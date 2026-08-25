# Changes made to shadcn/ui components

Apart from code formatting, the following changes were made to the original shadcn/ui components.

## Added components

- Icon picker: https://github.com/alan-crts/shadcn-iconpicker
    - `npx shadcn@latest add "https://icon-picker.alan-courtois.fr/r/icon-picker"`

## Fixes

### Missing React imports

Added missing React imports to components that use JSX but did not explicitly import React:

- ButtonGroup
- Collapsible
- Field
- Skeleton
- Sonner
- Spinner

### Missing tw-prefixes

Added missing `tw:` prefixes to class names and `tw-` to custom properties in the following components:

- Alert
- Calendar
- Chart
- Field
- Sidebar

## Type fixes

- Calendar

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

## Other changes

- Sonner
    - remove usage of `next-themes`
