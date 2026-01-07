# Knowledge Scrapbook

A beautiful, offline-first personal knowledge capture and visualization tool built with React, TypeScript, and modern web technologies.

## Features

- **Fast Capture** - Quickly create scraps: thoughts, links, images, code snippets, and notes
- **Auto-Enrichment** - Automatic tagging, keyword extraction, and content analysis
- **Smart Organization** - Filter by type or tag, pin important items
- **Offline-First** - All data stored locally in IndexedDB
- **Premium UI** - Smooth animations, refined typography, modern design

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Animations**: Framer Motion
- **Visualization**: Three.js (coming soon)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Base UI primitives (Button, Card, Modal, etc.)
│   ├── layout/       # App shell, sidebar, header
│   ├── scrap/        # Scrap-related components
│   ├── cluster/      # Clustering view (coming soon)
│   ├── graph/        # Graph visualization (coming soon)
│   └── empty-states/ # Empty state illustrations
├── pages/            # Route pages
├── store/            # Zustand state management
├── db/               # Dexie database schema and repositories
├── services/         # Business logic (enrichment, clustering, search)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── types/            # TypeScript type definitions
└── constants/        # App constants
```

## Keyboard Shortcuts

- `Ctrl/Cmd + N` - Quick capture (create new scrap)
- `Ctrl/Cmd + K` - Search (coming soon)

## Implementation Status

### Completed
- [x] **Phase 1: Foundation** - Project setup, UI components, scrap CRUD, routing
- [x] **Phase 2: Enrichment & Tags** - Auto-tagging, keyword extraction, filtering

### Upcoming
- [ ] **Phase 3: Search** - Full-text search with MiniSearch
- [ ] **Phase 4: Clustering** - TF-IDF and k-means auto-grouping
- [ ] **Phase 5: Graph Visualization** - Three.js knowledge graph
- [ ] **Phase 6: PWA & Polish** - Service worker, offline support, final polish

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed technical specifications.

## Data Storage

All data is stored locally in your browser using IndexedDB. No data is sent to any server. You can export your data from Settings.

## License

MIT
