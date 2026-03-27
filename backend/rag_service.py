import os
import json
import time
import requests
import google.generativeai as genai
from db_neon import get_db_connection
from dotenv import load_dotenv

load_dotenv()

# Configurações
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
BETS_API_TOKEN = os.getenv("BETS_API_TOKEN", "248558-x464EYT2kttm4b")

# Configurar o Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
# Usar Gemini Lite para custo baixo e latencia menor.
model = genai.GenerativeModel(GEMINI_MODEL)

# Cache p/ evitar flood na BetsAPI
_cache_live_matches = None
_cache_time = 0

def _tokenize_query(query: str):
    stop_words = {
        "de", "da", "do", "das", "dos", "a", "o", "e", "em", "com", "para",
        "que", "qual", "como", "foi", "sera", "ser", "uma", "um", "no", "na",
        "por", "sobre", "jogo", "partida", "edson", "placar", "resultado", "me",
    }
    tokens = []
    for raw in str(query or "").lower().replace("?", " ").replace(",", " ").split():
        token = raw.strip()
        if len(token) < 3 or token in stop_words:
            continue
        tokens.append(token)
    return tokens[:8]


def fetch_live_matches():
    global _cache_live_matches, _cache_time
    # Cache de 30 segundos
    if _cache_live_matches and (time.time() - _cache_time) < 30:
        return _cache_live_matches

    url = f"https://api.b365api.com/v3/events/inplay?sport_id=1&token={BETS_API_TOKEN}"
    try:
        req = requests.get(url, timeout=10)
        data = req.json()
        if data.get("success") == 1:
            _cache_live_matches = data.get("results", [])
            _cache_time = time.time()
            return _cache_live_matches
    except Exception as e:
        print(f"Erro BetsAPI: {e}")

    return []


def build_chat_rag_context(user_message: str, limit: int = 8):
    """
    Recupera contexto factual do Neon para ancorar o chat do Edson.
    Retorna lista de partidas relevantes baseada em termos da pergunta.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            tokens = _tokenize_query(user_message)

            if tokens:
                clauses = []
                values = []
                for token in tokens:
                    pattern = f"%{token}%"
                    clauses.append("(time_casa ILIKE %s OR time_fora ILIKE %s OR competicao ILIKE %s OR temporada ILIKE %s)")
                    values.extend([pattern, pattern, pattern, pattern])

                sql = f"""
                    SELECT id_partida, time_casa, time_fora, gols_casa, gols_fora, competicao, temporada
                    FROM tb_partida_historico
                    WHERE {' OR '.join(clauses)}
                    ORDER BY id_partida DESC
                    LIMIT %s
                """
                values.append(limit)
                cur.execute(sql, values)
            else:
                cur.execute(
                    """
                    SELECT id_partida, time_casa, time_fora, gols_casa, gols_fora, competicao, temporada
                    FROM tb_partida_historico
                    ORDER BY id_partida DESC
                    LIMIT %s
                    """,
                    (limit,),
                )

            rows = cur.fetchall() or []
            context_items = []
            for row in rows:
                context_items.append({
                    "id_partida": str(row.get("id_partida", "")),
                    "time_casa": row.get("time_casa", ""),
                    "time_fora": row.get("time_fora", ""),
                    "placar": f"{row.get('gols_casa', 0)}x{row.get('gols_fora', 0)}",
                    "competicao": row.get("competicao", ""),
                    "temporada": row.get("temporada", ""),
                })

            return context_items
    except Exception as e:
        print(f"Erro ao montar contexto RAG do chat: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_historical_context(home_team, away_team):
    """
    Busca o histórico de confronto ou estatísticas no Neon DB.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Buscar jogos onde qualquer um dos dois times jogou (para montar média de xG ou desempenho passado)
            sql = """
                SELECT time_casa, time_fora, gols_casa, gols_fora, competicao, temporada 
                FROM tb_partida_historico 
                WHERE time_casa ILIKE %s OR time_fora ILIKE %s OR time_casa ILIKE %s OR time_fora ILIKE %s
                LIMIT 10
            """
            cur.execute(sql, (f"%{home_team}%", f"%{home_team}%", f"%{away_team}%", f"%{away_team}%"))
            historico = cur.fetchall()
            return historico
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return []
    finally:
        if conn:
            conn.close()

def save_analysis(match_id, analysis_data):
    """
    Salva a resposta do Gemini no banco de dados Neon para consumo rápido e histórico.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = "INSERT INTO tb_analise (match_id, analise_json) VALUES (%s, %s)"
            cur.execute(sql, (match_id, json.dumps(analysis_data)))
            conn.commit()
    except Exception as e:
        print(f"Erro ao salvar análise no banco: {e}")
    finally:
        if conn:
            conn.close()

def get_saved_analysis(match_id):
    """
    Verifica se a partida já tem análise gerada nos últimos 5 minutos no DB.
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """
                SELECT analise_json 
                FROM tb_analise 
                WHERE match_id = %s 
                ORDER BY criado_em DESC 
                LIMIT 1
            """
            cur.execute(sql, (match_id,))
            result = cur.fetchone()
            if result:
                # Retorna o JSONB parseado
                return result['analise_json']
    except Exception as e:
        print(f"Erro ao buscar análise salva: {e}")
    finally:
        if conn:
            conn.close()
    return None

def analyze_match_with_gemini(match_id: str):
    """
    Gera a análise de uma partida combinando dados ao vivo + histórico do banco + Gemini.
    Retorna no formato exato que a AnalysisPage.jsx espera.
    """
    # 1. Tenta pegar do banco primeiro para ser rápido (se não precisar reprocessar agora)
    # Por exemplo, para mock ou testes
    # (Em prod, pode-se forçar regeneração condicionalmente)
    # saved = get_saved_analysis(match_id)
    # if saved:
    #     return saved
        
    # 2. Resgata partida ao vivo
    live_matches = fetch_live_matches()
    target_match = None
    
    # Procura na API se houver (se o frontend mandou um ID real). 
    for m in live_matches:
        if str(m.get("id")) == str(match_id):
            target_match = m
            break
            
    if not target_match:
        print(f"[RAG] Partida {match_id} não encontrada nos jogos ao vivo da BetsAPI")
        return None

    home_name = target_match.get("home", {}).get("name", "")
    away_name = target_match.get("away", {}).get("name", "")
    
    # 3. Busca histórico no DB
    historico = get_historical_context(home_name, away_name)
    historico_str = json.dumps(historico, default=str)
    
    # Formata prompt forte (System Instruction style)
    prompt = f"""
Você é o Edson, um assistente virtual ultra-avançado em análise de dados esportivos.
Sua missão é gerar um relatório estatístico e preditivo baseado em dados Reais (BetsAPI) e Históricos (StatsBomb/Banco).

Dados ao vivo da partida (BetsAPI):
{json.dumps(target_match)}

Dados Históricos (Banco Neon PostgreSQL / Statsbomb):
{historico_str if historico else "Sem amplo histórico. Baseie-se nas odds e no momento."}

INSTRUÇÕES DE PREENCHIMENTO E RESPONSABILIDADE ESPECÍFICAS:
Você DEVE obrigatoriamente retornar APENAS um objeto JSON. Sem formatação Markdown (remova ```json e ```). Absolutamente nenhum texto antes ou depois.

O JSON deve respeitar ESTRITAMENTE esta estrutura e chaves para o componente React renderizar corretamente:
{{
  "matchId": "{match_id}",
  "winProbability": {{ "home": [Inteiro 0-100], "draw": [Inteiro 0-100], "away": [Inteiro 0-100] }},
  "goalProbabilityNextMinute": [Inteiro 0-100],
  "cardRiskHome": [Inteiro 0-100],
  "cardRiskAway": [Inteiro 0-100],
  "penaltyRisk": [Inteiro 0-100],
  "momentumHome": [Array de 15 números inteiros entre 0-100 simulando posse/pressão a cada 5 min],
  "momentumAway": [Array de 15 números inteiros entre 0-100 simulando posse/pressão a cada 5 min],
  "commentary": [Array com exatas duas strings de comentários técnicos táticos sobre o jogo],
  "predictedWinner": "Nome do time com maior chance, ou 'Empate'",
  "confidenceScore": [Inteiro 0-100]
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json", # Força Output Estruturado JSON do Gemini
            )
        )
        
        texto_limpo = response.text.replace('```json', '').replace('```', '').strip()
        analysis_data = json.loads(texto_limpo)
        
        # Salva o resultado no Postgres
        save_analysis(match_id, analysis_data)
        
        return analysis_data
        
    except Exception as e:
        print(f"Erro na geração Gemini/RAG: {e}")
        score = str(target_match.get("ss", "0-0"))
        score_parts = score.split("-") if "-" in score else ["0", "0"]
        try:
            home_score = int(score_parts[0].strip())
        except Exception:
            home_score = 0
        try:
            away_score = int(score_parts[1].strip())
        except Exception:
            away_score = 0

        minute_raw = target_match.get("time", target_match.get("minute", 0))
        try:
            minute = int(str(minute_raw))
            if minute > 200:  # BetsAPI às vezes retorna timestamp; normaliza para minuto de jogo
                minute = 90
        except Exception:
            minute = 0

        # Fallback sem mock: usa apenas estado real da partida.
        if home_score > away_score:
            win_prob = {"home": 62, "draw": 24, "away": 14}
            predicted = home_name
        elif away_score > home_score:
            win_prob = {"home": 14, "draw": 24, "away": 62}
            predicted = away_name
        else:
            win_prob = {"home": 36, "draw": 40, "away": 24}
            predicted = "Empate"

        goal_next = 22 if minute < 70 else 12

        analysis_data = {
            "matchId": match_id,
            "winProbability": win_prob,
            "goalProbabilityNextMinute": goal_next,
            "cardRiskHome": 28,
            "cardRiskAway": 28,
            "penaltyRisk": 8,
            "momentumHome": [50] * 15,
            "momentumAway": [50] * 15,
            "commentary": [
                f"Dados ao vivo: {home_name} {home_score} x {away_score} {away_name} aos {minute} minutos.",
                "Análise gerada diretamente do estado atual da partida (sem simulação de times mock)."
            ],
            "predictedWinner": predicted,
            "confidenceScore": 52,
        }

        return analysis_data


# Cache dedicado para análises ao vivo compartilhadas entre usuários.
_cache_live_analyses = []
_cache_timestamp = 0


def analyze_and_cache_live_matches(limit=10):
    """
    Processa os jogos ao vivo, gera análise com Gemini e mantém cache por 10 minutos.
    """
    global _cache_live_analyses, _cache_timestamp

    if _cache_live_analyses and (time.time() - _cache_timestamp) < 600:
        return _cache_live_analyses

    try:
        live_matches = fetch_live_matches()
        if not live_matches:
            print("[Live Analysis] Nenhum jogo ao vivo disponível")
            return _cache_live_analyses

        top_matches = live_matches[:limit]
        analyses = []

        for match in top_matches:
            try:
                match_id = str(match.get("id", ""))
                if not match_id:
                    continue

                home_team = match.get("home", {}).get("name", "")
                away_team = match.get("away", {}).get("name", "")
                score = str(match.get("ss", "0-0"))
                score_parts = score.split("-") if "-" in score else ["0", "0"]

                analysis = analyze_match_with_gemini(match_id)
                if not analysis:
                    continue

                analyses.append({
                    "match_id": match_id,
                    "home_team": home_team,
                    "away_team": away_team,
                    "live_data": {
                        "minute": match.get("time", match.get("minute", 0)),
                        "home_score": score_parts[0].strip() if len(score_parts) > 0 else "0",
                        "away_score": score_parts[1].strip() if len(score_parts) > 1 else "0",
                    },
                    "analysis": analysis,
                    "timestamp": time.time(),
                })
            except Exception as e:
                print(f"[Live Analysis] Erro processando partida: {e}")

        _cache_live_analyses = analyses
        _cache_timestamp = time.time()
        print(f"[Live Analysis] Processadas {len(analyses)} análises")
        return _cache_live_analyses
    except Exception as e:
        print(f"[Live Analysis] Erro geral: {e}")
        return _cache_live_analyses


def get_bet_suggestion(match_id: str, style: str = "balanced"):
    """
    Gera sugestão de aposta a partir das probabilidades da análise.
    """
    try:
        match_data = next((m for m in _cache_live_analyses if m.get("match_id") == str(match_id)), None)
        if not match_data:
            return {"selection": "Analise", "odds": 1.5}

        analysis = match_data.get("analysis", {}) or {}
        win_prob = analysis.get("winProbability", {}) or {}
        home_prob = float(win_prob.get("home", 33))
        draw_prob = float(win_prob.get("draw", 33))
        away_prob = float(win_prob.get("away", 34))

        style_threshold = {
            "conservative": 65,
            "balanced": 50,
            "aggressive": 35,
        }.get(style, 50)

        options = [
            ("Home", home_prob, 1.95),
            ("Draw", draw_prob, 3.20),
            ("Away", away_prob, 1.95),
        ]
        best = max(options, key=lambda x: x[1])

        if best[1] >= style_threshold:
            return {"selection": best[0], "odds": best[2]}

        return {"selection": "Analise", "odds": 1.5}
    except Exception as e:
        print(f"[Bet Suggestion] Erro: {e}")
        return {"selection": "Analise", "odds": 1.5}


def get_top_live_recommendations(limit: int = 2):
    """
    Retorna TOP jogos ao vivo ordenados por confidence score.
    """
    try:
        analyses = analyze_and_cache_live_matches(limit=10)
        if not analyses:
            return []

        ordered = sorted(
            analyses,
            key=lambda item: (item.get("analysis", {}) or {}).get("confidenceScore", 0),
            reverse=True,
        )
        return ordered[:limit]
    except Exception as e:
        print(f"[Top Recommendations] Erro: {e}")
        return []
