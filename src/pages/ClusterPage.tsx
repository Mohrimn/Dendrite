import { Header } from '@/components/layout';

export function ClusterPage() {
  return (
    <>
      <Header title="Clusters" subtitle="Themed groups of related scraps" />
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
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="5" r="2" />
              <circle cx="19" cy="19" r="2" />
              <circle cx="5" cy="19" r="2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Clusters</h3>
          <p className="mt-1 text-sm text-slate-500">
            Coming soon - Auto-grouped themes
          </p>
        </div>
      </div>
    </>
  );
}
