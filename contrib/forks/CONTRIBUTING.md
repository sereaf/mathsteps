# Contributing Fork Patches

This document describes the process for reviewing and integrating patches from community forks of mathsteps.

## Overview

The `scripts/sync_forks.sh` script helps maintainers extract useful changes from community forks. This process allows us to benefit from distributed development while maintaining code quality and licensing compliance.

## Review Process

### 1. Generating Patches

Run the sync script with a list of fork URLs:

```bash
# Create a file with fork URLs (one per line)
echo "https://github.com/kemu-studio/mathsteps" > /tmp/forks.txt
echo "https://github.com/dovisp/mathsteps-calc" >> /tmp/forks.txt

# Run the sync script
FORKS_LIST=/tmp/forks.txt npm run sync-forks
```

This will:
- Clone each fork to a temporary directory
- Identify changes to simplification logic in `lib/simplifyExpression/`, `lib/factor/`, etc.
- Generate patch files in `contrib/forks/patches/<fork-owner>-<repo>/`
- Create/update `contrib/forks/index.json` manifest

### 2. Reviewing Patches

For each patch file generated:

1. **Read the patch** - Understand what changes it makes
2. **Check tests** - Ensure the fork has tests for the changes
3. **Verify license compatibility** - Confirm the fork uses Apache-2.0 or compatible license
4. **Assess code quality** - Review code style, documentation, and maintainability
5. **Test locally** - Apply the patch to a test branch and run all tests

### 3. Applying Approved Patches

If a patch is approved:

```bash
# Create a new branch
git checkout -b integrate-fork-xyz

# Apply the patch
git apply contrib/forks/patches/<fork-owner>-<repo>/0001-feature.patch

# Or use git am to preserve commit metadata
git am contrib/forks/patches/<fork-owner>-<repo>/0001-feature.patch

# Test thoroughly
npm test
npm run lint

# Commit with proper attribution
git commit --amend --author="Original Author <email@example.com>"
```

### 4. Attribution

When integrating changes from forks:

- Preserve original author information in commits
- Add a line in the commit message: `Co-authored-by: Name <email@example.com>`
- Update HISTORY.md or changelog with fork attribution
- Consider adding fork maintainer to contributors list

## Licensing Considerations

### License Verification

Before integrating any patch:

1. **Check the fork's LICENSE file** - Must be Apache-2.0 or compatible (MIT, BSD, etc.)
2. **Review copyright notices** - Ensure original Google/Socratic copyright is preserved
3. **Look for CLA/DCO** - Some forks may require contributor agreements
4. **Check dependencies** - New dependencies must have compatible licenses

### Apache-2.0 Compatibility

Compatible licenses include:
- Apache-2.0 (same as this project)
- MIT
- BSD (2-clause, 3-clause)
- ISC

Incompatible licenses include:
- GPL (any version) - copyleft incompatible with Apache-2.0 downstream use
- Proprietary/All Rights Reserved
- Non-commercial licenses

### When in Doubt

If you're uncertain about license compatibility:
1. Consult the LICENSE file in the fork
2. Check with legal counsel if needed
3. Reach out to fork maintainer for clarification
4. When uncertain, err on the side of caution and don't integrate

## Code Review Criteria

Patches should meet these standards:

### Must Have
- ✅ Compatible license (Apache-2.0 or compatible)
- ✅ Relevant to simplification logic or core features
- ✅ No breaking changes to public API
- ✅ Passes all existing tests
- ✅ Follows project code style

### Nice to Have
- ✅ Includes new tests for the feature
- ✅ Updates documentation
- ✅ Has clear commit messages
- ✅ Minimal, focused changes

### Red Flags
- ❌ Changes to licensing
- ❌ Large dependency additions
- ❌ Breaks existing tests
- ❌ No clear benefit or use case
- ❌ Poor code quality or documentation

## Rejection Guidelines

It's okay to reject patches that:
- Don't align with project goals
- Have unclear or insufficient benefits
- Introduce excessive complexity
- Can't be verified for licensing
- Break backward compatibility without good reason

When rejecting, consider:
- Documenting the reason in `contrib/forks/REJECTED.md`
- Suggesting improvements to the fork maintainer
- Keeping the door open for revised submissions

## Questions?

If you have questions about the fork integration process:
- Open an issue with the `question` label
- Tag it with `community-forks`
- Reference specific patches or forks as needed
