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

export default function EditRowModal({
  isOpen,
  onClose,
  form,
  setForm,
  handleTypeChange,
  matNames,
  surfaces,
  setSurfaces,
  newSurface,
  setNewSurface,
  saveEdit,
  selectedFormat,
  auxCols
}) {
  if (!isOpen || !form) return null;

  const fInp = (field, type = "text") => (
    <input
      type={type}
      value={form[field] != null ? form[field] : ""}
      onChange={e => setForm(f => ({ ...f, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
      style={iStyle}
    />
  );

  const isAuxiliary = selectedFormat && selectedFormat.includes("Auxiliary");
  const isCycleTime = selectedFormat && selectedFormat.includes("Cycle Time");

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ borderTop: `3px solid ${isAuxiliary ? "#2d8a3e" : isCycleTime ? "#e6920a" : "#7c3aed"}`, width: 660 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, color: "#1e3a5f", letterSpacing: 2 }}>
            {isAuxiliary ? "EDIT AUXILIARY ITEM SPECIFICATIONS" : isCycleTime ? "EDIT CYCLE TIME SPECIFICATIONS" : "EDIT SHEET SPECIFICATIONS"}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {isAuxiliary ? (
          /* Auxiliary Form */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>ITEM DESCRIPTION</div>
              {fInp("description", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>MATERIAL</div>
              {fInp("material", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>UNIT</div>
              {fInp("unit", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>LENGTH (m)</div>
              {fInp("length", "number")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>WIDTH (m)</div>
              {fInp("width", "number")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>HEIGHT (m)</div>
              {fInp("height", "number")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>QTY/KIT</div>
              {fInp("qtyKit", "number")}
            </div>

            {/* Dynamic Blade Items */}
            {auxCols && auxCols.map(c => (
              <div key={c.id}>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>{c.label.toUpperCase()}</div>
                {fInp(c.id, "text")}
              </div>
            ))}
            
            {selectedFormat === "Non Returnable Auxiliary" && (
              <div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>PRICE</div>
                {fInp("price", "number")}
              </div>
            )}
            
            {selectedFormat === "Returnable Auxiliary" && (
              <>
                <div>
                  <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>RETURNABLE PRICE</div>
                  {fInp("returnablePrice", "number")}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>RETURNABLE CYCLE</div>
                  {fInp("returnableCycle", "number")}
                </div>
              </>
            )}
          </div>
        ) : isCycleTime ? (
          /* Cycle Time Form */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>PART DESCRIPTION</div>
              {fInp("partDescription", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>PART CODE</div>
              {fInp("partCode", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>NO OF PROGRAMS</div>
              {fInp("noOfPrograms", "number")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>CNC TIME (HH:MM:SS)</div>
              {fInp("cncTime", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>FINISHING TIME (HH:MM:SS)</div>
              {fInp("finishingTime", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>MANUAL OPERATIONS (HH:MM:SS)</div>
              {fInp("manualOperations", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>REPAIR KIT (HH:MM:SS)</div>
              {fInp("repairKit", "text")}
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>OTHERS (HH:MM:SS)</div>
              {fInp("others", "text")}
            </div>
          </div>
        ) : (
          /* Standard BOM Form */
          <>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 14, background: "#f5f0ff", padding: "8px 12px", borderRadius: 4, border: "1px solid #7c3aed22" }}>
              Selecting a <strong>Material Type</strong> auto-fills Length, Width &amp; Density from the Material Types library.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["description", "DESCRIPTION", "text"],
                ["supplier", "SUPPLIER", "text"],
                ["finishing", "FINISHING", "text"],
                ["length", "LENGTH (m)", "number"],
                ["width", "WIDTH (m)", "number"],
                ["thickness", "THICKNESS (m)", "number"],
                ["density", "DENSITY (kg/m³)", "number"]
              ].map(([k, l, t]) => (
                <div key={k} style={k === "description" ? { gridColumn: "1/-1" } : {}}>
                  <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>{l}</div>
                  {fInp(k, t)}
                </div>
              ))}
              <div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>MATERIAL TYPE</div>
                <select value={form.type} onChange={e => handleTypeChange(e.target.value)} style={iStyle}>
                  {matNames.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1, marginBottom: 3, fontWeight: 600 }}>SURFACE</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                  {surfaces.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, surface: s }))}
                      style={{ padding: "4px 10px", fontSize: 10, borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, border: "1.5px solid " + (form.surface === s ? "#e6920a" : "#d0dcea"), background: form.surface === s ? "#fff4e0" : "#f8fafc", color: form.surface === s ? "#e6920a" : "#7a9bc4", transition: "all .12s" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                  <input
                    value={newSurface}
                    onChange={e => setNewSurface(e.target.value.toUpperCase())}
                    onKeyDown={e => {
                      if (e.key === "Enter" && newSurface.trim()) {
                        setSurfaces(p => [...p, newSurface.trim()]);
                        setForm(f => ({ ...f, surface: newSurface.trim() }));
                        setNewSurface("");
                      }
                    }}
                    placeholder="+ Add surface type"
                    style={{ ...iStyle, flex: 1, fontSize: 10, padding: "4px 8px" }}
                  />
                  <button
                    onClick={() => {
                      if (newSurface.trim()) {
                        setSurfaces(p => [...p, newSurface.trim()]);
                        setForm(f => ({ ...f, surface: newSurface.trim() }));
                        setNewSurface("");
                      }
                    }}
                    style={{ background: "#e6920a", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 14, display: "flex", justifyContent: "flex-end", gap: 6 }}>
          <button onClick={onClose} style={{ ...btnSmall, padding: "7px 18px" }}>Cancel</button>
          <button onClick={saveEdit} style={btnPrimary}>✓ Save changes</button>
        </div>
      </div>
    </div>
  );
}
