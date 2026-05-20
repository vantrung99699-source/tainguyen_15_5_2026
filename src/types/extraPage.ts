export type ExtraPageLinkType = 'content' | 'external';

export interface ExtraPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  showInMenu: boolean;
  enabled: boolean;
  linkType: ExtraPageLinkType;
  externalUrl: string;
  sortOrder: number;
  updatedAt: string;
}
