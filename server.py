from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pyodbc
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow frontend
    allow_credentials=True,
    allow_methods=["*"],   # allow POST, GET, OPTIONS
    allow_headers=["*"],   # allow all headers
)


# ✅ CONFIG (hidden in EXE)
DB_CONFIG = {
    "server": "localhost,1433",
    "database": "SKAPS_BOM",
    "username": "ravi",
    "password": "Skaps@123",
    "driver": "SQL Server"
}

def get_conn():
    return pyodbc.connect(
        f"DRIVER={{{DB_CONFIG['driver']}}};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID={DB_CONFIG['username']};"
        f"PWD={DB_CONFIG['password']}"
    )


# ✅ MODELS
class SaveRequest(BaseModel):
    article: str
    customer: str
    revision: str
    header: dict
    rows: list
    shellCols: list


class ApproveRequest(BaseModel):
    article: str
    customer: str
    revision: str
    approver: str
    header: dict
    rows: list
    shellCols: list


# ✅ GET EXISTING ARTICLES
@app.get("/articles")
def get_articles():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT article, customer FROM BOM_DATA")
    data = [{"article": r[0], "customer": r[1]} for r in cursor.fetchall()]

    conn.close()
    return data


# ✅ GET REVISIONS
@app.get("/revisions")
def get_revisions(article: str, customer: str):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT revision FROM BOM_DATA 
        WHERE article=? AND customer=?
    """, article, customer)

    revs = [r[0] for r in cursor.fetchall()]
    conn.close()

    return revs


# ✅ LOAD DATA
@app.get("/load")
def load_data(article: str, customer: str, revision: str):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT raw_data FROM BOM_DATA 
        WHERE article=? AND customer=? AND revision=?
    """, article, customer, revision)

    row = cursor.fetchone()
    conn.close()

    if not row:
        return {}

    return json.loads(row[0])


# ✅ SAVE TO SQL
@app.post("/save")
def save_data(req: SaveRequest):
    conn = get_conn()
    cursor = conn.cursor()

    raw = json.dumps({
        "header": req.header,
        "rows": req.rows,
        "shellCols": req.shellCols
    })

    cursor.execute("""
        INSERT INTO BOM_DATA 
        (article,customer,revision,prepared_by,article_code,ec_no,article_rev,raw_data)
        VALUES (?,?,?,?,?,?,?,?)
    """,
        req.article,
        req.customer,
        req.revision,
        req.header.get("preparedBy"),
        req.header.get("articleCode"),
        req.header.get("ecNo"),
        req.header.get("articleRev"),
        raw
    )

    conn.commit()
    conn.close()

    return {"status": "saved"}


# ✅ APPROVE
@app.post("/approve")
def approve(req: ApproveRequest):
    conn = get_conn()
    cursor = conn.cursor()

    raw = json.dumps({
        "header": req.header,
        "rows": req.rows,
        "shellCols": req.shellCols
    })

    cursor.execute("""
        INSERT INTO BOM_APPROVED 
        (article,customer,revision,approver,raw_data)
        VALUES (?,?,?,?,?)
    """,
        req.article,
        req.customer,
        req.revision,
        req.approver,
        raw
    )

    conn.commit()
    conn.close()

    return {"status": "approved"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8080, reload=True)