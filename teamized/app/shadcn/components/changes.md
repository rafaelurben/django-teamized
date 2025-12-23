# Changes made to shadcn/ui components

Apart from code formatting, the following changes were made to the original shadcn/ui components.

## Fixes

### Missing React imports

Added missing React imports to components that use JSX but did not explicitly import React:

- ButtonGroup
- Collapsible
- Field
- Skeleton
- Spinner

### Missing tw-prefixes

Added missing `tw:` prefixes to class names and `tw-` to custom properties in the following components:

- Alert
- Field
- Sidebar

## Improvements

### Added variants

- Alert
    - warning
- Badge
    - info
- Button
    - success
    - info

### Stylistic adjustments

- Card
    - reduced gap
