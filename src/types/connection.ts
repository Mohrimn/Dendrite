export type ConnectionType = 'manual' | 'tag' | 'cluster' | 'semantic' | 'temporal';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  strength: number;
  createdAt: Date;
}
