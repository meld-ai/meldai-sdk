# Release Process

This monorepo uses **semantic-release** to automatically version and release packages based on conventional commits.

## How it works

1. **Push to main** → CI detects changed packages
2. **Semantic-release runs** → Only for packages with changes
3. **Version bump** → Based on commit messages
4. **Auto-publish** → To npm (SDK only)

## Commit Message Format

Use conventional commits to trigger releases:

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix(sdk): handle null response"

# Minor release (1.0.0 → 1.1.0)  
git commit -m "feat(sdk): add retry logic"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat(sdk): redesign API

BREAKING CHANGE: The runMeld method signature has changed"
```

## Package Structure

```
packages/
├── sdk/          # TypeScript SDK (auto-released)
├── go/           # Go SDK (placeholder)
├── python/       # Python SDK (placeholder)
├── shared/       # Shared utilities (future)
└── react/        # React components (future)
```

## Examples

**Only SDK changes:**
```bash
git commit -m "feat(sdk): add timeout option"
git push origin main
# → Only SDK gets version bump + npm publish
```

**Multiple packages:**
```bash
git commit -m "feat(sdk): add new feature"
git commit -m "feat(go): implement client"
git push origin main  
# → Both SDK and Go get version bumps
```

**No changes:**
```bash
git commit -m "docs: update README"
git push origin main
# → No releases triggered
```

## Manual Release

To manually trigger a release for a specific package:

```bash
cd packages/sdk
CI=true pnpm semantic-release
```
