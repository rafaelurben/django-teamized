---
name: new-version
description: >-
    Bumps the project version, updates the changelog, and creates a release commit.
    Use this skill whenever the user asks to create a new version, release a new version,
    bump the version, prepare a release, or finalize the changelog for a release.
---

# New Version Workflow

This skill guides the agent through determining the next version number, validating and updating `changelog.ts`, updating `_version.txt`, running quality checks, and committing the release.

---

## Workflow Overview

1. **Read Current Version:** Extract current version from `_version.txt`.
2. **Review Git History:** Check commits since the git tag matching `v<current_version>`.
3. **Validate & Update Changelog:** Compare git history against entries in `changelog.ts` under `version: 'next'`, adding missing changes in German.
4. **Determine New Version:**
    - **Minor bump (`X.(Y+1).0`)**: If new features were added.
    - **Patch bump (`X.Y.(Z+1)`)**: If only bug fixes and maintenance were added.
5. **Update Files:**
    - In `changelog.ts`: Replace `'next'` with the new version string and update the date `'3333-03-03'` to today's date (`YYYY-MM-DD`).
    - In `_version.txt`: Overwrite with the new version string.
6. **Code Quality & Formatting:** Run typecheck, linter, and formatter.
7. **Commit Release:** Commit staged changes with message `"v<version>"`.

---

## Detailed Step-by-Step Instructions

### Step 1: Read Current Version & Git History

1. Locate and read `_version.txt`:
    - Repository root: `_version.txt`.
    - Trim any whitespace or newlines to get `<current_version>` (e.g. `0.4.0`).
2. Construct the tag:
    ```text
    current_tag = "v" + <current_version>  # e.g., "v0.4.0"
    ```
3. Fetch git commit log since this tag:
    ```bash
    git log v<current_version>..HEAD --oneline
    ```
    To see full commit details or authors when needed:
    ```bash
    git log v<current_version>..HEAD --format="%h %s"
    ```
4. Review the commit messages to identify all changes introduced since the last release.

---

### Step 2: Validate and Update `changelog.ts`

1. Open `app/src/data/changelog.ts`
2. Find the topmost changelog entry with `version: 'next'` and placeholder date `'3333-03-03'`:
    ```ts
    {
        date: '3333-03-03',
        version: 'next',
        changes: [
            // existing pending changes
        ],
    },
    ```
3. **Validate existing entries:**
    - Ensure the entries accurately reflect the commits since `v<current_version>`.
4. **Add missing entries:**
    - For any new feature, improvement, or notable bug fix present in git history that is not yet listed, add a corresponding entry to `changes`.
    - **Style Guide for Changelog Entries:**
        - Written in German.
        - Group or prefix with the feature/module area in brackets if applicable, e.g.:
            - `[Arbeitszeit]: Einfachere Erfassung von Sitzungen`
            - `[Kalender]: Ereignisse können nun verschoben werden`
            - `[Verein]: Portfolio zu Vereinsmitgliedern hinzugefügt`
        - Prefix major new highlights with `NEU:` if applicable.
        - Keep descriptions concise, user-facing, and clear.
        - Exclude purely internal maintenance commits (e.g. routine automated Renovate/dependency lockfile bumps), unless significant (e.g. major dependency upgrade or framework migration).

---

### Step 3: Determine New Version

Parse `<current_version>` into `MAJOR.MINOR.PATCH`:

- `current_version = X.Y.Z` (e.g., `0.4.0` -> `MAJOR = 0, MINOR = 4, PATCH = 0`).

Evaluate the changes in the release:

- **Minor Bump (`X.(Y+1).0`)**:
    - Apply if **any new feature** or enhancement was added (e.g., commits starting with `feat`, `feat(...)`, or user-facing functional additions).
    - Example: `0.4.0` -> `0.5.0`.
- **Patch Bump (`X.Y.(Z+1)`)**:
    - Apply if **only bug fixes, refactoring, documentation, or maintenance** were added (no new features).
    - Example: `0.4.0` -> `0.4.1`.

---

### Step 4: Update `changelog.ts` and `_version.txt`

1. **Update `changelog.ts` (`app/src/data/changelog.ts`):**
    - Update `version: 'next'` to `version: '<new_version>'` (e.g. `'0.5.0'`).
    - Update `date: '3333-03-03'` to today's local date formatted as `YYYY-MM-DD` (e.g. `'2026-10-23'`).
2. **Update `_version.txt`:**
    - Write `<new_version>` (e.g. `0.5.0\n`) to `_version.txt` at the repository root.

---

### Step 5: Code Quality & Formatting Checks

From the `app` directory, run the project checks to ensure formatting and types remain clean:

```bash
npm run prettier-fix
npm run eslint-check
npm run typescript-check
```

Ensure all commands exit with code 0.

---

### Step 6: Git Commit

1. Review the changes using:
   ```bash
   git status
   git diff
   ```
2. Stage the modified files:
   ```bash
   git add _version.txt app/src/data/changelog.ts
   ```
   (and any related formatted files if touched).
3. Create the release commit with message `"v<version>"`:
   ```bash
   git commit -m "v<new_version>"
   ```
   For example:
   ```bash
   git commit -m "v0.5.0"
   ```

---

## Example Execution

Given:

- `_version.txt` contains `0.4.0`.
- Git log since `v0.4.0` contains:
    - `feat(workingtime): Use inline form for session creation`
    - `feat: Add presets to date range pickers`
    - `feat: Use alert-dialog component for confirmation dialogs`
- Since features (`feat`) were added, determine new version: `0.5.0` (minor bump).
- In `changelog.ts`:
    - `version: 'next'` becomes `version: '0.5.0'`.
    - `date: '3333-03-03'` becomes `date: '2026-10-23'`.
    - `changes` list is verified and updated.
- In `_version.txt`: `0.4.0` becomes `0.5.0`.
- Format & typecheck: `npm run prettier-fix && npm run typescript-check`.
- Commit: `git commit -m "v0.5.0"`.
