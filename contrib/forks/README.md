# Community Forks of mathsteps

This directory contains metadata about notable community forks of the original google/mathsteps project. These forks contain various enhancements, bug fixes, and additional simplification rules that may be useful to integrate into this repository.

## Purpose

The forks listed here have been identified as containing potentially valuable contributions. The `scripts/sync_forks.sh` script can be used to extract patches from these forks for review and integration.

## Notable Forks

### sereaf/mathsteps
- **URL**: https://github.com/sereaf/mathsteps
- **Main Branch**: main
- **Last Known Activity**: ~2024-2026
- **Features Summary**: Active fork with various improvements and maintenance updates

### kemu-studio/mathsteps
- **URL**: https://github.com/kemu-studio/mathsteps
- **Main Branch**: master
- **Last Known Activity**: ~2023-2024
- **Features Summary**: Fork with potential enhancements to simplification logic

### dovisp/mathsteps-calc
- **URL**: https://github.com/dovisp/mathsteps-calc
- **Main Branch**: master
- **Last Known Activity**: ~2022-2023
- **Features Summary**: Calculator-focused fork with extended simplification capabilities

### wkangg/mathsteps
- **URL**: https://github.com/wkangg/mathsteps
- **Main Branch**: master
- **Last Known Activity**: ~2020-2021
- **Features Summary**: Fork with modifications to core algorithms

### taskbase/mathsteps
- **URL**: https://github.com/taskbase/mathsteps
- **Main Branch**: master
- **Last Known Activity**: ~2019-2020
- **Features Summary**: Educational platform integration fork

### socraticorg/mathsteps (Original)
- **URL**: https://github.com/socraticorg/mathsteps
- **Main Branch**: master
- **Last Known Activity**: ~2019
- **Features Summary**: Original repository by Socratic.org (now archived)

### google/mathsteps (Upstream)
- **URL**: https://github.com/google/mathsteps
- **Main Branch**: master
- **Last Known Activity**: ~2018-2019
- **Features Summary**: Original Google repository (archived/read-only)

## How to Add a Fork

1. Research the fork to understand its unique contributions
2. Add an entry to this README following the format above
3. Run `npm run sync-forks` to extract patches (see scripts/sync_forks.sh)
4. Review patches in `contrib/forks/patches/`
5. Follow the process in `CONTRIBUTING.md` to integrate valuable changes

## License Considerations

All forks listed here are derived from the original Apache-2.0 licensed mathsteps project. When integrating patches:
- Verify the fork maintains Apache-2.0 license or compatible license
- Preserve original copyright notices
- Credit fork authors in commit messages
- See `CONTRIBUTING.md` for full details
