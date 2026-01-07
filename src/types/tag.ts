export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  isSystem: boolean;
  usageCount: number;
  createdAt: Date;
}

export type CreateTagInput = Pick<Tag, 'name' | 'color'> & {
  isSystem?: boolean;
};
