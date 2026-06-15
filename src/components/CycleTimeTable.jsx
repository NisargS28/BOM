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
  border: "1px solid #000",
  whiteSpace: "nowrap",
  fontSize: 11,
  color: "#000"
};

const TH = {
  padding: "8px 10px",
  color: "#1e3a5f",
  fontWeight: 700,
  letterSpacing: .6,
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: 10,
  border: "1px solid #000",
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

// --- Time Helper Functions ---
export const parseTimeToSeconds = (value) => {
  if (!value || typeof value !== 'string') return 0;
  const parts = value.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
};

export const formatSecondsToHHMMSS = (seconds) => {
  if (isNaN(seconds) || seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const sumTimeField = (rows, fieldName) => {
  const totalSec = rows.reduce((acc, r) => acc + parseTimeToSeconds(r[fieldName]), 0);
  return formatSecondsToHHMMSS(totalSec);
};

export const getTotalPrograms = (rows) => {
  return rows.reduce((acc, r) => acc + (parseInt(r.noOfPrograms) || 0), 0);
};

export const getCombinedCycleTime = (rows) => {
  const fields = ["cncTime", "finishingTime", "manualOperations", "repairKit", "others"];
  let totalSec = 0;
  rows.forEach(r => {
    fields.forEach(f => {
      totalSec += parseTimeToSeconds(r[f]);
    });
  });
  return formatSecondsToHHMMSS(totalSec);
};

export default function CycleTimeTable({
  mode = "tentative",
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
  headerData = {},
  setHeaderData,
  articleName
}) {
  const isTentative = mode === "tentative";

  // Calculations
  const totalProgramsSum = getTotalPrograms(filtered);
  const sumCNC = sumTimeField(filtered, "cncTime");
  const sumFinishing = sumTimeField(filtered, "finishingTime");
  const sumManual = sumTimeField(filtered, "manualOperations");
  const sumRepair = sumTimeField(filtered, "repairKit");
  const sumOthers = sumTimeField(filtered, "others");
  const grandTotalTime = getCombinedCycleTime(filtered);

  return (
    <>
      {/* ── TOOLBAR ──────────────────────────────────────────── */}
      <div style={{ padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", background: "#f0f5fb", borderBottom: "1px solid #d4e0f0", flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search part description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...iStyle, width: 240, borderRadius: 5, background: "#fff", borderColor: "#c8d8ee" }}
        />
        <div style={{ fontSize: 9, color: "#7a9bc4", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5f4", borderRadius: 4, padding: "3px 8px", fontWeight: 700, letterSpacing: .5 }}>
            {isTentative ? "✏ THEORETICAL CYCLE TIME · HH:MM:SS" : "✏ ACTUAL CYCLE TIME · HH:MM:SS"}
          </span>
          click cell to enter
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={() => { if (canUndo) { undoRows(); showToast("Undone"); } }}
            disabled={!canUndo}
            style={{ background: canUndo ? "#fff" : "#f8fafc", color: canUndo ? "#4a6fa8" : "#b0c8e8", border: "1.5px solid " + (canUndo ? "#c8d8ee" : "#e4eaf4"), padding: "5px 12px", fontSize: 10, fontFamily: "inherit", fontWeight: 700, cursor: canUndo ? "pointer" : "not-allowed", borderRadius: 5 }}
          >
            ↩ UNDO
          </button>
          <button onClick={addRow} style={{ ...btnPrimary, borderRadius: 5, padding: "6px 16px", boxShadow: "0 2px 6px rgba(230,146,10,.25)" }}>+ ADD ROW</button>
        </div>
      </div>

      {/* ── EXCEL TITLE BLOCK ───────────────────────────────── */}
      <div style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid #000", textAlign: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e3a5f" }}>
          {isTentative ? "TENTATIVE" : "PRODUCTION"} CORE KIT CYCLE TIME - <span style={{ color: "#e6920a", background: "#fff4e0", padding: "2px 8px", borderRadius: 4 }}>{articleName || headerData.article || "—"}</span>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto", padding: "10px", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, background: "#fff", border: "1px solid #000" }}>
          <thead>
            <tr style={{ background: "#dbe8f8" }}>
              <th colSpan={4} style={{ ...TH, background: "#dbe8f8", borderRight: "2px solid #000" }}>CORE KIT DETAILS</th>
              <th colSpan={5} style={{ ...TH, background: "#fff4e0", color: "#b8600a", borderRight: "2px solid #000" }}>
                {isTentative ? "THEORETICAL CYCLE TIME IN HH:MM:SS" : "ACTUAL CYCLE TIME IN HH:MM:SS"}
              </th>
              <th style={{ ...TH, background: "#f4f6fa" }}></th>
            </tr>
            <tr style={{ background: "#f0f5ff" }}>
              <th style={{ ...TH, textAlign: "center", width: 50 }}>S.NO</th>
              <th style={{ ...TH, minWidth: 180, textAlign: "left" }}>PART DESCRIPTION</th>
              <th style={{ ...TH, minWidth: 120 }}>PART CODE</th>
              <th style={{ ...TH, width: 100, textAlign: "right", borderRight: "2px solid #000" }}>NO OF PROGRAMS</th>
              <th style={{ ...TH, width: 100, textAlign: "right" }}>CNC TIME</th>
              <th style={{ ...TH, width: 100, textAlign: "right" }}>FINISHING TIME</th>
              <th style={{ ...TH, width: 120, textAlign: "right" }}>MANUAL OPERATIONS</th>
              <th style={{ ...TH, width: 100, textAlign: "right" }}>REPAIR KIT</th>
              <th style={{ ...TH, width: 100, textAlign: "right", borderRight: "2px solid #000" }}>OTHERS</th>
              <th style={{ ...TH, width: 100 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const bg = "#ffffff";

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
                      displayVal === "" || displayVal === 0 ? <span style={{ color: "#ccc" }}>—</span> : displayVal
                    )}
                  </td>
                );
              };

              return (
                <tr key={r.id} className="row-tr fi" style={{ background: bg }}>
                  <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}><span style={{ color: "#555" }}>{r.sno || idx + 1}</span></td>
                  {renderEditableCell("partDescription", "text", "left", { fontWeight: 600 })}
                  {renderEditableCell("partCode", "text", "center")}
                  {renderEditableCell("noOfPrograms", "number", "right", { borderRight: "2px solid #000" })}
                  {renderEditableCell("cncTime", "text", "right")}
                  {renderEditableCell("finishingTime", "text", "right")}
                  {renderEditableCell("manualOperations", "text", "right")}
                  {renderEditableCell("repairKit", "text", "right")}
                  {renderEditableCell("others", "text", "right", { borderRight: "2px solid #000" })}
                  <td style={{ ...TD, textAlign: "center", whiteSpace: "nowrap" }}>
                    <button className="act-btn" title="Edit" onClick={() => openEdit(r)} style={btnSmall}>✏</button>
                    <button className="act-btn" title="Duplicate" onClick={() => dupRow(r)} style={{ ...btnSmall, marginLeft: 3 }}>⧉</button>
                    <button className="act-btn" title="Delete" onClick={() => deleteRow(r.id)} style={{ ...btnSmall, marginLeft: 3, borderColor: "#e74c3c", color: "#e74c3c" }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {/* Totals Row */}
            <tr style={{ background: "#f0f5ff", fontWeight: 800 }}>
              <td colSpan={3} style={{ ...TD, background: "#e8f0fb", color: "#1e3a5f", fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>TOTAL</td>
              <td style={{ ...TD, textAlign: "right", borderRight: "2px solid #000" }}>{totalProgramsSum}</td>
              <td style={{ ...TD, textAlign: "right" }}>{sumCNC}</td>
              <td style={{ ...TD, textAlign: "right" }}>{sumFinishing}</td>
              <td style={{ ...TD, textAlign: "right" }}>{sumManual}</td>
              <td style={{ ...TD, textAlign: "right" }}>{sumRepair}</td>
              <td style={{ ...TD, textAlign: "right", borderRight: "2px solid #000" }}>{sumOthers}</td>
              <td style={{ background: "#f4f6fa", border: "1px solid #000" }} />
            </tr>
            {/* Combined Cycle Time Row */}
            <tr style={{ background: "#fff4e0", fontWeight: 800 }}>
              <td colSpan={4} style={{ ...TD, background: "#ffe4bc", color: "#b8600a", fontWeight: 800, fontSize: 10, letterSpacing: 1, borderRight: "2px solid #000" }}>
                {isTentative ? "TOTAL THEORETICAL CYCLE TIME" : "TOTAL ACTUAL CYCLE TIME"}
              </td>
              <td colSpan={5} style={{ ...TD, textAlign: "center", color: "#e6920a", fontSize: 12, borderRight: "2px solid #000" }}>
                {grandTotalTime}
              </td>
              <td style={{ background: "#f4f6fa", border: "1px solid #000" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── SUMMARY CARDS ────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 16px", background: "linear-gradient(180deg,#f8fbff,#eef4fc)", borderTop: "3px solid #e6920a", display: "flex", gap: 10, flexWrap: "wrap", boxShadow: "0 -2px 8px rgba(30,58,95,.06)" }}>
        <div style={{ background: "#fff", border: "1.5px solid #2563a833", borderLeft: "3px solid #2563a8", borderRadius: 6, padding: "9px 14px", minWidth: 160 }}>
          <div style={{ fontSize: 8, color: "#2563a8", letterSpacing: 1.2, fontWeight: 800, marginBottom: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>TOTAL PARTS</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{filtered.length}</div>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #6b3fb533", borderLeft: "3px solid #6b3fb5", borderRadius: 6, padding: "9px 14px", minWidth: 160 }}>
          <div style={{ fontSize: 8, color: "#6b3fb5", letterSpacing: 1.2, fontWeight: 800, marginBottom: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>TOTAL PROGRAMS</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{totalProgramsSum}</div>
        </div>
        <div style={{ marginLeft: "auto", background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", borderRadius: 8, padding: "10px 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", minWidth: 220, boxShadow: "0 2px 8px rgba(30,58,95,.18)" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,.6)", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
            {isTentative ? "GRAND TOTAL THEORETICAL TIME" : "GRAND TOTAL ACTUAL TIME"}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "#e6920a", lineHeight: 1 }}>{grandTotalTime}</div>
        </div>
      </div>
    </>
  );
}
