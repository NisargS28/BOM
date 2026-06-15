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

const TD = {
  padding: "6px 8px",
  borderRight: "1px solid #e4eaf4",
  whiteSpace: "nowrap",
  fontSize: 11,
  color: "#2c4a72"
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

export default function ImportExcelModal({
  isOpen,
  onClose,
  importFile,
  importRows,
  importHeaders,
  importMapping,
  setImportMapping,
  shellCols,
  applyImport
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ borderTop: "3px solid #2d8a3e", width: 800, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, color: "#1e3a5f", letterSpacing: 2 }}>📥 IMPORT FROM EXCEL</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: "#888", marginBottom: 14, background: "#edfff2", padding: "8px 12px", borderRadius: 4, border: "1px solid #2d8a3e22" }}>
          File: <strong style={{ color: "#2d8a3e" }}>{importFile}</strong> — <strong>{importRows.length}</strong> data rows. Map your Excel columns to BOM fields below. Unmapped fields will use defaults.
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#2d8a3e", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>COLUMN MAPPING — Excel column → BOM field</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              ["description", "DESCRIPTION"],
              ["type", "MATERIAL TYPE"],
              ["supplier", "SUPPLIER"],
              ["finishing", "FINISHING"],
              ["surface", "SURFACE"],
              ["length", "LENGTH (m)"],
              ["width", "WIDTH (m)"],
              ["thickness", "THICKNESS (m)"],
              ["density", "DENSITY (kg/m³)"],
              ...shellCols.map(c => [c.id, c.label + " SHEETS"])
            ].map(([field, label]) => (
              <div key={field}>
                <div style={{ fontSize: 8, color: "#888", marginBottom: 2, fontWeight: 600 }}>{label}</div>
                <select value={importMapping[field] != null ? importMapping[field] : ""} onChange={e => setImportMapping(m => ({ ...m, [field]: e.target.value !== "" ? parseInt(e.target.value) : undefined }))} style={{ ...iStyle, fontSize: 10, padding: "4px 8px" }}>
                  <option value="">— skip —</option>
                  {importHeaders.map((h, i) => <option key={i} value={i}>{h || `Col ${i + 1}`}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {importRows.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>DATA PREVIEW — first 3 rows</div>
            <div style={{ overflowX: "auto", borderRadius: 4, border: "1px solid #dde1ea" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                <thead>
                  <tr style={{ background: "#e8f0fb" }}>
                    {importHeaders.map((h, i) => <th key={i} style={{ ...TH, fontSize: 8, padding: "5px 8px" }}>{h || `Col ${i + 1}`}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {importRows.slice(0, 3).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: "1px solid #eee" }}>
                      {row.map((cell, ci) => <td key={ci} style={{ ...TD, fontSize: 9, padding: "4px 8px" }}>{String(cell)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#aaa", marginRight: 4 }}>Import mode:</span>
          <button onClick={onClose} style={{ ...btnSmall, padding: "7px 16px" }}>CANCEL</button>
          <button onClick={() => applyImport("append")} style={{ ...btnPrimary, background: "#2563a8" }}>+ APPEND TO TABLE</button>
          <button onClick={() => applyImport("replace")} style={{ ...btnPrimary, background: "#2d8a3e" }}>⟳ REPLACE ALL ROWS</button>
        </div>
      </div>
    </div>
  );
}
