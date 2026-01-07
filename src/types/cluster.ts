export interface Cluster {
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
