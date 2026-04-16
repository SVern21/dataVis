# Dev Notes — The Roots of Rhythm

## Running the project

ES6 modules require a local server (not `file://`). From the project root:

```bash
npx serve .
# then open http://localhost:3000
```

Or use the VS Code Live Server extension.

## Adding real data

1. Populate the CSV files in `/data/` (headers already exist).
2. In each page JS file (`js/pages/*.js`), find the `// TODO` comment.
3. Replace `mockXxx()` with `await loadCSV('../data/xxx.csv')`.
4. Add any data transformation logic in the same file.

## Adding a new page

1. Copy any existing `pages/*.html` as a template.
2. Create `js/pages/your-page.js` — import `initFilters`, `getFilters`, `tooltip`, `tooltipHtml`.
3. Listen to `'filters:changed'` on `window` to re-render when filters change.
4. Add a nav link in all five HTML files.

## Design tokens

All colours, spacing, and font sizes live in `css/variables.css`.
Never hardcode values — always use `var(--token-name)`.

## Team conventions

- One JS file per page — no cross-page imports.
- Shared utilities only: `main.js`, `filters.js`, `tooltip.js`, `data-loader.js`.
- D3 is a CDN global (`window.d3`) — no npm install needed.
