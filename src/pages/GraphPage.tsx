import { Header } from '@/components/layout';

export function GraphPage() {
  return (
    <>
      <Header title="Knowledge Graph" subtitle="Visualize your ideas" />
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-400"
            >
              <circle cx="12" cy="12" r="2" />
              <circle cx="4" cy="6" r="2" />
              <circle cx="20" cy="6" r="2" />
              <circle cx="4" cy="18" r="2" />
              <circle cx="20" cy="18" r="2" />
              <line x1="6" y1="6" x2="10" y2="10.5" />
              <line x1="18" y1="6" x2="14" y2="10.5" />
              <line x1="6" y1="18" x2="10" y2="13.5" />
              <line x1="18" y1="18" x2="14" y2="13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Graph View</h3>
          <p className="mt-1 text-sm text-slate-500">
            Coming soon - Three.js visualization
          </p>
        </div>
      </div>
    </>
  );
}
