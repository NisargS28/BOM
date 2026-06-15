import React, { useState } from 'react';

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

export default function HeaderSection({
  header,
  setHeader,
  articleList,
  setArticleList,
  revisionList,
  setRevisionList,
  newArticle,
  setNewArticle,
  newCustomer,
  setNewCustomer,
  newRevision,
  setNewRevision,
  selectedFormat,
  setSelectedFormat
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isAuxSubmenuOpen, setIsAuxSubmenuOpen] = useState(false);

  let metaFields = [
    ["article", "ARTICLE"],
    ["customer", "CUSTOMER"],
    ["rev", "REVISION"],
    ["preparedBy", "PREPARED BY"],
    ["checkedBy", "CHECKED BY"],
    ["articleCode", "ARTICLE CODE"],
    ["ecNo", "EC NO"],
    ["articleRev", "ARTICLE REV"]
  ];

  if (selectedFormat === "Cycle Time - Tentative") {
    metaFields = [
      ["article", "ARTICLE"],
      ["customer", "CUSTOMER"],
      ["rev", "REVISION"],
      ["projectName", "PROJECT NAME"],
      ["customerLocation", "CUSTOMER LOCATION"],
      ["supplier", "SUPPLIER"],
      ["supplyLocation", "SUPPLY LOCATION"],
      ["section", "SECTION"],
      ["machine", "MACHINE"],
      ["projectCode", "PROJECT CODE"],
      ["preparedBy", "MADE BY -"],
      ["checkedBy", "VERIFIED BY -"],
      ["approvedBy", "APPROVED BY -"]
    ];
  } else if (selectedFormat === "Cycle Time - Production") {
    metaFields = [
      ["article", "ARTICLE"],
      ["customer", "CUSTOMER"],
      ["rev", "REVISION"],
      ["projectName", "PROJECT NAME"],
      ["customerLocation", "CUSTOMER LOCATION"],
      ["supplier", "SUPPLIER"],
      ["supplyLocation", "SUPPLY LOCATION"],
      ["section", "SECTION"],
      ["machine", "MACHINE"],
      ["projectCode", "PROJECT CODE"],
      ["dataTakenBy", "DATA TAKEN BY -"],
      ["kitWoNo", "KIT W/O NO -"],
      ["kitPrdDate", "KIT PRD DATE -"]
    ];
  }

  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #d4e0f0", background: "#ffffff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 14, background: "#e6920a", borderRadius: 2 }} />
          <span style={{ fontSize: 9, color: "#4a6fa8", fontWeight: 700, letterSpacing: 1.5 }}>PROJECT INFORMATION</span>
        </div>

        {/* Format Dropdown Selector */}
        <div style={{ position: "relative", zIndex: 100 }}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: "#fff",
              border: "1.5px solid #e6920a",
              color: "#1e3a5f",
              padding: "5px 12px",
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              borderRadius: 5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(230,146,10,.1)",
              outline: "none"
            }}
          >
            📋 FORMAT: {selectedFormat || "Bill of Material"} <span style={{ fontSize: 8 }}>▼</span>
          </button>
          
          {isDropdownOpen && (
            <div 
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 6,
                background: "#fff",
                border: "1px solid #d0dcea",
                borderRadius: 6,
                boxShadow: "0 8px 24px rgba(30, 58, 95, 0.15)",
                width: 180,
                overflow: "visible",
                padding: "4px 0"
              }}
            >
              <div 
                style={{
                  position: "relative"
                }}
                onMouseEnter={() => { setIsAuxSubmenuOpen(true); setIsSubmenuOpen(false); }}
                onMouseLeave={() => setIsAuxSubmenuOpen(false)}
              >
                <div 
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#1e3a5f",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  <span>Auxiliary</span>
                  <span style={{ fontSize: 8 }}>▶</span>
                </div>
                
                {isAuxSubmenuOpen && (
                  <div 
                    style={{
                      position: "absolute",
                      top: 0,
                      right: "100%",
                      background: "#fff",
                      border: "1px solid #d0dcea",
                      borderRadius: 6,
                      boxShadow: "0 8px 24px rgba(30, 58, 95, 0.15)",
                      width: 190,
                      padding: "4px 0",
                      transform: "translateX(2px)"
                    }}
                  >
                    <div 
                      onClick={() => { setSelectedFormat("Non Returnable Auxiliary"); setIsDropdownOpen(false); }}
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        cursor: "pointer",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Non Returnable Auxiliary
                    </div>
                    <div 
                      onClick={() => { setSelectedFormat("Returnable Auxiliary"); setIsDropdownOpen(false); }}
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        cursor: "pointer",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Returnable Auxiliary
                    </div>
                  </div>
                )}
              </div>
              
              <div 
                onClick={() => { setSelectedFormat("Bill of Material"); setIsDropdownOpen(false); }}
                style={{
                  padding: "8px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#1e3a5f",
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => { e.target.style.background = "#f0f5fb"; setIsSubmenuOpen(false); setIsAuxSubmenuOpen(false); }}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                Bill of Material
              </div>
              
              <div 
                style={{
                  position: "relative"
                }}
                onMouseEnter={() => { setIsSubmenuOpen(true); setIsAuxSubmenuOpen(false); }}
                onMouseLeave={() => setIsSubmenuOpen(false)}
              >
                <div 
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#1e3a5f",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  <span>Cycle Time</span>
                  <span style={{ fontSize: 8 }}>▶</span>
                </div>
                
                {isSubmenuOpen && (
                  <div 
                    style={{
                      position: "absolute",
                      top: 0,
                      right: "100%",
                      background: "#fff",
                      border: "1px solid #d0dcea",
                      borderRadius: 6,
                      boxShadow: "0 8px 24px rgba(30, 58, 95, 0.15)",
                      width: 140,
                      padding: "4px 0",
                      transform: "translateX(2px)"
                    }}
                  >
                    <div 
                      onClick={() => { setSelectedFormat("Cycle Time - Tentative"); setIsDropdownOpen(false); }}
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        cursor: "pointer",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Tentative
                    </div>
                    <div 
                      onClick={() => { setSelectedFormat("Cycle Time - Production"); setIsDropdownOpen(false); }}
                      style={{
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1e3a5f",
                        cursor: "pointer",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f0f5fb"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Production
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 10 }}>
        {metaFields.map(([k, l]) => (
          <div key={k}>
            <div style={{ fontSize: 8, color: "#7a9bc4", letterSpacing: 1.2, marginBottom: 3, fontWeight: 700 }}>{l}</div>
            
            {k === "article" ? (
              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  <select
                    value={header.article}
                    onChange={(e) => setHeader(h => ({ ...h, article: e.target.value }))}
                    style={{ ...iStyle, flex: 1 }}
                  >
                    <option value="">Select</option>
                    {articleList.map((a, i) => (
                      <option key={i} value={a.article}>{a.article}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (!newArticle) return;
                      if (!articleList.some(a => a.article === newArticle)) {
                        setArticleList(prev => [...prev, { article: newArticle, customer: "" }]);
                      }
                      setHeader(h => ({ ...h, article: newArticle }));
                      setNewArticle("");
                    }}
                    style={{ padding: "0 8px", cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>

                <input
                  placeholder="New Article"
                  value={newArticle}
                  onChange={(e) => setNewArticle(e.target.value)}
                  style={{ ...iStyle, marginTop: 4 }}
                />
              </div>
            ) : k === "customer" ? (
              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  <select
                    value={header.customer}
                    onChange={(e) => setHeader(h => ({ ...h, customer: e.target.value }))}
                    style={{ ...iStyle, flex: 1 }}
                  >
                    <option value="">Select</option>
                    {articleList.map((a, i) => (
                      <option key={i} value={a.customer}>{a.customer}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (!newCustomer) return;
                      if (!articleList.some(a => a.customer === newCustomer)) {
                        setArticleList(prev => [...prev, { article: header.article, customer: newCustomer }]);
                      }
                      setHeader(h => ({ ...h, customer: newCustomer }));
                      setNewCustomer("");
                    }}
                    style={{ padding: "0 8px", cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>

                <input
                  placeholder="New Customer"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  style={{ ...iStyle, marginTop: 4 }}
                />
              </div>
            ) : k === "rev" ? (
              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  <select
                    value={header.rev}
                    onChange={(e) => setHeader(h => ({ ...h, rev: e.target.value }))}
                    style={{ ...iStyle, flex: 1 }}
                  >
                    <option value="">Select</option>
                    {revisionList.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (!newRevision) return;
                      if (!revisionList.includes(newRevision)) {
                        setRevisionList(prev => [...prev, newRevision]);
                      }
                      setHeader(h => ({ ...h, rev: newRevision }));
                      setNewRevision("");
                    }}
                    style={{ padding: "0 8px", cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>

                <input
                  placeholder="New Revision"
                  value={newRevision}
                  onChange={(e) => setNewRevision(e.target.value)}
                  style={{ ...iStyle, marginTop: 4 }}
                />
              </div>
            ) : (
              <input
                value={header[k] || ""}
                onChange={(e) => setHeader(h => ({ ...h, [k]: e.target.value }))}
                style={{ ...iStyle }}
                placeholder="—"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
