export interface RawNewsArticle {
  id?: string | undefined;
  title: string;
  description?: string | undefined;
  url: string;
  publishedAt: string;
  sourceName?: string | undefined;
}
