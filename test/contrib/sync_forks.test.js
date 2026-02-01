const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '../..');
const SCRIPT_PATH = path.join(REPO_ROOT, 'scripts/sync_forks.sh');
const INDEX_PATH = path.join(REPO_ROOT, 'contrib/forks/index.json');

describe('sync_forks.sh script', function() {
  describe('usage/help', function() {
    it('should display usage when called with --help', function() {
      const output = execSync(`sh ${SCRIPT_PATH} --help`, { encoding: 'utf8' });
      assert(output.includes('Usage:'), 'Usage information should be displayed');
      assert(output.includes('sync_forks.sh'), 'Script name should be in usage');
      assert(output.includes('FORKS_LIST'), 'FORKS_LIST env var should be documented');
    });

    it('should display usage when called with -h', function() {
      const output = execSync(`sh ${SCRIPT_PATH} -h`, { encoding: 'utf8' });
      assert(output.includes('Usage:'), 'Usage information should be displayed');
    });

    it('should mention upstream URL option in help', function() {
      const output = execSync(`sh ${SCRIPT_PATH} --help`, { encoding: 'utf8' });
      assert(output.includes('UPSTREAM_URL'), 'UPSTREAM_URL should be documented');
    });
  });

  describe('manifest validation', function() {
    it('should validate index.json schema when present', function() {
      // Skip if index.json doesn't exist (won't exist until script is run)
      if (!fs.existsSync(INDEX_PATH)) {
        this.skip();
        return;
      }

      // Read and parse the manifest
      const manifestContent = fs.readFileSync(INDEX_PATH, 'utf8');
      let manifest;
      
      // Should be valid JSON
      assert.doesNotThrow(() => {
        manifest = JSON.parse(manifestContent);
      }, 'index.json should be valid JSON');

      // Should have required top-level fields
      assert(manifest.generated, 'manifest should have "generated" field');
      assert(manifest.upstream, 'manifest should have "upstream" field');
      assert(manifest.forks, 'manifest should have "forks" field');

      // upstream should have required fields
      assert(manifest.upstream.url, 'upstream should have "url" field');
      assert(manifest.upstream.branch, 'upstream should have "branch" field');

      // forks should be an array
      assert(Array.isArray(manifest.forks), 'forks should be an array');

      // Each fork should have required fields
      manifest.forks.forEach((fork, idx) => {
        assert(fork.name, `fork[${idx}] should have "name" field`);
        assert(typeof fork.patchCount === 'number', `fork[${idx}] should have numeric "patchCount" field`);
        assert(Array.isArray(fork.patches), `fork[${idx}] should have "patches" array`);
        assert.equal(fork.patches.length, fork.patchCount, 
          `fork[${idx}] patchCount should match patches array length`);
      });

      // generated should be a valid ISO date
      const generatedDate = new Date(manifest.generated);
      assert(!isNaN(generatedDate.getTime()), 'generated field should be a valid ISO date');
    });

    it('should have patches as relative paths', function() {
      if (!fs.existsSync(INDEX_PATH)) {
        this.skip();
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
      
      manifest.forks.forEach((fork) => {
        fork.patches.forEach((patchPath) => {
          // Should be relative path starting with patches/
          assert(patchPath.startsWith('patches/'), 
            `patch path "${patchPath}" should be relative and start with "patches/"`);
          
          // Should not be an absolute path
          assert(!path.isAbsolute(patchPath), 
            `patch path "${patchPath}" should not be absolute`);
        });
      });
    });
  });

  describe('script validation', function() {
    it('should be executable', function() {
      const stats = fs.statSync(SCRIPT_PATH);
      const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
      assert(isExecutable, 'sync_forks.sh should be executable');
    });

    it('should have POSIX shebang', function() {
      const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
      const firstLine = content.split('\n')[0];
      assert(firstLine.startsWith('#!/bin/sh') || firstLine.startsWith('#!/usr/bin/env sh'),
        'Script should have POSIX sh shebang');
    });

    it('should error when no fork URLs provided', function() {
      try {
        execSync(`sh ${SCRIPT_PATH}`, { 
          encoding: 'utf8',
          stdio: 'pipe',
          env: { ...process.env, FORKS_LIST: '' }
        });
        assert.fail('Script should exit with error when no URLs provided');
      } catch (error) {
        // Expected to fail
        assert(error.message.includes('No fork URLs') || error.status !== 0,
          'Should error with appropriate message');
      }
    });
  });

  describe('directory structure', function() {
    it('should have contrib/forks directory', function() {
      const contribDir = path.join(REPO_ROOT, 'contrib/forks');
      assert(fs.existsSync(contribDir), 'contrib/forks directory should exist');
      assert(fs.statSync(contribDir).isDirectory(), 'contrib/forks should be a directory');
    });

    it('should have contrib/forks/patches directory', function() {
      const patchesDir = path.join(REPO_ROOT, 'contrib/forks/patches');
      assert(fs.existsSync(patchesDir), 'contrib/forks/patches directory should exist');
      assert(fs.statSync(patchesDir).isDirectory(), 'contrib/forks/patches should be a directory');
    });

    it('should have README.md in contrib/forks', function() {
      const readmePath = path.join(REPO_ROOT, 'contrib/forks/README.md');
      assert(fs.existsSync(readmePath), 'contrib/forks/README.md should exist');
      
      const content = fs.readFileSync(readmePath, 'utf8');
      assert(content.includes('Community Forks'), 'README should describe community forks');
    });

    it('should have CONTRIBUTING.md in contrib/forks', function() {
      const contributingPath = path.join(REPO_ROOT, 'contrib/forks/CONTRIBUTING.md');
      assert(fs.existsSync(contributingPath), 'contrib/forks/CONTRIBUTING.md should exist');
      
      const content = fs.readFileSync(contributingPath, 'utf8');
      assert(content.includes('license') || content.includes('License'), 
        'CONTRIBUTING should mention licensing');
    });
  });
});
