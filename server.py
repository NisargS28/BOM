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


def ensure_columns():
    try:
        conn = get_conn()
        cursor = conn.cursor()
        
        # Check/add format_name in BOM_DATA
        try:
            cursor.execute("ALTER TABLE BOM_DATA ADD format_name VARCHAR(100) NULL")
            conn.commit()
        except Exception:
            pass

        # Check/add format_name in BOM_APPROVED
        try:
            cursor.execute("ALTER TABLE BOM_APPROVED ADD format_name VARCHAR(100) NULL")
            conn.commit()
        except Exception:
            pass
            
        conn.close()
    except Exception as e:
        print("Could not verify/add format_name column on startup:", e)


def upsert_format_data(cursor, table, format_name, req, raw):
    cursor.execute(f"""
        SELECT 1 FROM {table} 
        WHERE article=? AND customer=? AND revision=? AND format_name=?
    """, req.article, req.customer, req.revision, format_name)
    
    exists = cursor.fetchone()
    if exists:
        if table == "BOM_DATA":
            cursor.execute(f"""
                UPDATE {table} 
                SET prepared_by=?, article_code=?, ec_no=?, article_rev=?, raw_data=?
                WHERE article=? AND customer=? AND revision=? AND format_name=?
            """,
                req.header.get("preparedBy"),
                req.header.get("articleCode"),
                req.header.get("ecNo"),
                req.header.get("articleRev"),
                raw,
                req.article,
                req.customer,
                req.revision,
                format_name
            )
        else: # BOM_APPROVED
            cursor.execute(f"""
                UPDATE {table} 
                SET approver=?, raw_data=?
                WHERE article=? AND customer=? AND revision=? AND format_name=?
            """,
                req.approver,
                raw,
                req.article,
                req.customer,
                req.revision,
                format_name
            )
    else:
        if table == "BOM_DATA":
            cursor.execute(f"""
                INSERT INTO {table} 
                (article,customer,revision,prepared_by,article_code,ec_no,article_rev,format_name,raw_data)
                VALUES (?,?,?,?,?,?,?,?,?)
            """,
                req.article,
                req.customer,
                req.revision,
                req.header.get("preparedBy"),
                req.header.get("articleCode"),
                req.header.get("ecNo"),
                req.header.get("articleRev"),
                format_name,
                raw
            )
        else: # BOM_APPROVED
            cursor.execute(f"""
                INSERT INTO {table} 
                (article,customer,revision,approver,format_name,raw_data)
                VALUES (?,?,?,?,?,?)
            """,
                req.article,
                req.customer,
                req.revision,
                req.approver,
                format_name,
                raw
            )


@app.on_event("startup")
def startup_event():
    ensure_columns()


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
        SELECT format_name, raw_data FROM BOM_DATA 
        WHERE article=? AND customer=? AND revision=?
    """, article, customer, revision)

    db_rows = cursor.fetchall()
    conn.close()

    if not db_rows:
        return {}

    combined_data = {
        "rows": [],
        "shellCols": [],
        "header": {}
    }

    found_bom = False

    for format_name, raw_str in db_rows:
        try:
            raw_val = json.loads(raw_str)
        except Exception:
            continue

        if not format_name or format_name == "Bill of Material":
            found_bom = True
            combined_data["rows"] = raw_val.get("rows", [])
            combined_data["shellCols"] = raw_val.get("shellCols", [])
            combined_data["header"].update(raw_val.get("header", {}))
        elif format_name == "Non Returnable Auxiliary":
            combined_data["header"]["nonReturnableCols"] = raw_val.get("columns", [])
            combined_data["header"]["nonReturnableAuxRows"] = raw_val.get("rows", [])
        elif format_name == "Returnable Auxiliary":
            combined_data["header"]["returnableCols"] = raw_val.get("columns", [])
            combined_data["header"]["returnableAuxRows"] = raw_val.get("rows", [])
        elif format_name == "Cycle Time - Tentative":
            combined_data["header"]["tentativeCycleCols"] = raw_val.get("columns", [])
            combined_data["header"]["tentativeCycleRows"] = raw_val.get("rows", [])
        elif format_name == "Cycle Time - Production":
            combined_data["header"]["productionCycleCols"] = raw_val.get("columns", [])
            combined_data["header"]["productionCycleRows"] = raw_val.get("rows", [])

    if not found_bom and len(db_rows) > 0:
        try:
            first_raw = json.loads(db_rows[0][1])
            combined_data["header"].update(first_raw.get("header", {}))
        except Exception:
            pass

    return combined_data


# ✅ SAVE TO SQL
@app.post("/save")
def save_data(req: SaveRequest):
    conn = get_conn()
    cursor = conn.cursor()

    try:
        # Format 1: Bill of Material
        raw_bom = json.dumps({
            "header": req.header,
            "rows": req.rows,
            "shellCols": req.shellCols
        })
        upsert_format_data(cursor, "BOM_DATA", "Bill of Material", req, raw_bom)

        # Format 2: Non Returnable Auxiliary
        raw_nr = json.dumps({
            "header": req.header,
            "rows": req.header.get("nonReturnableAuxRows", []),
            "columns": req.header.get("nonReturnableCols", [])
        })
        upsert_format_data(cursor, "BOM_DATA", "Non Returnable Auxiliary", req, raw_nr)

        # Format 3: Returnable Auxiliary
        raw_r = json.dumps({
            "header": req.header,
            "rows": req.header.get("returnableAuxRows", []),
            "columns": req.header.get("returnableCols", [])
        })
        upsert_format_data(cursor, "BOM_DATA", "Returnable Auxiliary", req, raw_r)

        # Format 4: Cycle Time - Tentative
        raw_t = json.dumps({
            "header": req.header,
            "rows": req.header.get("tentativeCycleRows", []),
            "columns": req.header.get("tentativeCycleCols", [])
        })
        upsert_format_data(cursor, "BOM_DATA", "Cycle Time - Tentative", req, raw_t)

        # Format 5: Cycle Time - Production
        raw_p = json.dumps({
            "header": req.header,
            "rows": req.header.get("productionCycleRows", []),
            "columns": req.header.get("productionCycleCols", [])
        })
        upsert_format_data(cursor, "BOM_DATA", "Cycle Time - Production", req, raw_p)

        conn.commit()
    finally:
        conn.close()

    return {"status": "saved"}


# ✅ APPROVE
@app.post("/approve")
def approve(req: ApproveRequest):
    conn = get_conn()
    cursor = conn.cursor()

    try:
        # Format 1: Bill of Material
        raw_bom = json.dumps({
            "header": req.header,
            "rows": req.rows,
            "shellCols": req.shellCols
        })
        upsert_format_data(cursor, "BOM_APPROVED", "Bill of Material", req, raw_bom)

        # Format 2: Non Returnable Auxiliary
        raw_nr = json.dumps({
            "header": req.header,
            "rows": req.header.get("nonReturnableAuxRows", []),
            "columns": req.header.get("nonReturnableCols", [])
        })
        upsert_format_data(cursor, "BOM_APPROVED", "Non Returnable Auxiliary", req, raw_nr)

        # Format 3: Returnable Auxiliary
        raw_r = json.dumps({
            "header": req.header,
            "rows": req.header.get("returnableAuxRows", []),
            "columns": req.header.get("returnableCols", [])
        })
        upsert_format_data(cursor, "BOM_APPROVED", "Returnable Auxiliary", req, raw_r)

        # Format 4: Cycle Time - Tentative
        raw_t = json.dumps({
            "header": req.header,
            "rows": req.header.get("tentativeCycleRows", []),
            "columns": req.header.get("tentativeCycleCols", [])
        })
        upsert_format_data(cursor, "BOM_APPROVED", "Cycle Time - Tentative", req, raw_t)

        # Format 5: Cycle Time - Production
        raw_p = json.dumps({
            "header": req.header,
            "rows": req.header.get("productionCycleRows", []),
            "columns": req.header.get("productionCycleCols", [])
        })
        upsert_format_data(cursor, "BOM_APPROVED", "Cycle Time - Production", req, raw_p)

        conn.commit()
    finally:
        conn.close()

    return {"status": "approved"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8080, reload=True)