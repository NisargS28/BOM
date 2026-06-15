import React, { useState, useEffect, useRef, useMemo } from 'react';

const metricColor = {
  wt: "#e6920a",
  sqm: "#2563a8",
  vol: "#2d8a3e",
  sheets: "#6b3fb5"
};

export default function AnalyticsModal({ computed, shellCols, matTypes, totals, header, onClose }) {
  const [pivotRow, setPivotRow] = useState("type");      // type | shell
  const [pivotMetric, setPivotMetric] = useState("wt");    // wt | sqm | vol | sheets
  const [chartType, setChartType] = useState("bar");       // bar | pie | donut
  const [activeTab, setActiveTab] = useState("charts");    // charts | pivot | summary
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const donutRef = useRef(null);

  // Metric helpers
  const metricLabel = {
    wt: "Weight (kg)",
    sqm: "Area (m²)",
    vol: "Volume (m³)",
    sheets: "No. of Sheets"
  };
  const metricFmt = (v, m) => m === "sheets" ? v.toFixed(2) : v.toFixed(3);

  // Pivot data by material type
  const byMaterial = useMemo(() => {
    return matTypes.map(m => {
      const rows = computed.filter(r => r.type === m.name);
      return {
        name: m.name,
        color: m.color,
        wt: rows.reduce((a, r) => a + r.totalWt, 0),
        sqm: rows.reduce((a, r) => a + r.totalSqm, 0),
        vol: rows.reduce((a, r) => a + r.totalVol, 0),
        sheets: rows.reduce((a, r) => a + r.totalSheets, 0),
      };
    }).filter(m => m[pivotMetric] > 0);
  }, [computed, matTypes, pivotMetric]);

  // Pivot data by shell column
  const byShell = useMemo(() => {
    return shellCols.map(c => {
      const ct = totals.colTotals[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
      return {
        name: c.label,
        color: c.color,
        wt: ct.wt,
        sqm: ct.sqm,
        vol: ct.vol,
        sheets: ct.sheets
      };
    }).filter(c => c[pivotMetric] > 0);
  }, [shellCols, totals, pivotMetric]);

  // Cross-pivot: material × shell
  const crossPivot = useMemo(() => {
    return matTypes.map(m => {
      const entry = { name: m.name, color: m.color };
      shellCols.forEach(c => {
        const rows = computed.filter(r => r.type === m.name);
        const ct = rows.reduce((a, r) => {
          const s = r.colStats[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
          return {
            wt: a.wt + s.wt,
            sqm: a.sqm + s.sqm,
            vol: a.vol + s.vol,
            sheets: a.sheets + s.sheets
          };
        }, { wt: 0, sqm: 0, vol: 0, sheets: 0 });
        entry[c.id] = ct;
      });
      return entry;
    });
  }, [computed, matTypes, shellCols]);

  const chartData = pivotRow === "type" ? byMaterial : byShell;
  const total = chartData.reduce((a, d) => a + d[pivotMetric], 0);

  // Draw Bar Chart
  const drawBar = (canvas, data, metric) => {
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const pad = { top: 30, right: 20, bottom: 70, left: 70 };
    const cw = W - pad.left - pad.right, ch = H - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map(d => d[metric])) * 1.15 || 1;
    const barW = Math.min(52, (cw / data.length) * 0.62);
    const gap = cw / data.length;

    // grid lines
    ctx.strokeStyle = "#e4eaf4";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + ch * (1 - i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px 'JetBrains Mono',monospace";
      ctx.textAlign = "right";
      const v = maxVal * i / 4;
      ctx.fillText(
        metric === "sheets" ? Math.round(v).toString() : metric === "vol" ? v.toFixed(3) : v.toFixed(2),
        pad.left - 6,
        y + 4
      );
    }

    // bars
    data.forEach((d, i) => {
      const x = pad.left + i * gap + gap / 2 - barW / 2;
      const bh = (d[metric] / maxVal) * ch;
      const y = pad.top + ch - bh;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,.06)";
      ctx.fillRect(x + 3, y + 3, barW, bh);
      // bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + bh);
      grad.addColorStop(0, d.color);
      grad.addColorStop(1, d.color + "88");
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, bh, 4);
      } else {
        ctx.rect(x, y, barW, bh);
      }
      ctx.fill();
      // value label
      ctx.fillStyle = "#1e3a5f";
      ctx.font = "bold 10px 'JetBrains Mono',monospace";
      ctx.textAlign = "center";
      const vLabel = metric === "sheets" ? Math.round(d[metric]).toString() : d[metric].toFixed(2);
      ctx.fillText(vLabel, x + barW / 2, y - 5);
      // x label
      ctx.fillStyle = "#4a6fa8";
      ctx.font = "9px 'JetBrains Mono',monospace";
      const words = d.name.split(" ");
      words.forEach((w, wi) => ctx.fillText(w, x + barW / 2, pad.top + ch + 14 + wi * 12));
    });

    // axis lines
    ctx.strokeStyle = "#c8d8ee";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + ch);
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.stroke();
  };

  // Draw Pie/Donut Chart
  const drawPie = (canvas, data, metric, donut = false) => {
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W * 0.42, cy = H / 2, r = Math.min(cx, cy) * 0.78, ir = donut ? r * 0.52 : 0;
    const total = data.reduce((a, d) => a + d[metric], 0) || 1;
    let angle = -Math.PI / 2;

    data.forEach((d) => {
      const slice = (d[metric] / total) * Math.PI * 2;
      // shadow
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.12)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.restore();

      if (donut) {
        ctx.beginPath();
        ctx.arc(cx, cy, ir, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      // border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // percent label inside slice
      if (slice > 0.18) {
        const midA = angle + slice / 2;
        const lx = cx + Math.cos(midA) * (r * (donut ? 0.72 : 0.6));
        const ly = cy + Math.sin(midA) * (r * (donut ? 0.72 : 0.6));
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px 'JetBrains Mono',monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(((d[metric] / total) * 100).toFixed(1) + "%", lx, ly);
      }
      angle += slice;
    });

    // donut center text
    if (donut) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1e3a5f";
      ctx.font = "bold 13px 'Barlow Condensed',sans-serif";
      ctx.fillText("TOTAL", cx, cy - 10);
      ctx.font = "bold 16px 'Barlow Condensed',sans-serif";
      ctx.fillStyle = "#e6920a";
      const tv = metric === "sheets" ? Math.round(total).toString() : total.toFixed(2);
      ctx.fillText(tv, cx, cy + 8);
    }

    // legend
    const lx = W * 0.82, ly = H / 2 - (data.length * 22) / 2;
    data.forEach((d, i) => {
      ctx.fillStyle = d.color;
      ctx.fillRect(lx, ly + i * 22, 12, 12);
      ctx.fillStyle = "#1e3a5f";
      ctx.font = "10px 'JetBrains Mono',monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const nm = d.name.length > 12 ? d.name.slice(0, 11) + "\u2026" : d.name;
      ctx.fillText(nm, lx + 17, ly + i * 22);
    });
  };

  useEffect(() => {
    if (activeTab !== "charts") return;
    const timer = setTimeout(() => {
      if (chartType === "bar") drawBar(barRef.current, chartData, pivotMetric);
      if (chartType === "pie") drawPie(pieRef.current, chartData, pivotMetric, false);
      if (chartType === "donut") drawPie(donutRef.current, chartData, pivotMetric, true);
    }, 50);
    return () => clearTimeout(timer);
  }, [chartData, chartType, pivotMetric, pivotRow, activeTab]);

  const tabStyle = (t) => ({
    padding: "7px 18px",
    fontSize: 10,
    fontFamily: "inherit",
    fontWeight: 700,
    cursor: "pointer",
    borderBottom: activeTab === t ? "3px solid #e6920a" : "3px solid transparent",
    background: "transparent",
    border: "none",
    color: activeTab === t ? "#e6920a" : "#94a3b8",
    transition: "all .15s",
    letterSpacing: .5,
  });

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ width: "min(96vw,960px)", maxHeight: "92vh", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", borderRadius: 12 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: 2 }}>📊 ANALYTICS</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", letterSpacing: 1.5, marginTop: 2 }}>{header.article || "PROJECT"} · {computed.length} MATERIALS</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid #e4eaf4", background: "#fafbff", padding: "0 24px", flexShrink: 0 }}>
          {["charts", "pivot", "summary"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(t)}>
              {t === "charts" ? "📈 CHARTS" : t === "pivot" ? "⊞ PIVOT TABLE" : "▦ SUMMARY"}
            </button>
          ))}
        </div>

        {/* Controls bar */}
        <div style={{ display: "flex", gap: 10, padding: "10px 24px", background: "#f4f7fb", borderBottom: "1px solid #e4eaf4", flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700, letterSpacing: 1 }}>GROUP BY</div>
          {["type", "shell"].map((k) => (
            <button key={k} onClick={() => setPivotRow(k)} style={{ padding: "4px 12px", fontSize: 9, fontFamily: "inherit", fontWeight: 700, borderRadius: 4, cursor: "pointer", border: "1.5px solid " + (pivotRow === k ? "#1e3a5f" : "#d0dcea"), background: pivotRow === k ? "#1e3a5f" : "#fff", color: pivotRow === k ? "#e6920a" : "#94a3b8", transition: "all .12s" }}>
              {k === "type" ? "Material Type" : "Shell Column"}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "#dce8f4", margin: "0 4px" }} />
          <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700, letterSpacing: 1 }}>METRIC</div>
          {["wt", "sqm", "vol", "sheets"].map((k) => {
            const clr = metricColor[k];
            const lbl = k === "wt" ? "WT kg" : k === "sqm" ? "SQM m²" : k === "vol" ? "VOL m³" : "SHEETS";
            return (
              <button key={k} onClick={() => setPivotMetric(k)} style={{ padding: "4px 12px", fontSize: 9, fontFamily: "inherit", fontWeight: 700, borderRadius: 4, cursor: "pointer", border: "1.5px solid " + (pivotMetric === k ? clr : "#d0dcea"), background: pivotMetric === k ? clr + "15" : "#fff", color: pivotMetric === k ? clr : "#94a3b8", transition: "all .12s" }}>
                {lbl}
              </button>
            );
          })}
          {activeTab === "charts" && <>
            <div style={{ width: 1, height: 20, background: "#dce8f4", margin: "0 4px" }} />
            <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700, letterSpacing: 1 }}>CHART</div>
            {["bar", "pie", "donut"].map((k) => (
              <button key={k} onClick={() => setChartType(k)} style={{ padding: "4px 12px", fontSize: 9, fontFamily: "inherit", fontWeight: 700, borderRadius: 4, cursor: "pointer", border: "1.5px solid " + (chartType === k ? "#e6920a" : "#d0dcea"), background: chartType === k ? "#fff4e0" : "#fff", color: chartType === k ? "#e6920a" : "#94a3b8", transition: "all .12s" }}>
                {k === "bar" ? "▊ Bar" : k === "pie" ? "◕ Pie" : "◎ Donut"}
              </button>
            ))}
          </>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* CHARTS TAB */}
          {activeTab === "charts" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 8, fontSize: 9, color: "#94a3b8", letterSpacing: 1, fontWeight: 700 }}>{metricLabel[pivotMetric].toUpperCase()} BY {pivotRow === "type" ? "MATERIAL TYPE" : "SHELL COLUMN"}</div>
              {chartData.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: 11 }}>No data to display. Add rows with sheet counts.</div>}
              {chartData.length > 0 && (
                <>
                  {chartType === "bar" && <canvas ref={barRef} width={860} height={320} style={{ width: "100%", height: "auto", borderRadius: 8, background: "#fafbff", border: "1px solid #e4eaf4" }} />}
                  {chartType === "pie" && <canvas ref={pieRef} width={860} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, background: "#fafbff", border: "1px solid #e4eaf4" }} />}
                  {chartType === "donut" && <canvas ref={donutRef} width={860} height={340} style={{ width: "100%", height: "auto", borderRadius: 8, background: "#fafbff", border: "1px solid #e4eaf4" }} />}
                  {/* Mini stat cards */}
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    {chartData.map(d => (
                      <div key={d.name} style={{ flex: "1 1 120px", background: "#fff", border: "1.5px solid " + d.color + "33", borderLeft: "3px solid " + d.color, borderRadius: 6, padding: "8px 12px" }}>
                        <div style={{ fontSize: 8, color: d.color, fontWeight: 800, letterSpacing: .8, marginBottom: 3, fontFamily: "'Barlow Condensed',sans-serif" }}>{d.name}</div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>{metricFmt(d[pivotMetric], pivotMetric)}</div>
                        <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 1 }}>{((d[pivotMetric] / total) * 100).toFixed(1)}% of total</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* PIVOT TABLE TAB */}
          {activeTab === "pivot" && (
            <div>
              <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>CROSS-PIVOT: MATERIAL TYPE × SHELL COLUMN — {metricLabel[pivotMetric].toUpperCase()}</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: "#1e3a5f" }}>
                      <th style={{ padding: "8px 12px", color: "#e6920a", fontWeight: 800, textAlign: "left", fontSize: 9, letterSpacing: 1, borderRight: "1px solid #2d5a8e", minWidth: 140 }}>MATERIAL TYPE</th>
                      {shellCols.map(c => (
                        <th key={c.id} style={{ padding: "8px 10px", color: c.color, fontWeight: 800, textAlign: "center", fontSize: 9, letterSpacing: .5, borderRight: "1px solid #2d5a8e", minWidth: 100, lineHeight: 1.4 }}>
                          <div>{c.label}</div>
                          {c.itemCode && <div style={{ fontSize: 7, color: "rgba(255,255,255,.5)", fontWeight: 400 }}>{c.itemCode}</div>}
                        </th>
                      ))}
                      <th style={{ padding: "8px 10px", color: "#e6920a", fontWeight: 800, textAlign: "center", fontSize: 9, background: "#162d4a", minWidth: 90 }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crossPivot.map((m, i) => {
                      const rowTotal = shellCols.reduce((a, c) => a + (m[c.id] ? m[c.id][pivotMetric] : 0), 0);
                      if (rowTotal === 0) return null;
                      const maxInRow = Math.max(...shellCols.map(c => m[c.id] ? m[c.id][pivotMetric] : 0));
                      return (
                        <tr key={m.name} style={{ background: i % 2 === 0 ? "#fff" : "#f8fbff", borderBottom: "1px solid #e4eaf4" }}>
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: m.color, borderRight: "2px solid " + m.color + "33", fontSize: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                              {m.name}
                            </div>
                          </td>
                          {shellCols.map(c => {
                            const val = m[c.id] ? m[c.id][pivotMetric] : 0;
                            const pct = maxInRow > 0 ? (val / maxInRow) * 100 : 0;
                            return (
                              <td key={c.id} style={{ padding: "6px 10px", textAlign: "center", borderRight: "1px solid #e4eaf4", position: "relative" }}>
                                {val > 0 && <div style={{ position: "absolute", bottom: 0, left: 0, height: "3px", width: pct + "%", background: c.color + "66", borderRadius: "0 2px 0 0" }} />}
                                <span style={{ fontWeight: val > 0 ? 700 : 400, color: val > 0 ? metricColor[pivotMetric] : "#ddd", position: "relative" }}>
                                  {val > 0 ? metricFmt(val, pivotMetric) : "—"}
                                </span>
                              </td>
                            );
                          })}
                          <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: 800, color: metricColor[pivotMetric], background: metricColor[pivotMetric] + "0e" }}>
                            {metricFmt(rowTotal, pivotMetric)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f0f5ff", borderTop: "2px solid #e6920a" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 800, color: "#e6920a", fontSize: 9, letterSpacing: .5 }}>COLUMN TOTAL</td>
                      {shellCols.map(c => {
                        const ct = totals.colTotals[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
                        return <td key={c.id} style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, color: c.color, borderRight: "1px solid #e4eaf4" }}>{metricFmt(ct[pivotMetric], pivotMetric)}</td>;
                      })}
                      <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, fontSize: 12, color: "#e6920a" }}>{metricFmt(pivotMetric === "sheets" ? totals.totalSheets : pivotMetric === "sqm" ? totals.totalSqm : pivotMetric === "vol" ? totals.totalVol : totals.totalWt, pivotMetric)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 20 }}>
                {[
                  ["TOTAL WEIGHT", "#e6920a", "#fff4e0", totals.totalWt.toFixed(3), "kg"],
                  ["TOTAL SQM", "#2563a8", "#eff6ff", totals.totalSqm.toFixed(3), "m²"],
                  ["TOTAL VOLUME", "#2d8a3e", "#f0fdf4", totals.totalVol.toFixed(3), "m³"],
                  ["TOTAL SHEETS", "#6b3fb5", "#ede8fb", totals.totalSheets.toString(), "sheets"],
                  ["MATERIALS", "#0891b2", "#ecfeff", computed.length.toString(), "rows"],
                  ["SHELL COLS", "#db2777", "#fdf2f8", shellCols.length.toString(), "parts"],
                ].map(([l, c, bg, v, u]) => (
                  <div key={l} style={{ background: bg, border: "1.5px solid " + c + "33", borderRadius: 8, padding: "14px 18px", borderLeft: "4px solid " + c }}>
                    <div style={{ fontSize: 8, color: c, fontWeight: 800, letterSpacing: 1.2, marginBottom: 6, fontFamily: "'Barlow Condensed',sans-serif" }}>{l}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, color: "#1e3a5f", lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 9, color: c, marginTop: 3, fontWeight: 600 }}>{u}</div>
                  </div>
                ))}
              </div>

              {/* Per-material breakdown bars */}
              <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>BREAKDOWN BY MATERIAL · {metricLabel[pivotMetric].toUpperCase()}</div>
              {byMaterial.map(m => {
                const pct = total > 0 ? (m[pivotMetric] / total) * 100 : 0;
                return (
                  <div key={m.name} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifySpace: "space-between", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#1e3a5f", fontFamily: "'Barlow Condensed',sans-serif" }}>{metricFmt(m[pivotMetric], pivotMetric)}</span>
                        <span style={{ fontSize: 9, color: "#94a3b8" }}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg," + m.color + "," + m.color + "99)", borderRadius: 4, transition: "width .4s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
