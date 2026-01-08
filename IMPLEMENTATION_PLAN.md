# Personal Knowledge Scrapbook - Implementation Plan

## Tech Stack (Confirmed)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Three.js / WebGL for graph
- **Components**: Fully custom (no UI library)
- **Storage**: Dexie.js (IndexedDB)
- **PWA**: Full implementation from day one
- **Smart features**: Local AI ready (heuristics first, Transformers.js structure)

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── components/
│   ├── ui/                    # Button, Card, Input, Modal, Badge, Textarea
│   ├── layout/                # AppShell, Header, Sidebar
│   ├── scrap/                 # ScrapCard, ScrapGrid, ScrapForm, TagPill, etc.
│   ├── cluster/               # ClusterView, ClusterCard
│   ├── graph/                 # GraphCanvas, GraphControls, GraphLegend
│   ├── search/                # SearchOverlay, SearchResults
│   └── empty-states/
├── pages/
│   ├── HomePage.tsx
│   ├── GraphPage.tsx
│   ├── ClusterPage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── useKeyboardShortcut.ts
│   ├── usePWA.ts
│   └── useReducedMotion.ts
├── store/
│   ├── index.ts               # Zustand store
│   └── slices/
│       ├── scrapSlice.ts
│       └── uiSlice.ts
├── db/
│   ├── index.ts               # Dexie instance
│   ├── schema.ts
│   └── repositories/
│       ├── scrapRepository.ts
│       └── tagRepository.ts
├── services/
│   ├── enrichment/            # Tag extraction, link parsing, keyword extraction
│   ├── clustering/            # TF-IDF, k-means
│   ├── search/                # MiniSearch
│   └── graph/                 # Force simulation, graph builder
├── lib/
│   ├── three/                 # Scene setup, materials, geometries
│   ├── motion/                # Framer Motion variants
│   └── utils/
├── types/
│   ├── scrap.ts
│   ├── tag.ts
│   ├── cluster.ts
│   └── connection.ts
└── constants/
```

---

## Data Models

### Scrap
```typescript
interface Scrap {
  id: string;
  type: 'thought' | 'link' | 'image' | 'snippet' | 'note';
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
  linkMeta?: { title, description, image, domain, favicon };
  imageData?: { base64, mimeType, width, height, thumbnail };
  tags: string[];           // User-added tags
  autoTags: string[];       // System-generated tags
  keywords: string[];       // Extracted keywords for search
  clusterId?: string;
  clusterScore?: number;
  connectionIds: string[];
  isPinned: boolean;
  color?: string;
  searchableText: string;   // Combined text for full-text search
}
```

### Tag
```typescript
interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  isSystem: boolean;
  usageCount: number;
  createdAt: Date;
}
```

### Cluster
```typescript
interface Cluster {
  id: string;
  name: string;
  description?: string;
  keywords: string[];
  scrapIds: string[];
  centroid: number[];
  coherence: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Connection
```typescript
interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'manual' | 'tag' | 'cluster' | 'semantic' | 'temporal';
  strength: number;
  createdAt: Date;
}
```

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
1. ✅ Initialize Vite + React + TypeScript project
2. ✅ Configure Tailwind CSS
3. ✅ Set up Dexie database with schema
4. ✅ Set up Zustand store
5. ✅ Build core UI components (Button, Input, Card, Modal, Badge, Textarea)
6. ✅ Build AppShell layout (Sidebar, Header)
7. ✅ Implement Scrap CRUD (create, read, update, delete)
8. ✅ Build ScrapCard, ScrapGrid, ScrapForm, ScrapDetail
9. ✅ Set up React Router with HomePage, GraphPage, ClusterPage, SettingsPage

**Deliverable**: Working app that can create/view/edit/delete scraps

### Phase 2: Enrichment & Tags ✅ COMPLETED
1. ✅ Implement Tag system (TagPill, TagInput components)
2. ✅ Build keyword extraction (TF-IDF inspired, stop words filtering)
3. ✅ Implement auto-tag suggestions on content analysis
4. ✅ Add URL detection and LinkPreview component
5. ✅ Add image upload with thumbnail generation (ImageUpload)
6. ✅ Build FilterBar with type and tag filtering

**Deliverable**: Scraps automatically enriched with tags

### Phase 3: Search ✅ COMPLETED
1. ✅ Integrate MiniSearch for full-text search
2. ✅ Build SearchOverlay component (Cmd+K trigger)
3. ✅ Build SearchResults with highlighting
4. ✅ Implement search filters (type, tags, date range)
5. ✅ Add keyboard navigation in search results
6. ✅ Implement search suggestions/autocomplete

**Implementation Notes**:
```typescript
// MiniSearch configuration
const searchIndex = new MiniSearch({
  fields: ['title', 'content', 'searchableText', 'keywords'],
  storeFields: ['id', 'type', 'title'],
  searchOptions: {
    boost: { title: 2, keywords: 1.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});
```

**Deliverable**: Instant full-text search with keyboard navigation

### Phase 4: Clustering ✅ COMPLETED
1. ✅ Implement TF-IDF calculator
2. ✅ Implement cosine similarity function
3. ✅ Implement k-means clustering algorithm
4. ✅ Implement elbow method for optimal k detection
5. ✅ Build ClusterPage with ClusterCard components
6. ✅ Add cluster visualization (colored groups)
7. ✅ Background reclustering on significant changes

**Implementation Notes**:
- Clusters rebuild automatically when scraps change
- Cluster names generated from top keywords using TF-IDF
- Silhouette score used for quality measurement

**Deliverable**: Automatic thematic clustering

### Phase 5: Graph Visualization ✅ COMPLETED
1. ✅ Set up Three.js scene with camera, lights, controls
2. ✅ Add post-processing (UnrealBloomPass for glow)
3. ✅ Integrate d3-force-3d for physics simulation
4. ✅ Create node geometries (spheres with emissive materials)
5. ✅ Create edge geometries (lines)
6. ✅ Add ambient particles for atmosphere
7. ✅ Implement raycasting for hover/click interactions
8. ✅ Build GraphControls (zoom, reset, reheat simulation)
9. ✅ Build GraphLegend (node type colors)
10. ✅ Build GraphNodeTooltip (hover tooltip + detail panel)
11. ✅ Add zoom-to-node on click
12. ✅ Add filter by cluster/type

**Implementation Notes**:
- Core graph visualization working with Three.js + d3-force-3d
- Nodes colored by type with hover/selected states
- Edge lines connect related scraps
- Force simulation positions nodes in 3D space
- Click to select nodes and view detail panel
- Post-processing and particles can be added later for polish

**Deliverable**: 3D knowledge graph visualization

### Phase 6: PWA & Polish ✅ COMPLETED
1. ✅ Configure vite-plugin-pwa with workbox (already configured)
2. ✅ Create app manifest with icons (configured, icons placeholder)
3. ✅ Set up service worker caching strategies (fonts, images cached)
4. ✅ Build PWA install prompt component
5. ✅ Build update available prompt
6. ✅ Add Framer Motion page transitions
7. ✅ Refine all micro-interactions (animated nav indicator)
8. ✅ Build illustrated empty states (EmptyState component with animations)
9. ✅ Add loading skeletons (Skeleton, SkeletonCard, SkeletonGrid)
10. ✅ Final typography and spacing polish (base styles, heading hierarchy)
11. ✅ Accessibility audit (skip link, ARIA labels, focus management, reduced motion)
12. ✅ Performance optimization (lazy loading, code splitting)

**Implementation Notes**:
- PWA configured with workbox for offline caching
- Install and update prompts with Framer Motion animations
- Page transitions with AnimatePresence
- Skeleton components for loading states

**Deliverable**: Installable offline-first PWA

---

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.3",
    "zustand": "^4.5.2",
    "dexie": "^4.0.4",
    "dexie-react-hooks": "^1.1.7",
    "minisearch": "^6.3.0",
    "framer-motion": "^11.0.24",
    "three": "^0.161.0",
    "d3-force-3d": "^3.0.5",
    "uuid": "^9.0.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2"
  }
}
```

---

## Detailed Implementation Specs

### Search Service (Phase 3)

```typescript
// src/services/search/searchService.ts
import MiniSearch from 'minisearch';

export const searchService = {
  async indexAll(scraps: Scrap[]): Promise<void>,
  async addDocument(scrap: Scrap): Promise<void>,
  async updateDocument(scrap: Scrap): Promise<void>,
  removeDocument(id: string): void,
  search(query: string, options?: SearchOptions): SearchResult[],
  autoSuggest(query: string, limit?: number): string[],
};
```

### Clustering Service (Phase 4)

```typescript
// src/services/clustering/clusterEngine.ts
export const clusterEngine = {
  async rebuildClusters(scraps: Scrap[]): Promise<Cluster[]>,
  async assignToCluster(scrap: Scrap): Promise<string | null>,
  getClusterSimilarity(scrapId: string, clusterId: string): number,
};

// src/services/clustering/tfidf.ts
export class TFIDFCalculator {
  addDocument(id: string, text: string): void;
  calculateVector(id: string): TFIDFVector;
  calculateAllVectors(): TFIDFVector[];
}

// src/services/clustering/kmeans.ts
export function kMeansClustering(
  vectors: TFIDFVector[],
  k: number,
  maxIterations?: number
): KMeansResult;

export function findOptimalK(vectors: TFIDFVector[], maxK?: number): number;
```

### Graph Visualization (Phase 5)

```typescript
// src/lib/three/setup.ts
export function createGraphScene(config: GraphSceneConfig): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  nodeGroup: THREE.Group;
  edgeGroup: THREE.Group;
  dispose: () => void;
};

// src/services/graph/graphBuilder.ts
export const graphBuilder = {
  build(scraps: Scrap[], connections: Connection[]): GraphData,
  findConnections(scraps: Scrap[]): Connection[],
};

// src/services/graph/forceSimulation.ts
export function createForceSimulation(
  data: GraphData,
  config?: SimulationConfig
): {
  simulation: Simulation;
  nodes: GraphNode[];
  stop: () => void;
  restart: () => void;
  reheat: () => void;
};
```

---

## File Checklist

### Created ✅
- [x] vite.config.ts
- [x] tsconfig.json
- [x] tailwind.config.js
- [x] src/main.tsx
- [x] src/App.tsx
- [x] src/index.css
- [x] src/types/*.ts
- [x] src/db/schema.ts
- [x] src/db/repositories/*.ts
- [x] src/store/index.ts
- [x] src/store/slices/*.ts
- [x] src/components/ui/*.tsx
- [x] src/components/layout/*.tsx
- [x] src/components/scrap/*.tsx
- [x] src/components/empty-states/*.tsx
- [x] src/pages/*.tsx
- [x] src/services/enrichment/*.ts
- [x] src/lib/utils/*.ts

### To Create 🔲
- [x] src/services/search/searchService.ts
- [x] src/components/search/SearchOverlay.tsx
- [x] src/hooks/useKeyboardShortcut.ts
- [x] src/services/clustering/tfidf.ts
- [x] src/services/clustering/similarity.ts
- [x] src/services/clustering/kmeans.ts
- [x] src/services/clustering/clusterEngine.ts
- [x] src/components/cluster/ClusterCard.tsx
- [x] src/lib/three/setup.ts
- [x] src/lib/three/geometries.ts
- [x] src/lib/three/materials.ts
- [x] src/services/graph/graphBuilder.ts
- [x] src/services/graph/forceSimulation.ts
- [x] src/components/graph/GraphCanvas.tsx
- [x] src/components/graph/GraphControls.tsx
- [x] src/components/graph/GraphLegend.tsx
- [x] src/hooks/usePWA.ts
- [x] src/components/PWAPrompt.tsx
- [x] src/components/ui/Skeleton.tsx
