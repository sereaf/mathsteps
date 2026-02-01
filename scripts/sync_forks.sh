#!/bin/sh
# sync_forks.sh - Extract patches from community forks of mathsteps
#
# This script clones specified forks, identifies changes to simplification logic,
# and generates patch files for maintainer review.
#
# Usage:
#   FORKS_LIST=/path/to/forks.txt ./scripts/sync_forks.sh
#   OR
#   ./scripts/sync_forks.sh <fork-url-1> <fork-url-2> ...
#
# Environment variables:
#   FORKS_LIST - Path to file containing fork URLs (one per line)
#   UPSTREAM_URL - Upstream repo to compare against (default: https://github.com/google/mathsteps)
#   UPSTREAM_BRANCH - Upstream branch (default: master)
#
# The script will:
#   1. Clone each fork to a temporary directory
#   2. Scan for changes to lib/simplifyExpression/*, lib/factor/*, etc.
#   3. Generate patch files in contrib/forks/patches/<fork-owner>-<repo>/
#   4. Create/update contrib/forks/index.json manifest
#
# Requirements:
#   - git
#   - Standard POSIX utilities (sh, mktemp, awk, sed, grep)
#   - node (for JSON generation)

set -e  # Exit on error

# Constants
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTRIB_DIR="$REPO_ROOT/contrib/forks"
PATCHES_DIR="$CONTRIB_DIR/patches"
INDEX_FILE="$CONTRIB_DIR/index.json"
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/google/mathsteps}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-master}"

# Paths to scan for simplification logic changes
WATCHED_PATHS="lib/simplifyExpression lib/factor"

# Print usage information
usage() {
    cat << 'EOF'
Usage: sync_forks.sh [OPTIONS] [FORK_URLS...]

Extract patches from community forks of mathsteps.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output
    -u URL          Set upstream URL (default: https://github.com/google/mathsteps)
    -b BRANCH       Set upstream branch (default: master)

ENVIRONMENT VARIABLES:
    FORKS_LIST      Path to file with fork URLs (one per line)
    UPSTREAM_URL    Upstream repository URL
    UPSTREAM_BRANCH Upstream branch name

EXAMPLES:
    # Using a file with fork URLs
    FORKS_LIST=/tmp/forks.txt ./scripts/sync_forks.sh

    # Passing URLs as arguments
    ./scripts/sync_forks.sh https://github.com/user1/mathsteps https://github.com/user2/mathsteps

    # Using custom upstream
    UPSTREAM_URL=https://github.com/socraticorg/mathsteps ./scripts/sync_forks.sh

EOF
}

# Parse command-line arguments
VERBOSE=0
FORK_URLS=""

while [ $# -gt 0 ]; do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -u)
            UPSTREAM_URL="$2"
            shift 2
            ;;
        -b)
            UPSTREAM_BRANCH="$2"
            shift 2
            ;;
        *)
            FORK_URLS="$FORK_URLS $1"
            shift
            ;;
    esac
done

# Logging functions
log() {
    echo "[sync_forks] $*"
}

verbose() {
    if [ "$VERBOSE" -eq 1 ]; then
        echo "[sync_forks] $*"
    fi
}

error() {
    echo "[sync_forks ERROR] $*" >&2
    exit 1
}

# Ensure required directories exist
mkdir -p "$PATCHES_DIR"

# Get list of forks to process
get_fork_urls() {
    if [ -n "$FORKS_LIST" ] && [ -f "$FORKS_LIST" ]; then
        grep -v '^#' "$FORKS_LIST" | grep -v '^[[:space:]]*$'
    elif [ -n "$FORK_URLS" ]; then
        echo "$FORK_URLS" | tr ' ' '\n' | grep -v '^$'
    else
        error "No fork URLs provided. Use FORKS_LIST environment variable or pass URLs as arguments."
    fi
}

# Extract owner and repo name from GitHub URL
parse_github_url() {
    url="$1"
    # Remove trailing .git if present
    url=$(echo "$url" | sed 's/\.git$//')
    # Extract owner/repo from various GitHub URL formats
    echo "$url" | sed -E 's|.*github\.com[:/]([^/]+)/([^/]+).*|\1/\2|'
}

# Create a safe directory name from owner/repo
safe_dirname() {
    owner_repo="$1"
    echo "$owner_repo" | tr '/' '-'
}

# Process a single fork
process_fork() {
    fork_url="$1"
    log "Processing fork: $fork_url"
    
    # Parse fork details
    owner_repo=$(parse_github_url "$fork_url")
    if [ -z "$owner_repo" ] || [ "$owner_repo" = "$fork_url" ]; then
        log "Warning: Could not parse GitHub URL: $fork_url (skipping)"
        return 0
    fi
    
    safe_name=$(safe_dirname "$owner_repo")
    verbose "  Owner/Repo: $owner_repo"
    verbose "  Safe name: $safe_name"
    
    # Create temporary directory for clone
    temp_dir=$(mktemp -d -t "mathsteps-fork-XXXXXX")
    trap "rm -rf '$temp_dir'" EXIT
    
    verbose "  Cloning to temporary directory: $temp_dir"
    
    # Clone the fork
    if ! git clone --depth 50 "$fork_url" "$temp_dir/fork" >/dev/null 2>&1; then
        log "Warning: Failed to clone $fork_url (skipping)"
        return 0
    fi
    
    cd "$temp_dir/fork"
    
    # Detect default branch
    default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "master")
    verbose "  Default branch: $default_branch"
    
    # Create patch output directory
    patch_output_dir="$PATCHES_DIR/$safe_name"
    mkdir -p "$patch_output_dir"
    
    # Try to add upstream remote and fetch for comparison
    verbose "  Adding upstream remote: $UPSTREAM_URL"
    if git remote add upstream "$UPSTREAM_URL" 2>/dev/null && \
       git fetch upstream "$UPSTREAM_BRANCH" --depth 50 >/dev/null 2>&1; then
        
        upstream_ref="upstream/$UPSTREAM_BRANCH"
        verbose "  Comparing against $upstream_ref"
    else
        # If upstream fetch fails, use first commit as base
        verbose "  Warning: Could not fetch upstream, using fork's first commit as base"
        upstream_ref=$(git rev-list --max-parents=0 HEAD)
    fi
    
    # Generate patches for watched paths
    patch_count=0
    for watched_path in $WATCHED_PATHS; do
        if [ ! -d "$watched_path" ] && [ ! -f "$watched_path" ]; then
            verbose "    Path $watched_path does not exist in fork"
            continue
        fi
        
        # Check if there are any commits modifying this path
        if git log "$upstream_ref".."$default_branch" --oneline -- "$watched_path" 2>/dev/null | grep -q .; then
            verbose "    Found changes in $watched_path"
            
            # Generate format-patch for this path
            patch_files=$(git format-patch "$upstream_ref".."$default_branch" \
                --output-directory "$patch_output_dir" \
                -- "$watched_path" 2>/dev/null || echo "")
            
            if [ -n "$patch_files" ]; then
                num_patches=$(echo "$patch_files" | wc -l)
                patch_count=$((patch_count + num_patches))
                verbose "    Generated $num_patches patch(es) for $watched_path"
            fi
        else
            verbose "    No changes found in $watched_path"
        fi
    done
    
    if [ "$patch_count" -gt 0 ]; then
        log "  Generated $patch_count patch file(s) in $patch_output_dir"
    else
        log "  No relevant changes found (no patches generated)"
        # Remove empty directory
        rmdir "$patch_output_dir" 2>/dev/null || true
    fi
    
    cd "$REPO_ROOT"
}

# Generate index.json manifest
generate_manifest() {
    log "Generating manifest: $INDEX_FILE"
    
    # Use node to generate valid JSON
    node -e "
const fs = require('fs');
const path = require('path');

const patchesDir = '$PATCHES_DIR';
const manifest = {
    generated: new Date().toISOString(),
    upstream: {
        url: '$UPSTREAM_URL',
        branch: '$UPSTREAM_BRANCH'
    },
    forks: []
};

// Read patches directory
if (fs.existsSync(patchesDir)) {
    const forkDirs = fs.readdirSync(patchesDir).filter(name => {
        const fullPath = path.join(patchesDir, name);
        return fs.statSync(fullPath).isDirectory();
    });
    
    for (const forkDir of forkDirs) {
        const forkPath = path.join(patchesDir, forkDir);
        const patches = fs.readdirSync(forkPath)
            .filter(f => f.endsWith('.patch'))
            .map(f => path.join('patches', forkDir, f));
        
        if (patches.length > 0) {
            manifest.forks.push({
                name: forkDir,
                patchCount: patches.length,
                patches: patches
            });
        }
    }
}

fs.writeFileSync('$INDEX_FILE', JSON.stringify(manifest, null, 2) + '\n');
console.log('Manifest written: ' + manifest.forks.length + ' fork(s) with patches');
" || error "Failed to generate manifest"
}

# Main execution
main() {
    log "Starting fork synchronization"
    log "Repository root: $REPO_ROOT"
    log "Patches directory: $PATCHES_DIR"
    
    # Get fork URLs
    fork_urls=$(get_fork_urls)
    
    if [ -z "$fork_urls" ]; then
        error "No fork URLs found"
    fi
    
    fork_count=$(echo "$fork_urls" | wc -l)
    log "Found $fork_count fork(s) to process"
    
    # Process each fork
    echo "$fork_urls" | while IFS= read -r fork_url; do
        if [ -n "$fork_url" ]; then
            process_fork "$fork_url"
        fi
    done
    
    # Generate manifest
    generate_manifest
    
    log "Fork synchronization complete"
    log "Review patches in: $PATCHES_DIR"
    log "See manifest at: $INDEX_FILE"
}

# Run main function
main
