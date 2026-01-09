import { useState } from 'react';
import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { useStore } from '@/store';
import { db } from '@/db';
import { seedTestData } from '@/utils';

export function SettingsPage() {
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);
  const createScrap = useStore((state) => state.createScrap);
  const loadScraps = useStore((state) => state.loadScraps);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (window.confirm('This will add 28 test scraps to Dendrite. Continue?')) {
      setIsSeeding(true);
      try {
        await seedTestData(createScrap);
        await loadScraps();
        alert('Test data added successfully!');
      } catch (error) {
        console.error('Failed to seed data:', error);
        alert('Failed to add test data');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all your scraps? This cannot be undone.')) {
      await db.scraps.clear();
      await db.tags.clear();
      await db.clusters.clear();
      await db.connections.clear();
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    const scraps = await db.scraps.toArray();
    const tags = await db.tags.toArray();
    const data = { scraps, tags, exportedAt: new Date().toISOString() };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dendrite-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header title="Settings" />
      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* Display Settings */}
          <Card>
            <h3 className="mb-4 font-medium text-slate-900">Display</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">View Mode</p>
                  <p className="text-sm text-slate-500">Choose how scraps are displayed</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card>
            <h3 className="mb-4 font-medium text-slate-900">Data Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Export Data</p>
                  <p className="text-sm text-slate-500">Download all your scraps as JSON</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExportData}>
                  Export
                </Button>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Clear All Data</p>
                    <p className="text-sm text-slate-500">Permanently delete all scraps</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={handleClearData}>
                    Clear Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Developer Tools */}
          <Card>
            <h3 className="mb-4 font-medium text-slate-900">Developer Tools</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Seed Test Data</p>
                  <p className="text-sm text-slate-500">Add 28 sample scraps for testing search and clustering</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSeedData}
                  disabled={isSeeding}
                >
                  {isSeeding ? 'Seeding...' : 'Add Test Data'}
                </Button>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card>
            <h3 className="mb-4 font-medium text-slate-900">About</h3>
            <div className="text-sm text-slate-600">
              <p className="mb-2">
                <strong>Dendrite</strong> v1.0.0
              </p>
              <p>
                A beautiful, offline-first personal knowledge capture tool.
                All your data is stored locally in your browser.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
