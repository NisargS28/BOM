import React from 'react';

const iStyle = {
  background: "#f8fafc",
  border: "1px solid #d0dcea",
  color: "#1e3a5f",
  padding: "5px 10px",
  fontSize: 11,
  fontFamily: "'JetBrains Mono',monospace",
  width: "100%",
  borderRadius: 3
};

const TD = {
  padding: "6px 8px",
  borderRight: "1px solid #e4eaf4",
  whiteSpace: "nowrap",
  fontSize: 11,
  color: "#2c4a72"
};

const TH = {
  padding: "8px 10px",
  color: "#3b5a8a",
  fontWeight: 700,
  letterSpacing: .6,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 9,
  borderRight: "1px solid #c8d8ee",
  background: "#e8f0fb"
};

const btnPrimary = {
  background: "#e6920a",
  color: "#fff",
  border: "none",
  padding: "7px 18px",
  fontSize: 11,
  fontFamily: "'JetBrains Mono',monospace",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: 1,
  borderRadius: 5,
  boxShadow: "0 2px 6px rgba(230,146,10,.25)"
};

const btnSmall = {
  background: "transparent",
  border: "1.5px solid #e6920a",
  color: "#e6920a",
  padding: "3px 8px",
  fontSize: 11,
  fontFamily: "inherit",
  cursor: "pointer",
  borderRadius: 4
};

const calcTotalQtyKit = (r, auxCols) => {
  if (!auxCols || auxCols.length === 0) return parseFloat(r.qtyKit) || 0;
  const itemSum = auxCols
    .map(c => parseFloat(r[c.id]))
    .filter(n => !isNaN(n))
    .reduce((a, b) => a + b, 0);
  return itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
};

const fmtCurrency = (val) => {
  if (!val || parseFloat(val) === 0) return "-";
  return `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function NonReturnableAuxiliaryTable({
  filtered,
  setRows,
  canUndo,
  undoRows,
  addRow,
  search,
  setSearch,
  inlineCell,
  setInlineCell,
  inlineVal,
  setInlineVal,
  startInline,
  commitInline,
  openEdit,
  dupRow,
  deleteRow,
  showToast,
  header,
  auxCols
}) {
  // Compute totals
  const totalQtyKitSum = filtered.reduce((sum, r) => sum + calcTotalQtyKit(r, auxCols), 0);
  const totalAmountSum = filtered.reduce((sum, r) => sum + (calcTotalQtyKit(r, auxCols) * (parseFloat(r.price) || 0)), 0);

  return (
    <>
      {/* ── TOOLBAR ──────────────────────────────────────────── */}
      <div style={{ padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", background: "#f0f5fb", borderBottom: "1px solid #d4e0f0", flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...iStyle, width: 240, borderRadius: 5, background: "#fff", borderColor: "#c8d8ee" }}
        />
        <div style={{ fontSize: 9, color: "#7a9bc4", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5f4", borderRadius: 4, padding: "3px 8px", fontWeight: 700, letterSpacing: .5 }}>✏ EDIT</span>
          click cell to enter
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => { if (canUndo) { undoRows(); showToast("Undone"); } }}
            disabled={!canUndo}
            style={{ background: canUndo ? "#fff" : "#f8fafc", color: canUndo ? "#4a6fa8" : "#b0c0d8", border: "1.5px solid " + (canUndo ? "#c8d8ee" : "#e4eaf4"), padding: "5px 12px", fontSize: 10, fontFamily: "inherit", fontWeight: 700, cursor: canUndo ? "pointer" : "not-allowed", borderRadius: 5 }}
          >
            ↩ UNDO
          </button>
          <button onClick={addRow} style={{ ...btnPrimary, borderRadius: 5, padding: "6px 16px", boxShadow: "0 2px 6px rgba(230,146,10,.25)" }}>+ ADD ROW</button>
        </div>
      </div>

      {/* ── EXCEL HEADER BLOCK ──────────────────────────────── */}
      <div style={{ padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #dce8f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: "#1e3a5f" }}>BOM: Core-Kit_Auxiliary (Non-Returnable)</div>
          <div style={{ fontSize: 9, color: "#7a9bc4", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>ARTICLE: {header.article || "—"} · REV: {header.rev || "A00"}</div>
        </div>
        <div style={{ background: "#fff4e0", border: "1px solid #e6920a", color: "#e6920a", padding: "4px 10px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          NON-RETURNABLE
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto", boxShadow: "0 1px 4px rgba(30,58,95,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, background: "#fff" }}>
          <thead>
            <tr style={{ background: "#dbe8f8", borderBottom: "1px solid #b8cfe8" }}>
              <th colSpan={7} style={{ ...TH, background: "#dbe8f8", color: "#3b5a8a", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "2px solid #b0c8e4" }}>AUXILIARY ITEM DETAILS</th>
              <th colSpan={auxCols ? auxCols.length : 5} style={{ ...TH, background: "#ede8fb", color: "#6b3fb5", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "2px solid #c4b5f4", textAlign: "center" }}>BLADE ITEMS (QTY / BLADE)</th>
              <th colSpan={4} style={{ ...TH, background: "#fff4e0", color: "#b8600a", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "1px solid #f0d0a0", borderBottom: "2px solid #e6920a88" }}>COST SUMMARY</th>
              <th style={{ ...TH, background: "#f4f6fa", borderRight: "none" }}></th>
            </tr>
            <tr style={{ background: "#f0f5ff", borderBottom: "2px solid #e6920a" }}>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", textAlign: "center" }}>SR</th>
              <th style={{ ...TH, minWidth: 160, background: "#f0f5ff", color: "#4a6fa8" }}>ITEM DESCRIPTION</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", textAlign: "right" }}>L (m)</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", textAlign: "right" }}>W (m)</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", textAlign: "right" }}>H (m)</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8" }}>MATERIAL</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", textAlign: "center", borderRight: "2px solid #ccd6ee" }}>UNIT</th>
              {auxCols && auxCols.map((c, idx) => (
                <th key={c.id} style={{ ...TH, color: "#6b3fb5", background: "#ede8fb", borderRight: idx === auxCols.length - 1 ? "2px solid #c4b5f4" : "1px solid #e5dbff", textAlign: "center" }}>{c.label}</th>
              ))}
              <th style={{ ...TH, color: "#b8600a", background: "#fff4e0", textAlign: "right" }}>QTY/KIT</th>
              <th style={{ ...TH, color: "#b8600a", background: "#fff4e0", textAlign: "right" }}>TOT QTY</th>
              <th style={{ ...TH, color: "#b8600a", background: "#fff4e0", textAlign: "right" }}>PRICE</th>
              <th style={{ ...TH, color: "#b8600a", background: "#fff4e0", borderRight: "1px solid #e8d5b0", textAlign: "right" }}>AMOUNT</th>
              <th style={{ ...TH, background: "#f4f6fa", borderRight: "none" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const bg = "#fdfdf6"; // Excel auxiliary style pale yellow row
              const totalQtyKit = calcTotalQtyKit(r, auxCols);
              const totalAmount = totalQtyKit * (parseFloat(r.price) || 0);

              const handleValueChange = (field, val) => {
                setRows(prev => prev.map(row => row.id === r.id ? { ...row, [field]: val } : row));
              };

              const renderEditableCell = (field, type = "text", align = "left", borderStyle = {}) => {
                const isActive = inlineCell && inlineCell.rowId === r.id && inlineCell.colId === field;
                const displayVal = r[field] != null ? r[field] : "";

                return (
                  <td
                    style={{ ...TD, textAlign: align, background: bg, cursor: "pointer", ...borderStyle }}
                    onClick={() => startInline(r.id, field, displayVal)}
                  >
                    {isActive ? (
                      <input
                        autoFocus
                        className="cell-input"
                        type={type}
                        value={inlineVal}
                        onChange={e => setInlineVal(e.target.value)}
                        onBlur={commitInline}
                        onKeyDown={e => {
                          if (e.key === "Enter") commitInline();
                          if (e.key === "Escape") {
                            setInlineCell(null);
                            setInlineVal("");
                          }
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      displayVal === "" ? <span style={{ color: "#ccc" }}>—</span> : displayVal
                    )}
                  </td>
                );
              };

              return (
                <tr key={r.id} className="row-tr fi" style={{ background: bg, borderBottom: `1px solid #e6920a22` }}>
                  <td style={{ ...TD, textAlign: "center" }}><span style={{ color: "#bbb" }}>{idx + 1}</span></td>
                  {renderEditableCell("description", "text", "left", { fontWeight: 600 })}
                  {renderEditableCell("length", "number", "right")}
                  {renderEditableCell("width", "number", "right")}
                  {renderEditableCell("height", "number", "right")}
                  {renderEditableCell("material", "text", "left")}
                  {renderEditableCell("unit", "text", "center", { borderRight: "2px solid #ddd" })}
                  
                  {/* Blade Items */}
                  {auxCols && auxCols.map((c, idx) => 
                    renderEditableCell(c.id, "text", "center", idx === auxCols.length - 1 ? { borderRight: "2px solid #c4b5f4" } : {})
                  )}

                  {renderEditableCell("qtyKit", "number", "right")}
                  <td style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#1e3a5f" }}>{totalQtyKit}</td>
                  {renderEditableCell("price", "number", "right")}
                  <td style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#b8600a" }}>{fmtCurrency(totalAmount)}</td>

                  <td style={{ ...TD, whiteSpace: "nowrap" }}>
                    <button className="act-btn" title="Edit" onClick={() => openEdit(r)} style={btnSmall}>✏</button>
                    <button className="act-btn" title="Duplicate" onClick={() => dupRow(r)} style={{ ...btnSmall, marginLeft: 3 }}>⧉</button>
                    <button className="act-btn" title="Delete" onClick={() => deleteRow(r.id)} style={{ ...btnSmall, marginLeft: 3, borderColor: "#e74c3c", color: "#e74c3c" }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0f5ff", borderTop: "2px solid #e6920a" }}>
              <td colSpan={7} style={{ ...TD, background: "#e8f0fb", color: "#e6920a", fontWeight: 800, fontSize: 10, letterSpacing: 1, borderRight: "2px solid #b0c8e4" }}>TOTALS</td>
              <td colSpan={auxCols ? auxCols.length : 5} style={{ ...TD, background: "#ede8fb", borderRight: "2px solid #c4b5f4" }} />
              <td style={{ ...TD, background: "#fff4e0" }} />
              <td style={{ ...TD, color: "#b8600a", fontWeight: 800, background: "#fff4e0", textAlign: "right" }}>{totalQtyKitSum}</td>
              <td style={{ ...TD, background: "#fff4e0" }} />
              <td style={{ ...TD, color: "#b8600a", fontWeight: 800, background: "#fff4e0", textAlign: "right", borderRight: "1px solid #e8d5b0" }}>{fmtCurrency(totalAmountSum)}</td>
              <td style={{ background: "#f4f6fa", borderBottom: "none" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── SUMMARY CARDS ────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 16px", background: "linear-gradient(180deg,#f8fbff,#eef4fc)", borderTop: "3px solid #e6920a", display: "flex", gap: 10, flexWrap: "wrap", boxShadow: "0 -2px 8px rgba(30,58,95,.06)" }}>
        <div style={{ background: "#fff", border: "1.5px solid #2563a833", borderLeft: "3px solid #2563a8", borderRadius: 6, padding: "9px 14px", minWidth: 160 }}>
          <div style={{ fontSize: 8, color: "#2563a8", letterSpacing: 1.2, fontWeight: 800, marginBottom: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>TOTAL ITEMS</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{filtered.length}</div>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #6b3fb533", borderLeft: "3px solid #6b3fb5", borderRadius: 6, padding: "9px 14px", minWidth: 160 }}>
          <div style={{ fontSize: 8, color: "#6b3fb5", letterSpacing: 1.2, fontWeight: 800, marginBottom: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>TOTAL QTY/KIT</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{totalQtyKitSum}</div>
        </div>
        <div style={{ marginLeft: "auto", background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", borderRadius: 8, padding: "10px 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", minWidth: 200, boxShadow: "0 2px 8px rgba(30,58,95,.18)" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,.6)", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>GRAND TOTAL AMOUNT</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "#e6920a", lineHeight: 1 }}>{fmtCurrency(totalAmountSum)}</div>
        </div>
      </div>
    </>
  );
}
