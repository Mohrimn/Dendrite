# Dendrite

A beautiful, offline-first personal knowledge capture and visualization tool. Capture thoughts, links, code snippets, and notes — then explore connections through an interactive 3D graph.

## Features

### Capture
- **Multiple Types** — Thoughts, links, images, code snippets, and rich notes
- **Quick Capture** — `Ctrl/Cmd + N` to instantly create new scraps
- **Link Previews** — Automatic favicon and metadata fetching for URLs
- **Image Support** — Paste or upload images with automatic thumbnails

### Organization
- **Smart Tags** — Manual tagging plus automatic tag suggestions
- **Keyword Extraction** — TF-based keyword analysis with tech term boosting
- **Pinning** — Keep important items at the top
- **Filtering** — Filter by type, tag, or search

### Visualization
- **3D Knowledge Graph** — Interactive force-directed graph built with Three.js
- **Cluster Detection** — Automatic grouping of related scraps
- **Bloom Effects** — Beautiful post-processing with ambient particles
- **Zoom to Node** — Click any node to focus and view details

### Experience
- **Offline-First** — All data stored locally in IndexedDB
- **PWA Support** — Install as a native app, works offline
- **Mobile Optimized** — Responsive design with touch-friendly controls
- **Smooth Animations** — Polished micro-interactions with Framer Motion
- **Accessible** — Keyboard navigation, ARIA labels, reduced motion support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Dexie.js (IndexedDB) |
| Animations | Framer Motion |
| 3D Graphics | Three.js |
| Graph Layout | D3-force |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Primitives (Button, Card, Modal, Input)
│   ├── layout/       # AppShell, Sidebar, Header, MobileHeader
│   ├── scrap/        # ScrapCard, ScrapForm, ScrapDetail, FilterBar
│   ├── cluster/      # ClusterCard, clustering visualization
│   ├── graph/        # GraphCanvas, GraphControls, GraphLegend
│   └── empty-states/ # Illustrated empty states
├── pages/            # HomePage, GraphPage, ClusterPage, SettingsPage
├── store/            # Zustand slices (scrap, ui, search)
├── db/               # Dexie schema and repositories
├── services/         # Enrichment, clustering, search
├── hooks/            # useMediaQuery, useDebounce, useIsMobile
├── lib/              # Utils, Three.js setup
└── types/            # TypeScript definitions
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Create new scrap |
| `/` | Focus search |
| `Escape` | Close modal / clear search |

## Data & Privacy

All data stays on your device. Nothing is sent to any server. Export your data anytime from Settings.

## Author

Built by [@Mohrimn](https://github.com/Mohrimn)

## License

MIT
