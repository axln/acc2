# Acc2

A personal accounting web app built for mobile.

This is the third rewrite of the codebase, now built with SvelteKit 2, Svelte 5 and
Tailwind CSS 3. It runs entirely in the browser: there is no backend, and all data is
stored locally in IndexedDB via the [`idb`](https://github.com/jakearchibald/idb)
library.

## Features

- Double-entry accounting: expenses, income and transfers between accounts
- Multiple accounts grouped into account groups, with running balances
- Multiple currencies with exchange rates against a base currency
- Categories for transactions
- Mobile-first UI with large text and tap targets, and automatic dark mode
- Balances kept low-key on screen, for privacy when recording spendings in public
- JSON backup and restore of the whole database
- iOS-style push/pop slide transitions between views
- Installable as a PWA with offline launch support, for use as a home-screen app

## Live release

The current release is hosted on GitHub Pages:

https://axln.github.io/acc2/#/

## Development

Requires [Yarn](https://yarnpkg.com/).

```sh
yarn install
yarn dev
```

### Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `yarn dev`       | Start the dev server                 |
| `yarn build`     | Create a production build in `dist/` |
| `yarn preview`   | Serve the production build locally   |
| `yarn run check` | Type-check with `svelte-check`       |
| `yarn lint`      | Run the Prettier check and ESLint    |
| `yarn format`    | Rewrite files with Prettier          |

Use `yarn run check` rather than `yarn check`: on Yarn 1 the bare form runs Yarn's
built-in lockfile integrity check instead of the project script.

There is no test framework or test suite in this project.

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which type-checks, runs `yarn build`, and publishes `dist/` to GitHub Pages via
`actions/deploy-pages`. `dist/` is not committed to git.

## PWA & offline support

The app registers a service worker ([`src/service-worker.js`](src/service-worker.js))
that precaches the build output and app shell, and a web manifest
([`static/manifest.webmanifest`](static/manifest.webmanifest)) for
`display: standalone`. This lets a home-screen shortcut launch from cache with no
network connection. The service worker only registers in production builds; there's
none in `yarn dev`. A new deploy gets a new cache automatically, keyed by SvelteKit's
build `version`. On install, the service worker fetches files past the browser's HTTP
cache, so it never stores an app shell from the previous deploy.

If the app shows a blank page after a deploy, reload it twice. Don't clear the site's
data to fix it: that also deletes all of your accounts and transactions, which exist
only in the browser.

The app icon's source is [`static/favicon.svg`](static/favicon.svg), which also serves
as the favicon. The PNG icons (`static/favicon.png` and `static/icons/icon-*.png`) are
rendered from it, so regenerate them whenever the SVG changes.

## Branches

- `main` is the current design and what GitHub Pages serves.
- `old-design` keeps the previous UI from before the mobile overhaul.

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/) (runes)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [idb](https://github.com/jakearchibald/idb) for IndexedDB access
- Static adapter with hash-based routing (`#/...`), so the app can be served from a
  static file host with no server-side routing
