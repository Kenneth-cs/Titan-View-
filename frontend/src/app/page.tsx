import Link from 'next/link';
import SectionCard from '@/components/SectionCard';
import { fetchNews, fetchReport, NewsItem } from '@/lib/api';

const SIGNALS = [
  {
    dot: '🔴', label: '风险预警',
    borderClass: 'border-red-500', bgClass: 'bg-red-50', titleClass: 'text-red-800', textClass: 'text-red-700',
    titans: ['🏦 李嘉诚', '📊 巴菲特', '🔧 任正非'],
    items: [
      '新兴市场汇率异常波动，建议优先持有现金，等待市场出清。',
      '美联储降息预期推迟，资金成本高企，高负债企业压力加大。',
      '地缘政治摩擦加剧，核心技术供应链风险需纳入战略评估。',
    ],
  },
  {
    dot: '🟢', label: '机会信号',
    borderClass: 'border-green-500', bgClass: 'bg-green-50', titleClass: 'text-green-800', textClass: 'text-green-700',
    titans: ['🚀 马斯克', '💻 黄仁勋', '🌪️ 雷军'],
    items: [
      '固态电池制造成本突破，电动车平价临界点将至，供应链机会开启。',
      '国产大模型推理效率大幅提升，企业级 AI 应用替换浪潮爆发在即。',
      '低空经济政策密集落地，飞行汽车与无人机赛道进入规模化窗口期。',
    ],
  },
  {
    dot: '🔵', label: '价值洼地',
    borderClass: 'border-blue-500', bgClass: 'bg-blue-50', titleClass: 'text-blue-800', textClass: 'text-blue-700',
    titans: ['🌱 张磊', '🧠 芒格'],
    items: [
      '港股科技板块估值处于历史低位，具备护城河的龙头企业值得关注。',
      '消费情绪低迷反而是布局优质消费品牌的好时机，等待情绪反转。',
    ],
  },
];

const TITAN_TAKES = [
  { avatar: '🏦', name: '李嘉诚', title: '稳健资本家',      color: 'border-slate-300 bg-slate-50',    badge: 'bg-slate-700 text-white',   quote: '现在最重要的是保住子弹。汇率波动+政策收紧的组合，是减仓锁定收益的信号，不是抄底的时机。', focus: '⚠️ 关注：汇率 · 房产税 · 现金储备' },
  { avatar: '🚀', name: '马斯克',  title: '第一性原理',      color: 'border-indigo-300 bg-indigo-50',  badge: 'bg-indigo-600 text-white',  quote: 'AI推理成本下降90%意味着什么？意味着所有依赖人工的信息处理行业都要被重做一遍，这才刚刚开始。', focus: '🚀 关注：AI算力 · 能源 · 机器人' },
  { avatar: '📊', name: '巴菲特', title: '价值投资',         color: 'border-amber-300 bg-amber-50',    badge: 'bg-amber-600 text-white',   quote: '市场先生今天情绪不稳定，但护城河还在。好公司的内在价值不会因为短期波动而改变，等价格回归理性。', focus: '📊 关注：护城河 · 自由现金流 · 回购' },
  { avatar: '🧠', name: '查理·芒格', title: '多元思维模型', color: 'border-teal-300 bg-teal-50',      badge: 'bg-teal-600 text-white',    quote: '先把问题反过来想——什么会让这笔投资必然亏损？把那些原因全部排除掉，剩下的就是可以考虑的。', focus: '🧠 关注：逆向验证 · 心理陷阱 · 等待好球' },
  { avatar: '🔧', name: '任正非', title: '技术自主战略',     color: 'border-red-300 bg-red-50',        badge: 'bg-red-600 text-white',     quote: '核心技术是买不来的。今天的AI芯片限制告诉我们，凡是关键赛道，必须要有自己的备胎随时可以切换。', focus: '🔧 关注：半导体 · 技术自主 · 供应链安全' },
  { avatar: '🌱', name: '张磊',   title: '长期主义',         color: 'border-green-300 bg-green-50',    badge: 'bg-green-600 text-white',   quote: '短期的悲观情绪掩盖了中国消费升级的长期趋势。找到真正创造社会价值的公司，给它时间，陪它穿越周期。', focus: '🌱 关注：消费升级 · 港股价值 · 长期复利' },
  { avatar: '💻', name: '黄仁勋', title: 'AI基础设施',       color: 'border-emerald-300 bg-emerald-50', badge: 'bg-emerald-600 text-white', quote: '问题不是要不要用AI，而是谁先把AI基础设施建起来。算力就是新时代的电力，掌控算力就掌控未来话语权。', focus: '💻 关注：AI算力 · 数据中心 · 国产芯片' },
  { avatar: '🌪️', name: '雷军',  title: '风口捕手',         color: 'border-orange-300 bg-orange-50',  badge: 'bg-orange-600 text-white',  quote: '低空经济+AI+机器人，三个风口在2026年同时共振。站在风口，要all in，但要先搞清楚哪个是真风口。', focus: '🌪️ 关注：低空经济 · 智能硬件 · 消费AI' },
];

const SECTIONS = [
  { key: 'policy',   icon: '🏛️', title: '宏观政策',     subtitle: '发改委 · 央行 · 国务院',        desc: '政策原文 vs 落地影响，解读监管意图' },
  { key: 'global',   icon: '🌏', title: '国际形势',     subtitle: '地缘政治 · 外贸 · 汇率',         desc: '地缘政治对资本流动与供应链的影响' },
  { key: 'market',   icon: '📈', title: '资本市场',     subtitle: 'A股 · 港股 · 大宗商品 · 加密',   desc: '二级市场异动、资金流向与风险信号' },
  { key: 'tech',     icon: '🤖', title: 'AI 与硬科技',  subtitle: 'AI · 半导体 · 新材料',           desc: '真正具有颠覆性的技术进展与产业变局' },
  { key: 'consumer', icon: '🛍️', title: '消费与社会情绪', subtitle: '小红书 · 微博 · 百度热搜',    desc: '社会心理与消费趋势，挖掘大众认知变化' },
  { key: 'industry', icon: '⚡', title: '产业赛道',     subtitle: '新能源 · 生物医药 · 房地产',     desc: '重点赛道政策红利、产业周期与风险预警' },
  { key: 'vc',       icon: '🦄', title: '创投生态',     subtitle: '融资 · 并购 · IPO',              desc: '一级市场融资动态、独角兽动向与机构布局' },
  { key: 'economy',  icon: '📊', title: '经济数据',     subtitle: 'PMI · CPI · 就业 · 外汇储备',   desc: '关键宏观经济指标发布与趋势研判' },
];

async function getSectionNews(): Promise<Record<string, NewsItem[]>> {
  const result: Record<string, NewsItem[]> = {};
  await Promise.allSettled(
    SECTIONS.map(async (s) => {
      try {
        const data = await fetchNews({ section: s.key, limit: 4 });
        result[s.key] = data.items;
      } catch {
        result[s.key] = [];
      }
    })
  );
  return result;
}

export default async function Home() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  const todayStr = new Date().toISOString().split('T')[0];

  const [sectionNews, report] = await Promise.allSettled([
    getSectionNews(),
    fetchReport(todayStr),
  ]);

  const newsData   = sectionNews.status  === 'fulfilled' ? sectionNews.value   : {};
  const reportData = report.status       === 'fulfilled' ? report.value         : null;

  return (
    <div className="space-y-10">

      {/* 标题 */}
      <section className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">每日晨间决策简报</h1>
        <p className="text-lg text-gray-500">{today}</p>
        {reportData && (
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              宏观评分 {reportData.macro_score ?? '--'}/100
            </span>
            <span className="text-sm bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-200">
              科技评分 {reportData.tech_score ?? '--'}/100
            </span>
          </div>
        )}
      </section>

      {/* 三色信号 */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-widest mb-4">▌ 今日信号灯</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SIGNALS.map((s) => (
            <div key={s.label} className={`${s.bgClass} border-l-4 ${s.borderClass} p-5 rounded-r-xl shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{s.dot}</span>
                <h2 className={`text-lg font-bold ${s.titleClass}`}>{s.label}</h2>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.titans.map((t) => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white bg-opacity-70 ${s.titleClass}`}>{t}</span>
                ))}
              </div>
              <ul className={`space-y-2 ${s.textClass} text-sm`}>
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 shrink-0">·</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 巨头速评 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-widest">▌ 今日巨头速评</h2>
          <Link href="/ask" className="text-sm text-blue-600 hover:text-blue-800 font-medium">深度对话巨头 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TITAN_TAKES.map((t) => (
            <div key={t.name} className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${t.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.title}</div>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed mb-3 italic">「{t.quote}」</p>
              <p className="text-xs text-gray-500 font-medium">{t.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 八大维度 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-500 uppercase tracking-widest">▌ 八大维度深度解读</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:text-blue-800 font-medium">查看全部情报 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SECTIONS.map((s) => (
            <SectionCard
              key={s.key}
              icon={s.icon}
              title={s.title}
              subtitle={s.subtitle}
              desc={s.desc}
              news={newsData[s.key] ?? []}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
