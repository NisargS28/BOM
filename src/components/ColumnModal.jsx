import React from 'react';
import { PALETTE } from '../constants';

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

export default function ColumnModal({
  isOpen,
  onClose,
  shellCols,
  setShellCols,
  setRows,
  newColLabel,
  setNewColLabel,
  newColColor,
  setNewColColor,
  newColCode,
  setNewColCode,
  newColRev,
  setNewColRev,
  addShellCol,
  removeShellCol,
  renameShellCol,
  recolorShellCol,
  updateColCode,
  updateColRev,
  selectedFormat,
  auxCols,
  addAuxCol,
  removeAuxCol,
  renameAuxCol
}) {
  if (!isOpen) return null;

  const isAuxiliary = selectedFormat && selectedFormat.includes("Auxiliary");

  if (isAuxiliary) {
    return (
      <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-box" style={{ borderTop: "3px solid #e6920a", width: 500, maxWidth: "95vw" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, color: "#1e3a5f", letterSpacing: 2 }}>⚙ MANAGE BLADE ITEM COLUMNS</div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: 10, color: "#7a9bc4", marginBottom: 14, background: "#f0f5fb", padding: "10px 14px", borderRadius: 6, border: "1px solid #d0dcea" }}>
            Add, remove, or update the dynamic <strong>Blade Item</strong> quantity columns. These represent the quantity per blade.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18, maxHeight: "250px", overflowY: "auto" }}>
            {auxCols && auxCols.map((c, idx) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", padding: "8px 12px", borderRadius: 6, border: "1px solid #ccd8e8" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#7a9bc4", minWidth: 20 }}>#{idx + 1}</span>
                <input 
                  value={c.label} 
                  onChange={e => renameAuxCol(c.id, e.target.value)} 
                  style={{ ...iStyle, flex: 1, fontWeight: 600 }} 
                  placeholder="Column label" 
                />
                <button 
                  onClick={() => removeAuxCol(c.id)} 
                  style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e74c3c", padding: "4px 11px", fontSize: 10, borderRadius: 5, cursor: "pointer", fontWeight: 700 }}
                >
                  ✕ Remove
                </button>
              </div>
            ))}
            {(!auxCols || auxCols.length === 0) && <div style={{ color: "#ccc", fontSize: 11, textAlign: "center", padding: "12px 0" }}>No columns yet.</div>}
          </div>
          <div style={{ borderTop: "2px solid #f0f4fa", paddingTop: 16 }}>
            <div style={{ fontSize: 9, color: "#4a6fa8", letterSpacing: 1.5, marginBottom: 12, fontWeight: 800 }}>+ ADD NEW COLUMN</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input 
                value={newColLabel} 
                onChange={e => setNewColLabel(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === "Enter" && newColLabel.trim()) {
                    addAuxCol(newColLabel.trim());
                    setNewColLabel("");
                  }
                }} 
                placeholder="e.g. ITM 6" 
                style={{ ...iStyle, flex: 1, fontWeight: 600 }} 
              />
              <button 
                onClick={() => {
                  if (newColLabel.trim()) {
                    addAuxCol(newColLabel.trim());
                    setNewColLabel("");
                  }
                }} 
                style={{ ...btnPrimary }}
              >
                + Add
              </button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={onClose} style={btnPrimary}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ borderTop: "3px solid #e6920a", width: 600, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, color: "#1e3a5f", letterSpacing: 2 }}>⚙ MANAGE SHELL COLUMNS</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: "#7a9bc4", marginBottom: 14, background: "#f0f5fb", padding: "10px 14px", borderRadius: 6, border: "1px solid #d0dcea" }}>
          Each column = one shell part (e.g. Suction Side, Pressure Side). Set its <strong>Item Code</strong> and <strong>Revision</strong> — these appear in the table header and export.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
          {shellCols.map(c => (
            <div key={c.id} style={{ background: "#fff", padding: "12px 16px", borderRadius: 8, border: "2px solid " + c.color + "44", marginBottom: 2, borderLeft: "4px solid " + c.color }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: c.color, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }} />
                  <input type="color" value={c.color} onChange={e => recolorShellCol(c.id, e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: 22, height: 22 }} />
                </div>
                <input value={c.label} onChange={e => renameShellCol(c.id, e.target.value)} style={{ ...iStyle, flex: 1, fontWeight: 700, fontSize: 12, color: c.color, borderColor: c.color + "44", background: c.color + "08" }} placeholder="Column label" />
                <button onClick={() => removeShellCol(c.id)} style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e74c3c", padding: "4px 11px", fontSize: 10, borderRadius: 5, cursor: "pointer", flexShrink: 0, fontWeight: 700 }}>✕ Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ITEM CODE</div>
                  <input value={c.itemCode || ""} onChange={e => updateColCode(c.id, e.target.value)} style={{ ...iStyle, fontSize: 11 }} placeholder="e.g. SK-SUCT-001" />
                </div>
                <div>
                  <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>REVISION</div>
                  <input value={c.itemRev || ""} onChange={e => updateColRev(c.id, e.target.value)} style={{ ...iStyle, fontSize: 11 }} placeholder="A" />
                </div>
              </div>
              {(c.itemCode || c.itemRev) && (
                <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: "#94a3b8" }}>PREVIEW:</span>
                  {c.itemCode && <span style={{ background: c.color + "15", color: c.color, border: "1px solid " + c.color + "44", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>{c.itemCode}</span>}
                  {c.itemRev && <span style={{ background: c.color, color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 700 }}>Rev {c.itemRev}</span>}
                </div>
              )}
            </div>
          ))}
          {shellCols.length === 0 && <div style={{ color: "#ccc", fontSize: 11, textAlign: "center", padding: "12px 0" }}>No columns yet.</div>}
        </div>
        <div style={{ borderTop: "2px solid #f0f4fa", paddingTop: 16 }}>
          <div style={{ fontSize: 9, color: "#4a6fa8", letterSpacing: 1.5, marginBottom: 12, fontWeight: 800 }}>+ ADD NEW COLUMN</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 120px 100px", gap: 8, alignItems: "end", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>COLOR</div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 80 }}>
                {PALETTE.map(p => (
                  <div
                    key={p}
                    onClick={() => setNewColColor(p)}
                    style={{ width: 16, height: 16, borderRadius: "50%", background: p, cursor: "pointer", border: newColColor === p ? "2.5px solid #1e3a5f" : "1.5px solid transparent", boxShadow: newColColor === p ? "0 0 0 1px #fff inset" : "" }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>LABEL</div>
              <input value={newColLabel} onChange={e => setNewColLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addShellCol()} placeholder="e.g. Root – PET" style={{ ...iStyle, fontWeight: 600 }} />
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ITEM CODE</div>
              <input value={newColCode} onChange={e => setNewColCode(e.target.value)} placeholder="SK-001" style={{ ...iStyle }} />
            </div>
            <div>
              <div style={{ fontSize: 8, color: "#7a9bc4", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>REVISION</div>
              <input value={newColRev} onChange={e => setNewColRev(e.target.value)} placeholder="A" style={{ ...iStyle }} />
            </div>
          </div>
          <button onClick={addShellCol} style={{ ...btnPrimary, width: "100%", marginBottom: 14 }}>+ Add Column</button>
          <div>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>QUICK PRESETS</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {[
                ["Suction - BALSA", "#c87530"],
                ["Suction - PET", "#2563a8"],
                ["Pressure - PET", "#2563a8"],
                ["Pressure - BALSA", "#c87530"],
                ["LE Reinf - PET", "#2d8a3e"],
                ["TE Reinf - BALSA", "#c87530"],
                ["Root - PET", "#9b3090"],
                ["Web - BALSA", "#c87530"]
              ].map(([label, color]) => {
                const already = shellCols.some(c => c.label === label);
                return (
                  <button
                    key={label}
                    disabled={already}
                    onClick={() => {
                      if (!already) {
                        const id = "sc_" + Date.now();
                        setShellCols(p => [...p, { id, label, color, itemCode: "", itemRev: "A" }]);
                        setRows(p => p.map(r => ({ ...r, [id]: 0 })));
                      }
                    }}
                    style={{ background: already ? "#f8fafc" : "#fff", color: already ? "#c8d8ee" : color, border: `1.5px solid ${already ? "#e4eaf4" : color}`, padding: "4px 10px", fontSize: 9, borderRadius: 4, cursor: already ? "not-allowed" : "pointer", fontWeight: 700, opacity: already ? 0.6 : 1 }}
                  >
                    {already ? "✓ " : ""}{label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      </div>
    </div>
  );
}
