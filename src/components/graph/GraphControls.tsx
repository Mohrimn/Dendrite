// ABOUTME: Control buttons for the 3D graph visualization
// ABOUTME: Provides zoom, reset view, and simulation reheat controls

interface GraphControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onReheat?: () => void;
  className?: string;
}

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onReheat,
  className = '',
}: GraphControlsProps) {
  return (
    <div className={`flex flex-col gap-1.5 bg-slate-800/90 backdrop-blur-sm rounded-lg p-1.5 ${className}`}>
      <button
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
        className="w-10 h-10 p-0 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors touch-manipulation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
        className="w-10 h-10 p-0 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors touch-manipulation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={onResetView}
        title="Reset View"
        aria-label="Reset View"
        className="w-10 h-10 p-0 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors touch-manipulation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
      <button
        onClick={onReheat}
        title="Reheat Simulation"
        aria-label="Reheat Simulation"
        className="w-10 h-10 p-0 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors touch-manipulation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v8" />
          <path d="m4.93 10.93 1.41 1.41" />
          <path d="M2 18h2" />
          <path d="M20 18h2" />
          <path d="m19.07 10.93-1.41 1.41" />
          <path d="M22 22H2" />
          <path d="m8 6 4-4 4 4" />
          <path d="M16 18a4 4 0 0 0-8 0" />
        </svg>
      </button>
    </div>
  );
}
