export type ScrapType = 'thought' | 'link' | 'image' | 'snippet' | 'note';

export interface LinkMeta {
  title: string;
  description: string;
  image: string;
  domain: string;
  favicon: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  thumbnail: string;
}

export interface Scrap {
  id: string;
  type: ScrapType;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
  linkMeta?: LinkMeta;
  imageData?: ImageData;
  tags: string[];
  autoTags: string[];
  keywords: string[];
  clusterId?: string;
  clusterScore?: number;
  connectionIds: string[];
  isPinned: boolean;
  color?: string;
  searchableText: string;
}

export type CreateScrapInput = Pick<Scrap, 'type' | 'title' | 'content'> & {
  url?: string;
  imageData?: ImageData;
  tags?: string[];
  color?: string;
};

export type UpdateScrapInput = Partial<Omit<Scrap, 'id' | 'createdAt'>>;
