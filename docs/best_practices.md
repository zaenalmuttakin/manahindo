# 📘 Project Best Practices

## 1. Project Purpose
This repository is a Next.js (App Router) TypeScript application for managing expenses and orders. Core domains include:
- Expenses: stores, products, purchase items, totals, and receipt image uploads.
- Orders: customers, addresses, products, and order items.
- Persistence via MongoDB using Mongoose models.

The app provides UI components (forms, tables, galleries) for data entry and review, and server-side API routes for CRUD and file uploads.

## 2. Project Structure
- Root
  - `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`
  - `.env.local` (runtime env), `.example.env.local` (template)
  - `public/` static assets; uploads saved under `public/uploads/...`
  - `README.md`
- `src/`
  - `app/`
    - `layout.tsx` (root layout; themes, toasts, LayoutClient)
    - `globals.css` (global styles)
    - `page.tsx` (home page)
    - `orders/` (orders pages)
    - `api/` (route handlers)
      - `expenses/route.ts` (CRUD, aggregation, file cleanup)
      - `uploads/route.ts` (multipart uploads and deletions)
      - `customers/route.ts`, `stores/route.ts`, `products/route.ts`, `orders/route.ts`
  - `components/` (UI and feature components)
    - `form/expense/ExpenseForm.tsx` (react-hook-form, uploads)
    - `table/expense/ExpenseTable.tsx` (listing, filters, edit/delete, gallery)
    - `sidebar/` (layout navigation)
    - `providers/` (ThemeProvider)
    - `ui/` (design system; Radix-based)
  - `lib/`
    - `mongodb.ts` (Mongoose connection with global cache)
    - `utils.ts` (cn helper)
    - `formatting.ts` (formatDisplayName with abbreviation awareness)
  - `models/` (Mongoose schemas)
    - `Expense`, `ExpenseStore`, `ExpenseProduct`, `Order`, `Product`, `Customer`, `Address`, `Abbreviation`

Conventions
- Models in `src/models` use `mongoose.models.Name || mongoose.model` to prevent recompile issues in dev.
- Server routes in `src/app/api/*/route.ts` use NextRequest/NextResponse and connect via `lib/mongodb`.
- File uploads saved under `public/uploads/expenses/{expenseId}/...`.

## 3. Test Strategy
Current repository has no test setup. Recommended approach:
- Unit tests: Vitest or Jest (with ts-jest) for utilities, model helpers, and pure functions.
  - Location: colocate `*.test.ts`/`*.test.tsx` beside sources or under `src/__tests__`.
  - Use `mongodb-memory-server` to test model logic without touching real DB.
  - Mock network with MSW for client components using fetch.
- Integration tests: test API route handlers with real Request/Response objects and in-memory MongoDB.
  - Exercise validation, status codes, and DB side-effects.
- E2E tests: Playwright for critical flows (create expense, upload images, edit/delete, create order).
- Coverage targets: aim 70–80% overall; prioritize `lib/`, `models/`, `app/api/*`, and critical form/table components.

Guidelines
- Test happy paths and error paths (missing fields, invalid IDs, DB failures).
- For uploads, test allowed types, size limits, and directory creation logic.
- Use factories/builders for common payloads.

## 4. Code Style
TypeScript
- Prefer explicit interfaces/types for request/response payloads.
- Avoid `any`; use discriminated unions or generics where appropriate.
- Leverage `readonly` for immutable structures and `as const` when needed.
- Validate inputs at boundaries. Zod is available; define schemas per route and parse request bodies.

React/Next.js
- Separate Client vs Server:
  - Page/layout defaults to server; mark client components with `"use client"` at top-level file only.
  - Do not use `"use client"` in API route files.
- Forms: use `react-hook-form` with controlled inputs; prefer schema resolvers (zod) for validation.
- State: keep local UI state minimal; derive values with `useMemo` where beneficial.
- Async: always handle loading and error states; prevent double-submission with `isSubmitting`.

Naming
- Files: components in `PascalCase.tsx` (e.g., `ExpenseForm.tsx`), util/libs in `camel-case.ts`.
- Models: `PascalCase` filenames and exported names.
- Variables/functions: `camelCase`; React components in `PascalCase`.

Comments/Docs
- Use JSDoc for utilities and non-trivial functions (e.g., `formatDisplayName`).
- Document API payload interfaces and route behavior at top of route files.

Errors & Responses
- Wrap route logic in try/catch; return `NextResponse.json({ error: string }, { status })` consistently.
- Avoid leaking stack traces; log server-side with context labels.
- Validate `ObjectId` inputs; check resource existence; return 400/404/409 appropriately.

## 5. Common Patterns
- Database connection caching via `global.mongoose` to prevent multiple connections in dev.
- Name normalization:
  - Store/Product keep a lowercase `name_lowercase` for case-insensitive lookup with indexes.
  - `formatDisplayName` preserves abbreviations and ALL-CAPS words.
- Abbreviation caching: in-memory cache hydrated via Mongo at first use.
- Expense workflows:
  - Create Expense, then upload files to `public/uploads/expenses/{_id}`; update document with attachments and thumbnail.
  - Update merges existing and newly uploaded attachments; removes deleted files from disk and DB.
- UI patterns:
  - Autocomplete for store/products with debounced fetch.
  - Table grouping and pagination by date.
  - Image gallery and thumbnail stacks for attachments.

## 6. Do's and Don'ts
Do
- Use Zod schemas in API routes to validate and coerce inputs before DB access.
- Keep server-only code (env secrets, DB logic) in server modules; never import into client components.
- Confirm `mongoose.Types.ObjectId.isValid(id)` for IDs from clients.
- Use `lean()` for read-only queries when returning plain JSON.
- Paginate and limit results for autocomplete endpoints.
- Enforce file constraints (MIME, size, count) both client- and server-side.
- Use indexes for frequent lookups (`name_lowercase`, foreign keys) and keep them in sync.
- Centralize response shapes and error messages for consistency.

Don't
- Don’t add `"use client"` to API or server-only modules.
- Don’t trust client-provided IDs without verifying ownership/association (e.g., product belongs to store).
- Don’t write unbounded arrays to documents; enforce limits and pruning where sensible.
- Don’t block UI while uploading; provide progress/disabled state.
- Don’t store derived values without reason; recompute totals server-side when critical.

## 7. Tools & Dependencies
Key Libraries
- Next.js 15 (App Router), React 19, TypeScript 5
- Mongoose 8 for MongoDB models and queries
- UI: Radix primitives, Tailwind CSS v4, lucide-react icons, framer-motion
- Forms: react-hook-form; consider `@hookform/resolvers` + Zod for schema validation
- Date/time: date-fns
- UX: sonner (toasts)
- Files: react-dropzone, Next Image

Environment
- Required: `MONGODB_URI` in `.env.local`
- Optional: `NEXT_PUBLIC_BASE_URL` for image URLs in client tables

Setup
- Install: `npm ci`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build/Start: `npm run build && npm start`

## 8. Other Notes
- Security for uploads: validate MIME/size, normalize filenames, ensure deletion only within `public/uploads/expenses`. Keep path joins under the uploads root.
- Consistency: keep `attachments` and `thumbnailPath` in sync when deleting files; prefer server-side enforcement.
- Performance: reduce payloads by projecting fields and using `$lookup` with `$project` to drop large arrays, as in expenses aggregation.
- Internationalization: money formatting uses `toLocaleString('id-ID')`; consider a money utility to centralize formatting and math.
- Migration tip: if adding tests, prefer Vitest for faster TS DX; add `ts-node` or precompiled tests if using Jest.
- Known improvement: remove the `"use client"` directive from any API route files (e.g., `src/app/api/orders/route.ts`). API routes run on the server only.
