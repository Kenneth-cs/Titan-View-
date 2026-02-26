'use client';

import React, { useState } from 'react';

const PLATFORMS = [
  { id: 'all',        label: '全部',         color: 'bg-gray-800 text-white' },
  { id: 'gov',        label: '🏛️ 政府/官媒',  color: 'bg-red-600 text-white' },
  { id: 'xinhua',     label: '📰 新华社',     color: 'bg-red-500 text-white' },
  { id: 'sina',       label: '📡 新浪财经',   color: 'bg-orange-500 text-white' },
  { id: 'weibo',      label: '🔥 微博',       color: 'bg-yellow-500 text-white' },
  { id: 'xiaohongshu',label: '📕 小红书',     color: 'bg-rose-500 text-white' },
  { id: 'baidu',      label: '🔍 百度热榜',   color: 'bg-blue-600 text-white' },
  { id: 'caixin',     label: '💼 财新',       color: 'bg-purple-600 text-white' },
  { id: '36kr',       label: '🦄 36氪',       color: 'bg-indigo-500 text-white' },
];

const SECTIONS = [
  { id: 'all',        label: '全部维度' },
  { id: 'policy',     label: '🏛️ 宏观政策' },
  { id: 'global',     label: '🌏 国际形势' },
  { id: 'market',     label: '📈 资本市场' },
  { id: 'tech',       label: '🤖 AI与科技' },
  { id: 'consumer',   label: '🛍️ 消费情绪' },
  { id: 'industry',   label: '⚡ 产业赛道' },
  { id: 'vc',         label: '🦄 创投生态' },
  { id: 'economy',    label: '📊 经济数据' },
];

const MOCK_NEWS = [
  {
    id: 1,
    platform: 'gov',
    platformLabel: '国家发改委',
    section: 'policy',
    sectionLabel: '宏观政策',
    title: '国家发展改革委：加快推进新型基础设施建设，重点支持AI算力中心布局',
    summary: '发改委发布通知，明确2026年新型基础设施建设重点方向，AI算力中心、数据中心将获重点政策支持与专项资金。',
    url: 'https://www.ndrc.gov.cn/',
    publishTime: '2026-02-26 07:30',
    tags: ['#政策', '#AI算力', '#新基建'],
  },
  {
    id: 2,
    platform: 'xinhua',
    platformLabel: '新华社',
    section: 'policy',
    sectionLabel: '宏观政策',
    title: '中国人民银行：继续保持货币政策稳健，适时降准以支持实体经济',
    summary: '央行货币政策执行报告显示，将灵活运用降准、公开市场操作等工具，重点支持科技创新和绿色发展。',
    url: 'https://www.xinhuanet.com/',
    publishTime: '2026-02-26 08:00',
    tags: ['#央行', '#货币政策', '#降准'],
  },
  {
    id: 3,
    platform: 'sina',
    platformLabel: '新浪财经',
    section: 'market',
    sectionLabel: '资本市场',
    title: 'A股三大指数低开高走，AI算力板块集体爆发，成交额突破1.2万亿',
    summary: '沪指收涨1.8%，深成指涨2.3%，AI算力、机器人、低空经济板块领涨，北向资金单日净流入超50亿。',
    url: 'https://finance.sina.com.cn/',
    publishTime: '2026-02-26 15:30',
    tags: ['#A股', '#AI板块', '#资金流向'],
  },
  {
    id: 4,
    platform: 'caixin',
    platformLabel: '财新',
    section: 'economy',
    sectionLabel: '经济数据',
    title: '1月财新中国制造业PMI升至52.3，为近18个月新高',
    summary: '财新中国制造业PMI连续三月扩张，新订单指数和就业指数均高于荣枯线，显示制造业复苏动能增强。',
    url: 'https://www.caixin.com/',
    publishTime: '2026-02-26 09:45',
    tags: ['#PMI', '#制造业', '#经济数据'],
  },
  {
    id: 5,
    platform: 'weibo',
    platformLabel: '微博热搜',
    section: 'consumer',
    sectionLabel: '消费情绪',
    title: '#消费降级还是消费升级# 登上微博热搜，年轻人开始大规模讨论"反向消费"',
    summary: '微博热搜显示，"平替经济"相关话题阅读量超10亿，年轻消费者主动寻求高性价比替代品，奢侈品消费出现明显分化。',
    url: 'https://s.weibo.com/',
    publishTime: '2026-02-26 10:20',
    tags: ['#消费降级', '#社会情绪', '#微博热搜'],
  },
  {
    id: 6,
    platform: 'xiaohongshu',
    platformLabel: '小红书',
    section: 'consumer',
    sectionLabel: '消费情绪',
    title: '小红书高赞：转行AI产品经理热帖破10万赞，"AI副业月入3万"笔记激增',
    summary: '小红书平台AI相关职业转型话题持续发酵，AI工具副业变现攻略成为最热门内容类别，反映市场对AI就业机会的强烈关注。',
    url: 'https://www.xiaohongshu.com/',
    publishTime: '2026-02-26 11:00',
    tags: ['#AI就业', '#转行', '#小红书趋势'],
  },
  {
    id: 7,
    platform: '36kr',
    platformLabel: '36氪',
    section: 'vc',
    sectionLabel: '创投生态',
    title: '具身智能独角兽宇树科技完成B轮6亿融资，估值超200亿人民币',
    summary: '机器人公司宇树科技宣布完成6亿元B轮融资，由红杉中国领投，字节跳动战略跟投，将用于人形机器人量产研发。',
    url: 'https://36kr.com/',
    publishTime: '2026-02-26 14:00',
    tags: ['#机器人', '#融资', '#具身智能'],
  },
  {
    id: 8,
    platform: 'baidu',
    platformLabel: '百度热榜',
    section: 'global',
    sectionLabel: '国际形势',
    title: '美联储1月会议纪要出炉：通胀未达目标，年内降息预期降温',
    summary: '美联储公布1月FOMC会议纪要，多位官员认为通胀回落速度低于预期，市场将2025年首次降息预期推迟至下半年。',
    url: 'https://www.baidu.com/',
    publishTime: '2026-02-26 08:30',
    tags: ['#美联储', '#降息', '#国际金融'],
  },
  {
    id: 9,
    platform: 'sina',
    platformLabel: '新浪科技',
    section: 'tech',
    sectionLabel: 'AI与科技',
    title: 'DeepSeek R2 发布在即，据悉推理性能超 GPT-5，参数量仅为竞品 1/10',
    summary: '多位知情人士透露，DeepSeek新一代推理模型R2即将发布，在数学和代码基准测试中显著超越现有旗舰模型，再度引发全球关注。',
    url: 'https://tech.sina.com.cn/',
    publishTime: '2026-02-26 13:15',
    tags: ['#DeepSeek', '#AI大模型', '#硬科技'],
  },
];

const platformColorMap: Record<string, string> = {
  gov:         'bg-red-100 text-red-700',
  xinhua:      'bg-red-100 text-red-600',
  sina:        'bg-orange-100 text-orange-700',
  weibo:       'bg-yellow-100 text-yellow-700',
  xiaohongshu: 'bg-rose-100 text-rose-700',
  baidu:       'bg-blue-100 text-blue-700',
  caixin:      'bg-purple-100 text-purple-700',
  '36kr':      'bg-indigo-100 text-indigo-700',
};

const sectionColorMap: Record<string, string> = {
  policy:   'bg-red-50 text-red-700',
  global:   'bg-sky-50 text-sky-700',
  market:   'bg-green-50 text-green-700',
  tech:     'bg-violet-50 text-violet-700',
  consumer: 'bg-pink-50 text-pink-700',
  industry: 'bg-amber-50 text-amber-700',
  vc:       'bg-indigo-50 text-indigo-700',
  economy:  'bg-teal-50 text-teal-700',
};

export default function NewsPage() {
  const [activePlatform, setActivePlatform] = useState('all');
  const [activeSection, setActiveSection] = useState('all');

  const filtered = MOCK_NEWS.filter((n) => {
    const matchPlatform = activePlatform === 'all' || n.platform === activePlatform;
    const matchSection  = activeSection  === 'all' || n.section  === activeSection;
    return matchPlatform && matchSection;
  });

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
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">按来源平台筛选</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activePlatform === p.id
                  ? p.color + ' border-transparent shadow'
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
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">按情报维度筛选</p>
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

      {/* 结果计数 */}
      <p className="text-sm text-gray-400">共 {filtered.length} 条情报</p>

      {/* 新闻列表 */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">暂无符合条件的情报</div>
        )}
        {filtered.map((news) => (
          <div
            key={news.id}
            className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* 标题 - 可点击跳转 */}
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-blue-700 hover:text-blue-900 hover:underline leading-snug block"
                >
                  {news.title} ↗
                </a>
                {/* 摘要 */}
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{news.summary}</p>
                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {news.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* 右侧元信息 */}
              <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${platformColorMap[news.platform] || 'bg-gray-100 text-gray-600'}`}>
                  {news.platformLabel}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${sectionColorMap[news.section] || 'bg-gray-100 text-gray-600'}`}>
                  {news.sectionLabel}
                </span>
                <span className="text-xs text-gray-400">{news.publishTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
