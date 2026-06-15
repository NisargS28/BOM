import React from 'react';
import { getRowBg, getAccent } from '../utils/calculations';

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

export default function BOMTable({
  filtered,
  showMetric,
  setShowMetric,
  extraPct,
  setExtraPct,
  canUndo,
  undoRows,
  addRow,
  search,
  setSearch,
  filterType,
  setFilterType,
  matNames,
  shellCols,
  totals,
  matTypes,
  setRows,
  inlineCell,
  setInlineCell,
  inlineVal,
  setInlineVal,
  startInline,
  commitInline,
  openEdit,
  dupRow,
  deleteRow,
  showToast
}) {
  return (
    <>
      {/* ── TOOLBAR ──────────────────────────────────────────── */}
      <div style={{ padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", background: "#f0f5fb", borderBottom: "1px solid #d4e0f0", flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search description / supplier…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...iStyle, width: 240, borderRadius: 5, background: "#fff", borderColor: "#c8d8ee" }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ ...iStyle, width: 160, borderRadius: 5, background: "#fff", borderColor: "#c8d8ee" }}
        >
          <option value="ALL">ALL TYPES</option>
          {matNames.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ fontSize: 9, color: "#7a9bc4", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5f4", borderRadius: 4, padding: "3px 8px", fontWeight: 700, letterSpacing: .5 }}>✏ SHEETS</span>
          click cell to enter
          <span style={{ color: "#c8d8ee" }}>|</span>
          <span style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 4, padding: "3px 8px", fontWeight: 700, letterSpacing: .5 }}>AUTO</span>
          SQM · VOL · WT
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

      {/* ── TABLE ────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto", boxShadow: "0 1px 4px rgba(30,58,95,.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, background: "#fff" }}>
          <thead>
            <tr style={{ background: "#dbe8f8", borderBottom: "1px solid #b8cfe8" }}>
              <th colSpan={6} style={{ ...TH, background: "#dbe8f8", color: "#3b5a8a", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "2px solid #b0c8e4" }}>MATERIAL INFO</th>
              <th colSpan={4} style={{ ...TH, background: "#ede8fb", color: "#6b3fb5", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "2px solid #c4b5f4" }}>SHEET SPECS (✏ edit row)</th>
              {shellCols.map(c => (
                <th key={c.id} colSpan={1} style={{ ...TH, fontSize: 8, fontWeight: 800, letterSpacing: .8, background: c.color + "18", color: c.color, borderRight: "2px solid " + c.color + "55", borderBottom: "3px solid " + c.color, padding: "7px 10px", lineHeight: 1.4, minWidth: 110 }}>
                  <div style={{ fontWeight: 800, letterSpacing: .8 }}>{c.label}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                    {c.itemCode ? (
                      <span style={{ background: "#fff", color: c.color, border: "1px solid " + c.color + "66", borderRadius: 3, padding: "1px 5px", fontSize: 7, fontWeight: 700, letterSpacing: .5 }}>{c.itemCode}</span>
                    ) : (
                      <span style={{ color: c.color + "88", fontSize: 7, fontStyle: "italic" }}>no code</span>
                    )}
                    {c.itemRev && <span style={{ background: c.color, color: "#fff", borderRadius: 3, padding: "1px 5px", fontSize: 7, fontWeight: 700 }}>Rev {c.itemRev}</span>}
                  </div>
                </th>
              ))}
              <th colSpan={4} style={{ ...TH, background: "#fff4e0", color: "#b8600a", fontSize: 8, fontWeight: 800, letterSpacing: 1.2, borderRight: "1px solid #f0d0a0", borderBottom: "2px solid #e6920a88" }}>ROW TOTALS</th>
              <th style={{ ...TH, background: "#f4f6fa", borderRight: "none" }}></th>
            </tr>
            <tr style={{ background: "#f0f5ff", borderBottom: "2px solid #e6920a" }}>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8" }}>SR</th>
              <th style={{ ...TH, minWidth: 160, background: "#f0f5ff", color: "#4a6fa8" }}>DESCRIPTION</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8" }}>TYPE</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8" }}>SUPPLIER</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8" }}>FINISHING</th>
              <th style={{ ...TH, background: "#f0f5ff", color: "#4a6fa8", borderRight: "2px solid #ccd6ee" }}>SURFACE</th>
              <th style={{ ...TH, background: "#ede8fb", color: "#6b3fb5" }}>L(m)</th>
              <th style={{ ...TH, background: "#ede8fb", color: "#6b3fb5" }}>W(m)</th>
              <th style={{ ...TH, background: "#ede8fb", color: "#6b3fb5" }}>Th(m)</th>
              <th style={{ ...TH, background: "#ede8fb", color: "#6b3fb5", borderRight: "2px solid #c4b5f4" }}>DENS</th>
              {shellCols.map(c => (
                <th key={c.id + "s"} style={{ ...TH, color: c.color, background: c.color + "15", borderBottom: "2px solid " + c.color + "88", fontWeight: 800, borderRight: "2px solid " + c.color + "44", minWidth: 110, textAlign: "center" }}>
                  <div>SHEETS</div>
                  <div style={{ fontSize: 7, fontWeight: 700, marginTop: 2, color: showMetric === "sheets" ? c.color : showMetric === "sqm" ? "#b8600a" : showMetric === "vol" ? "#2d8a3e" : "#e6920a", letterSpacing: .3 }}>
                    {showMetric === "sheets" ? "NO. SHEETS" : showMetric === "sqm" ? "SQM m²" : showMetric === "vol" ? "VOL m³" : "WT kg"}
                  </div>
                </th>
              ))}
              <th style={{ ...TH, color: "#6b3fb5", background: "#ede8fb" }}>SHEETS</th>
              <th style={{ ...TH, color: "#2563a8", background: "#e8f4ff" }}>SQM m²</th>
              <th style={{ ...TH, color: "#2d8a3e", background: "#edfff2" }}>VOL m³</th>
              <th style={{ ...TH, color: "#b8600a", background: "#fff4e0", borderRight: "1px solid #e8d5b0" }}>WT kg</th>
              <th style={{ ...TH, background: "#f4f6fa", borderRight: "none" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const acc = getAccent(r.type, matTypes);
              const bg = getRowBg(r.type, matTypes);
              return (
                <tr key={r.id} className="row-tr fi" style={{ background: bg, borderBottom: `1px solid ${acc}22` }}>
                  <td style={TD}><span style={{ color: "#bbb" }}>{idx + 1}</span></td>
                  <td style={{ ...TD, maxWidth: 180 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>{r.description || <span style={{ color: "#ccc" }}>—</span>}</div></td>
                  <td style={{ ...TD, padding: "3px 6px" }}>
                    {showMetric === "sheets" ? (
                      <select
                        value={r.type}
                        onChange={e => {
                          const newType = e.target.value;
                          const mt = matTypes.find(m => m.name === newType);
                          setRows(prev => prev.map(row => row.id === r.id ? { ...row, type: newType, ...(mt ? { length: mt.length, width: mt.width, density: mt.density } : {}) } : row));
                        }}
                        style={{ background: acc + "12", color: acc, border: "1.5px solid " + acc + "55", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "3px 6px", cursor: "pointer", outline: "none", maxWidth: 130 }}
                      >
                        {matNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : (
                      <span style={{ background: acc + "18", color: acc, padding: "2px 5px", borderRadius: 3, fontSize: 9, fontWeight: 700, border: `1px solid ${acc}44` }}>{r.type}</span>
                    )}
                  </td>
                  <td style={TD}>{r.supplier || <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={TD}>{r.finishing || <span style={{ color: "#ccc" }}>—</span>}</td>
                  <td style={{ ...TD, borderRight: "2px solid #ddd", color: "#888" }}>{r.surface}</td>
                  <td style={{ ...TD, color: "#888" }}>{r.length.toFixed(2)}</td>
                  <td style={{ ...TD, color: "#888" }}>{r.width.toFixed(2)}</td>
                  <td style={{ ...TD, color: "#888" }}>{r.thickness.toFixed(3)}</td>
                  <td style={{ ...TD, color: "#888", borderRight: "2px solid #c8b4ff" }}>{r.density}</td>
                  {shellCols.map(c => {
                    const st = r.colStats[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
                    const isActive = inlineCell && inlineCell.rowId === r.id && inlineCell.colId === c.id;
                    const mv = showMetric === "sqm" ? st.sqm : showMetric === "vol" ? st.vol : st.wt;
                    const mvFmt = showMetric === "sqm" ? mv.toFixed(3) : showMetric === "vol" ? mv.toFixed(3) : mv.toFixed(3);
                    const mvBase = showMetric === "sqm" ? (st.sqmBase ?? st.sqm) : showMetric === "vol" ? (st.volBase ?? st.vol) : (st.wtBase ?? st.wt);
                    const mvBaseFmt = extraPct > 0 ? mvBase.toFixed(3) : null;
                    return (
                      <td
                        key={c.id}
                        style={{ ...TD, textAlign: "center", background: bg, borderRight: "2px solid " + c.color + "33", padding: "4px 6px", cursor: showMetric === "sheets" ? "pointer" : "default" }}
                        onClick={() => showMetric === "sheets" && !isActive && startInline(r.id, c.id, r[c.id] || 0)}
                      >
                        {isActive && showMetric === "sheets" ? (
                          <input
                            autoFocus
                            className="cell-input"
                            type="number"
                            min={0}
                            step="0.01"
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
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 28 }}>
                            {showMetric === "sheets" ? (
                              <span style={{ background: c.color + "18", color: c.color, fontWeight: 800, fontSize: 13, borderRadius: 3, padding: "2px 10px", border: "1px solid " + c.color + "33", minWidth: 32, textAlign: "center" }}>
                                {parseFloat((r[c.id] || 0).toFixed(2))}
                              </span>
                            ) : (
                              st.sheets > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                                  <span style={{ fontWeight: 700, fontSize: 12, color: extraPct > 0 ? "#e6920a" : showMetric === "sqm" ? "#b8600a" : showMetric === "vol" ? "#2d8a3e" : "#e6920a" }}>{mvFmt}</span>
                                  {extraPct > 0 && mvBaseFmt && <span style={{ fontSize: 7, color: "#94a3b8", textDecoration: "line-through", lineHeight: 1.2 }}>{mvBaseFmt}</span>}
                                </div>
                              ) : (
                                <span style={{ color: "#ddd", fontSize: 11 }}>—</span>
                              )
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ ...TD, color: "#7c3aed", fontWeight: 700, borderLeft: "2px solid #7c3aed22" }}>{r.totalSheets}</td>
                  <td style={{ ...TD, color: "#1a6fa8", fontWeight: 700 }}>{(r.totalSqm || 0).toFixed(3)}</td>
                  <td style={{ ...TD, color: "#2d8a3e", fontWeight: 700 }}>{(r.totalVol || 0).toFixed(3)}</td>
                  <td style={{ ...TD, color: "#b8600a", fontWeight: 700 }}>{(r.totalWt || 0).toFixed(3)}</td>
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
              <td colSpan={6} style={{ ...TD, background: "#e8f0fb", color: "#e6920a", fontWeight: 800, fontSize: 10, letterSpacing: 1, borderBottom: "none" }}>TOTALS</td>
              <td colSpan={4} style={{ ...TD, background: "#ede8fb", borderBottom: "none" }} />
              {shellCols.map(c => {
                const ct = totals.colTotals[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
                const mv = showMetric === "sqm" ? ct.sqm : showMetric === "vol" ? ct.vol : ct.wt;
                const mvFmt = showMetric === "sqm" ? mv.toFixed(3) : showMetric === "vol" ? mv.toFixed(3) : mv.toFixed(3);
                return (
                  <td key={c.id} style={{ ...TD, textAlign: "center", background: c.color + "12", borderRight: "2px solid " + c.color + "44", borderBottom: "none", padding: "4px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 24 }}>
                      {showMetric === "sheets" ? (
                        <span style={{ color: c.color, fontWeight: 800, fontSize: 13 }}>{parseFloat((ct.sheets || 0).toFixed(2))}</span>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 12, color: showMetric === "sqm" ? "#b8600a" : showMetric === "vol" ? "#2d8a3e" : "#e6920a" }}>{mvFmt}</span>
                      )}
                    </div>
                  </td>
                );
              })}
              <td style={{ ...TD, color: "#6b3fb5", fontWeight: 800, background: "#ede8fb", borderBottom: "none" }}>{parseFloat((totals.totalSheets || 0).toFixed(2))}</td>
              <td style={{ ...TD, color: "#2563a8", fontWeight: 800, background: "#e8f4ff", borderBottom: "none" }}>{totals.totalSqm.toFixed(3)}</td>
              <td style={{ ...TD, color: "#2d8a3e", fontWeight: 800, background: "#edfff2", borderBottom: "none" }}>{totals.totalVol.toFixed(3)}</td>
              <td style={{ ...TD, color: "#b8600a", fontWeight: 800, background: "#fff4e0", borderBottom: "none" }}>{totals.totalWt.toFixed(3)}</td>
              <td style={{ background: "#f4f6fa", borderBottom: "none" }} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ padding: "14px 20px 16px", background: "linear-gradient(180deg,#f8fbff,#eef4fc)", borderTop: "3px solid #e6920a", boxShadow: "0 -2px 8px rgba(30,58,95,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: 2, color: "#4a6fa8" }}>TOTALS BY MATERIAL TYPE</div>
          <div style={{ flex: 1, height: 1, background: "#dce8f4" }} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          {matTypes.map(m => {
            const rows = filtered.filter(r => r.type === m.name);
            const sqm = rows.reduce((a, r) => a + r.totalSqm, 0);
            const vol = rows.reduce((a, r) => a + r.totalVol, 0);
            const wt = rows.reduce((a, r) => a + r.totalWt, 0);
            if (wt === 0 && sqm === 0) return null;
            return (
              <div key={m.id} style={{ background: "#fff", border: "1.5px solid " + m.color + "33", borderLeft: "3px solid " + m.color, borderRadius: 6, padding: "9px 14px", minWidth: 160, boxShadow: "0 1px 4px rgba(30,58,95,.06)" }}>
                <div style={{ fontSize: 8, color: m.color, letterSpacing: 1.2, fontWeight: 800, marginBottom: 6, fontFamily: "'Barlow Condensed',sans-serif" }}>{m.name}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 8, color: "#94a3b8", fontWeight: 600, letterSpacing: .5 }}>SQM</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800, color: m.color, lineHeight: 1 }}>{sqm.toFixed(3)}<span style={{ fontSize: 8, color: "#bbb", marginLeft: 2 }}>m²</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 8, color: "#94a3b8", fontWeight: 600, letterSpacing: .5 }}>VOL</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: "#2d8a3e", lineHeight: 1 }}>{vol.toFixed(3)}<span style={{ fontSize: 8, color: "#bbb", marginLeft: 2 }}>m³</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, borderTop: "1px solid " + m.color + "22", paddingTop: 3, marginTop: 1 }}>
                    <span style={{ fontSize: 8, color: "#94a3b8", fontWeight: 600, letterSpacing: .5 }}>WT</span>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 800, color: "#e6920a", lineHeight: 1 }}>{wt.toFixed(3)}<span style={{ fontSize: 8, color: "#bbb", marginLeft: 2 }}>kg</span></span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ marginLeft: "auto", background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", borderRadius: 8, padding: "10px 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", minWidth: 180, boxShadow: "0 2px 8px rgba(30,58,95,.18)" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.6)", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>GRAND TOTAL</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: "#7dd3fc", marginBottom: 2 }}>{totals.totalSqm.toFixed(3)}<span style={{ fontSize: 9, color: "rgba(255,255,255,.45)", marginLeft: 3 }}>m²</span></div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: "#6ee7b7", marginBottom: 4 }}>{totals.totalVol.toFixed(3)}<span style={{ fontSize: 9, color: "rgba(255,255,255,.45)", marginLeft: 3 }}>m³</span></div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, color: "#e6920a", lineHeight: 1 }}>{totals.total.toFixed(3)}<span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginLeft: 4, fontWeight: 400 }}>kg</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
