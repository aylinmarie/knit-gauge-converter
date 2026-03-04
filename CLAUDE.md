# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run lint       # ESLint via next lint
npm test           # Run all Jest tests
npm run test:watch # Jest in watch mode
```

Run a single test file:
```bash
npm test -- components/GaugeForm.test.tsx
```

Tests run automatically as a pre-commit hook (`npm test -- --no-coverage`).

## Environment Variables

Set in `.env.local`:

- `RAVELRY_USERNAME` — Ravelry API username (Basic Auth)
- `RAVELRY_PASSWORD` — Ravelry API password (Basic Auth)

Without these, the Ravelry import feature returns 500 errors.

## Architecture

This is a **Next.js 15 / React 19** app with no database. All state is ephemeral client-side; no auth, no external persistence.

### Data flow

1. **`app/page.tsx`** is the root client component. It owns all shared state (`result`, `loading`, `error`, `unit`, `prefill`) and coordinates the three tool sections.

2. **Gauge estimation** (pure math, no AI):
   - `GaugeForm` collects inputs → `page.tsx` POSTs to `/api/estimate`
   - `app/api/estimate/route.ts` calculates entirely in-process using `YARN_MIDPOINTS` / `ROW_MIDPOINTS` lookup tables (CYC standard gauges). No LLM is involved despite `@anthropic-ai/sdk` being present in `package.json`.
   - Result flows to `ResultsPanel` (displays gauge + needle suggestion) and `StitchConverter` (scales pattern stitch/row counts).

3. **Ravelry import**: `RavelryImport` POSTs a pattern URL to `POST /api/ravelry`, which fetches gauge + yarn weight from the Ravelry API and returns data to pre-fill `GaugeForm` via the `prefill` prop.

4. **Unit handling**: The API always works in **sts/4 inches** (imperial). `GaugeForm` converts metric inputs to imperial before submitting. `ResultsPanel` converts imperial results back to metric for display. Conversion: `4 inches = 10.16 cm`.

### Key library files

- `lib/yarnWeights.ts` — display labels for the 8 CYC yarn weight categories
- `lib/needleSizes.ts` — `suggestNeedle(gauge)`: lookup table mapping sts/4in → US/metric needle size
- `lib/ravelryWeights.ts` — maps Ravelry yarn weight names (e.g. `"Fingering"`) to app weight keys (e.g. `"super-fine"`)

### Styling

CSS Modules only — each component has a co-located `.module.css` file. No Tailwind, no global utility classes.

### Testing

Tests use Jest + React Testing Library. Test files live next to source files (`*.test.tsx` / `*.test.ts`). The jest config uses `next/jest` to handle Next.js transforms.
