import os
import json
import time
import requests
import google.generativeai as genai
from db_neon import get_db_connection
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
BETS_API_TOKEN = os.getenv("BETS_API_TOKEN", "248558-x464EYT2kttm4b")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(GEMINI_MODEL)

# Cache em memória para jogos ao vivo (30s)
_cache_live_matches = None
_cache_time = 0

# Cache em memória para análises ao vivo (10 min)
_cache_live_analyses = []
_cache_timestamp = 0


# ====================================================
# HELPERS
# ====================================================

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


# ====================================================
# BETSAPI
# ====================================================

def fetch_live_matches():
    global _cache_live_matches, _cache_time
    if _cache_live_matches and (time.time() - _cache_time) < 30:
        return _cache_live_matches

    url = f"https://api.b365api.com/v3/events/inplay?sport_id=1&token={BETS_API_TOKEN}"
    try:
        req = requests.get(url, timeout=12)
        data = req.json()
        if data.get("success") == 1:
            _cache_live_matches = data.get("results", [])
            _cache_time = time.time()
            return _cache_live_matches
    except Exception as e:
        print(f"[BetsAPI] Erro: {e}")

    return []


# ====================================================
# DB — ANÁLISES
# ====================================================

def save_analysis(match_id: str, analysis_data: dict):
    """Upsert de análise no banco (insert ou update se já existir)."""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """
                INSERT INTO tb_analise (match_id, analise_json, atualizado_em)
                VALUES (%s, %s, NOW())
                ON CONFLICT (match_id)
                DO UPDATE SET analise_json = EXCLUDED.analise_json,
                              atualizado_em = NOW()
            """
            cur.execute(sql, (match_id, json.dumps(analysis_data)))
        conn.commit()
    except Exception as e:
        print(f"[DB] Erro ao salvar análise: {e}")
    finally:
        if conn:
            conn.close()


def get_saved_analysis(match_id: str, max_age_minutes: int = 5):
    """Retorna análise salva no DB se tiver menos de max_age_minutes."""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """
                SELECT analise_json
                FROM tb_analise
                WHERE match_id = %s
                  AND atualizado_em >= NOW() - INTERVAL '%s minutes'
                ORDER BY atualizado_em DESC
                LIMIT 1
            """
            cur.execute(sql, (match_id, max_age_minutes))
            result = cur.fetchone()
            if result:
                raw = result["analise_json"]
                if isinstance(raw, dict):
                    return raw
                return json.loads(raw)
    except Exception as e:
        print(f"[DB] Erro ao buscar análise: {e}")
    finally:
        if conn:
            conn.close()
    return None


def get_all_cached_analyses(max_age_minutes: int = 15):
    """Retorna todas as análises recentes do banco (endpoint público para todos os usuários)."""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """
                SELECT match_id, analise_json, atualizado_em
                FROM tb_analise
                WHERE atualizado_em >= NOW() - INTERVAL '%s minutes'
                ORDER BY atualizado_em DESC
                LIMIT 20
            """
            cur.execute(sql, (max_age_minutes,))
            rows = cur.fetchall() or []
            results = []
            for row in rows:
                raw = row["analise_json"]
                analise = raw if isinstance(raw, dict) else json.loads(raw)
                results.append({
                    "match_id": row["match_id"],
                    "analysis": analise,
                    "atualizado_em": str(row["atualizado_em"]),
                })
            return results
    except Exception as e:
        print(f"[DB] Erro ao buscar análises salvas: {e}")
        return []
    finally:
        if conn:
            conn.close()


# ====================================================
# HISTÓRICO
# ====================================================

def get_historical_context(home_team: str, away_team: str):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """
                SELECT time_casa, time_fora, gols_casa, gols_fora, competicao, temporada
                FROM tb_partida_historico
                WHERE time_casa ILIKE %s OR time_fora ILIKE %s
                   OR time_casa ILIKE %s OR time_fora ILIKE %s
                LIMIT 10
            """
            cur.execute(sql, (f"%{home_team}%", f"%{home_team}%", f"%{away_team}%", f"%{away_team}%"))
            return cur.fetchall() or []
    except Exception as e:
        print(f"[DB] Erro ao buscar histórico: {e}")
        return []
    finally:
        if conn:
            conn.close()


# ====================================================
# RAG CONTEXT PARA CHAT
# ====================================================

def build_chat_rag_context(user_message: str, limit: int = 8):
    """Recupera contexto do banco + injeta análises ao vivo recentes."""
    conn = None
    historico_items = []

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
                cur.execute("""
                    SELECT id_partida, time_casa, time_fora, gols_casa, gols_fora, competicao, temporada
                    FROM tb_partida_historico
                    ORDER BY id_partida DESC
                    LIMIT %s
                """, (limit,))

            rows = cur.fetchall() or []
            for row in rows:
                historico_items.append({
                    "id_partida": str(row.get("id_partida", "")),
                    "time_casa": row.get("time_casa", ""),
                    "time_fora": row.get("time_fora", ""),
                    "placar": f"{row.get('gols_casa', 0)}x{row.get('gols_fora', 0)}",
                    "competicao": row.get("competicao", ""),
                    "temporada": row.get("temporada", ""),
                })
    except Exception as e:
        print(f"[RAG] Erro ao montar contexto histórico: {e}")
    finally:
        if conn:
            conn.close()

    # Injeta também as análises ao vivo em cache
    live_ctx = []
    for item in _cache_live_analyses[:5]:
        analysis = item.get("analysis", {}) or {}
        live_ctx.append({
            "match_id": item.get("match_id"),
            "em_andamento": True,
            "home_team": item.get("home_team"),
            "away_team": item.get("away_team"),
            "placar": f"{item.get('live_data', {}).get('home_score', 0)}-{item.get('live_data', {}).get('away_score', 0)}",
            "minuto": item.get("live_data", {}).get("minute", 0),
            "winProbability": analysis.get("winProbability", {}),
            "predictedWinner": analysis.get("predictedWinner", ""),
            "confidenceScore": analysis.get("confidenceScore", 0),
        })

    return {"historico": historico_items, "ao_vivo": live_ctx}


# ====================================================
# ANÁLISE GEMINI POR PARTIDA
# ====================================================

def analyze_match_with_gemini(match_id: str):
    """Gera análise combinando BetsAPI + histórico + Gemini. Usa cache DB com TTL de 5 min."""

    # 1. Tenta pegar do banco primeiro (TTL 5 min)
    saved = get_saved_analysis(match_id, max_age_minutes=5)
    if saved:
        print(f"[RAG] Cache DB hit para match {match_id}")
        return saved

    # 2. Busca partida ao vivo na BetsAPI
    live_matches = fetch_live_matches()
    target_match = next((m for m in live_matches if str(m.get("id")) == str(match_id)), None)

    if not target_match:
        print(f"[RAG] Partida {match_id} não encontrada nos jogos ao vivo")
        return None

    home_name = target_match.get("home", {}).get("name", "")
    away_name = target_match.get("away", {}).get("name", "")

    # 3. Histórico no banco
    historico = get_historical_context(home_name, away_name)
    historico_str = json.dumps(historico, default=str)

    prompt = f"""
Você é o Edson, assistente ultra-avançado em análise esportiva.
Sua missão: relatório estatístico e preditivo baseado em dados Reais (BetsAPI) e Históricos (Banco).

Dados ao vivo (BetsAPI):
{json.dumps(target_match)}

Histórico (Banco Neon):
{historico_str if historico else "Sem histórico disponível. Use as odds e momento atual."}

RETORNE APENAS JSON VÁLIDO sem markdown, sem texto antes ou depois:
{{
  "matchId": "{match_id}",
  "homeTeam": "{home_name}",
  "awayTeam": "{away_name}",
  "winProbability": {{ "home": [0-100], "draw": [0-100], "away": [0-100] }},
  "goalProbabilityNextMinute": [0-100],
  "cardRiskHome": [0-100],
  "cardRiskAway": [0-100],
  "penaltyRisk": [0-100],
  "momentumHome": [15 inteiros 0-100],
  "momentumAway": [15 inteiros 0-100],
  "commentary": ["comentário técnico 1", "comentário técnico 2"],
  "predictedWinner": "Nome do time ou Empate",
  "confidenceScore": [0-100]
}}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json",
            )
        )
        texto_limpo = response.text.replace("```json", "").replace("```", "").strip()
        analysis_data = json.loads(texto_limpo)

        # Salva no DB (upsert)
        save_analysis(match_id, analysis_data)
        return analysis_data

    except Exception as e:
        print(f"[RAG] Erro Gemini: {e}")

        # Fallback baseado no estado real da partida
        score = str(target_match.get("ss", "0-0"))
        score_parts = score.split("-") if "-" in score else ["0", "0"]
        home_score = int(score_parts[0].strip()) if score_parts[0].strip().isdigit() else 0
        away_score = int(score_parts[1].strip()) if len(score_parts) > 1 and score_parts[1].strip().isdigit() else 0

        minute_raw = target_match.get("time", target_match.get("minute", 0))
        try:
            minute = int(str(minute_raw))
            if minute > 200:
                minute = 90
        except Exception:
            minute = 0

        if home_score > away_score:
            win_prob = {"home": 62, "draw": 24, "away": 14}
            predicted = home_name
        elif away_score > home_score:
            win_prob = {"home": 14, "draw": 24, "away": 62}
            predicted = away_name
        else:
            win_prob = {"home": 36, "draw": 40, "away": 24}
            predicted = "Empate"

        analysis_data = {
            "matchId": match_id,
            "homeTeam": home_name,
            "awayTeam": away_name,
            "winProbability": win_prob,
            "goalProbabilityNextMinute": 22 if minute < 70 else 12,
            "cardRiskHome": 28,
            "cardRiskAway": 28,
            "penaltyRisk": 8,
            "momentumHome": [50] * 15,
            "momentumAway": [50] * 15,
            "commentary": [
                f"{home_name} {home_score} x {away_score} {away_name} aos {minute} minutos.",
                "Análise gerada com base no estado atual da partida."
            ],
            "predictedWinner": predicted,
            "confidenceScore": 52,
        }

        save_analysis(match_id, analysis_data)
        return analysis_data


# ====================================================
# ANÁLISES AO VIVO EM LOTE
# ====================================================

def analyze_and_cache_live_matches(limit: int = 10):
    """Processa jogos ao vivo, gera análise Gemini e mantém cache por 10 min."""
    global _cache_live_analyses, _cache_timestamp

    if _cache_live_analyses and (time.time() - _cache_timestamp) < 600:
        return _cache_live_analyses

    try:
        live_matches = fetch_live_matches()
        if not live_matches:
            print("[Live Analysis] Nenhum jogo ao vivo")
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
                        "home_score": score_parts[0].strip() if score_parts else "0",
                        "away_score": score_parts[1].strip() if len(score_parts) > 1 else "0",
                    },
                    "analysis": analysis,
                    "timestamp": time.time(),
                })
            except Exception as e:
                print(f"[Live Analysis] Erro na partida: {e}")

        _cache_live_analyses = analyses
        _cache_timestamp = time.time()
        print(f"[Live Analysis] Processadas {len(analyses)} análises")
        return _cache_live_analyses

    except Exception as e:
        print(f"[Live Analysis] Erro geral: {e}")
        return _cache_live_analyses


# ====================================================
# APOSTAS / RECOMENDAÇÕES
# ====================================================

def get_bet_suggestion(match_id: str, style: str = "balanced"):
    """Gera sugestão de aposta a partir das probabilidades."""
    try:
        match_data = next((m for m in _cache_live_analyses if m.get("match_id") == str(match_id)), None)
        if not match_data:
            return {"selection": "Analise", "odds": 1.5}

        analysis = match_data.get("analysis", {}) or {}
        win_prob = analysis.get("winProbability", {}) or {}
        home_prob = float(win_prob.get("home", 33))
        draw_prob = float(win_prob.get("draw", 33))
        away_prob = float(win_prob.get("away", 34))
        home_name = match_data.get("home_team", "Casa")
        away_name = match_data.get("away_team", "Fora")

        threshold = {"conservative": 65, "balanced": 50, "aggressive": 35}.get(style, 50)

        options = [
            (home_name, home_prob, 1.95),
            ("Empate", draw_prob, 3.20),
            (away_name, away_prob, 1.95),
        ]
        best = max(options, key=lambda x: x[1])

        if best[1] >= threshold:
            return {"selection": best[0], "odds": best[2], "confidence": round(best[1])}

        return {"selection": "Analise", "odds": 1.5, "confidence": 0}
    except Exception as e:
        print(f"[BetSuggestion] Erro: {e}")
        return {"selection": "Analise", "odds": 1.5}


def get_top_live_recommendations(limit: int = 2):
    """Retorna TOP jogos ao vivo por confidence score."""
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
        print(f"[TopRec] Erro: {e}")
        return []
