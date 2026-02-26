const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface NewsItem {
  id: number;
  source_platform: string;
  title: string;
  url: string;
  content: string;
  publish_time: string | null;
  tags: string[];
}

export interface NewsResponse {
  total: number;
  items: NewsItem[];
}

export interface DailyReport {
  id: number;
  report_date: string;
  summary_markdown: string;
  macro_score: number | null;
  tech_score: number | null;
  created_at: string;
}

export async function fetchNews(params: {
  section?: string;
  platform?: string;
  limit?: number;
  skip?: number;
}): Promise<NewsResponse> {
  const query = new URLSearchParams();
  if (params.section)  query.set('section',  params.section);
  if (params.platform) query.set('platform', params.platform);
  if (params.limit)    query.set('limit',    String(params.limit));
  if (params.skip)     query.set('skip',     String(params.skip));

  const res = await fetch(`${API_BASE}/news/?${query}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchReport(date: string): Promise<DailyReport | null> {
  const res = await fetch(`${API_BASE}/reports/${date}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function triggerPipeline(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/pipeline/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Pipeline failed');
  return res.json();
}

export const PLATFORM_LABEL: Record<string, string> = {
  gov:         '🏛️ 政府网',
  ndrc:        '📋 发改委',
  stats:       '📊 统计局',
  xinhua:      '📰 新华社',
  reuters:     '🌐 路透社',
  sina:        '📡 新浪财经',
  stcn:        '📈 证券时报',
  '36kr':      '🦄 36氪',
  hackernews:  '💻 HackerNews',
  caixin:      '💼 财新',
  weibo:       '🔥 微博',
  baidu:       '🔍 百度',
};

export const SECTION_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  policy:   { label: '宏观政策',     icon: '🏛️', color: 'bg-red-50 text-red-700 border-red-200' },
  global:   { label: '国际形势',     icon: '🌏', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  market:   { label: '资本市场',     icon: '📈', color: 'bg-green-50 text-green-700 border-green-200' },
  tech:     { label: 'AI与科技',     icon: '🤖', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  consumer: { label: '消费与社会情绪', icon: '🛍️', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  industry: { label: '产业赛道',     icon: '⚡', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  vc:       { label: '创投生态',     icon: '🦄', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  economy:  { label: '经济数据',     icon: '📊', color: 'bg-teal-50 text-teal-700 border-teal-200' },
};
