export interface NotionEntry {
  id: string;
  title: string;
  content: string;
  status: string;
  createdTime: string;
}

export interface ExportResults {
  success: boolean;
  entries: NotionEntry[];
  count: number;
  error?: string;
}

export interface ExportResult {
  exported: boolean;
  description: string;
  db: string;
  title?: string;
  mediumUrl?: string;
}

export interface MediumStory {
  title: string | null;
  content: string;
  canonicalUrl: string;
  tags: string[];
  publishStatus: string;
  contentFormat: string;
}
