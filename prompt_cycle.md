Create one reusable React component for both Tentative and Production Core Kit Cycle Time tables.

Reference existing file:
- Use `BOMTable.jsx` as the UI/UX and coding-style reference.
- Follow the same patterns used in `BOMTable.jsx`:
  - Toolbar layout
  - Search/filter controls
  - Undo button
  - Add row button
  - Inline editable table cells
  - Row actions: edit, duplicate, delete
  - Totals row
  - Footer summary cards
  - Compact table styling
  - React functional component style

Do not modify or break `BOMTable.jsx`.

Create one reusable component:

`CycleTimeTable.jsx`

It should support both cycle-time sheets using this prop:

mode="tentative" | "production"

When mode is `tentative`, render:
- Title: `TENTATIVE CORE KIT CYCLE TIME - ARTICLE NAME`
- Cycle heading: `THEORETICAL CYCLE TIME IN HH:MM:SS`
- Footer label: `Total Theoretical Cycle Time`
- Toolbar helper text: `✏ THEORETICAL CYCLE TIME · HH:MM:SS`

When mode is `production`, render:
- Title: `PRODUCTION CORE KIT CYCLE TIME - ARTICLE NAME`
- Cycle heading: `ACTUAL CYCLE TIME IN HH:MM:SS`
- Footer label: `Total Actual Cycle Time`
- Toolbar helper text: `✏ ACTUAL CYCLE TIME · HH:MM:SS`

Create two small wrapper components:

1. `TentativeCycleTimeTable.jsx`
2. `ProductionCycleTimeTable.jsx`

`TentativeCycleTimeTable.jsx` should import `CycleTimeTable` and render:

<CycleTimeTable mode="tentative" {...props} />

`ProductionCycleTimeTable.jsx` should import `CycleTimeTable` and render:

<CycleTimeTable mode="production" {...props} />

Do not duplicate the full table code in both wrapper files.
Only keep the actual reusable table implementation inside `CycleTimeTable.jsx`.

Important HeaderSection.jsx requirement:
- Check the existing `HeaderSection.jsx` before adding or changing header labels.
- Do not add duplicate labels if they are already available in `HeaderSection.jsx`.
- Labels such as `CUSTOMER`, `REVISION`, `PROJECT NAME`, `PROJECT CODE`, `SUPPLIER`, `SECTION`, `MACHINE`, etc. may already exist.
- Reuse existing labels/fields/state from `HeaderSection.jsx` wherever possible.
- Only add missing labels required for Tentative/Production cycle time sheets.
- Avoid duplicate header rows, duplicate keys, and duplicate state fields.
- Do not add the company/logo/document metadata top header.
- Do not add:
  - Left SKAPS logo/logo placeholder
  - Center `SKAPS INDUSTRIES INDIA PVT. LTD.`
  - Right document metadata area

Important header layout note:
- It is NOT necessary to keep some labels on the left side and some labels on the right side.
- Header fields can be rendered in the current layout style of `HeaderSection.jsx`.
- Keep the layout compatible with the existing `HeaderSection.jsx`.
- The important requirement is that all required labels appear once, are editable if existing header fields are editable, and no duplicate labels are created.

The cycle time sheet should start from the title row and header/project information section.

Title row:
- For tentative:
  `TENTATIVE CORE KIT CYCLE TIME - ARTICLE NAME`
- For production:
  `PRODUCTION CORE KIT CYCLE TIME - ARTICLE NAME`
- `ARTICLE NAME` should be highlighted in orange/yellow.
- The title row should be full width, centered, bold, and Excel-like.

Header/project information fields:
Use or extend `HeaderSection.jsx` to render these fields.

Common required labels:
- CUSTOMER
- PROJECT NAME
- CUSTOMER LOCATION
- SUPPLIER
- SUPPLY LOCATION
- SECTION
- MACHINE
- REVISION
- PROJECT CODE

Default values:
- SUPPLIER = `SKAPS`
- SECTION = `CORE`

Additional labels for `mode="tentative"`:
- MADE BY -
- VERIFIED BY -
- APPROVED BY -

Additional labels for `mode="production"`:
- DATA TAKEN BY -
- KIT W/O NO -
- KIT PRD DATE -

Before adding any of these labels, inspect `HeaderSection.jsx`.
If the labels already exist, reuse them.
If a label is missing, add only the missing label.
Do not create duplicate labels or duplicate data keys.

Suggested flexible HeaderSection API if needed:

<HeaderSection
  mode={mode}
  title={title}
  articleName={articleName}
  fields={headerFields}
  headerData={headerData}
  setHeaderData={setHeaderData}
/>

Where for tentative:

headerFields = [
  { key: "customer", label: "CUSTOMER" },
  { key: "projectName", label: "PROJECT NAME" },
  { key: "customerLocation", label: "CUSTOMER LOCATION" },
  { key: "supplier", label: "SUPPLIER", defaultValue: "SKAPS" },
  { key: "supplyLocation", label: "SUPPLY LOCATION" },
  { key: "section", label: "SECTION", defaultValue: "CORE" },
  { key: "machine", label: "MACHINE" },
  { key: "revision", label: "REVISION" },
  { key: "projectCode", label: "PROJECT CODE" },
  { key: "madeBy", label: "MADE BY -" },
  { key: "verifiedBy", label: "VERIFIED BY -" },
  { key: "approvedBy", label: "APPROVED BY -" }
]

Where for production:

headerFields = [
  { key: "customer", label: "CUSTOMER" },
  { key: "projectName", label: "PROJECT NAME" },
  { key: "customerLocation", label: "CUSTOMER LOCATION" },
  { key: "supplier", label: "SUPPLIER", defaultValue: "SKAPS" },
  { key: "supplyLocation", label: "SUPPLY LOCATION" },
  { key: "section", label: "SECTION", defaultValue: "CORE" },
  { key: "machine", label: "MACHINE" },
  { key: "revision", label: "REVISION" },
  { key: "projectCode", label: "PROJECT CODE" },
  { key: "dataTakenBy", label: "DATA TAKEN BY -" },
  { key: "kitWoNo", label: "KIT W/O NO -" },
  { key: "kitPrdDate", label: "KIT PRD DATE -" }
]

If `HeaderSection.jsx` already uses a different API, adapt this idea to the existing structure instead of replacing everything unnecessarily.

Use props similar to `BOMTable.jsx` where possible:

export default function CycleTimeTable({
  mode = "tentative",
  filtered,
  setRows,
  canUndo,
  undoRows,
  addRow,
  search,
  setSearch,
  filterType,
  setFilterType,
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
  headerData,
  setHeaderData,
  articleName
})

If some props are not available in the current app, make the component graceful and self-contained.

Main table column names:
The cycle time table must include these exact column headers in this order:

1. S.NO
2. PART DESCRIPTION
3. PART CODE
4. NO OF PROGRAMS
5. CNC TIME
6. FINISHING TIME
7. MANUAL OPERATIONS
8. REPAIR KIT
9. OTHERS
10. ACTIONS

Important:
- These column names must be visible in the table header row.
- The table heading row above these columns should show:
  - `THEORETICAL CYCLE TIME IN HH:MM:SS` for tentative
  - `ACTUAL CYCLE TIME IN HH:MM:SS` for production
- The ACTIONS column is for edit, duplicate, and delete buttons.
- If Excel/export view should not show actions, keep actions only in the web UI.

Use this row model:

{
  id: string,
  sno: number,
  partDescription: string,
  partCode: string,
  noOfPrograms: number,
  cncTime: string,
  finishingTime: string,
  manualOperations: string,
  repairKit: string,
  others: string
}

Generate 13 default editable rows numbered 1 to 13, matching the Excel screenshot.
If rows already come from parent state, use those rows.
If no rows exist, initialize or display 13 blank rows.

Toolbar requirements:
- Search input
- Optional filter dropdown
- Undo button
- Add row button
- Helper text based on mode:
  - Tentative: `✏ THEORETICAL CYCLE TIME · HH:MM:SS`
  - Production: `✏ ACTUAL CYCLE TIME · HH:MM:SS`

Editing requirements:
Allow inline editing for:
- PART DESCRIPTION
- PART CODE
- NO OF PROGRAMS
- CNC TIME
- FINISHING TIME
- MANUAL OPERATIONS
- REPAIR KIT
- OTHERS

Time fields should accept HH:MM:SS format.

Valid examples:
- 00:10:30
- 01:20:00
- 12:00:00

If a field is empty or invalid, treat it as zero during totals calculation.

Inside `CycleTimeTable.jsx`, create helper functions:

parseTimeToSeconds(value)
formatSecondsToHHMMSS(seconds)
sumTimeField(rows, fieldName)
getTotalPrograms(rows)
getCombinedCycleTime(rows)

Logic:
- `parseTimeToSeconds` should convert HH:MM:SS to total seconds.
- `formatSecondsToHHMMSS` should convert seconds back to HH:MM:SS.
- `sumTimeField` should total each time column.
- `getTotalPrograms` should sum all `noOfPrograms`.
- `getCombinedCycleTime` should add all time columns:
  - cncTime
  - finishingTime
  - manualOperations
  - repairKit
  - others

Totals row:
- Add a bottom total row similar to the Excel screenshot.
- Show `TOTAL` in the first area of the totals row.
- Sum `NO OF PROGRAMS`.
- Sum:
  - CNC TIME
  - FINISHING TIME
  - MANUAL OPERATIONS
  - REPAIR KIT
  - OTHERS

Add one final combined total time row below:
- Show combined total cycle time across all time columns.
- For tentative, this is total theoretical cycle time.
- For production, this is total actual cycle time.

Footer summary cards:
For tentative:
- Total Parts
- Total Programs
- Total Theoretical Cycle Time

For production:
- Total Parts
- Total Programs
- Total Actual Cycle Time

Styling requirements:
- Excel-like styling matching the screenshot.
- Border-collapse table layout.
- Thin black borders around all table cells.
- White sheet background.
- Blue/dark text for labels.
- Orange/yellow article name.
- Compact row heights.
- Small font sizes.
- Bold total row.
- Horizontally scrollable table wrapper.
- Action buttons should match the style from `BOMTable.jsx`.

Important implementation notes:
- Do not modify or break existing `BOMTable.jsx`.
- Create reusable `CycleTimeTable.jsx`.
- Create wrappers:
  - `TentativeCycleTimeTable.jsx`
  - `ProductionCycleTimeTable.jsx`
- Check `HeaderSection.jsx` before editing.
- Do not duplicate existing labels in `HeaderSection.jsx`.
- Reuse existing header labels/states if already present.
- Add only missing labels required by Tentative/Production.
- It is not necessary to keep labels split as left labels and right labels.
- Render header fields in the most compatible layout with existing `HeaderSection.jsx`.
- Do not add the SKAPS logo/company/document metadata top header.
- Keep the reusable implementation mode-driven instead of duplicating code.
- Keep code clean and readable.
- Ensure JSX has no syntax errors.
- Ensure all components export correctly.