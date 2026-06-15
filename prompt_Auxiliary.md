In FORMAT Dropdown in HeaderSection.jsx Add nested list item "Non Returnable Auxiliary" and "Returnable Auxiliary" under "Auxiliary" and open the NonReturnableAuxiliaryTable.jsx and ReturnableAuxiliaryTable.jsx files when user clicks it

Create a new React component for an Auxiliary BOM table, similar in structure and behavior to the existing `BOMTable.jsx` component.

Use `BOMTable.jsx` as the reference for:
- Toolbar layout
- Table styling
- Header grouping
- Inline editable cells
- Row actions
- Totals row
- Footer totals/cards
- Existing style constants like `iStyle`, `TD`, `TH`, `btnPrimary`, and `btnSmall`
- Existing calculation helpers such as `getRowBg` and `getAccent`

The new component should be named:

`NonReturnableAuxiliaryTable.jsx`


The table should visually match an Excel-style Auxiliary BOM format with these columns:

1. Sr. No.
2. Item Description
3. Length
4. Width
5. Height
6. Material
7. Unit
8. Blade item / Item no1
9. Blade item / Item no2
10. Blade item / Item no3
11. Blade item / Item no4
12. Blade item / Item no5
13. Qty/Kit
14. Total Qty/Kit
15. Price
16. Total Amount

Another new component should be named:

`ReturnableAuxiliaryTable.jsx`


The table should visually match an Excel-style Auxiliary BOM format with these columns:

1. Sr. No.
2. Item Description
3. Length
4. Width
5. Height
6. Material
7. Unit
8. Blade item / Item no1
9. Blade item / Item no2
10. Blade item / Item no3
11. Blade item / Item no4
12. Blade item / Item no5
13. Qty/Kit
14. Total Qty/Kit
15. Returnable Price
16. Total Amount
17. Final Amount
18. Returnable Cycle


Header requirements:
- Add a large title/header area above the column headers.
- The title should show:
  - `Article name`
  - SKAPS logo placeholder area if the app has a logo asset, otherwise leave a styled placeholder.
  - Revision text: `Rev-A00`
  - BOM name: `Core-Kit_Auxiliary`
- The table should include grouped header styling similar to the screenshot.
- The blade/item columns should be grouped visually under repeated labels like `Blade items`.

Functional requirements:
- Rows should be editable where appropriate.
- Quantity/item number cells should support inline editing similar to BOMTable.jsx.
- User should be able to:
  - Add row
  - Duplicate row
  - Delete row
  - Undo row changes if undo support exists
  - Search/filter rows if existing state patterns are available
- Reuse the same toolbar behavior from BOMTable.jsx where possible.
- Reuse button styles from BOMTable.jsx.
- Reuse the same design language: small font size, compact cells, light blue/grey headers, orange primary actions.

Data model suggestion for each Non returnable auxiliary row:

{
  id: string,
  description: string,
  length: number,
  width: number,
  height: number,
  material: string,
  unit: string,
  itemNo: number | string,
  itemNo2: number | string,
  itemNo3: number | string,
  itemNo4: number | string,
  itemNo5: number | string,
  qtyKit: number,
  totalQtyKit: number,
  price: number,
  totalAmount: number
}


Calculation requirements:
- `totalQtyKit` should be calculated from the relevant item quantity columns if applicable, or from `qtyKit` if no item columns are numeric.
- `totalAmount = totalQtyKit * price`
- Show currency as `₹`
- Show dash `-` when price or total amount is empty/zero, matching the screenshot style.
- Keep numeric formatting clean:
  - Length/Width/Height as integers or decimals based on value
  - Qty as number
  - Price and Total Amount as currency-style values


Data model suggestion for each Returnable auxiliary row:

{
  id: string,
  description: string,
  length: number,
  width: number,
  height: number,
  material: string,
  unit: string,
  itemNo: number | string,
  itemNo2: number | string,
  itemNo3: number | string,
  itemNo4: number | string,
  itemNo5: number | string,
  qtyKit: number,
  totalQtyKit: number,
  returnablePrice: number,
  totalAmount: number,
  finalAmount: number,
  returnableCycle: number
}

Component props should follow the same pattern as BOMTable.jsx where possible.

Suggested props:

export default function AuxiliaryTable({
  filtered,
  setRows,
  canUndo,
  undoRows,
  addRow,
  search,
  setSearch,
  filterType,
  setFilterType,
  matNames,
  matTypes,
  totals,
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
})

If some props are not available in the current app, adapt the component gracefully and keep the implementation compatible with the existing app architecture.

Table layout requirements:
- Use a `<table>` layout like BOMTable.jsx.
- Use two-level headers:
  - First header row for title/group headers
  - Second header row for actual column names
- Freeze/sticky header is optional but preferred.
- Make the table horizontally scrollable.
- Keep cell borders similar to Excel.
- Use pale yellow row background for data rows, similar to the screenshot.
- Use grey/blue header background.
- Use right alignment for quantity, price, and amount columns.
- Use center alignment for Sr. No., unit, and item columns.

Footer/totals requirements:
- Add a totals row at the bottom.
- Totals row should calculate:
  - Total Qty/Kit
  - Total Amount
- Add a small summary footer/card similar to BOMTable.jsx showing:
  - Total Auxiliary Items
  - Total Qty/Kit
  - Grand Total Amount

Important:
- Do not break the existing `BOMTable.jsx`.
- Create a separate `NonReturnableAuxiliaryTable.jsx` and `ReturnableAuxiliaryTable.jsx`.
- Keep coding style consistent with the existing `BOMTable.jsx`.
- If needed, create helper functions inside the component for formatting currency, numbers, and calculating row totals.
- Make sure that ColumnModal.jsx & EditRowModal.jsx is updatable and works with auxiliary data and the new columns properly.
- Ensure there are no JSX syntax errors.
- Ensure the component exports default correctly.
- Use React functional component style.
- Keep everything self-contained unless shared utilities already exist.

Reference behavior from existing BOMTable.jsx:
- Existing BOMTable has toolbar search/filter/add row/undo functionality.
- Existing BOMTable maps rows using `filtered.map(...)`.
- Existing BOMTable uses `shellCols.map(...)` for dynamic item columns.
- Existing BOMTable supports inline editing with `inlineCell`, `inlineVal`, `startInline`, and `commitInline`.
- Existing BOMTable has action buttons for edit, duplicate, and delete.
- Existing BOMTable includes a totals row and footer summary cards.

For AuxiliaryTable, replace shell/material-specific columns with Auxiliary-specific fields while preserving the same user experience.