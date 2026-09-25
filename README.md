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
- JSON backup and restore of the whole database
- iOS-style push/pop slide transitions between views

## Live release

The current release is hosted on GitHub Pages:

https://axln.github.io/acc2/dist/#/

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

The production build in `dist/` is committed to git and served directly from GitHub
Pages, so a release consists of running `yarn build` and committing the regenerated
`dist/` output together with the source change.

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/) (runes)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [idb](https://github.com/jakearchibald/idb) for IndexedDB access
- Static adapter with hash-based routing (`#/...`), so the app can be served from a
  static file host with no server-side routing
