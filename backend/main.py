import os
import json
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
import time
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from db_neon import get_db_connection
import rag_service

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# CORS — inclui Vercel e Railway
default_origins = ",".join([
    "http://localhost:5173",
    "https://esportesdasorte-production.up.railway.app",
    "https://esportesdasorte.vercel.app",
    "https://esportesdasorte.bet.br",
])
raw_origins = os.getenv("CORS_ORIGINS", default_origins)
cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] or ["*"]
allow_credentials = "*" not in cors_origins

app = FastAPI(
    title="Assistente de Análise Esportiva (Edson)",
    description="Backend RAG com PostgreSQL Neon, BetsAPI e Gemini.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler: análises a cada 5 min
scheduler = BackgroundScheduler()

def scheduled_live_match_analysis():
    try:
        print("[Scheduler] Processando análises ao vivo...")
        analyses = rag_service.analyze_and_cache_live_matches()
        print(f"[Scheduler] {len(analyses)} análises processadas")
    except Exception as e:
        print(f"[Scheduler] Erro: {e}")

scheduler.add_job(
    scheduled_live_match_analysis,
    trigger=IntervalTrigger(minutes=5),
    id="live_match_analysis",
    replace_existing=True,
)

@app.on_event("startup")
def on_startup():
    if not scheduler.running:
        scheduler.start()
        print("[App] Scheduler iniciado")

@app.on_event("shutdown")
def on_shutdown():
    if scheduler.running:
        scheduler.shutdown(wait=False)


# ==========================================
# MODELOS PYDANTIC
# ==========================================

class Usuario(BaseModel):
    nome_usuario: str
    email_usuario: str
    cpf_usuario: str
    dataNac_usuario: str
    endereco_usuario: str = ""
    telefone_usuario: str
    senha_usuario: str

class LoginDados(BaseModel):
    email_usuario: str
    senha_usuario: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []


# ==========================================
# USUÁRIOS
# ==========================================

@app.post("/api/login", tags=["Usuários"])
def validar_login(credenciais: LoginDados):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """SELECT id_usuario, nome_usuario, email_usuario
                     FROM tb_usuario
                     WHERE email_usuario = %s AND senha_usuario = %s"""
            cur.execute(sql, (credenciais.email_usuario, credenciais.senha_usuario))
            usuario = cur.fetchone()
            if usuario:
                return {"sucesso": True, "mensagem": f"Bem-vindo(a), {usuario['nome_usuario']}!", "usuario": usuario}
            return {"sucesso": False, "erro": "E-mail ou senha incorretos."}
    except Exception as erro:
        return {"sucesso": False, "erro": f"Erro no servidor: {str(erro)}"}
    finally:
        if conn: conn.close()


@app.post("/api/usuarios", tags=["Usuários"])
def criar_usuario(novo_usuario: Usuario):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = """INSERT INTO tb_usuario
                     (nome_usuario, email_usuario, cpf_usuario, dataNac_usuario, endereco_usuario, telefone_usuario, senha_usuario)
                     VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id_usuario"""
            valores = (
                novo_usuario.nome_usuario, novo_usuario.email_usuario, novo_usuario.cpf_usuario,
                novo_usuario.dataNac_usuario, novo_usuario.endereco_usuario,
                novo_usuario.telefone_usuario, novo_usuario.senha_usuario
            )
            cur.execute(sql, valores)
            id_gerado = cur.fetchone()['id_usuario']
            conn.commit()
            return {"sucesso": True, "mensagem": "Usuário cadastrado!", "id_gerado": id_gerado}
    except psycopg2.IntegrityError:
        return {"sucesso": False, "erro": "E-mail ou CPF já cadastrado."}
    except Exception as erro:
        return {"sucesso": False, "erro": str(erro)}
    finally:
        if conn: conn.close()


@app.get("/api/usuarios", tags=["Usuários"])
def listar_usuarios():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT id_usuario, nome_usuario, email_usuario, criado_em FROM tb_usuario ORDER BY id_usuario DESC")
            usuarios = cur.fetchall()
            return {"sucesso": True, "quantidade": len(usuarios), "usuarios": usuarios}
    except Exception as erro:
        return {"sucesso": False, "erro": str(erro)}
    finally:
        if conn: conn.close()


# ==========================================
# ANÁLISES AO VIVO
# ==========================================

@app.get("/api/analises-ao-vivo", tags=["Análises"])
def get_live_analyses():
    """Processa e retorna análises dos jogos ao vivo (pode ser lento na primeira chamada)."""
    try:
        analises = rag_service.analyze_and_cache_live_matches()
        return {
            "sucesso": True,
            "quantidade": len(analises),
            "analises": analises,
            "timestamp": time.time(),
        }
    except Exception as e:
        print(f"[API] Erro analises-ao-vivo: {e}")
        return {"sucesso": False, "quantidade": 0, "analises": [], "erro": str(e)}


@app.get("/api/analises-salvas", tags=["Análises"])
def get_saved_analyses():
    """Retorna análises já processadas do banco (rápido — sem chamar Gemini)."""
    try:
        analises = rag_service.get_all_cached_analyses(max_age_minutes=30)
        # Enriquece com dados ao vivo em cache se disponíveis
        live_cache = {m.get("match_id"): m for m in rag_service._cache_live_analyses}
        enriquecidas = []
        for a in analises:
            mid = a["match_id"]
            live = live_cache.get(mid, {})
            enriquecidas.append({
                "match_id": mid,
                "home_team": live.get("home_team") or a["analysis"].get("homeTeam", "Casa"),
                "away_team": live.get("away_team") or a["analysis"].get("awayTeam", "Fora"),
                "live_data": live.get("live_data", {"minute": 0, "home_score": 0, "away_score": 0}),
                "analysis": a["analysis"],
                "atualizado_em": a["atualizado_em"],
            })
        return {
            "sucesso": True,
            "quantidade": len(enriquecidas),
            "analises": enriquecidas,
            "timestamp": time.time(),
        }
    except Exception as e:
        print(f"[API] Erro analises-salvas: {e}")
        return {"sucesso": False, "quantidade": 0, "analises": [], "erro": str(e)}


@app.get("/api/edson-recommendations", tags=["Edson"])
def get_edson_recommendations():
    """Retorna TOP 2 jogos ao vivo para Edson recomendar."""
    try:
        recommendations = rag_service.get_top_live_recommendations(limit=2)
        return {"sucesso": True, "recomendacoes": recommendations, "timestamp": time.time()}
    except Exception as e:
        return {"sucesso": False, "recomendacoes": [], "erro": str(e)}


@app.get("/api/analisar/{match_id}", tags=["Análises"])
def analisar_partida(match_id: str):
    """Retorna análise de uma partida específica (BetsAPI + Histórico + Gemini)."""
    try:
        resultado = rag_service.analyze_match_with_gemini(match_id)
        if not resultado:
            raise HTTPException(status_code=404, detail=f"Partida {match_id} não encontrada nos jogos ao vivo.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# CHAT DO EDSON
# ==========================================

KEYWORDS_APOSTA = [
    "recomenda", "melhor", "qual jogo", "qual apostar", "dica", "apostar", "aposta",
    "sugest", "tip", "bet", "odds", "favorit", "chance", "probabilidade",
]

def _inject_bet_markers(resposta_texto: str) -> str:
    """Injeta marcadores [[BET:...]] nas recomendações ao vivo."""
    try:
        recommendations = rag_service.get_top_live_recommendations(limit=2)
        if not recommendations:
            return resposta_texto

        for rec in recommendations:
            match_id = rec.get("match_id")
            home = rec.get("home_team", "Casa")
            away = rec.get("away_team", "Fora")
            confidence = (rec.get("analysis", {}) or {}).get("confidenceScore", 0)

            bet = rag_service.get_bet_suggestion(match_id, "balanced")
            selection = bet.get("selection", "Analise")
            odds = bet.get("odds", 1.5)

            if selection != "Analise":
                resposta_texto += (
                    f"\n\n🔥 **{home} vs {away}** — Confiança: {confidence}%"
                    f"\n[[BET:{selection}|{odds:.2f}|{match_id}|Resultado Final]]"
                )
    except Exception as e:
        print(f"[Chat] Erro ao injetar BET markers: {e}")
    return resposta_texto


@app.post("/api/chat", tags=["Edson Chat"])
def edson_chat(request: ChatRequest):
    """Chat do Edson com contexto RAG (banco Neon + análises ao vivo) e sugestões de aposta."""

    has_bet_intent = any(kw in request.message.lower() for kw in KEYWORDS_APOSTA)

    # Modo sem chave Gemini — resposta de contingência
    if not GEMINI_API_KEY:
        try:
            rag_ctx = rag_service.build_chat_rag_context(request.message, limit=5)
            historico = rag_ctx.get("historico", [])
            if historico:
                exemplos = [f"{p['time_casa']} {p['placar']} {p['time_fora']}" for p in historico[:3]]
                resposta_texto = (
                    "Estou em modo de contingência (Gemini indisponível), "
                    "mas encontrei partidas relacionadas: " + "; ".join(exemplos)
                )
            else:
                resposta_texto = "Estou em modo de contingência. Não encontrei dados suficientes para essa pergunta."
        except Exception as e:
            print(f"[Chat] Erro contingência: {e}")
            resposta_texto = "Desculpe, o Edson está temporariamente sem configuração de IA."

        if has_bet_intent:
            resposta_texto = _inject_bet_markers(resposta_texto)

        return {"response": resposta_texto}

    # Modo normal com Gemini
    prompt_sistema = (
        "Você é Edson, assistente de análise esportiva orientado por dados. "
        "Nunca invente fatos. Use prioritariamente os dados do CONTEXTO abaixo. "
        "Quando houver jogos ao vivo, mencione-os com dados reais (times, placar, probabilidades). "
        "Seja direto, objetivo e responda em português em no máximo 3 parágrafos. "
        "Não use web. Se faltar dado, diga claramente."
    )

    model_chat = genai.GenerativeModel(GEMINI_MODEL, system_instruction=prompt_sistema)

    gemini_history = []
    for m in request.history:
        parts = m.get("parts", [])
        if not parts:
            parts = [{"text": ""}]
        gemini_history.append({
            "role": m.get("role", "user"),
            "parts": [{"text": p.get("text", "") if isinstance(p, dict) else str(p)} for p in parts],
        })

    chat = model_chat.start_chat(history=gemini_history)

    try:
        rag_ctx = rag_service.build_chat_rag_context(request.message, limit=8)
        historico_str = json.dumps(rag_ctx.get("historico", []), default=str, ensure_ascii=False)
        ao_vivo_str = json.dumps(rag_ctx.get("ao_vivo", []), default=str, ensure_ascii=False)

        grounded_message = (
            "[CONTEXTO_BANCO_NEON — Histórico de Partidas]\n"
            f"{historico_str}\n\n"
            "[JOGOS_AO_VIVO_AGORA — Análise em Tempo Real]\n"
            f"{ao_vivo_str}\n\n"
            "[REGRAS]\n"
            "- Priorize dados do contexto acima.\n"
            "- Não afirme fatos fora do contexto.\n"
            "- Para jogos ao vivo, use os dados de winProbability e predictedWinner.\n\n"
            "[PERGUNTA]\n"
            f"{request.message}"
        )

        response = chat.send_message(grounded_message)
        resposta_texto = (response.text or "").strip()

        if not resposta_texto:
            resposta_texto = "Não consegui gerar resposta com base nos dados atuais."

    except Exception as e:
        print(f"[Chat] Erro Gemini: {e}")
        resposta_texto = "Ocorreu um erro ao consultar o contexto. Tente novamente."

    if has_bet_intent:
        resposta_texto = _inject_bet_markers(resposta_texto)

    return {"response": resposta_texto}
