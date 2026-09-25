# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Acc2 is a personal accounting web app built for mobile. It is the third rewrite of the codebase, now in SvelteKit 2 + Svelte 5 + Tailwind 3. It runs only in the browser: there is no backend, and all data lives in the browser's IndexedDB (through the `idb` library). The release is served from GitHub Pages at https://axln.github.io/acc2/dist/#/.

## Commands

Uses yarn (`yarn.lock`).

- `yarn dev`: start the dev server.
- `yarn build`: create a production build in `dist/`.
- `yarn preview`: serve the production build.
- `yarn run check`: type-check with svelte-check. Use `run`, because on Yarn 1 a bare `yarn check` runs Yarn's built-in lockfile integrity check instead.
- `yarn lint`: run the prettier check and eslint. It already fails on prettier issues in `dist/` and a few config files, so check the files you changed (`npx prettier --check <file>`, `npx eslint <file>`).
- `yarn format`: rewrite files with prettier.

The project has no test framework and no tests. To test by hand with data, open the dev server in a browser and run `const m = await import('/src/lib/db.ts')` in the console. It shares the app's open `db` connection, so the app's own functions (`createCurrency`, `createAccount`, `createTransaction`, …) keep balances consistent. Reload afterwards so the root layout reloads its reference data. IndexedDB is per origin, so data seeded on one dev-server port doesn't appear on another.

## Build & deployment

- The static build goes into `dist/`, and **`dist/` is committed to git**. It is the deployed artifact. After changing source code for a release, run `yarn build` and commit the regenerated `dist/` files together with the source change, as in the "fresh build" and "amount validation fixed" commits.
- `svelte.config.js` sets `paths.base` to `/acc2/dist` for every command except `dev`, where it is empty. It also uses the hash router (`router.type: 'hash'`), `bundleStrategy: 'single'` and `appDir: 'app'`.
- The `~` alias points to `src` (for example, `~/lib/db`, `~/type`, `~/components/...`). Use it instead of `$lib`.

## Architecture

### Routing

The app uses hash-based routing, so every in-app link and every `goto()` call uses a `#/` path, for example `goto('#/currencies')` or `href="#/accounts/{id}"`. Query params are part of the hash, so read them from `url.hash`, not `url.searchParams`. `accounts/[id]/transactions/new/+page.ts` shows how.

### Data layer (`src/lib/db.ts`)

- `hooks.client.ts` calls `initDb()` at client init. It opens IndexedDB `acc` and exports the live `db` handle. **Schema changes** need three steps:
  - Bump the version number in `openDB('acc', N, ...)`.
  - Add guarded, idempotent steps to `upgrade()`.
  - Update the `AccDB` schema in `src/type.ts`.
- There are 8 object stores: `accountGroups`, `accounts`, `currencies` (keyed by `code`), `categories`, `entries`, `transactions`, `settings` (keyed by `name`) and `rates` (keyed by `code`). IDs come from `nanoid(5)`.
- **Double-entry model:**
  - A `TransactionDoc` (kind `EXPENSE` / `INCOME` / `TRANSFER`) owns one `EntryDoc`, or two for a transfer.
  - Each entry belongs to one account and holds a signed `amount` plus a running `total`.
  - `makeTransactionDocs()` is the one place that converts `TransactionParams` into these docs. Expenses get a negative amount, and a transfer's second entry uses `secondAmount` when the currencies differ.
- **Balances are denormalized.**
  - `AccountDoc.balance` and each `EntryDoc.total` are derived values.
  - `recalcBalance(accountId)` recomputes them by walking the account's entries in timestamp order.
  - Any change to transactions or entries must call `recalcBalance` for every affected account, including the old second account when a transfer changes target.
  - `recalculateAccountBalances()` rebuilds all balances; the main page menu exposes it.
- **Money** is stored as integer minor units (cents).
  - `parseAmount` converts user input ("12,5" or "12.50") into cents.
  - `formatAmount` converts cents back into display text.
  - `validateAmount` and `validateRate` in `src/lib/utils.ts` validate the input strings.
- **Currencies:**
  - The `settings` store holds the base currency under the `baseCurrencyCode` name.
  - `rates` holds each currency's rate relative to the base currency.
  - `getCurrencyRate` and `getGroupBalance` do the conversions for group totals.
- **Backup and restore:**
  - `getDBSnapshot()` exports every store as a JSON `DBSnapshot`.
  - `restoreSnapshot()` validates a snapshot and overwrites every store in one transaction.
  - Both are triggered from the main page menu. When you add a store, add it to the snapshot, the validation and the restore as well.

### State & loading

- Pages load data in `+page.ts` / `+layout.ts` `load` functions, which call `db.ts` directly. Some loaders use a dynamic `await import('~/lib/db')`.
- The root `+layout.ts` loads app-wide reference data: the base currency, rates, categories and currencies. `+layout.svelte` puts that data into Svelte `writable` stores through `setContext(STORE, ...)`. Components read it with `useStore()` from `~/lib/store.ts`. Update these stores after changing the matching DB data so the UI stays in sync.
- Components use Svelte 5 runes (`$props`, `$state`, `$derived`) together with `$store` auto-subscriptions for the context stores.

### UI

- `src/components/` holds the forms and selects.
- `src/components/controls/` holds generic inputs: Button, DropDown, InputBox, Select and KindSelect.
- `Keypad.svelte` is the on-screen amount keypad.
- `src/lib/actions/` contains Svelte actions (`autoClose`, `focus`).
- The UI uses the native `alert` and `confirm` for errors and confirmations.
- **View transitions** live in the root `+layout.svelte`. They work like iOS navigation:
  - A `{#key}` on the hash path wraps each page in a `div` with the custom `ios` transition.
  - `beforeNavigate` sets the direction. Going to a shallower hash path is a pop; anything else is a push.
  - The deeper view sits on top with a shadow and moves the full width. The view underneath shifts 30% and dims.
  - Both views share one grid cell, so they overlap without absolute positioning. Each has a white background so they don't show through each other.
  - The container uses `overflow-x-clip`, not `overflow-x-hidden`: `hidden` would create a scroll container and break the sticky `Header`.
  - In a Svelte transition's `css(t, u)`, `t` runs 0→1 for intros but 1→0 for outros, so `t = 1` always means "in place".
- `src/routes/test` is a scratch page.

## Code style

The prettier config sets tabs, single quotes, no trailing commas and a print width of 100. It includes the svelte and tailwind class-sorting plugins.
