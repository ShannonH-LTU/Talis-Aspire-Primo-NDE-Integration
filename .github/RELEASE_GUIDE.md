# Release Guide

## Release Types

This project supports two types of releases:

### 1. Latest Release (Rolling)
- **Trigger**: Push to `main` branch
- **Tag**: `latest`
- **URL**: `https://github.com/ExLibrisGroup/customModule/releases/download/latest/TalisAspireIntegration.zip`
- **Purpose**: Always contains the most recent build from main
- **Use case**: Users who want automatic updates

### 2. Versioned Releases (Stable)
- **Trigger**: Push a tag matching `v*` (e.g., `v1.0.0`, `v1.2.3`, `v2.0.0-beta.1`)
- **Tag**: The version tag you create
- **URL**: `https://github.com/ExLibrisGroup/customModule/releases/download/v1.0.0/TalisAspireIntegration.zip`
- **Purpose**: Permanent snapshot for production deployments
- **Use case**: Rollback capability

## Creating a Versioned Release

### Step 1: Prepare your release
```bash
# Ensure your main branch is up to date
git checkout main
git pull origin main

# Test the build locally
npm run build
```

### Step 2: Create and push a tag
```bash
# Create a tag with semantic versioning
git tag v1.0.0

# Or create a tag with a message
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial production release"

# Push the tag to GitHub
git push origin v1.0.0
```

### Step 3: GitHub Actions automatically builds and publishes
The workflow will:
1. Build the project
2. Create a GitHub Release for the tag
3. Upload the zip file
4. Make it available at the versioned URL

## Version Numbering (Semantic Versioning)

Use semantic versioning: `vMAJOR.MINOR.PATCH`

- **MAJOR** (v2.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.1.0): New features, backwards compatible
- **PATCH** (v1.0.1): Bug fixes, backwards compatible

### Examples:
- `v1.0.0` - First stable release
- `v1.1.0` - Added new component
- `v1.1.1` - Fixed bug in component
- `v2.0.0` - Changed integration method (breaking change)
- `v2.1.0-beta.1` - Pre-release version for testing

## Customer Deployment URLs

### For users who want latest updates:
```
https://github.com/ExLibrisGroup/customModule/releases/download/latest/TalisAspireIntegration.zip
```

### For users who want stability:
```
https://github.com/ExLibrisGroup/customModule/releases/download/v1.0.0/TalisAspireIntegration.zip
```

## Rollback Strategy

If a release has issues:

1. **Quick fix**: Push a new tag (e.g., `v1.0.1`) with the fix
2. **Rollback**: Direct customers to use a previous version URL

Customers can always download any previous version using its tag:
```
https://github.com/ExLibrisGroup/customModule/releases/download/v1.0.0/TalisAspireIntegration.zip
```

## Deleting a Tag (if needed)

```bash
# Delete locally
git tag -d v1.0.0

# Delete remotely
git push origin :refs/tags/v1.0.0
```

**Note**: Deleting a tag will also delete the associated release on GitHub.
