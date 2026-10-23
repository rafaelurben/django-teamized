---
name: update-changelog
description: >-
    Adds a new feature or notable fix to the changelog and prepares for the next release.
    Use this skill whenever the user asks to create a new feature/improvement, add a new feature/improvement, or update the changelog with a new feature.
---

# Add feature Workflow

For any new feature, improvement, or notable bug fix must be added to the changelog.

Changelog file: `app/src/data/changelog.ts`

1. Check if an entry with version `'next'` exists in `changelog.ts`. If not, create a new entry with:
    ```ts
    {
        version: 'next',
        date: '3333-03-03',
        changes: [],
    }
    ```
2. Add a new change entry to the `changes` array of the `'next'` version entry, following the style guide below.
    - Written in German.
    - Group or prefix with the feature/module area in brackets if applicable, e.g.:
        - `[Arbeitszeit]: Einfachere Erfassung von Sitzungen`
        - `[Kalender]: Ereignisse können nun verschoben werden`
        - `[Verein]: Portfolio zu Vereinsmitgliedern hinzugefügt`
    - Prefix major new highlights with `NEU:` if applicable.
    - Keep descriptions concise, user-facing, and clear.
    - Exclude purely internal maintenance commits (e.g. routine automated Renovate/dependency lockfile bumps), unless
      significant (e.g. major dependency upgrade or framework migration).
