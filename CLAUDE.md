# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Acc2 is a personal accounting web app built for mobile. It is the third rewrite of the codebase, now in SvelteKit 2 + Svelte 5 + Tailwind 3. It runs only in the browser: there is no backend, and all data lives in the browser's IndexedDB (through the `idb` library). The release is served from GitHub Pages at https://axln.github.io/acc2/#/.

## Commands

Uses yarn (`yarn.lock`).

- `yarn dev`: start the dev server.
- `yarn build`: create a production build in `dist/`.
- `yarn preview`: serve the production build.
- `yarn run check`: type-check with svelte-check. Use `run`, because on Yarn 1 a bare `yarn check` runs Yarn's built-in lockfile integrity check instead.
- `yarn lint`: run the prettier check and eslint. It already fails on prettier issues in a few config files (`.prettierrc`, `.vscode/settings.json`, `eslint.config.js`, `postcss.config.js`), so check the files you changed (`npx prettier --check <file>`, `npx eslint <file>`).
- `yarn format`: rewrite files with prettier.

The project has no test framework and no tests. To test by hand with data, open the dev server in a browser and run `const m = await import('/src/lib/db.ts')` in the console. It shares the app's open `db` connection, so the app's own functions (`createCurrency`, `createAccount`, `createTransaction`, …) keep balances consistent. Reload afterwards so the root layout reloads its reference data. IndexedDB is per origin, so data seeded on one dev-server port doesn't appear on another.

## Build & deployment

- `main` is the current design and the one deployed. The `old-design` branch keeps the pre-overhaul UI (cadet-blue header, grey bordered controls) as of `1d5a070`.
- The static build goes into `dist/`, which is **not** committed (`.gitignore`) and is only a local/CI build artifact. A push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which type-checks, builds, and publishes `dist/` to GitHub Pages via `actions/deploy-pages`. There is no manual release step.
- **The version bump.** The workflow runs `yarn bump-version` (`scripts/bump-version.mjs`) before the type check and build, which adds 1 to the patch number in `package.json`. After the deploy it commits the bump as `chore: bump version to vX.Y.Z [skip ci]` by `github-actions[bot]` and pushes it to `main`. That's why the workflow has `contents: write`, and why the job is skipped when the head commit message contains `[skip ci]`. Don't run `yarn bump-version` locally or bump the patch by hand. Since CI pushes to `main` after every deploy, run `git pull --rebase` before pushing.
- **After every push to `main`, wait for the deploy and pull on your own.** Don't hand this back to the user. `gh` is not installed, so poll the public API with `curl` (`https://api.github.com/repos/axln/acc2/actions/runs?branch=main&per_page=1`) until the run for the pushed commit has `status: completed`. If `conclusion` is `success`, run `git pull --rebase` to fetch the bump commit and report the new version. If it fails, report the failed step instead.
- **The version is shown on the About page** (`#/about`, in the home page menu). `vite.config.ts` imports `package.json` and embeds its version as the build-time constant `__APP_VERSION__`. The constant is declared in `src/app.d.ts` and listed as an eslint global. The version must stay three plain numbers, or the bump script throws.
- `svelte.config.js` sets `paths.base` to `/acc2` for every command except `dev`, where it is empty. It also uses the hash router (`router.type: 'hash'`), `bundleStrategy: 'single'` and `appDir: 'app'`.
- The `~` alias points to `src` (for example, `~/lib/db`, `~/type`, `~/components/...`). Use it instead of `$lib`.

## Architecture

### Routing

The app uses hash-based routing, so every in-app link and every `goto()` call uses a `#/` path, for example `goto('#/currencies')` or `href="#/accounts/{id}"`. Query params are part of the hash, so read them from `url.hash`, not `url.searchParams`. `accounts/[id]/transactions/new/+page.ts` shows how.

### Data layer (`src/lib/db.ts`)

- `hooks.client.ts` calls `initDb()` at client init. It opens IndexedDB `acc` and exports the live `db` handle. **Schema changes** need three steps:
  - Bump the version number in `openDB('acc', N, ...)`.
  - Add guarded, idempotent steps to `upgrade()`. The upgrade runs on existing databases too, so check `indexNames.contains` before every `createIndex`, or it throws on a phone that already has that index.
  - Update the `AccDB` schema in `src/type.ts`.
  - An upgrade waits until every other open copy of the app (another tab, the installed app window) closes its connection. Before the `blocked`/`blocking` handlers in `initDb`, that left the new version blank with no message, which happened on the move to version 4. `blocked` tells the user to close the other copy. `blocking` closes the outdated copy's connection and asks the user to close or reload it; it deliberately doesn't reload itself, since a reload could get the old version from the service worker and block the upgrade again.
- There are 8 object stores: `accountGroups`, `accounts`, `currencies` (keyed by `code`), `categories`, `entries`, `transactions`, `settings` (keyed by `name`) and `rates` (keyed by `code`). IDs come from `nanoid(5)`. The schema is at version 4, which added the `entries` index `accountTime` (`[accountId, timestamp, id]`).
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

- **Theme:** colors are semantic tokens (`canvas`, `surface`, `fg`, `muted`, `line`, `primary`, `primary-soft`, `positive`, `negative`) defined in `tailwind.config.ts` as CSS variables. `src/app.css` sets their RGB channels, with a `prefers-color-scheme: dark` override, so dark mode is automatic. Use these tokens, not raw Tailwind palette colors. The primary violet matches the app icon. `app.css` also defines the shared `card`, `section-label`, `list-row`, `tap-row` and `chip` classes. Any row that navigates on tap uses `tap-row` (`list-row` includes it). It turns off text selection and the iOS long-press callout, because Chrome on Android would otherwise sometimes select a row's text on an ordinary tap. The global `user-select: none` in `app.css` applies only to devices that can hover, so it doesn't cover phones. The font sizes `xs`/`sm`/`base` are overridden to 13/15/17px, and tap targets are at least 44–48px.
- Lists are rounded `card`s on the grey `canvas`, with a `section-label` above each one. `Fab.svelte` is a sticky bottom-right add button; the account page uses it for new transactions.
- **Account page paging:** the account page doesn't read the whole history, so that it opens quickly.
  - `getEntriesPage` reads the newest entries through the `accountTime` index: `PAGE_SIZE` (50, in `accounts/[id]/paging.ts`) of them, plus the rest of the last one's day, so a day header's sums are never partial.
  - A sentinel at the end of the list, watched by an `IntersectionObserver`, reads older pages as you scroll.
  - Scroll position and the number of loaded entries are kept only when the page opens one of its own views (a transaction, the edit form), so coming back restores both. Opening the account from anywhere else starts at the top with one page.
  - When testing it, keep the browser tab in front: a background tab renders no frames, so the observer and the view transitions stall.
- **Privacy:** the user records spendings in public and doesn't want the money they hold readable at a glance. Keep overall balances low-key:
  - The home page shows the grand total only as a small muted row at the bottom.
  - The account page has no balance header. Each day header shows that day's incoming sum (green, `+`) and outgoing sum separately, leaving out a zero side, instead of a net total.
  - Don't add prominent totals or balance cards back.
- `src/components/` holds the forms and selects.
- `src/components/controls/` holds generic inputs: Button (`variant` `primary` by default, or `secondary`), DropDown, InputBox, Select and KindSelect.
- `Keypad.svelte` is the on-screen amount keypad.
- `src/lib/actions/` contains Svelte actions (`autoClose`, `focus`).
- The UI uses the native `alert` and `confirm` for errors and confirmations.
- **View transitions** live in the root `+layout.svelte`. They work like iOS navigation:
  - A `{#key}` on the hash path wraps each page in a `div` with the custom `ios` transition.
  - `beforeNavigate` sets the direction. Going to a shallower hash path is a pop; anything else is a push.
  - The deeper view sits on top with a shadow and moves the full width. The view underneath shifts 30% and dims.
  - Both views share one grid cell, so they overlap without absolute positioning. Each has the opaque `bg-canvas` background and `min-h-dvh`, so they don't show through each other and the sticky `Fab` sits at the bottom of short pages.
  - The container uses `overflow-x-clip`, not `overflow-x-hidden`: `hidden` would create a scroll container and break the sticky `Header`.
  - In a Svelte transition's `css(t, u)`, `t` runs 0→1 for intros but 1→0 for outros, so `t = 1` always means "in place".
- `src/routes/test` is a scratch page.

### PWA & offline support

- `static/manifest.webmanifest` is the web app manifest (`display: standalone`, icons under `static/icons/`). It uses `start_url`/`scope: "."`, which resolve relative to the manifest's own URL, so it works unmodified under the `/acc2` base path.
- `src/service-worker.js` is a hand-written SvelteKit service worker (not the auto-registered one; `svelte.config.js` sets `serviceWorker.register: false`). It precaches `build`/`files`/`prerendered` from `$service-worker` plus the app shell (`${base}/`, added explicitly since `prerender.entries` is `[]` so nothing is prerendered) under a cache keyed by `version`, so each deploy invalidates the previous cache. On fetch it serves cached assets first, otherwise falls back to network then cache, and serves the cached shell for failed navigations (offline).
- **Install must bypass the HTTP cache.** GitHub Pages serves `index.html` with `max-age=600`, so a plain `cache.addAll` can store the previous deploy's shell. That shell points at a bundle that is gone from the server and from the deleted old cache, and the app then 404s until the next deploy. This happened once after a deploy. To prevent it:
  - `install` fetches everything with `cache: 'reload'`.
  - It fails if the shell doesn't reference one of this build's `.js` files, which keeps the previous worker.
  - It calls `skipWaiting()`, so a fixed worker replaces a broken one on the next load. A broken page never runs `hooks.client.ts`, but the browser still checks for a new worker on navigation.
- To test service worker changes, use `yarn build && yarn preview` (the preview serves under `/acc2/`). To simulate a deploy, build again with any change: the rebuild deletes the old bundle, as a Pages deploy does. Then reload twice.
- If a browser is stuck on a broken worker, unregister it in DevTools → Application → Service workers. Never suggest "Clear site data" or the phone's "Clear & reset": they also delete IndexedDB, which holds all of the user's data and has no server copy.
- `src/hooks.client.ts` registers it manually (`navigator.serviceWorker.register`), guarded by `!dev`, since `build`/`files` from `$service-worker` are empty during `yarn dev`.
- **When changing `svelte.config.js`'s `paths.base` or `appDir`, or adding new static assets that should work offline**, check `src/service-worker.js` still covers them — it relies on `$service-worker`'s `files`/`build` exports rather than a hardcoded list, so most changes need no update here.

### App icon

- `static/favicon.svg` is the source of the app icon: a gradient wallet on a transparent background. `app.html` links it as the main favicon, with `static/favicon.png` (128px) as the fallback for browsers without SVG favicon support.
- The PNGs are rendered from the SVG and must be regenerated after any SVG change:
  - `static/favicon.png` (128px)
  - `static/icons/icon-192.png`, which the manifest and the `apple-touch-icon` use
  - `static/icons/icon-512.png`, which the manifest uses
- The repo has no SVG rasterizer. To regenerate, render the SVG at 512×512 with headless Chrome, then downscale with `sips`:
  - `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --default-background-color=00000000 --window-size=512,512 --screenshot=icon.png file://$PWD/static/favicon.svg`
  - `sips -z 192 192 icon.png --out static/icons/icon-192.png` (and the same for 512 and 128).
- iOS fills the transparent areas of the `apple-touch-icon` with black.

## Code style

The prettier config sets tabs, single quotes, no trailing commas and a print width of 100. It includes the svelte and tailwind class-sorting plugins.
