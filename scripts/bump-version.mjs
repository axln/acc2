import { readFileSync, writeFileSync } from 'node:fs';

// Increments package.json's patch version by 1. Run in CI before the checks and
// the build, so the version that is deployed is the one that then gets
// committed back to main.
const pkgPath = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

if ([major, minor, patch].some((n) => !Number.isInteger(n))) {
	throw new Error(`Unexpected version "${pkg.version}", expected three plain numbers`);
}

pkg.version = `${major}.${minor}.${patch + 1}`;
// Tabs, to match the prettier config
writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');

console.log(`package.json version bumped to ${pkg.version}`);
