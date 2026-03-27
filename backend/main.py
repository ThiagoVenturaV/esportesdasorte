import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

from db_neon import get_db_connection
import rag_service

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

default_origins = ",".join([
    "http://localhost:5173",
    "https://esportesdasorte-production.up.railway.app",
    "https://esportesdasorte.bet.br",
])
raw_origins = os.getenv("CORS_ORIGINS", default_origins)
cors_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()] or ["*"]
allow_credentials = "*" not in cors_origins

app = FastAPI(
    title="Assistente de Análise Esportiva (Edson)",
    description="Backend estruturado com PostgreSQL Neon, BetsAPI e Gemini 2.5 Lite via RAG.",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
# ROTAS DE USUÁRIOS
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
            return {"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!", "id_gerado": id_gerado}
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
# ROTAS DO ASSISTENTE EDSON E RAG
# ==========================================

@app.get("/api/analisar/{match_id}", tags=["Edson RAG"])
def analisar_partida(match_id: str):
    """
    Acionado pela AnalysisPage.jsx. Retorna a previsão robusta baseada em Parquet/BetsAPI.
    """
    try:
        resultado = rag_service.analyze_match_with_gemini(match_id)
        if not resultado:
            raise HTTPException(status_code=500, detail="Erro interno ao gerar análise RAG.")
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", tags=["Edson Chat"])
def edson_chat(request: ChatRequest):
    """
    Chat do Edson com contexto RAG vindo do banco Neon.
    """
    if not GEMINI_API_KEY:
        return {"response": "Desculpe, o Edson esta temporariamente sem configuracao da IA no backend."}

    prompt_sistema = (
        "Voce e Edson, assistente de futebol orientado por dados do banco. "
        "Nunca invente fatos. Se faltar dado no contexto, diga claramente que nao encontrou no banco. "
        "Quando citar partida, inclua id_partida e placar exato quando disponivel. "
        "Nao use web. Responda em portugues em no maximo 3 paragrafos."
    )

    model_chat = genai.GenerativeModel("gemini-1.5-flash", system_instruction=prompt_sistema)

    gemini_history = []
    for m in request.history:
        gemini_history.append({
            "role": m.get("role", "user"),
            "parts": [p.get("text", "") for p in m.get("parts", [{"text": ""}])],
        })

    chat = model_chat.start_chat(history=gemini_history)

    try:
        rag_context = rag_service.build_chat_rag_context(request.message, limit=8)
        rag_context_text = str(rag_context) if rag_context else "[]"

        grounded_message = (
            "[CONTEXTO_RAG_DO_BANCO_NEON]\n"
            f"{rag_context_text}\n\n"
            "[REGRAS]\n"
            "- Use prioritariamente os dados do CONTEXTO_RAG_DO_BANCO_NEON.\n"
            "- Nao afirme fatos que nao estejam no contexto.\n"
            "- Se nao houver dado suficiente, informe essa limitacao de forma objetiva.\n\n"
            "[PERGUNTA_USUARIO]\n"
            f"{request.message}"
        )

        response = chat.send_message(grounded_message)
        resposta_texto = (response.text or "").strip()

        if not resposta_texto:
            return {"response": "Nao consegui gerar resposta com base nos dados atuais do banco."}

        return {"response": resposta_texto}
    except Exception as e:
        print(f"Erro no chat: {e}")
        return {"response": "Desculpe, ocorreu um erro ao consultar o contexto RAG do Edson."}
