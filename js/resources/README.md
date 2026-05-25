# Resource Library Frontend Module

Batch 1A establishes the resource library as a bounded frontend module for the current static app.

## Import Pattern

`index.html` imports `resources.api.js` from the existing `<script type="module">` block and exposes it on:

```js
window.RaederResourceLibrary
```

This keeps `app.js` as a classic deferred script for now, while giving future resource UI work a clean module boundary.

## Boundary

`app.js` may call the public API for routing, init and orchestration.

Resource-specific code should stay in this folder:

- constants
- queries
- mutations
- content block rendering
- resource components
- seed helpers

Do not add resource business logic directly to `app.js`.

## Current State

These modules are intentionally minimal. Database reads and writes are stubs until the Batch 1B/1C migrations and seed data exist.

