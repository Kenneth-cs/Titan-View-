'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchNews, NewsItem, PLATFORM_LABEL, SECTION_LABEL } from '@/lib/api';

const PLATFORMS = [
  { id: 'all',    label: '全部' },
  { id: 'gov',    label: '🏛️ 政府/官媒' },
  { id: 'ndrc',   label: '📋 发改委' },
  { id: 'xinhua', label: '📰 新华社' },
  { id: 'reuters',label: '🌐 路透社' },
  { id: 'sina',   label: '📡 新浪财经' },
  { id: 'stcn',   label: '📈 证券时报' },
  { id: 'weibo',  label: '🔥 微博' },
  { id: 'baidu',  label: '🔍 百度热榜' },
  { id: 'caixin', label: '💼 财新' },
  { id: '36kr',   label: '🦄 36氪' },
  { id: 'hackernews', label: '💻 HackerNews' },
  { id: 'stats',  label: '📊 统计局' },
];

const SECTIONS = [
  { id: 'all',      label: '全部维度' },
  { id: 'policy',   label: '🏛️ 宏观政策' },
  { id: 'global',   label: '🌏 国际形势' },
  { id: 'market',   label: '📈 资本市场' },
  { id: 'tech',     label: '🤖 AI与科技' },
  { id: 'consumer', label: '🛍️ 消费情绪' },
  { id: 'industry', label: '⚡ 产业赛道' },
  { id: 'vc',       label: '🦄 创投生态' },
  { id: 'economy',  label: '📊 经济数据' },
];

export default function NewsPage() {
  const [activePlatform, setActivePlatform] = useState('all');
  const [activeSection,  setActiveSection]  = useState('all');
  const [news,     setNews]     = useState<NewsItem[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const LIMIT = 20;

  const load = useCallback(async (platform: string, section: string, skip: number) => {
    setLoading(true);
    try {
      const data = await fetchNews({
        platform: platform !== 'all' ? platform : undefined,
        section:  section  !== 'all' ? section  : undefined,
        limit: LIMIT,
        skip,
      });
      setNews(skip === 0 ? data.items : (prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch {
      // API 离线时静默处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    load(activePlatform, activeSection, 0);
  }, [activePlatform, activeSection, load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(activePlatform, activeSection, next * LIMIT);
  };

  const sectionInfo = SECTION_LABEL[activeSection];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">跨平台情报聚合</h1>
        <p className="text-gray-500 mt-1 text-sm">
          覆盖政府官网、主流财经媒体、社交平台，AI 过滤后按维度分级呈现。点击标题可跳转原文。
        </p>
      </div>

      {/* 平台筛选 */}
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">按来源平台</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activePlatform === p.id
                  ? 'bg-gray-900 text-white border-transparent shadow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 维度筛选 */}
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">按情报维度</p>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeSection === s.id
                  ? 'bg-gray-900 text-white border-transparent shadow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {loading ? '加载中...' : `共 ${total} 条情报，已显示 ${news.length} 条`}
        </p>
        {sectionInfo && (
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${sectionInfo.color}`}>
            {sectionInfo.icon} {sectionInfo.label}
          </span>
        )}
      </div>

      {/* 新闻列表 */}
      <div className="space-y-3">
        {loading && news.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">暂无情报数据</p>
            <p className="text-sm">请先运行爬虫：<code className="bg-gray-100 px-2 py-0.5 rounded">python scheduler.py --once</code></p>
          </div>
        )}

        {news.map((item) => {
          const secInfo = SECTION_LABEL[
            (item.tags || []).find((t) => SECTION_LABEL[t]) || ''
          ];
          return (
            <div key={item.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline leading-snug block"
                  >
                    {item.title} ↗
                  </a>
                  {item.content && (
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed line-clamp-2">{item.content}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(item.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {PLATFORM_LABEL[item.source_platform] || item.source_platform}
                  </span>
                  {secInfo && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${secInfo.color}`}>
                      {secInfo.icon} {secInfo.label}
                    </span>
                  )}
                  {item.publish_time && (
                    <span className="text-xs text-gray-400">
                      {new Date(item.publish_time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 加载更多 */}
        {news.length < total && !loading && (
          <button
            onClick={loadMore}
            className="w-full py-3 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            加载更多（剩余 {total - news.length} 条）
          </button>
        )}
      </div>
    </div>
  );
}
