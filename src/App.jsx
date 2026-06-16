import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

// Constants
import {
  DEFAULT_MATERIAL_TYPES,
  DEFAULT_SHELL_COLS,
  DEFAULT_SURFACES,
  PALETTE
} from './constants';

// Calculations
import { mkRow, calcRow } from './utils/calculations';

// Custom Hooks
import { useUndoRows } from './hooks/useUndoRows';

// Components
import HeaderSection from './components/HeaderSection';
import BOMTable from './components/BOMTable';
import NonReturnableAuxiliaryTable from './components/NonReturnableAuxiliaryTable';
import ReturnableAuxiliaryTable from './components/ReturnableAuxiliaryTable';
import TentativeCycleTimeTable from './components/TentativeCycleTimeTable';
import ProductionCycleTimeTable from './components/ProductionCycleTimeTable';
import AnalyticsModal from './components/AnalyticsModal';
import MaterialModal from './components/MaterialModal';
import ColumnModal from './components/ColumnModal';
import ImportExcelModal from './components/ImportExcelModal';
import EditRowModal from './components/EditRowModal';

// Styling
import './App.css';

// Dynamic auxiliary row/col initializers
const DEFAULT_AUX_COLS = [
  { id: "itemNo", label: "ITM 1" },
  { id: "itemNo2", label: "ITM 2" },
  { id: "itemNo3", label: "ITM 3" },
  { id: "itemNo4", label: "ITM 4" },
  { id: "itemNo5", label: "ITM 5" }
];

const mkNonReturnableRow = (cols = DEFAULT_AUX_COLS) => {
  const row = {
    id: Date.now() + Math.random(),
    description: "",
    length: 0,
    width: 0,
    height: 0,
    material: "",
    unit: "",
    qtyKit: 0,
    totalQtyKit: 0,
    price: 0,
    totalAmount: 0
  };
  cols.forEach(c => {
    row[c.id] = "";
  });
  return row;
};

const mkReturnableRow = (cols = DEFAULT_AUX_COLS) => {
  const row = {
    id: Date.now() + Math.random(),
    description: "",
    length: 0,
    width: 0,
    height: 0,
    material: "",
    unit: "",
    qtyKit: 0,
    totalQtyKit: 0,
    returnablePrice: 0,
    totalAmount: 0,
    finalAmount: 0,
    returnableCycle: 1
  };
  cols.forEach(c => {
    row[c.id] = "";
  });
  return row;
};

const DEFAULT_CYCLE_COLS = [
  { id: "cncTime", label: "CNC TIME" },
  { id: "finishingTime", label: "FINISHING TIME" },
  { id: "manualOperations", label: "MANUAL OPERATIONS" },
  { id: "repairKit", label: "REPAIR KIT" },
  { id: "others", label: "OTHERS" }
];

const mkCycleTimeRow = (sno, cols = DEFAULT_CYCLE_COLS) => {
  const row = {
    id: Date.now() + Math.random() + "_" + sno,
    sno,
    partDescription: "",
    partCode: "",
    noOfPrograms: ""
  };
  cols.forEach(c => {
    row[c.id] = "";
  });
  return row;
};

const mkDefaultCycleTimeRows = (cols = DEFAULT_CYCLE_COLS) => [mkCycleTimeRow(1, cols)];

// Configure this to toggle between localhost and your remote ngrok URL
//const API_BASE_URL = "https://unmade-amnesty-gallon.ngrok-free.dev";
const API_BASE_URL = "http://192.168.23.134:8080";

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

export default function App() {
  // FORMAT SELECTION
  const [selectedFormat, setSelectedFormat] = useState("Bill of Material");

  // USER LOGIN
  const [username, setUsername] = useState("");
  const [userInput, setUserInput] = useState("");

  // ARTICLES & REVISIONS
  const [articleList, setArticleList] = useState([]);
  const [revisionList, setRevisionList] = useState([]);

  // APPROVAL
  const [showApprove, setShowApprove] = useState(false);
  const [approver, setApprover] = useState("");

  // FOR HIDDEN BUTTONS
  const [hidden, setHidden] = useState(true);

  const [newArticle, setNewArticle] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newRevision, setNewRevision] = useState("");

  const [matTypes, setMatTypes] = useState(DEFAULT_MATERIAL_TYPES);
  const [shellCols, setShellCols] = useState(DEFAULT_SHELL_COLS);
  const [header, setHeader] = useState({
    article: "",
    customer: "",
    rev: "A01",
    preparedBy: "",
    checkedBy: "",
    modifiedBy: "",
    date: "",
    articleCode: "",
    ecNo: "",
    articleRev: "",
    // Cycle time defaults
    projectName: "",
    customerLocation: "",
    supplier: "SKAPS",
    supplyLocation: "",
    section: "CORE",
    machine: "",
    projectCode: "",
    approvedBy: "",
    dataTakenBy: "",
    kitWoNo: "",
    kitPrdDate: ""
  });
  
  const [rows, setRows, undoRows, canUndo] = useUndoRows([mkRow(DEFAULT_SHELL_COLS, DEFAULT_MATERIAL_TYPES)]);

  // Auxiliary formats states
  const [nonReturnableCols, setNonReturnableCols] = useState(DEFAULT_AUX_COLS);
  const [returnableCols, setReturnableCols] = useState(DEFAULT_AUX_COLS);
  const [nonReturnableRows, setNonReturnableRows, undoNonReturnableRows, canUndoNonReturnableRows] = useUndoRows([mkNonReturnableRow(DEFAULT_AUX_COLS)]);
  const [returnableRows, setReturnableRows, undoReturnableRows, canUndoReturnableRows] = useUndoRows([mkReturnableRow(DEFAULT_AUX_COLS)]);

  // Cycle time formats states
  const [tentativeCycleCols, setTentativeCycleCols] = useState(DEFAULT_CYCLE_COLS);
  const [productionCycleCols, setProductionCycleCols] = useState(DEFAULT_CYCLE_COLS);
  const [tentativeCycleRows, setTentativeCycleRows, undoTentativeCycleRows, canUndoTentativeCycleRows] = useUndoRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
  const [productionCycleRows, setProductionCycleRows, undoProductionCycleRows, canUndoProductionCycleRows] = useUndoRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [inlineCell, setInlineCell] = useState(null);
  const [inlineVal, setInlineVal] = useState("");
  const [showMetric, setShowMetric] = useState("sqm");
  const [extraPct, setExtraPct] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [activeModal, setActiveModal] = useState(null); // "matTypes" | "columns" | "importExcel" | "analytics" | null

  // Material type form
  const [newMat, setNewMat] = useState({ name: "", length: 2.44, width: 1.22, density: 100, color: PALETTE[0] });
  const [editMatId, setEditMatId] = useState(null);

  // Column manager form
  const [newColLabel, setNewColLabel] = useState("");
  const [newColColor, setNewColColor] = useState(PALETTE[0]);
  const [newColCode, setNewColCode] = useState("");
  const [surfaces, setSurfaces] = useState(DEFAULT_SURFACES);
  const [newSurface, setNewSurface] = useState("");
  const [newColRev, setNewColRev] = useState("A");

  // Excel import
  const [importRows, setImportRows] = useState([]);
  const [importHeaders, setImportHeaders] = useState([]);
  const [importMapping, setImportMapping] = useState({});
  const [importFile, setImportFile] = useState("");

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  // LOAD ARTICLE LIST FROM BACKEND
  useEffect(() => {
    fetch(`${API_BASE_URL}/articles`)
      .then(r => r.json())
      .then(data => setArticleList(data))
      .catch(() => console.log("API not ready"));
  }, []);

  // LOAD REVISIONS
  useEffect(() => {
    if (header.article && header.customer) {
      fetch(`${API_BASE_URL}/revisions?article=${header.article}&customer=${header.customer}`)
        .then(r => r.json())
        .then(setRevisionList);
    }
  }, [header.article, header.customer]);

  // AUTO LOAD DATA
  useEffect(() => {
    if (header.article && header.customer && header.rev) {
      fetch(`${API_BASE_URL}/load?article=${header.article}&customer=${header.customer}&revision=${header.rev}`)
        .then(r => r.json())
        .then(data => {
          if (data.rows) {
            setRows(data.rows);
            setShellCols(data.shellCols);
            if (data.header) {
              setHeader(data.header);
              setNonReturnableCols(data.header.nonReturnableCols || DEFAULT_AUX_COLS);
              setReturnableCols(data.header.returnableCols || DEFAULT_AUX_COLS);
              setTentativeCycleCols(data.header.tentativeCycleCols || DEFAULT_CYCLE_COLS);
              setProductionCycleCols(data.header.productionCycleCols || DEFAULT_CYCLE_COLS);
              setNonReturnableRows(data.header.nonReturnableAuxRows || [mkNonReturnableRow(data.header.nonReturnableCols || DEFAULT_AUX_COLS)]);
              setReturnableRows(data.header.returnableAuxRows || [mkReturnableRow(data.header.returnableCols || DEFAULT_AUX_COLS)]);
              setTentativeCycleRows(data.header.tentativeCycleRows || mkDefaultCycleTimeRows(data.header.tentativeCycleCols || DEFAULT_CYCLE_COLS));
              setProductionCycleRows(data.header.productionCycleRows || mkDefaultCycleTimeRows(data.header.productionCycleCols || DEFAULT_CYCLE_COLS));
            } else {
              setNonReturnableCols(DEFAULT_AUX_COLS);
              setReturnableCols(DEFAULT_AUX_COLS);
              setTentativeCycleCols(DEFAULT_CYCLE_COLS);
              setProductionCycleCols(DEFAULT_CYCLE_COLS);
              setNonReturnableRows([mkNonReturnableRow(DEFAULT_AUX_COLS)]);
              setReturnableRows([mkReturnableRow(DEFAULT_AUX_COLS)]);
              setTentativeCycleRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
              setProductionCycleRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
            }
            showToast("Loaded from DB");
          }
        });
    }
  }, [header.rev]);

  // Ctrl+Z shortcut
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (selectedFormat === "Non Returnable Auxiliary") {
          if (canUndoNonReturnableRows) {
            undoNonReturnableRows();
            showToast("Undone");
          }
        } else if (selectedFormat === "Returnable Auxiliary") {
          if (canUndoReturnableRows) {
            undoReturnableRows();
            showToast("Undone");
          }
        } else if (selectedFormat === "Cycle Time - Tentative") {
          if (canUndoTentativeCycleRows) {
            undoTentativeCycleRows();
            showToast("Undone");
          }
        } else if (selectedFormat === "Cycle Time - Production") {
          if (canUndoProductionCycleRows) {
            undoProductionCycleRows();
            showToast("Undone");
          }
        } else {
          if (canUndo) {
            undoRows();
            showToast("Undone");
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    canUndo, undoRows, 
    canUndoNonReturnableRows, undoNonReturnableRows, 
    canUndoReturnableRows, undoReturnableRows, 
    canUndoTentativeCycleRows, undoTentativeCycleRows,
    canUndoProductionCycleRows, undoProductionCycleRows,
    selectedFormat
  ]);

  // Computed
  const computed = useMemo(() => rows.map(r => calcRow(r, shellCols, extraPct)), [rows, shellCols, extraPct]);
  const matNames = useMemo(() => matTypes.map(m => m.name), [matTypes]);
  const filtered = useMemo(() => computed.filter(r => {
    const mt = filterType === "ALL" || r.type === filterType;
    const ms = !search || r.description.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  }), [computed, filterType, search]);

  const filteredNonReturnable = useMemo(() => {
    return nonReturnableRows.filter(r => 
      !search || (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [nonReturnableRows, search]);

  const filteredReturnable = useMemo(() => {
    return returnableRows.filter(r => 
      !search || (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [returnableRows, search]);

  const filteredTentativeCycle = useMemo(() => {
    return tentativeCycleRows.filter(r => 
      !search || (r.partDescription && r.partDescription.toLowerCase().includes(search.toLowerCase())) ||
      (r.partCode && r.partCode.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tentativeCycleRows, search]);

  const filteredProductionCycle = useMemo(() => {
    return productionCycleRows.filter(r => 
      !search || (r.partDescription && r.partDescription.toLowerCase().includes(search.toLowerCase())) ||
      (r.partCode && r.partCode.toLowerCase().includes(search.toLowerCase()))
    );
  }, [productionCycleRows, search]);

  const totals = useMemo(() => {
    const colTotals = {};
    shellCols.forEach(c => {
      colTotals[c.id] = {
        sheets: computed.reduce((a, r) => a + (r[c.id] || 0), 0),
        sqm: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].sqm : 0), 0),
        vol: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].vol : 0), 0),
        wt: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].wt : 0), 0),
        sqmBase: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].sqmBase ?? r.colStats[c.id].sqm : 0), 0),
        volBase: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].volBase ?? r.colStats[c.id].vol : 0), 0),
        wtBase: computed.reduce((a, r) => a + (r.colStats[c.id] ? r.colStats[c.id].wtBase ?? r.colStats[c.id].wt : 0), 0),
      };
    });
    const totalWt = computed.reduce((a, r) => a + r.totalWt, 0);
    return {
      totalSheets: computed.reduce((a, r) => a + r.totalSheets, 0),
      totalSqm: computed.reduce((a, r) => a + r.totalSqm, 0),
      totalVol: computed.reduce((a, r) => a + r.totalVol, 0),
      totalWt,
      total: totalWt,
      colTotals,
    };
  }, [computed, shellCols]);

  // Row helpers
  const startInline = (rowId, colId, cur) => {
    setInlineCell({ rowId, colId });
    setInlineVal(String(cur));
  };

  const commitInline = () => {
    if (!inlineCell) return;
    const valStr = inlineVal.trim();
    
    if (selectedFormat === "Non Returnable Auxiliary") {
      const numericFields = ["length", "width", "height", "qtyKit", "price"];
      const isNumeric = numericFields.includes(inlineCell.colId);
      setNonReturnableRows(prev => prev.map(r => r.id === inlineCell.rowId ? { 
        ...r, 
        [inlineCell.colId]: isNumeric ? (parseFloat(valStr) || 0) : valStr 
      } : r));
    } else if (selectedFormat === "Returnable Auxiliary") {
      const numericFields = ["length", "width", "height", "qtyKit", "returnablePrice", "returnableCycle"];
      const isNumeric = numericFields.includes(inlineCell.colId);
      setReturnableRows(prev => prev.map(r => r.id === inlineCell.rowId ? { 
        ...r, 
        [inlineCell.colId]: isNumeric ? (parseFloat(valStr) || 0) : valStr 
      } : r));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      const isNumeric = inlineCell.colId === "noOfPrograms";
      setTentativeCycleRows(prev => prev.map(r => r.id === inlineCell.rowId ? { 
        ...r, 
        [inlineCell.colId]: isNumeric ? (parseInt(valStr) || 0) : valStr 
      } : r));
    } else if (selectedFormat === "Cycle Time - Production") {
      const isNumeric = inlineCell.colId === "noOfPrograms";
      setProductionCycleRows(prev => prev.map(r => r.id === inlineCell.rowId ? { 
        ...r, 
        [inlineCell.colId]: isNumeric ? (parseInt(valStr) || 0) : valStr 
      } : r));
    } else {
      setRows(prev => prev.map(r => r.id === inlineCell.rowId ? { ...r, [inlineCell.colId]: parseFloat(valStr) || 0 } : r));
    }
    
    setInlineCell(null);
    setInlineVal("");
  };

  const openEdit = row => {
    setEditingId(row.id);
    setForm({ ...row });
  };

  const closeEdit = () => {
    setEditingId(null);
    setForm(null);
  };

  const saveEdit = () => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableRows(prev => prev.map(r => r.id === editingId ? { ...form } : r));
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableRows(prev => prev.map(r => r.id === editingId ? { ...form } : r));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleRows(prev => prev.map(r => r.id === editingId ? { ...form } : r));
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleRows(prev => prev.map(r => r.id === editingId ? { ...form } : r));
    } else {
      setRows(prev => prev.map(r => r.id === editingId ? { ...form } : r));
    }
    closeEdit();
  };

  const deleteRow = id => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableRows(prev => prev.filter(r => r.id !== id));
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableRows(prev => prev.filter(r => r.id !== id));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleRows(prev => {
        const remaining = prev.filter(r => r.id !== id);
        return remaining.map((r, idx) => ({ ...r, sno: idx + 1 }));
      });
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleRows(prev => {
        const remaining = prev.filter(r => r.id !== id);
        return remaining.map((r, idx) => ({ ...r, sno: idx + 1 }));
      });
    } else {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };
  
  const dupRow = row => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      const idx = nonReturnableRows.findIndex(r => r.id === row.id);
      const n = [...nonReturnableRows];
      n.splice(idx + 1, 0, { ...row, id: Date.now() + Math.random() });
      setNonReturnableRows(n);
    } else if (selectedFormat === "Returnable Auxiliary") {
      const idx = returnableRows.findIndex(r => r.id === row.id);
      const n = [...returnableRows];
      n.splice(idx + 1, 0, { ...row, id: Date.now() + Math.random() });
      setReturnableRows(n);
    } else if (selectedFormat === "Cycle Time - Tentative") {
      const idx = tentativeCycleRows.findIndex(r => r.id === row.id);
      const n = [...tentativeCycleRows];
      n.splice(idx + 1, 0, { ...row, id: Date.now() + Math.random() });
      const renumbered = n.map((r, i) => ({ ...r, sno: i + 1 }));
      setTentativeCycleRows(renumbered);
    } else if (selectedFormat === "Cycle Time - Production") {
      const idx = productionCycleRows.findIndex(r => r.id === row.id);
      const n = [...productionCycleRows];
      n.splice(idx + 1, 0, { ...row, id: Date.now() + Math.random() });
      const renumbered = n.map((r, i) => ({ ...r, sno: i + 1 }));
      setProductionCycleRows(renumbered);
    } else {
      const idx = rows.findIndex(r => r.id === row.id);
      const n = [...rows];
      n.splice(idx + 1, 0, { ...row, id: Date.now() + Math.random() });
      setRows(n);
    }
  };

  const addRow = () => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableRows(prev => [...prev, mkNonReturnableRow(nonReturnableCols)]);
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableRows(prev => [...prev, mkReturnableRow(returnableCols)]);
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleRows(prev => [...prev, mkCycleTimeRow(prev.length + 1, tentativeCycleCols)]);
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleRows(prev => [...prev, mkCycleTimeRow(prev.length + 1, productionCycleCols)]);
    } else {
      setRows(prev => [...prev, mkRow(shellCols, matTypes)]);
    }
  };

  // When type selected in edit form -> auto-fill dims
  const handleTypeChange = t => {
    const m = matTypes.find(x => x.name === t);
    if (m) setForm(f => ({ ...f, type: t, length: m.length, width: m.width, density: m.density }));
    else setForm(f => ({ ...f, type: t }));
  };

  // Shell columns
  const addShellCol = () => {
    if (!newColLabel.trim()) return;
    const id = "sc_" + Date.now();
    setShellCols(p => [...p, { id, label: newColLabel.trim(), color: newColColor, itemCode: newColCode, itemRev: newColRev || "A" }]);
    setRows(p => p.map(r => ({ ...r, [id]: 0 })));
    setNewColLabel("");
    setNewColCode("");
    setNewColRev("A");
  };

  const removeShellCol = id => {
    setShellCols(p => p.filter(c => c.id !== id));
    setRows(p => p.map(r => {
      const n = { ...r };
      delete n[id];
      return n;
    }));
  };

  const renameShellCol = (id, label) => setShellCols(p => p.map(c => c.id === id ? { ...c, label } : c));
  const recolorShellCol = (id, color) => setShellCols(p => p.map(c => c.id === id ? { ...c, color } : c));
  const updateColCode = (id, itemCode) => setShellCols(p => p.map(c => c.id === id ? { ...c, itemCode } : c));
  const updateColRev = (id, itemRev) => setShellCols(p => p.map(c => c.id === id ? { ...c, itemRev } : c));

  // Auxiliary columns
  const addAuxCol = (label) => {
    const id = "aux_" + Date.now();
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableCols(p => [...p, { id, label }]);
      setNonReturnableRows(p => p.map(r => ({ ...r, [id]: "" })));
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableCols(p => [...p, { id, label }]);
      setReturnableRows(p => p.map(r => ({ ...r, [id]: "" })));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleCols(p => [...p, { id, label }]);
      setTentativeCycleRows(p => p.map(r => ({ ...r, [id]: "" })));
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleCols(p => [...p, { id, label }]);
      setProductionCycleRows(p => p.map(r => ({ ...r, [id]: "" })));
    }
  };

  const removeAuxCol = (id) => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableCols(p => p.filter(c => c.id !== id));
      setNonReturnableRows(p => p.map(r => {
        const n = { ...r };
        delete n[id];
        return n;
      }));
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableCols(p => p.filter(c => c.id !== id));
      setReturnableRows(p => p.map(r => {
        const n = { ...r };
        delete n[id];
        return n;
      }));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleCols(p => p.filter(c => c.id !== id));
      setTentativeCycleRows(p => p.map(r => {
        const n = { ...r };
        delete n[id];
        return n;
      }));
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleCols(p => p.filter(c => c.id !== id));
      setProductionCycleRows(p => p.map(r => {
        const n = { ...r };
        delete n[id];
        return n;
      }));
    }
  };

  const renameAuxCol = (id, label) => {
    if (selectedFormat === "Non Returnable Auxiliary") {
      setNonReturnableCols(p => p.map(c => c.id === id ? { ...c, label } : c));
    } else if (selectedFormat === "Returnable Auxiliary") {
      setReturnableCols(p => p.map(c => c.id === id ? { ...c, label } : c));
    } else if (selectedFormat === "Cycle Time - Tentative") {
      setTentativeCycleCols(p => p.map(c => c.id === id ? { ...c, label } : c));
    } else if (selectedFormat === "Cycle Time - Production") {
      setProductionCycleCols(p => p.map(c => c.id === id ? { ...c, label } : c));
    }
  };

  // Material Types
  const addMaterial = () => {
    if (!newMat.name.trim()) return;
    if (matTypes.some(m => m.name === newMat.name.trim())) {
      showToast("Name already exists");
      return;
    }
    setMatTypes(p => [...p, { ...newMat, name: newMat.name.trim(), id: "mt_" + Date.now() }]);
    setNewMat({ name: "", length: 2.44, width: 1.22, density: 100, color: PALETTE[0] });
    showToast("Material added");
  };

  const deleteMaterial = id => {
    const mat = matTypes.find(m => m.id === id);
    if (!mat) return;
    const remaining = matTypes.filter(m => m.id !== id);
    setMatTypes(remaining);
    setRows(prev => prev.map(r => r.type === mat.name ? { ...r, type: (remaining[0]?.name || "PET 100") } : r));
    showToast("Material deleted");
  };

  const updateMat = (id, field, val) => {
    setMatTypes(prev => prev.map(m => {
      if (m.id !== id) return m;
      const v = (field === "name" || field === "color") ? val : (parseFloat(val) || 0);
      const updated = { ...m, [field]: v };
      if (field !== "name" && field !== "color") {
        setRows(prev2 => prev2.map(r => r.type === m.name ? { ...r, [field]: v } : r));
      }
      return updated;
    }));
  };

  const saveToSQL = async () => {
    try {
      const updatedHeader = {
        ...header,
        nonReturnableCols,
        returnableCols,
        tentativeCycleCols,
        productionCycleCols,
        nonReturnableAuxRows: nonReturnableRows,
        returnableAuxRows: returnableRows,
        tentativeCycleRows,
        productionCycleRows
      };
      await fetch(`${API_BASE_URL}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          article: header.article,
          customer: header.customer,
          revision: header.rev,
          header: updatedHeader,
          rows,
          shellCols
        })
      });
      showToast("Saved to SQL");
    } catch {
      showToast("Could not save to SQL");
    }
  };

  const approveData = async () => {
    try {
      const updatedHeader = {
        ...header,
        nonReturnableCols,
        returnableCols,
        tentativeCycleCols,
        productionCycleCols,
        nonReturnableAuxRows: nonReturnableRows,
        returnableAuxRows: returnableRows,
        tentativeCycleRows,
        productionCycleRows
      };
      await fetch(`${API_BASE_URL}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          article: header.article,
          customer: header.customer,
          revision: header.rev,
          approver,
          header: updatedHeader,
          rows,
          shellCols
        })
      });
      showToast("Approved successfully");
      setShowApprove(false);
    } catch {
      showToast("Could not approve");
    }
  };

  // Local Save / Load
  const saveToFile = () => {
    const updatedHeader = {
      ...header,
      nonReturnableCols,
      returnableCols,
      tentativeCycleCols,
      productionCycleCols,
      nonReturnableAuxRows: nonReturnableRows,
      returnableAuxRows: returnableRows,
      tentativeCycleRows,
      productionCycleRows
    };
    const data = { version: 4, savedAt: new Date().toISOString(), header: updatedHeader, rows, shellCols, showMetric, matTypes, surfaces, extraPct };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SKAPS_BOM_${header.article || "PROJECT"}_${header.rev || "A01"}.bom.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastSaved(new Date());
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2500);
    showToast("Session saved");
  };

  const loadFromFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.header) {
          setHeader(d.header);
          setNonReturnableCols(d.header.nonReturnableCols || DEFAULT_AUX_COLS);
          setReturnableCols(d.header.returnableCols || DEFAULT_AUX_COLS);
          setTentativeCycleCols(d.header.tentativeCycleCols || DEFAULT_CYCLE_COLS);
          setProductionCycleCols(d.header.productionCycleCols || DEFAULT_CYCLE_COLS);
          setNonReturnableRows(d.header.nonReturnableAuxRows || [mkNonReturnableRow(d.header.nonReturnableCols || DEFAULT_AUX_COLS)]);
          setReturnableRows(d.header.returnableAuxRows || [mkReturnableRow(d.header.returnableCols || DEFAULT_AUX_COLS)]);
          setTentativeCycleRows(d.header.tentativeCycleRows || mkDefaultCycleTimeRows(d.header.tentativeCycleCols || DEFAULT_CYCLE_COLS));
          setProductionCycleRows(d.header.productionCycleRows || mkDefaultCycleTimeRows(d.header.productionCycleCols || DEFAULT_CYCLE_COLS));
        } else {
          setNonReturnableCols(DEFAULT_AUX_COLS);
          setReturnableCols(DEFAULT_AUX_COLS);
          setTentativeCycleCols(DEFAULT_CYCLE_COLS);
          setProductionCycleCols(DEFAULT_CYCLE_COLS);
          setNonReturnableRows([mkNonReturnableRow(DEFAULT_AUX_COLS)]);
          setReturnableRows([mkReturnableRow(DEFAULT_AUX_COLS)]);
          setTentativeCycleRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
          setProductionCycleRows(mkDefaultCycleTimeRows(DEFAULT_CYCLE_COLS));
        }
        if (d.rows) setRows(d.rows);
        if (d.shellCols) setShellCols(d.shellCols);
        if (d.showMetric) setShowMetric(d.showMetric);
        if (d.matTypes) setMatTypes(d.matTypes);
        if (d.surfaces) setSurfaces(d.surfaces);
        if (d.extraPct != null) setExtraPct(d.extraPct);
        setLastSaved(d.savedAt ? new Date(d.savedAt) : new Date());
        showToast("Session loaded");
      } catch {
        alert("Could not read file. Use a valid .bom.json file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Excel Import
  const handleExcelUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (data.length < 2) {
          showToast("No data found");
          return;
        }
        const headers = data[0].map(h => String(h).trim());
        const dataRows = data.slice(1).filter(r => r.some(c => c !== ""));
        setImportHeaders(headers);
        setImportRows(dataRows);
        
        // Auto-map
        const map = {};
        const aliases = {
          description: ["description", "desc", "raw material description", "material", "name", "raw material"],
          type: ["type", "material type", "raw material type", "mat type"],
          supplier: ["supplier", "vendor"],
          finishing: ["finishing", "finish"],
          surface: ["surface"],
          length: ["length", "l(m)", "l (m)", "length (m)"],
          width: ["width", "w(m)", "w (m)", "width (m)"],
          thickness: ["thickness", "th(m)", "th (m)", "thickness (m)", "th"],
          density: ["density", "density (kg/m3)", "density (kg/m³)", "dens"],
          partName: ["part name", "partname", "part"]
        };
        
        headers.forEach((h, i) => {
          const hl = h.toLowerCase();
          Object.entries(aliases).forEach(([field, alts]) => {
            if (alts.includes(hl)) map[field] = i;
          });
          shellCols.forEach(sc => {
            if (hl === sc.label.toLowerCase() || hl === sc.label.toLowerCase() + " sheets") map[sc.id] = i;
          });
        });
        
        setImportMapping(map);
        setActiveModal("importExcel");
      } catch {
        showToast("Could not read Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const applyImport = mode => {
    const newRows = importRows.map(row => {
      const get = f => {
        const i = importMapping[f];
        return i != null ? row[i] : "";
      };
      const getN = (f, def = 0) => parseFloat(get(f)) || def;
      const typeName = String(get("type")).trim();
      const mat = matTypes.find(m => m.name === typeName) || matTypes[0];
      const shellData = {};
      shellCols.forEach(c => {
        shellData[c.id] = getN(c.id, 0);
      });
      return {
        id: Date.now() + Math.random(),
        description: String(get("description")).trim(),
        type: mat ? mat.name : (matTypes[0]?.name || "PET 100"),
        supplier: String(get("supplier")).trim(),
        finishing: String(get("finishing")).trim(),
        surface: String(get("surface")).trim() || "SEALED",
        length: getN("length", mat?.length || 2.44),
        width: getN("width", mat?.width || 1.22),
        thickness: getN("thickness", 0.01),
        density: getN("density", mat?.density || 100),
        ...shellData,
      };
    });
    
    if (mode === "replace") setRows(newRows);
    else setRows(prev => [...prev, ...newRows]);
    
    setActiveModal(null);
    setImportRows([]);
    setImportHeaders([]);
    setImportMapping({});
    showToast(`Imported ${newRows.length} rows`);
  };

  // Excel Export
  const exportToExcel = () => {
    setExporting(true);
    const wb = XLSX.utils.book_new();

    if (selectedFormat === "Non Returnable Auxiliary") {
      const wsData = [
        ["BOM: Core-Kit_Auxiliary (Non-Returnable)"],
        [`ARTICLE: ${header.article || "—"}`, `CUSTOMER: ${header.customer || "—"}`, `REV: ${header.rev || "—"}`],
        [],
        ["SR NO", "ITEM DESCRIPTION", "L (m)", "W (m)", "H (m)", "MATERIAL", "UNIT", ...nonReturnableCols.map(c => c.label), "QTY/KIT", "TOT QTY", "PRICE", "AMOUNT"]
      ];

      filteredNonReturnable.forEach((r, idx) => {
        const itemSum = nonReturnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        const totalQty = itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
        const amount = totalQty * (parseFloat(r.price) || 0);
        
        wsData.push([
          idx + 1,
          r.description || "",
          r.length || 0,
          r.width || 0,
          r.height || 0,
          r.material || "",
          r.unit || "",
          ...nonReturnableCols.map(c => r[c.id] || ""),
          r.qtyKit || 0,
          totalQty,
          r.price || 0,
          amount
        ]);
      });

      const totalQtyKitSum = filteredNonReturnable.reduce((sum, r) => {
        const itemSum = nonReturnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        return sum + (itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0));
      }, 0);
      
      const totalAmountSum = filteredNonReturnable.reduce((sum, r) => {
        const itemSum = nonReturnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        const qty = itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
        return sum + (qty * (parseFloat(r.price) || 0));
      }, 0);

      const totalRow = ["TOTALS", "", "", "", "", "", ""];
      nonReturnableCols.forEach(() => totalRow.push(""));
      totalRow.push("");
      totalRow.push(totalQtyKitSum);
      totalRow.push("");
      totalRow.push(totalAmountSum);
      
      wsData.push(totalRow);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Non-Returnable Auxiliary");
      XLSX.writeFile(wb, `SKAPS_Non_Returnable_Auxiliary_${header.article || "PROJECT"}_${header.rev || "A01"}.xlsx`);
      setExporting(false);
      setExportMsg("Exported!");
      setTimeout(() => setExportMsg(""), 2500);
      return;
    }

    if (selectedFormat === "Returnable Auxiliary") {
      const wsData = [
        ["BOM: Core-Kit_Auxiliary (Returnable)"],
        [`ARTICLE: ${header.article || "—"}`, `CUSTOMER: ${header.customer || "—"}`, `REV: ${header.rev || "—"}`],
        [],
        ["SR NO", "ITEM DESCRIPTION", "L (m)", "W (m)", "H (m)", "MATERIAL", "UNIT", ...returnableCols.map(c => c.label), "QTY/KIT", "TOT QTY", "RET PRICE", "TOT AMOUNT", "FINAL AMT", "RET CYCLE"]
      ];

      filteredReturnable.forEach((r, idx) => {
        const itemSum = returnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        const totalQty = itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
        const amount = totalQty * (parseFloat(r.returnablePrice) || 0);
        const cycle = parseFloat(r.returnableCycle) || 1;
        const finalAmt = amount / cycle;

        wsData.push([
          idx + 1,
          r.description || "",
          r.length || 0,
          r.width || 0,
          r.height || 0,
          r.material || "",
          r.unit || "",
          ...returnableCols.map(c => r[c.id] || ""),
          r.qtyKit || 0,
          totalQty,
          r.returnablePrice || 0,
          amount,
          finalAmt,
          cycle
        ]);
      });

      const totalQtyKitSum = filteredReturnable.reduce((sum, r) => {
        const itemSum = returnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        return sum + (itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0));
      }, 0);

      const totalAmountSum = filteredReturnable.reduce((sum, r) => {
        const itemSum = returnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        const qty = itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
        return sum + (qty * (parseFloat(r.returnablePrice) || 0));
      }, 0);

      const finalAmountSum = filteredReturnable.reduce((sum, r) => {
        const itemSum = returnableCols
          .map(c => parseFloat(r[c.id]))
          .filter(n => !isNaN(n))
          .reduce((a, b) => a + b, 0);
        const qty = itemSum > 0 ? itemSum : (parseFloat(r.qtyKit) || 0);
        const amt = qty * (parseFloat(r.returnablePrice) || 0);
        const cyc = parseFloat(r.returnableCycle) || 1;
        return sum + (amt / cyc);
      }, 0);

      const totalRow = ["TOTALS", "", "", "", "", "", ""];
      returnableCols.forEach(() => totalRow.push(""));
      totalRow.push("");
      totalRow.push(totalQtyKitSum);
      totalRow.push("");
      totalRow.push(totalAmountSum);
      totalRow.push(finalAmountSum);
      totalRow.push("");
      
      wsData.push(totalRow);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Returnable Auxiliary");
      XLSX.writeFile(wb, `SKAPS_Returnable_Auxiliary_${header.article || "PROJECT"}_${header.rev || "A01"}.xlsx`);
      setExporting(false);
      setExportMsg("Exported!");
      setTimeout(() => setExportMsg(""), 2500);
      return;
    }

    if (selectedFormat === "Cycle Time - Tentative" || selectedFormat === "Cycle Time - Production") {
      const isTentative = selectedFormat === "Cycle Time - Tentative";
      const rowsToExport = isTentative ? tentativeCycleRows : productionCycleRows;
      const cols = isTentative ? tentativeCycleCols : productionCycleCols;
      
      const wsData = [
        [isTentative ? "TENTATIVE CORE KIT CYCLE TIME" : "PRODUCTION CORE KIT CYCLE TIME"],
        [
          `ARTICLE: ${header.article || "—"}`, 
          `CUSTOMER: ${header.customer || "—"}`, 
          `REV: ${header.rev || "—"}`,
          `PROJECT: ${header.projectName || "—"}`,
          `MACHINE: ${header.machine || "—"}`
        ],
        [],
        ["S.NO", "PART DESCRIPTION", "PART CODE", "NO OF PROGRAMS", ...cols.map(c => c.label)]
      ];

      const parse = (val) => {
        if (!val || typeof val !== 'string') return 0;
        const parts = val.split(':').map(Number);
        if (parts.some(isNaN)) return 0;
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 1) return parts[0];
        return 0;
      };

      const format = (seconds) => {
        if (isNaN(seconds) || seconds <= 0) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      };

      let totalProg = 0;
      const colSeconds = {};
      cols.forEach(c => {
        colSeconds[c.id] = 0;
      });

      rowsToExport.forEach((r, idx) => {
        const prog = parseInt(r.noOfPrograms) || 0;
        totalProg += prog;
        cols.forEach(c => {
          colSeconds[c.id] += parse(r[c.id]);
        });

        wsData.push([
          r.sno || idx + 1,
          r.partDescription || "",
          r.partCode || "",
          prog,
          ...cols.map(c => r[c.id] || "00:00:00")
        ]);
      });

      wsData.push([
        "TOTAL",
        "",
        "",
        totalProg,
        ...cols.map(c => format(colSeconds[c.id]))
      ]);

      const grandSeconds = cols.reduce((sum, c) => sum + colSeconds[c.id], 0);
      const grandTotalRow = [
        isTentative ? "TOTAL THEORETICAL CYCLE TIME" : "TOTAL ACTUAL CYCLE TIME",
        "",
        "",
        "",
        format(grandSeconds)
      ];
      while (grandTotalRow.length < 4 + cols.length) {
        grandTotalRow.push("");
      }
      wsData.push(grandTotalRow);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      const totalIdx = wsData.length - 2;
      const grandIdx = wsData.length - 1;
      
      ws['!merges'] = [
        { s: { r: totalIdx, c: 0 }, e: { r: totalIdx, c: 2 } },
        { s: { r: grandIdx, c: 0 }, e: { r: grandIdx, c: 3 } },
        { s: { r: grandIdx, c: 4 }, e: { r: grandIdx, c: 4 + cols.length - 1 } }
      ];

      XLSX.utils.book_append_sheet(wb, ws, isTentative ? "Tentative Cycle Time" : "Production Cycle Time");
      XLSX.writeFile(wb, `SKAPS_Cycle_Time_${isTentative ? "Tentative" : "Production"}_${header.article || "PROJECT"}_${header.rev || "A01"}.xlsx`);
      setExporting(false);
      setExportMsg("Exported!");
      setTimeout(() => setExportMsg(""), 2500);
      return;
    }

    // Shared helpers
    const al = h => ({ horizontal: h, vertical: "center" });
    const alCW = h => ({ horizontal: h, vertical: "center", wrapText: true });
    const bdr = (clr = "C8D8EE") => ({ top: { style: "thin", color: { rgb: clr } }, bottom: { style: "thin", color: { rgb: clr } }, left: { style: "thin", color: { rgb: clr } }, right: { style: "thin", color: { rgb: clr } } });
    const bdrM = (clr = "A0C4E4") => ({ top: { style: "medium", color: { rgb: clr } }, bottom: { style: "medium", color: { rgb: clr } }, left: { style: "medium", color: { rgb: clr } }, right: { style: "medium", color: { rgb: clr } } });
    const numFmt3 = "0.000";
    const numFmt4 = "0.0000";

    const metaFields = [
      ["ARTICLE", header.article], ["CUSTOMER", header.customer],
      ["REVISION", header.rev], ["PREPARED BY", header.preparedBy],
      ["CHECKED BY", header.checkedBy], ["ARTICLE CODE", header.articleCode],
      ["EC NO", header.ecNo], ["ARTICLE REV", header.articleRev]
    ];

    const buildSheet = (metricKey) => {
      const ws = {};
      const R = (r, c, cell) => {
        ws[XLSX.utils.encode_cell({ r, c })] = cell;
      };

      const mColors = {
        sheets: { accent: "1E3A5F", light: "EEF4FF", colFg: "1E3A5F", colBg: "DBE8F8", totFg: "6B3FB5", totBg: "EDE8FB", unit: "sheets", label: "NO. OF SHEETS" },
        sqm: { accent: "B8600A", light: "FFF8EE", colFg: "B8600A", colBg: "FFF4E0", totFg: "B8600A", totBg: "FFF4E0", unit: "m²", label: "AREA (SQM)" },
        vol: { accent: "2D8A3E", light: "F0FDF4", colFg: "2D8A3E", colBg: "E8FDF2", totFg: "2D8A3E", totBg: "F0FDF4", unit: "m³", label: "VOLUME" },
        wt: { accent: "B45309", light: "FFFBEB", colFg: "B45309", colBg: "FFF8EE", totFg: "B45309", totBg: "FFFBEB", unit: "kg", label: "WEIGHT" },
      };
      const mc = mColors[metricKey];
      const totalCols = 10 + shellCols.length + 1;

      // Title banner
      R(0, 0, { v: "SKAPS BOM — " + mc.label, t: "s", s: { font: { bold: true, sz: 16, color: { rgb: "FFFFFF" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "1E3A5F" } }, alignment: al("left"), border: bdrM(mc.accent) } });
      for (let c = 1; c < totalCols; c++) R(0, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "1E3A5F" } }, border: bdrM(mc.accent) } });

      // Accent divider
      for (let c = 0; c < totalCols; c++) R(1, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: mc.accent } } } });

      // Project meta
      metaFields.forEach(([l, v], i) => {
        const row = 2 + Math.floor(i / 4), col = (i % 4) * 2;
        R(row, col, { v: l, t: "s", s: { font: { bold: true, sz: 8, color: { rgb: "94A3B8" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "EEF4FF" } }, alignment: al("left"), border: bdr("C8D8EE") } });
        R(row, col + 1, { v: v || "—", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FBFF" } }, alignment: al("left"), border: bdr("C8D8EE") } });
      });

      // Divider
      for (let c = 0; c < totalCols; c++) R(4, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } } } });

      // Group headers
      const matColCount = 10;
      R(5, 0, { v: "MATERIAL INFORMATION", t: "s", s: { font: { bold: true, sz: 9, color: { rgb: "2563A8" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, alignment: alCW("center"), border: bdrM("A0C4E4") } });
      for (let c = 1; c < matColCount; c++) R(5, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      shellCols.forEach((c, i) => {
        const cc = c.color.replace("#", "");
        R(5, matColCount + i, { v: c.label + (c.itemCode ? " | " + c.itemCode : "") + (c.itemRev ? " Rev:" + c.itemRev : ""), t: "s", s: { font: { bold: true, sz: 9, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.colBg } }, alignment: alCW("center"), border: bdrM(cc) } });
      });
      R(5, matColCount + shellCols.length, { v: "TOTAL " + mc.label.toUpperCase(), t: "s", s: { font: { bold: true, sz: 9, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, alignment: alCW("center"), border: bdrM(mc.accent) } });

      // Column headers
      const mkH = (v, fg, bg) => ({ v, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: fg }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: alCW("center"), border: bdr("C8D8EE") } });
      [["SR NO", "4A6FA8", "F0F5FF"], ["DESCRIPTION", "4A6FA8", "F0F5FF"], ["TYPE", "4A6FA8", "F0F5FF"], ["SUPPLIER", "4A6FA8", "F0F5FF"], ["FINISHING", "4A6FA8", "F0F5FF"], ["SURFACE", "4A6FA8", "F0F5FF"], ["L (m)", "6B3FB5", "EDE8FB"], ["W (m)", "6B3FB5", "EDE8FB"], ["Th (m)", "6B3FB5", "EDE8FB"], ["DENSITY kg/m³", "6B3FB5", "EDE8FB"]].forEach(([v, f, b], i) => R(6, i, mkH(v, f, b)));
      shellCols.forEach((c, i) => {
        const cc = c.color.replace("#", "");
        R(6, matColCount + i, { v: mc.unit, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.colBg } }, alignment: alCW("center"), border: bdrM(cc) } });
      });
      R(6, matColCount + shellCols.length, { v: "TOTAL " + mc.unit, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: mc.totFg }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.totBg } }, alignment: alCW("center"), border: bdrM(mc.accent) } });

      // Data rows
      const getRowFill = t => {
        if (t && t.startsWith("PET")) return { patternType: "solid", fgColor: { rgb: "EFF6FF" } };
        if (t && t.startsWith("PVC")) return { patternType: "solid", fgColor: { rgb: "FDF4FF" } };
        if (t && t.startsWith("BALSA")) return { patternType: "solid", fgColor: { rgb: "FFFBEB" } };
        return { patternType: "solid", fgColor: { rgb: "F8FAFC" } };
      };

      const dc = (v, t, fill, fnt, fmt) => ({ v: v != null ? v : "", t, s: { font: { sz: 10, name: "Calibri", ...fnt }, fill, alignment: al(t === "n" ? "center" : "left"), border: bdr(), ...(fmt ? { numFmt: fmt } : {}) } });
      
      const getVal = (r, col) => {
        const s = r.colStats[col.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
        return s[metricKey] || 0;
      };

      const getRowTotal = r => {
        if (metricKey === "sheets") return r.totalSheets;
        if (metricKey === "sqm") return r.totalSqm;
        if (metricKey === "vol") return r.totalVol;
        return r.totalWt;
      };

      const fmt = metricKey === "sheets" ? null : metricKey === "vol" ? numFmt4 : numFmt3;

      computed.forEach((r, i) => {
        const row = 7 + i;
        const fill = getRowFill(r.type);
        const mt = matTypes.find(m => m.name === r.type);
        const acRgb = (mt ? mt.color : "#6655AA").replace("#", "");
        let c2 = 0;
        
        R(row, c2++, dc(i + 1, "n", fill, { bold: true, color: { rgb: "94A3B8" } }));
        R(row, c2++, dc(r.description, "s", fill, { bold: true, color: { rgb: "1E3A5F" } }));
        R(row, c2++, dc(r.type, "s", { patternType: "solid", fgColor: { rgb: "EEF2FF" } }, { bold: true, color: { rgb: acRgb } }));
        R(row, c2++, dc(r.supplier, "s", fill, { color: { rgb: "4A6FA8" } }));
        R(row, c2++, dc(r.finishing, "s", fill, { color: { rgb: "4A6FA8" } }));
        R(row, c2++, dc(r.surface, "s", fill, { color: { rgb: "888888" } }));
        [r.length, r.width, r.thickness].forEach(v => R(row, c2++, dc(v, "n", { patternType: "solid", fgColor: { rgb: "F3F0FF" } }, { color: { rgb: "6B3FB5" } }, "0.000")));
        R(row, c2++, dc(r.density, "n", { patternType: "solid", fgColor: { rgb: "F3F0FF" } }, { color: { rgb: "6B3FB5" } }, "0.00"));
        
        shellCols.forEach(col => {
          const cRgb = col.color.replace("#", "");
          const val = getVal(r, col);
          R(row, c2++, dc(val, "n", { patternType: "solid", fgColor: { rgb: mc.light } }, { bold: metricKey === "sheets", color: { rgb: cRgb } }, fmt));
        });
        
        const tot = getRowTotal(r);
        R(row, c2++, dc(tot, "n", { patternType: "solid", fgColor: { rgb: mc.totBg } }, { bold: true, color: { rgb: mc.totFg } }, fmt));
      });

      // Totals
      const sr = 7 + computed.length;
      for (let c = 0; c < totalCols; c++) R(sr, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "E8F0FB" } } } });
      
      const tr = sr + 1;
      R(tr, 0, { v: "GRAND TOTALS", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, alignment: al("left"), border: bdrM(mc.accent) } });
      for (let c = 1; c < matColCount; c++) R(tr, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: mc.light } }, border: bdrM(mc.accent) } });
      
      let tc2 = matColCount;
      shellCols.forEach(col => {
        const ct = totals.colTotals[col.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
        const cRgb = col.color.replace("#", "");
        const val = ct[metricKey] || 0;
        R(tr, tc2++, { v: val, t: "n", s: { font: { bold: true, sz: 11, color: { rgb: cRgb }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, alignment: al("center"), border: bdrM(cRgb), ...(fmt ? { numFmt: fmt } : {}) } });
      });
      
      const grandVal = totals["total" + metricKey.charAt(0).toUpperCase() + metricKey.slice(1)] || totals.total;
      R(tr, tc2, { v: grandVal, t: "n", s: { font: { bold: true, sz: 13, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.totBg } }, alignment: al("center"), border: bdrM(mc.accent), ...(fmt ? { numFmt: fmt } : {}) } });

      // Material type summary
      let mr = tr + 2;
      R(mr, 0, { v: mc.label.toUpperCase() + " SUMMARY BY MATERIAL TYPE", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdr() } });
      mr++;
      
      matTypes.forEach(m => {
        const rows2 = computed.filter(r2 => r2.type === m.name);
        const val = rows2.reduce((a, r2) => {
          const s = r2.colStats;
          return a + shellCols.reduce((ac, col) => ac + (r2.colStats[col.id] ? r2.colStats[col.id][metricKey] : 0), 0);
        }, 0);
        if (val > 0) {
          const cc = m.color.replace("#", "");
          R(mr, 0, { v: m.name, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, border: bdr() } });
          R(mr, 1, { v: val, t: "n", s: { font: { bold: true, sz: 10, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, border: bdr(), ...(fmt ? { numFmt: fmt } : {}) } });
          R(mr, 2, { v: mc.unit, t: "s", s: { font: { sz: 9, color: { rgb: "94A3B8" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, border: bdr() } });
          mr++;
        }
      });
      
      R(mr, 0, { v: "GRAND TOTAL", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, border: bdrM(mc.accent) } });
      R(mr, 1, { v: grandVal, t: "n", s: { font: { bold: true, sz: 12, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.totBg } }, border: bdrM(mc.accent), ...(fmt ? { numFmt: fmt } : {}) } });
      R(mr, 2, { v: mc.unit, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: mc.accent }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: mc.light } }, border: bdrM(mc.accent) } });

      ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: mr + 2, c: totalCols - 1 } });
      ws["!cols"] = [{ wch: 5 }, { wch: 36 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 9 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 11 }, ...shellCols.map(() => ({ wch: 13 })), { wch: 14 }];
      ws["!rows"] = [{ hpt: 26 }, { hpt: 5 }, { hpt: 18 }, { hpt: 18 }, { hpt: 5 }, { hpt: 20 }, { hpt: 30 }, ...computed.map(() => ({ hpt: 16 })), { hpt: 5 }, { hpt: 22 }];
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: totalCols - 1 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: matColCount - 1 } },
        { s: { r: sr, c: 0 }, e: { r: sr, c: totalCols - 1 } },
        { s: { r: tr, c: 0 }, e: { r: tr, c: matColCount - 1 } }
      ];
      return ws;
    };

    const buildAnalyticsSheet = () => {
      const ws = {};
      const R = (r, c, cell) => {
        ws[XLSX.utils.encode_cell({ r, c })] = cell;
      };
      
      const mkHdr = (v, fg, bg, border = bdr()) => ({ v, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: fg }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: alCW("center"), border } });
      const mkCell = (v, t, fg, bg, fmt, bold = false, border = bdr()) => ({ v: v != null ? v : "", t, s: { font: { bold, sz: 10, name: "Calibri", color: { rgb: fg } }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: al(t === "n" ? "center" : "left"), border, ...(fmt ? { numFmt: fmt } : {}) } });

      let row = 0;
      const totalAnalyticsCols = 3 + shellCols.length + 1;

      // Title
      R(row, 0, { v: "ANALYTICS & PIVOT SUMMARY", t: "s", s: { font: { bold: true, sz: 16, color: { rgb: "FFFFFF" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "1E3A5F" } }, alignment: al("left"), border: bdrM("E6920A") } });
      for (let c = 1; c < totalAnalyticsCols + 4; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "1E3A5F" } }, border: bdrM("E6920A") } });
      row++;
      
      for (let c = 0; c < totalAnalyticsCols + 4; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "E6920A" } } } });
      row++;

      // KPIs
      R(row, 0, { v: "PROJECT KPIs", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdrM("A0C4E4") } });
      for (let c = 1; c < 8; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      row++;
      
      const kpis = [
        ["TOTAL WEIGHT", totals.totalWt, "n", "B45309", "FFFBEB", numFmt3, "kg"],
        ["TOTAL AREA", totals.totalSqm, "n", "2563A8", "EFF6FF", numFmt3, "m²"],
        ["TOTAL VOLUME", totals.totalVol, "n", "2D8A3E", "F0FDF4", numFmt4, "m³"],
        ["TOTAL SHEETS", totals.totalSheets, "n", "6B3FB5", "EDE8FB", "0", "sheets"],
        ["NO. OF MATERIALS", computed.length, "n", "0891B2", "ECFEFF", "0", "rows"],
        ["NO. OF PARTS", shellCols.length, "n", "DB2777", "FDF2F8", "0", "parts"]
      ];
      
      const kRow = row, kRow2 = row + 1;
      kpis.slice(0, 3).forEach(([l, v, t, fg, bg, fmt], i) => {
        R(kRow, i * 2, { v: l, t: "s", s: { font: { bold: true, sz: 8, color: { rgb: "94A3B8" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: al("left"), border: bdr(fg) } });
        R(kRow, i * 2 + 1, { v, t, s: { font: { bold: true, sz: 12, color: { rgb: fg }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: al("center"), border: bdr(fg), ...(fmt ? { numFmt: fmt } : {}) } });
      });
      kpis.slice(3).forEach(([l, v, t, fg, bg, fmt], i) => {
        R(kRow2, i * 2, { v: l, t: "s", s: { font: { bold: true, sz: 8, color: { rgb: "94A3B8" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: al("left"), border: bdr(fg) } });
        R(kRow2, i * 2 + 1, { v, t, s: { font: { bold: true, sz: 12, color: { rgb: fg }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: bg } }, alignment: al("center"), border: bdr(fg), ...(fmt ? { numFmt: fmt } : {}) } });
      });
      row += 3;

      // Section 2: Material Pivot
      row++;
      R(row, 0, { v: "PIVOT BY MATERIAL TYPE", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdrM("A0C4E4") } });
      for (let c = 1; c < 5; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      row++;
      [["MATERIAL", "4A6FA8", "F0F5FF"], ["WEIGHT (kg)", "B45309", "FFFBEB"], ["AREA (m²)", "2563A8", "EFF6FF"], ["VOLUME (m³)", "2D8A3E", "F0FDF4"], ["NO. SHEETS", "6B3FB5", "EDE8FB"]].forEach(([v, f, b], i) => R(row, i, mkHdr(v, f, b)));
      row++;
      
      matTypes.forEach(m => {
        const mrows = computed.filter(r => r.type === m.name);
        const wt = mrows.reduce((a, r) => a + r.totalWt, 0);
        if (wt === 0 && mrows.length === 0) return;
        const cc = m.color.replace("#", "");
        const sqm = mrows.reduce((a, r) => a + r.totalSqm, 0);
        const vol = mrows.reduce((a, r) => a + r.totalVol, 0);
        const sh = mrows.reduce((a, r) => a + r.totalSheets, 0);
        
        R(row, 0, { v: m.name, t: "s", s: { font: { bold: true, sz: 10, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, alignment: al("left"), border: bdrM(cc) } });
        R(row, 1, mkCell(wt, "n", "B45309", "FFFBEB", numFmt3, true));
        R(row, 2, mkCell(sqm, "n", "2563A8", "EFF6FF", numFmt3, true));
        R(row, 3, mkCell(vol, "n", "2D8A3E", "F0FDF4", numFmt4, true));
        R(row, 4, mkCell(sh, "n", "6B3FB5", "EDE8FB", "0", true));
        row++;
      });
      
      R(row, 0, { v: "TOTAL", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "E6920A" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "FFF4E0" } }, border: bdrM("E6920A") } });
      R(row, 1, mkCell(totals.totalWt, "n", "B45309", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      R(row, 2, mkCell(totals.totalSqm, "n", "2563A8", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      R(row, 3, mkCell(totals.totalVol, "n", "2D8A3E", "FFF4E0", numFmt4, true, bdrM("E6920A")));
      R(row, 4, mkCell(totals.totalSheets, "n", "6B3FB5", "FFF4E0", "0", true, bdrM("E6920A")));
      row += 3;

      // Section 3: Shell Column Pivot
      R(row, 0, { v: "PIVOT BY SHELL COLUMN / PART", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdrM("A0C4E4") } });
      for (let c = 1; c < 5; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      row++;
      [["SHELL PART", "4A6FA8", "F0F5FF"], ["WEIGHT (kg)", "B45309", "FFFBEB"], ["AREA (m²)", "2563A8", "EFF6FF"], ["VOLUME (m³)", "2D8A3E", "F0FDF4"], ["NO. SHEETS", "6B3FB5", "EDE8FB"]].forEach(([v, f, b], i) => R(row, i, mkHdr(v, f, b)));
      row++;
      
      shellCols.forEach(c => {
        const ct = totals.colTotals[c.id] || { sheets: 0, sqm: 0, vol: 0, wt: 0 };
        const cc = c.color.replace("#", "");
        
        R(row, 0, { v: c.label + (c.itemCode ? " (" + c.itemCode + ")" : ""), t: "s", s: { font: { bold: true, sz: 10, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, alignment: al("left"), border: bdrM(cc) } });
        R(row, 1, mkCell(ct.wt, "n", "B45309", "FFFBEB", numFmt3, true));
        R(row, 2, mkCell(ct.sqm, "n", "2563A8", "EFF6FF", numFmt3, true));
        R(row, 3, mkCell(ct.vol, "n", "2D8A3E", "F0FDF4", numFmt4, true));
        R(row, 4, mkCell(ct.sheets, "n", "6B3FB5", "EDE8FB", "0", true));
        row++;
      });
      
      R(row, 0, { v: "TOTAL", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "E6920A" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "FFF4E0" } }, border: bdrM("E6920A") } });
      R(row, 1, mkCell(totals.totalWt, "n", "B45309", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      R(row, 2, mkCell(totals.totalSqm, "n", "2563A8", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      R(row, 3, mkCell(totals.totalVol, "n", "2D8A3E", "FFF4E0", numFmt4, true, bdrM("E6920A")));
      R(row, 4, mkCell(totals.totalSheets, "n", "6B3FB5", "FFF4E0", "0", true, bdrM("E6920A")));
      row += 3;

      // Section 4: Cross-pivot
      R(row, 0, { v: "CROSS-PIVOT: MATERIAL TYPE × SHELL PART (WEIGHT kg)", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdrM("A0C4E4") } });
      for (let c = 1; c < shellCols.length + 2; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      row++;
      
      R(row, 0, mkHdr("MATERIAL", "4A6FA8", "F0F5FF"));
      shellCols.forEach((c, i) => {
        const cc = c.color.replace("#", "");
        R(row, i + 1, { v: c.label, t: "s", s: { font: { bold: true, sz: 9, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: cc + "22" } }, alignment: alCW("center"), border: bdrM(cc) } });
      });
      R(row, shellCols.length + 1, mkHdr("TOTAL", "B45309", "FFFBEB", bdrM("E6920A")));
      row++;

      matTypes.forEach(m => {
        const mrows = computed.filter(r => r.type === m.name);
        const rowTotal = shellCols.reduce((a, c) => {
          const v = mrows.reduce((b, r) => b + (r.colStats[c.id]?.wt || 0), 0);
          return a + v;
        }, 0);
        if (rowTotal === 0) return;
        const cc = m.color.replace("#", "");
        R(row, 0, { v: m.name, t: "s", s: { font: { bold: true, sz: 10, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, alignment: al("left"), border: bdrM(cc) } });
        shellCols.forEach((c, i) => {
          const val = mrows.reduce((a, r) => a + (r.colStats[c.id]?.wt || 0), 0);
          const cRgb = c.color.replace("#", "");
          R(row, i + 1, { v: val || 0, t: "n", s: { font: { sz: 10, name: "Calibri", color: { rgb: val > 0 ? "B45309" : "C8D8EE" } }, fill: { patternType: "solid", fgColor: { rgb: val > 0 ? "FFFBEB" : "F8FAFC" } }, alignment: al("center"), border: bdr(cRgb), ...(numFmt3 ? { numFmt: numFmt3 } : {}) } });
        });
        R(row, shellCols.length + 1, mkCell(rowTotal, "n", "B45309", "FFF4E0", numFmt3, true, bdrM("E6920A")));
        row++;
      });

      R(row, 0, { v: "TOTAL", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "E6920A" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "FFF4E0" } }, border: bdrM("E6920A") } });
      shellCols.forEach((c, i) => {
        const ct = totals.colTotals[c.id] || { wt: 0 };
        R(row, i + 1, mkCell(ct.wt, "n", "E6920A", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      });
      R(row, shellCols.length + 1, mkCell(totals.totalWt, "n", "E6920A", "FFF4E0", numFmt3, true, bdrM("E6920A")));
      row += 3;

      // Section 5: % Share
      R(row, 0, { v: "% WEIGHT DISTRIBUTION BY MATERIAL", t: "s", s: { font: { bold: true, sz: 10, color: { rgb: "1E3A5F" }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" } }, border: bdrM("A0C4E4") } });
      for (let c = 1; c < 4; c++) R(row, c, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: "DBE8F8" }, border: bdrM("A0C4E4") } } });
      row++;
      [["MATERIAL", "4A6FA8", "F0F5FF"], ["WEIGHT (kg)", "B45309", "FFFBEB"], ["% SHARE", "E6920A", "FFF4E0"], ["BAR", "B45309", "FFF4E0"]].forEach(([v, f, b], i) => R(row, i, mkHdr(v, f, b)));
      row++;
      
      matTypes.forEach(m => {
        const mrows = computed.filter(r => r.type === m.name);
        const wt = mrows.reduce((a, r) => a + r.totalWt, 0);
        if (wt === 0) return;
        const pct = totals.totalWt > 0 ? (wt / totals.totalWt) * 100 : 0;
        const cc = m.color.replace("#", "");
        
        R(row, 0, { v: m.name, t: "s", s: { font: { bold: true, sz: 10, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, border: bdr() } });
        R(row, 1, mkCell(wt, "n", "B45309", "FFFBEB", numFmt3, false));
        R(row, 2, { v: pct / 100, t: "n", s: { font: { sz: 10, name: "Calibri", color: { rgb: "E6920A" } }, fill: { patternType: "solid", fgColor: { rgb: "FFF8EE" } }, alignment: al("center"), border: bdr(), numFmt: "0.0%" } });
        R(row, 3, { v: "█".repeat(Math.round(pct / 5)), t: "s", s: { font: { sz: 10, color: { rgb: cc }, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: "F8FAFC" } }, border: bdr() } });
        row++;
      });

      ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row + 2, c: Math.max(7, shellCols.length + 2) } });
      ws["!cols"] = [{ wch: 22 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 11 }, ...shellCols.map(() => ({ wch: 13 })), { wch: 13 }];
      ws["!rows"] = [{ hpt: 26 }, { hpt: 5 }, { hpt: 18 }, { hpt: 18 }, { hpt: 5 }];
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(7, shellCols.length + 2) } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(7, shellCols.length + 2) } }
      ];
      return ws;
    };

    XLSX.utils.book_append_sheet(wb, buildSheet("sheets"), "No. of Sheets");
    XLSX.utils.book_append_sheet(wb, buildSheet("sqm"), "SQM (m²)");
    XLSX.utils.book_append_sheet(wb, buildSheet("vol"), "Volume (m³)");
    XLSX.utils.book_append_sheet(wb, buildSheet("wt"), "Weight (kg)");
    XLSX.utils.book_append_sheet(wb, buildAnalyticsSheet(), "Analytics");

    XLSX.writeFile(wb, `SKAPS_BOM_${header.article || "PROJECT"}_${header.rev || "A01"}.xlsx`, { bookSST: false, type: "binary", cellStyles: true });
    setExporting(false);
    setExportMsg("Exported!");
    setTimeout(() => setExportMsg(""), 2500);
  };

  return (
    <div style={{ background: "#f0f5fb", minHeight: "100vh" }}>
      
      {/* USERNAME POPUP */}
      {!username && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 800 }}>Enter Name</div>
            </div>
            <input
              placeholder="Enter Name"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setUsername(userInput);
                }
              }}
              style={{ ...iStyle, width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={() => setUsername(userInput)}
              style={{ ...btnPrimary, width: "100%" }}
            >
              ENTER
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ background: "#ffffff", borderBottom: "3px solid #e6920a", padding: "11px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 12px rgba(37,99,168,.10)", flexWrap: "wrap" }}>
        
        {/* Brand */}
        <div style={{ background: "linear-gradient(135deg,#e6920a,#f5a623)", padding: "6px 14px", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: 3, borderRadius: 6, boxShadow: "0 2px 8px rgba(230,146,10,.35)" }}>SKAPS</div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 20, color: "#1e3a5f", letterSpacing: 2, lineHeight: 1.1 }}>BOM CALCULATOR</div>
          <div style={{ fontSize: 9, color: "#7a9bc4", letterSpacing: 1.5, fontWeight: 500 }}>SHEETS INPUT PER PART · SQM / VOL / WT AUTO-CALCULATED</div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1e3a5f" }}>
            👤 {username}
          </div>

          {/* Metric toggle */}
          <div style={{ display: "flex", gap: 2, background: "#f0f5fb", padding: "3px", borderRadius: 6, border: "1px solid #d0dcea" }}>
            {[["sheets", "NO. SHEETS"], ["sqm", "SQM m²"], ["vol", "VOL m³"], ["wt", "WT kg"]].map(([k, l]) => (
              <button key={k} onClick={() => setShowMetric(k)} style={{ padding: "4px 10px", fontSize: 9, fontFamily: "inherit", borderRadius: 4, cursor: "pointer", fontWeight: 700, border: "none", background: showMetric === k ? "#1e3a5f" : "transparent", color: showMetric === k ? "#e6920a" : "#7a9bc4", transition: "all .15s", letterSpacing: .3 }}>{l}</button>
            ))}
          </div>

          {/* Extra % wastage */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: extraPct > 0 ? "#fff4e0" : "#f0f5fb", border: "1.5px solid " + (extraPct > 0 ? "#e6920a" : "#d0dcea"), borderRadius: 6, padding: "4px 10px", transition: "all .2s", minWidth: 130 }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: extraPct > 0 ? "#e6920a" : "#94a3b8", letterSpacing: .8, whiteSpace: "nowrap" }}>EXTRA %</span>
            <input
              type="number" min="0" max="999" step="0.5"
              value={extraPct === 0 ? "" : extraPct}
              onChange={e => setExtraPct(Math.max(0, parseFloat(e.target.value) || 0))}
              onBlur={e => { if (e.target.value === "") setExtraPct(0); }}
              placeholder="0"
              style={{ width: 44, background: "transparent", border: "none", outline: "none", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: extraPct > 0 ? "#e6920a" : "#94a3b8", textAlign: "center", padding: "0" }}
            />
            <span style={{ fontSize: 9, fontWeight: 700, color: extraPct > 0 ? "#e6920a" : "#94a3b8" }}>%</span>
            {extraPct > 0 && <button onClick={() => setExtraPct(0)} title="Clear" style={{ background: "#e6920a22", border: "none", color: "#e6920a", cursor: "pointer", fontSize: 10, padding: "1px 5px", lineHeight: 1, borderRadius: 3, fontWeight: 800 }}>✕</button>}
          </div>

          <div style={{ width: 1, height: 26, background: "#dce8f4", margin: "0 2px" }} />

          {/* UNDO */}
          <button 
            onClick={() => {
              if (selectedFormat === "Non Returnable Auxiliary") {
                if (canUndoNonReturnableRows) { undoNonReturnableRows(); showToast("Undone"); }
              } else if (selectedFormat === "Returnable Auxiliary") {
                if (canUndoReturnableRows) { undoReturnableRows(); showToast("Undone"); }
              } else {
                if (canUndo) { undoRows(); showToast("Undone"); }
              }
            }} 
            disabled={
              selectedFormat === "Non Returnable Auxiliary" ? !canUndoNonReturnableRows :
              selectedFormat === "Returnable Auxiliary" ? !canUndoReturnableRows :
              !canUndo
            } 
            title="Undo (Ctrl+Z)"
            style={{ 
              background: (
                selectedFormat === "Non Returnable Auxiliary" ? canUndoNonReturnableRows :
                selectedFormat === "Returnable Auxiliary" ? canUndoReturnableRows :
                canUndo
              ) ? "#f0f4fa" : "#f8fafc", 
              color: (
                selectedFormat === "Non Returnable Auxiliary" ? canUndoNonReturnableRows :
                selectedFormat === "Returnable Auxiliary" ? canUndoReturnableRows :
                canUndo
              ) ? "#1e3a5f" : "#b8cde0", 
              border: "1.5px solid " + ((
                selectedFormat === "Non Returnable Auxiliary" ? canUndoNonReturnableRows :
                selectedFormat === "Returnable Auxiliary" ? canUndoReturnableRows :
                canUndo
              ) ? "#c0d4e8" : "#e4eaf4"), 
              padding: "5px 11px", 
              fontSize: 10, 
              fontFamily: "inherit", 
              cursor: (
                selectedFormat === "Non Returnable Auxiliary" ? canUndoNonReturnableRows :
                selectedFormat === "Returnable Auxiliary" ? canUndoReturnableRows :
                canUndo
              ) ? "pointer" : "not-allowed", 
              fontWeight: 700, 
              borderRadius: 5, 
              display: "flex", 
              alignItems: "center", 
              gap: 4 
            }}
          >
            ↩ UNDO
          </button>

          {/* MAT TYPES */}
          <button 
            onClick={() => setActiveModal("matTypes")}
            disabled={selectedFormat !== "Bill of Material"}
            style={{ 
              background: selectedFormat !== "Bill of Material" ? "#f8fafc" : "#faf5ff", 
              color: selectedFormat !== "Bill of Material" ? "#b8cde0" : "#7c3aed", 
              border: "1.5px solid " + (selectedFormat !== "Bill of Material" ? "#e4eaf4" : "#c4b5f4"), 
              padding: "5px 11px", 
              fontSize: 10, 
              fontFamily: "inherit", 
              cursor: selectedFormat !== "Bill of Material" ? "not-allowed" : "pointer", 
              fontWeight: 700, 
              borderRadius: 5, 
              whiteSpace: "nowrap" 
            }}
          >
            🧱 MAT TYPES
          </button>

          {/* COLUMNS */}
          <button 
            onClick={() => setActiveModal("columns")}
            style={{ 
              background: "#f0f5fb", 
              color: "#1e3a5f", 
              border: "1.5px solid #c0d4e8", 
              padding: "5px 11px", 
              fontSize: 10, 
              fontFamily: "inherit", 
              cursor: "pointer", 
              fontWeight: 700, 
              borderRadius: 5 
            }}
          >
            ⚙ COLUMNS
          </button>

          <div style={{ width: 1, height: 26, background: "#dce8f4", margin: "0 2px" }} />

          {/* IMPORT EXCEL */}
          <label 
            style={{ 
              background: selectedFormat !== "Bill of Material" ? "#f8fafc" : "#f0fdf4", 
              color: selectedFormat !== "Bill of Material" ? "#b8cde0" : "#15803d", 
              border: "1.5px solid " + (selectedFormat !== "Bill of Material" ? "#e4eaf4" : "#86efac"), 
              padding: "5px 11px", 
              fontSize: 10, 
              fontFamily: "inherit", 
              fontWeight: 700, 
              cursor: selectedFormat !== "Bill of Material" ? "not-allowed" : "pointer", 
              borderRadius: 5, 
              display: "flex", 
              alignItems: "center", 
              gap: 4, 
              whiteSpace: "nowrap" 
            }}
          >
            📥 IMPORT EXCEL
            {selectedFormat === "Bill of Material" && (
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} style={{ display: "none" }} />
            )}
          </label>

          {/* EXPORT EXCEL */}
          <button onClick={exportToExcel} disabled={exporting} className={exporting ? "pulsing" : ""}
            style={{ background: exportMsg ? "#15803d" : "#1e3a5f", color: "#fff", border: "none", padding: "5px 13px", fontSize: 10, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", borderRadius: 5, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "background .3s", boxShadow: "0 1px 4px rgba(30,58,95,.2)" }}>
            ⬇ {exportMsg || (exporting ? "EXPORTING…" : "EXPORT EXCEL")}
          </button>

          {/* ANALYTICS */}
          <button 
            onClick={() => setActiveModal("analytics")}
            disabled={selectedFormat !== "Bill of Material"}
            style={{ 
              display: "inline-block", 
              background: selectedFormat !== "Bill of Material" ? "#f8fafc" : "#f0fdf4", 
              color: selectedFormat !== "Bill of Material" ? "#b8cde0" : "#15803d", 
              border: "1.5px solid " + (selectedFormat !== "Bill of Material" ? "#e4eaf4" : "#86efac"), 
              padding: "5px 13px", 
              fontSize: 10, 
              fontFamily: "inherit", 
              fontWeight: 700, 
              cursor: selectedFormat !== "Bill of Material" ? "not-allowed" : "pointer", 
              borderRadius: 5, 
              whiteSpace: "nowrap", 
              alignItems: "center", 
              gap: 5 
            }}
          >
            📊 ANALYTICS
          </button>

          <div style={{ width: 1, height: 26, background: "#dce8f4", margin: "0 2px" }} />

          <button onClick={saveToSQL} style={btnPrimary}>
            💾 SAVE
          </button>

          <button onClick={() => setShowApprove(true)} style={btnPrimary}>
            ✅ APPROVE+
          </button>
 
          {lastSaved && <div style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.5, textAlign: "right" }}><div style={{ color: "#7c3aed", fontWeight: 700, letterSpacing: .5 }}>SAVED</div><div>{lastSaved.toLocaleTimeString()}</div></div>}
        </div>
      </div>

      {/* PROJECT META */}
      <HeaderSection
        header={header}
        setHeader={setHeader}
        articleList={articleList}
        setArticleList={setArticleList}
        revisionList={revisionList}
        setRevisionList={setRevisionList}
        newArticle={newArticle}
        setNewArticle={setNewArticle}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        newRevision={newRevision}
        setNewRevision={setNewRevision}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
      />

      {selectedFormat === "Bill of Material" ? (
        <>
          {/* SUMMARY BAR */}
          <div style={{ display: "flex", borderBottom: "2px solid #dce8f8", flexWrap: "wrap", background: "#fff", boxShadow: "0 2px 10px rgba(30,58,95,.06)" }}>
            <div style={{ padding: "14px 22px", borderRight: "1px solid #dde8f8", background: "linear-gradient(135deg,#f5f0ff,#ede8ff)", minWidth: 155 }}>
              <div style={{ fontSize: 8, color: "#7c3aed", letterSpacing: 2, fontWeight: 800, marginBottom: 3 }}>NO. OF SHEETS</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: "#6d28d9", lineHeight: 1 }}>{totals.totalSheets}</div>
              <div style={{ fontSize: 8, color: "#a78bfa", marginTop: 3, letterSpacing: 1 }}>AUTO-SUM</div>
            </div>
            {showMetric === "sqm" && (
              <div style={{ padding: "14px 22px", borderRight: "1px solid #dde8f8", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", minWidth: 155, animation: "fadeIn .2s ease" }}>
                <div style={{ fontSize: 8, color: "#1d4ed8", letterSpacing: 2, fontWeight: 800 }}>TOTAL SQM</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: "#1d4ed8", lineHeight: 1, marginTop: 3 }}>{totals.totalSqm.toFixed(3)}<span style={{ fontSize: 11, marginLeft: 4, color: "#93c5fd" }}>m²</span></div>
              </div>
            )}
            {showMetric === "vol" && (
              <div style={{ padding: "14px 22px", borderRight: "1px solid #dde8f8", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", minWidth: 165, animation: "fadeIn .2s ease" }}>
                <div style={{ fontSize: 8, color: "#15803d", letterSpacing: 2, fontWeight: 800 }}>TOTAL VOLUME</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: "#15803d", lineHeight: 1, marginTop: 3 }}>{totals.totalVol.toFixed(3)}<span style={{ fontSize: 11, marginLeft: 4, color: "#86efac" }}>m³</span></div>
              </div>
            )}
            {showMetric === "wt" && (
              <div style={{ padding: "14px 22px", borderRight: "1px solid #dde8f8", background: "linear-gradient(135deg,#fffbeb,#fef3c7)", minWidth: 155, animation: "fadeIn .2s ease" }}>
                <div style={{ fontSize: 8, color: "#b45309", letterSpacing: 2, fontWeight: 800 }}>TOTAL WEIGHT</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: "#b45309", lineHeight: 1, marginTop: 3 }}>{totals.totalWt.toFixed(3)}<span style={{ fontSize: 11, marginLeft: 4, color: "#fbbf24" }}>kg</span></div>
              </div>
            )}
            <div style={{ padding: "14px 22px", borderRight: "1px solid #dde8f8", background: "linear-gradient(135deg,#fff7ed,#ffe4bc)", minWidth: 155 }}>
              <div style={{ fontSize: 8, color: "#c2410c", letterSpacing: 2, fontWeight: 800 }}>GRAND TOTAL</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 800, color: "#ea580c", lineHeight: 1, marginTop: 3 }}>{totals.total.toFixed(3)}<span style={{ fontSize: 11, marginLeft: 4, color: "#fb923c" }}>kg</span></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "0 22px", marginLeft: "auto", gap: 6 }}>
              <span style={{ fontSize: 8, color: "#94a3b8", letterSpacing: .5, fontWeight: 600 }}>VIEW</span>
              {[["sheets", "SHEETS", "#1e3a5f", "#e8f0fb"], ["sqm", "SQM", "#1d4ed8", "#eff6ff"], ["vol", "VOL", "#15803d", "#f0fdf4"], ["wt", "WT", "#b45309", "#fff7ed"]].map(([k, l]) => (
                <div key={k} onClick={() => setShowMetric(k)} style={{ padding: "5px 12px", fontSize: 9, borderRadius: 5, cursor: "pointer", fontWeight: 800, border: `1.5px solid ${showMetric === k ? (k === "sheets" ? "#1e3a5f" : k === "sqm" ? "#1d4ed8" : k === "vol" ? "#15803d" : "#b45309") : "#d0dcea"}`, background: showMetric === k ? (k === "sheets" ? "#e8f0fb" : k === "sqm" ? "#eff6ff" : k === "vol" ? "#f0fdf4" : "#fff7ed") : "#f8fafc", color: showMetric === k ? (k === "sheets" ? "#1e3a5f" : k === "sqm" ? "#1d4ed8" : k === "vol" ? "#15803d" : "#b45309") : "#94a3b8", transition: "all .15s", letterSpacing: .5 }}>{l}</div>
              ))}
            </div>
          </div>

          {/* BOM TABLE GRID */}
          <BOMTable
            filtered={filtered}
            showMetric={showMetric}
            setShowMetric={setShowMetric}
            extraPct={extraPct}
            setExtraPct={setExtraPct}
            canUndo={canUndo}
            undoRows={undoRows}
            addRow={addRow}
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            matNames={matNames}
            shellCols={shellCols}
            totals={totals}
            matTypes={matTypes}
            setRows={setRows}
            inlineCell={inlineCell}
            setInlineCell={setInlineCell}
            inlineVal={inlineVal}
            setInlineVal={setInlineVal}
            startInline={startInline}
            commitInline={commitInline}
            openEdit={openEdit}
            dupRow={dupRow}
            deleteRow={deleteRow}
            showToast={showToast}
          />
        </>
      ) : selectedFormat === "Non Returnable Auxiliary" ? (
        <NonReturnableAuxiliaryTable
          filtered={filteredNonReturnable}
          setRows={setNonReturnableRows}
          canUndo={canUndoNonReturnableRows}
          undoRows={undoNonReturnableRows}
          addRow={addRow}
          search={search}
          setSearch={setSearch}
          inlineCell={inlineCell}
          setInlineCell={setInlineCell}
          inlineVal={inlineVal}
          setInlineVal={setInlineVal}
          startInline={startInline}
          commitInline={commitInline}
          openEdit={openEdit}
          dupRow={dupRow}
          deleteRow={deleteRow}
          showToast={showToast}
          header={header}
          auxCols={nonReturnableCols}
        />
      ) : selectedFormat === "Returnable Auxiliary" ? (
        <ReturnableAuxiliaryTable
          filtered={filteredReturnable}
          setRows={setReturnableRows}
          canUndo={canUndoReturnableRows}
          undoRows={undoReturnableRows}
          addRow={addRow}
          search={search}
          setSearch={setSearch}
          inlineCell={inlineCell}
          setInlineCell={setInlineCell}
          inlineVal={inlineVal}
          setInlineVal={setInlineVal}
          startInline={startInline}
          commitInline={commitInline}
          openEdit={openEdit}
          dupRow={dupRow}
          deleteRow={deleteRow}
          showToast={showToast}
          header={header}
          auxCols={returnableCols}
        />
      ) : selectedFormat === "Cycle Time - Tentative" ? (
        <TentativeCycleTimeTable
          filtered={filteredTentativeCycle}
          setRows={setTentativeCycleRows}
          canUndo={canUndoTentativeCycleRows}
          undoRows={undoTentativeCycleRows}
          addRow={addRow}
          search={search}
          setSearch={setSearch}
          inlineCell={inlineCell}
          setInlineCell={setInlineCell}
          inlineVal={inlineVal}
          setInlineVal={setInlineVal}
          startInline={startInline}
          commitInline={commitInline}
          openEdit={openEdit}
          dupRow={dupRow}
          deleteRow={deleteRow}
          showToast={showToast}
          headerData={header}
          setHeaderData={setHeader}
          articleName={header.article}
          cycleCols={tentativeCycleCols}
        />
      ) : selectedFormat === "Cycle Time - Production" ? (
        <ProductionCycleTimeTable
          filtered={filteredProductionCycle}
          setRows={setProductionCycleRows}
          canUndo={canUndoProductionCycleRows}
          undoRows={undoProductionCycleRows}
          addRow={addRow}
          search={search}
          setSearch={setSearch}
          inlineCell={inlineCell}
          setInlineCell={setInlineCell}
          inlineVal={inlineVal}
          setInlineVal={setInlineVal}
          startInline={startInline}
          commitInline={commitInline}
          openEdit={openEdit}
          dupRow={dupRow}
          deleteRow={deleteRow}
          showToast={showToast}
          headerData={header}
          setHeaderData={setHeader}
          articleName={header.article}
          cycleCols={productionCycleCols}
        />
      ) : (
        <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", margin: 20, borderRadius: 10, border: "1.5px dashed #c8d8ee", minHeight: 300 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 24, color: "#1e3a5f", letterSpacing: 1 }}>{selectedFormat.toUpperCase()} VIEW</div>
          <div style={{ fontSize: 11, color: "#7a9bc4", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>This section is currently under development. Selected components will render here.</div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && <div className="toast">{toast.toUpperCase()}</div>}

      {/* APPROVAL MODAL */}
      {showApprove && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 320 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 800 }}>Enter Approver Name</div>
              <button onClick={() => setShowApprove(false)} style={{ background: "transparent", border: "none", color: "#bbb", fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <input
              placeholder="Approver Name"
              value={approver}
              onChange={e => setApprover(e.target.value)}
              style={{ ...iStyle, width: "100%", marginBottom: 10 }}
            />
            <button
              onClick={approveData}
              style={{ ...btnPrimary, width: "100%" }}
            >
              APPROVE
            </button>
          </div>
        </div>
      )}

      {/* MODAL - MATERIAL TYPES */}
      <MaterialModal
        isOpen={activeModal === "matTypes"}
        onClose={() => setActiveModal(null)}
        matTypes={matTypes}
        editMatId={editMatId}
        setEditMatId={setEditMatId}
        newMat={newMat}
        setNewMat={setNewMat}
        addMaterial={addMaterial}
        deleteMaterial={deleteMaterial}
        updateMat={updateMat}
      />

      {/* MODAL - COLUMNS */}
      <ColumnModal
        isOpen={activeModal === "columns"}
        onClose={() => setActiveModal(null)}
        shellCols={shellCols}
        setShellCols={setShellCols}
        setRows={setRows}
        newColLabel={newColLabel}
        setNewColLabel={setNewColLabel}
        newColColor={newColColor}
        setNewColColor={setNewColColor}
        newColCode={newColCode}
        setNewColCode={setNewColCode}
        newColRev={newColRev}
        setNewColRev={setNewColRev}
        addShellCol={addShellCol}
        removeShellCol={removeShellCol}
        renameShellCol={renameShellCol}
        recolorShellCol={recolorShellCol}
        updateColCode={updateColCode}
        updateColRev={updateColRev}
        selectedFormat={selectedFormat}
        auxCols={
          selectedFormat === "Non Returnable Auxiliary" ? nonReturnableCols :
          selectedFormat === "Returnable Auxiliary" ? returnableCols :
          selectedFormat === "Cycle Time - Tentative" ? tentativeCycleCols :
          selectedFormat === "Cycle Time - Production" ? productionCycleCols : []
        }
        addAuxCol={addAuxCol}
        removeAuxCol={removeAuxCol}
        renameAuxCol={renameAuxCol}
      />

      {/* MODAL - EXCEL IMPORT */}
      <ImportExcelModal
        isOpen={activeModal === "importExcel"}
        onClose={() => setActiveModal(null)}
        importFile={importFile}
        importRows={importRows}
        importHeaders={importHeaders}
        importMapping={importMapping}
        setImportMapping={setImportMapping}
        shellCols={shellCols}
        applyImport={applyImport}
      />

      {/* MODAL - EDIT ROW */}
      <EditRowModal
        isOpen={editingId !== null}
        onClose={closeEdit}
        form={form}
        setForm={setForm}
        handleTypeChange={handleTypeChange}
        matNames={matNames}
        surfaces={surfaces}
        setSurfaces={setSurfaces}
        newSurface={newSurface}
        setNewSurface={setNewSurface}
        saveEdit={saveEdit}
        selectedFormat={selectedFormat}
        auxCols={
          selectedFormat === "Non Returnable Auxiliary" ? nonReturnableCols :
          selectedFormat === "Returnable Auxiliary" ? returnableCols :
          selectedFormat === "Cycle Time - Tentative" ? tentativeCycleCols :
          selectedFormat === "Cycle Time - Production" ? productionCycleCols : []
        }
      />

      {/* MODAL - ANALYTICS */}
      {activeModal === "analytics" && (
        <AnalyticsModal
          computed={computed}
          shellCols={shellCols}
          matTypes={matTypes}
          totals={totals}
          header={header}
          onClose={() => setActiveModal(null)}
        />
      )}

    </div>
  );
}
