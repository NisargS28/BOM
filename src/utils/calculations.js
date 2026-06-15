export const getRowBg = (t, mts) => {
  const mt = mts.find(m => m.name === t);
  return mt ? mt.color + "18" : "#f5f5ff";
};

export const getAccent = (t, mts) => {
  const mt = mts.find(m => m.name === t);
  return mt ? mt.color : "#6655aa";
};

export const calcColStats = (sheets, r, extraPct = 0) => {
  const mult = 1 + (extraPct || 0) / 100;
  const L = r.length || 0,
        W = r.width || 0,
        T = r.thickness || 0,
        D = r.density || 0;
  const sqm = (sheets || 0) * L * W;
  const vol = sqm * T;
  const wt  = vol * D;
  return {
    sheets: sheets || 0,
    sqm: sqm * mult,
    vol: vol * mult,
    wt: wt * mult,
    sqmBase: sqm,
    volBase: vol,
    wtBase: wt
  };
};

export const mkRow = (shellCols, matTypes) => {
  const shellData = {};
  shellCols.forEach(c => {
    shellData[c.id] = 0;
  });
  const def = matTypes[0] || { name: "PET 100", length: 2.44, width: 1.22, density: 100 };
  return {
    id: Date.now() + Math.random(),
    description: "",
    type: def.name,
    supplier: "",
    finishing: "",
    surface: "SEALED",
    length: def.length,
    width: def.width,
    thickness: 0.01,
    density: def.density,
    ...shellData,
  };
};

export const calcRow = (r, shellCols, extraPct = 0) => {
  const colStats = {};
  let totalSheets = 0,
      totalSqm = 0,
      totalVol = 0,
      totalWt = 0;
  shellCols.forEach(c => {
    const sheets = r[c.id] || 0;
    const s = calcColStats(sheets, r, extraPct);
    colStats[c.id] = s;
    totalSheets += s.sheets;
    totalSqm += s.sqm;
    totalVol += s.vol;
    totalWt += s.wt;
  });
  return { ...r, colStats, totalSheets, totalSqm, totalVol, totalWt };
};
