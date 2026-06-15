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

export default function MaterialModal({
  isOpen,
  onClose,
  matTypes,
  editMatId,
  setEditMatId,
  newMat,
  setNewMat,
  addMaterial,
  deleteMaterial,
  updateMat
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ borderTop: "3px solid #9b3090", width: 720, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, color: "#1e3a5f", letterSpacing: 2 }}>🧱 MATERIAL TYPES</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: "#888", marginBottom: 14, background: "#fcf5ff", padding: "8px 12px", borderRadius: 4, border: "1px solid #9b309022" }}>
          Define material types with standard sheet dimensions and density. Selecting a type on a row <strong>auto-fills L × W × Density</strong>.
        </div>

        {/* Existing types */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#e8f0fb" }}>
              {["", "NAME", "LENGTH (m)", "WIDTH (m)", "DENSITY (kg/m³)", "ACTIONS"].map((h, i) => (
                <th key={i} style={{ ...TH, padding: "7px 10px", fontSize: 9 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matTypes.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid #eee", background: editMatId === m.id ? "#fdf6ff" : "#fff" }}>
                <td style={{ ...TD, width: 40, textAlign: "center" }}>
                  <div style={{ position: "relative", width: 22, height: 22, margin: "auto" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, border: "2px solid #ddd" }} />
                    {editMatId === m.id && (
                      <input
                        type="color"
                        value={m.color}
                        onChange={e => updateMat(m.id, "color", e.target.value)}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                      />
                    )}
                  </div>
                </td>
                <td style={TD}>
                  {editMatId === m.id ? (
                    <input
                      value={m.name}
                      onChange={e => updateMat(m.id, "name", e.target.value)}
                      style={{ ...iStyle, width: 130 }}
                    />
                  ) : (
                    <strong style={{ color: m.color }}>{m.name}</strong>
                  )}
                </td>
                <td style={TD}>
                  {editMatId === m.id ? (
                    <input
                      type="number"
                      value={m.length}
                      onChange={e => updateMat(m.id, "length", e.target.value)}
                      style={{ ...iStyle, width: 80 }}
                    />
                  ) : (
                    m.length.toFixed(2)
                  )}
                </td>
                <td style={TD}>
                  {editMatId === m.id ? (
                    <input
                      type="number"
                      value={m.width}
                      onChange={e => updateMat(m.id, "width", e.target.value)}
                      style={{ ...iStyle, width: 80 }}
                    />
                  ) : (
                    m.width.toFixed(2)
                  )}
                </td>
                <td style={TD}>
                  {editMatId === m.id ? (
                    <input
                      type="number"
                      value={m.density}
                      onChange={e => updateMat(m.id, "density", e.target.value)}
                      style={{ ...iStyle, width: 90 }}
                    />
                  ) : (
                    m.density
                  )}
                </td>
                <td style={{ ...TD, whiteSpace: "nowrap" }}>
                  {editMatId === m.id ? (
                    <button onClick={() => setEditMatId(null)} style={{ ...btnPrimary, padding: "3px 12px", fontSize: 10 }}>✓ Done</button>
                  ) : (
                    <button onClick={() => setEditMatId(m.id)} style={{ ...btnSmall, fontSize: 10 }}>✏ Edit</button>
                  )}
                  <button onClick={() => deleteMaterial(m.id)} title="Delete material type" style={{ ...btnSmall, marginLeft: 5, borderColor: "#e74c3c", color: "#e74c3c", fontSize: 10 }}>✕ Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add new */}
        <div style={{ borderTop: "2px solid #9b309022", paddingTop: 14 }}>
          <div style={{ fontSize: 9, color: "#9b3090", letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>+ ADD NEW MATERIAL TYPE</div>
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 100px 100px 120px 80px", gap: 8, alignItems: "end" }}>
            <div style={{ position: "relative", paddingTop: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: newMat.color, border: "2px solid #ddd", cursor: "pointer" }} />
              <input
                type="color"
                value={newMat.color}
                onChange={e => setNewMat(m => ({ ...m, color: e.target.value }))}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
            </div>
            {[
              ["name", "NAME", "text"],
              ["length", "LENGTH (m)", "number"],
              ["width", "WIDTH (m)", "number"],
              ["density", "DENSITY (kg/m³)", "number"]
            ].map(([k, l, t]) => (
              <div key={k}>
                <div style={{ fontSize: 8, color: "#aaa", marginBottom: 3, fontWeight: 600 }}>{l}</div>
                <input
                  type={t}
                  value={newMat[k]}
                  placeholder={k === "name" ? "e.g. FOAM 50" : ""}
                  onChange={e => setNewMat(m => ({ ...m, [k]: t === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  style={iStyle}
                />
              </div>
            ))}
            <div style={{ paddingTop: 16 }}>
              <button onClick={addMaterial} style={{ ...btnPrimary, background: "#9b3090", width: "100%", padding: "6px 0" }}>+ ADD</button>
            </div>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PALETTE.map(p => (
              <div
                key={p}
                onClick={() => setNewMat(m => ({ ...m, color: p }))}
                style={{ width: 16, height: 16, borderRadius: "50%", background: p, cursor: "pointer", border: newMat.color === p ? "2.5px solid #1e3a5f" : "2px solid transparent" }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      </div>
    </div>
  );
}
