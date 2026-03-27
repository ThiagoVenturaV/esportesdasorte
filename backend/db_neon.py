import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Carrega variáveis de ambiente do .env
load_dotenv()

# string de conexão provida pelo Neon
NEON_URL = os.getenv("NEON_URL")

def get_db_connection():
    """
    Cria e retorna uma conexão com o banco de dados PostgreSQL (Neon).
    Utiliza RealDictCursor para que os resultados retornem como dicionários
    ao invés de tuplas, facilitando a serialização para JSON.
    """
    if not NEON_URL:
        raise ValueError("A variável de ambiente NEON_URL não está configurada.")
        
    try:
        conn = psycopg2.connect(NEON_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Erro ao conectar no banco de dados Neon: {e}")
        raise e

def init_db():
    """
    Inicializa as tabelas necessárias no banco de dados Neon caso não existam.
    """
    commands = [
        """
        CREATE TABLE IF NOT EXISTS tb_usuario (
            id_usuario SERIAL PRIMARY KEY,
            nome_usuario VARCHAR(150) NOT NULL,
            email_usuario VARCHAR(150) NOT NULL UNIQUE,
            cpf_usuario VARCHAR(14) NOT NULL UNIQUE,
            dataNac_usuario DATE NOT NULL,
            endereco_usuario VARCHAR(255),
            telefone_usuario VARCHAR(20) NOT NULL,
            senha_usuario VARCHAR(255) NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS tb_analise (
            id_analise SERIAL PRIMARY KEY,
            match_id VARCHAR(50) NOT NULL,
            analise_json JSONB NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS tb_partida_historico (
            id_partida VARCHAR(50) PRIMARY KEY,
            competicao VARCHAR(150),
            temporada VARCHAR(50),
            time_casa VARCHAR(100),
            time_fora VARCHAR(100),
            gols_casa INT,
            gols_fora INT,
            dados_extras JSONB,
            importado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]
    
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            for command in commands:
                cur.execute(command)
        conn.commit()
        print("Tabelas inicializadas com sucesso no Neon DB.")
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
    finally:
        if conn:
            conn.close()

# Executa a inicialização ao importar o módulo
if __name__ == "__main__":
    init_db()
