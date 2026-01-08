import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { SearchOverlay } from '@/components/search';
import { HomePage, GraphPage, ClusterPage, SettingsPage } from '@/pages';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/clusters" element={<ClusterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
      <SearchOverlay />
    </BrowserRouter>
  );
}
