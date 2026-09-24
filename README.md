# Product Admin Dashboard (Next.js + Tailwind + Axios)

## Setup
1. `npx create-next-app@latest admin --js --tailwind --app --no-src-dir --import-alias "@/*"`
2. `cd admin && npm i axios`
3. Copy these folders over the generated ones: `app/ components/ hooks/ lib/ services/`
4. `npm run dev` -> login `emilys` / `emilyspass`

## Key decisions (explain these in the next round)
1. **Search vs category**: the API can't do both. Search wins; category is disabled while search has text. Reason: simplest honest behaviour, no fake client-side filtering across pages.
2. **Add/edit/delete**: the API fakes saving. We still call it, then store changes in localStorage and merge them into API results (`lib/localStore.js`).
3. **Stale search results**: `AbortController` in `hooks/useProducts.js` cancels the old request on every change.
4. **URL is the state**: page/size/q/category/sort live in the URL and are validated (`app/products/page.js`).
5. **Double clicks**: `useRef` guard on login, `saving` flag on the form.

## Problem I faced (edit with your own)
Stale results when typing fast -> fixed with debounce + AbortController.

## Finished
Login/logout, guarded pages, list (table/cards), pagination, debounced search, category filter, sort, details + not-found, add/edit/delete with validation + confirm, loader/empty/error+Retry.
