# JS Example

This is a JavaScript example project that demonstrates how to use `@tqpull-to-refresh/core`.

## Getting Started

### Installation

```bash
# From the monorepo root
pnpm install
```

### Running the Example

```bash
# From this directory
pnpm dev

# Or from the monorepo root
pnpm -F js-example dev
```
// in packages/core/index.js
loadStyles() {
  const href = new URL('./refresh.css', import.meta.url).href;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
## Project Structure

```
js-example/
├── src/
│   └── index.js       # Entry point
├── package.json
└── README.md
```

## Features

- Simple JavaScript example using the core library
- Easy to extend and customize
- Demonstrates basic usage patterns

## Next Steps

Extend `src/index.js` with your own implementation and use cases for the pull-to-refresh functionality.
