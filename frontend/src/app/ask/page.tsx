'use client';

import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TITANS = [
  { id: 'li_ka_shing',  name: '李嘉诚', title: '稳健资本家',     avatar: '🏦', color: 'border-slate-400 bg-slate-50',   tagColor: 'bg-slate-200 text-slate-700',   badgeColor: 'bg-slate-700 text-white',   tags: ['避险', '现金流', '政策风向', '周期套利'], desc: '先考虑输的情况，再考虑赢。逆周期布局，顺周期收割。' },
  { id: 'elon_musk',    name: '马斯克',  title: '第一性原理',     avatar: '🚀', color: 'border-indigo-400 bg-indigo-50', tagColor: 'bg-indigo-200 text-indigo-700', badgeColor: 'bg-indigo-600 text-white',  tags: ['硬科技', 'AI', '效率', '第一性原理'],   desc: '打破假设，从物理定律出发重新推导答案。' },
  { id: 'buffett',      name: '巴菲特', title: '价值投资之父',    avatar: '📊', color: 'border-amber-400 bg-amber-50',   tagColor: 'bg-amber-200 text-amber-700',   badgeColor: 'bg-amber-600 text-white',   tags: ['护城河', '长期持有', '安全边际', '复利'], desc: '买的是生意，不是股票。护城河决定一切。' },
  { id: 'munger',       name: '查理·芒格', title: '多元思维模型', avatar: '🧠', color: 'border-teal-400 bg-teal-50',     tagColor: 'bg-teal-200 text-teal-700',     badgeColor: 'bg-teal-600 text-white',    tags: ['逆向思维', '心理学', '跨学科', '等待好球'], desc: '先把问题反过来想，用100个模型交叉验证。' },
  { id: 'ren_zhengfei', name: '任正非', title: '技术自主战略家',  avatar: '🔧', color: 'border-red-400 bg-red-50',       tagColor: 'bg-red-200 text-red-700',       badgeColor: 'bg-red-600 text-white',     tags: ['技术自主', '危机管理', '组织作战', '长期主义'], desc: '没有退路就是最好的出路。活下来是最高战略。' },
  { id: 'zhang_lei',    name: '张磊',   title: '长期主义投资人',  avatar: '🌱', color: 'border-green-400 bg-green-50',   tagColor: 'bg-green-200 text-green-700',   badgeColor: 'bg-green-600 text-white',   tags: ['长期主义', '研究驱动', '价值创造', '高瓴风格'], desc: '找到最好的公司，给它最长的时间。' },
  { id: 'jensen_huang', name: '黄仁勋', title: 'AI基础设施架构师', avatar: '💻', color: 'border-emerald-400 bg-emerald-50', tagColor: 'bg-emerald-200 text-emerald-700', badgeColor: 'bg-emerald-600 text-white', tags: ['AI算力', 'GPU', '基础设施', '平台战略'], desc: '掌控算力就掌控未来，基础设施比应用层更值钱。' },
  { id: 'lei_jun',      name: '雷军',   title: '风口捕手',        avatar: '🌪️', color: 'border-orange-400 bg-orange-50', tagColor: 'bg-orange-200 text-orange-700', badgeColor: 'bg-orange-600 text-white',  tags: ['风口', '极致性价比', '互联网思维', '生态布局'], desc: '站在风口，猪都能飞。先看清风从哪来。' },
];

const MOCK_RESPONSES: Record<string, (q: string) => string> = {
  li_ka_shing:  (q) => `针对「${q}」，先看最坏情况能不能接受。如果能活下来，才谈收益。现在要优先保住现金流，不确定的时候宁可错过，不可犯错。地产和制造业在政策收紧期要减仓，等到市场出清再入场。`,
  elon_musk:    (q) => `「${q}」——先问：这件事物理上可行吗？如果可行，就是工程问题。现在的成本高，是因为大家不假思索接受了既有假设。把它拆开，重新组装，你会发现10倍提效是可能的。别被"行业惯例"绑架。`,
  buffett:      (q) => `关于「${q}」，我会问：10年后这家公司的竞争优势还在吗？护城河才是核心——品牌、网络效应、转换成本、规模优势。等到市场先生情绪崩溃时，再用安全边际买入。`,
  munger:       (q) => `「${q}」——先反过来想：怎么做会必然失败？把失败原因全部排除，剩下的就是正确路径。大多数时候最好的策略是什么都不做，等待一个"胖子球"，然后全力挥棒。`,
  ren_zhengfei: (q) => `对于「${q}」，危机是常态，不是例外。要在晴天修屋顶，在战略上保持对最坏情况的清醒认知。核心技术必须自主，否则永远被人卡脖子。目标清晰、责权对等、执行坚决。`,
  zhang_lei:    (q) => `关于「${q}」，关键问题是：这个赛道能在未来10-20年持续创造社会价值吗？在大家看不懂的早期重仓进入，陪它穿越周期。短期的悲观情绪掩盖了长期的结构性机会。`,
  jensen_huang: (q) => `「${q}」的本质是算力和数据的竞争。AI不是软件，它是新工厂，GPU就是新的生产设备。谁掌握了算力基础设施，谁就掌握了未来十年的产业主导权。`,
  lei_jun:      (q) => `「${q}」——先判断这是不是一个真风口。风口有三个特征：技术成熟拐点、政策推动、大众需求爆发。三者共振时要all in，不能犹豫。然后用极致性价比打败传统对手。`,
};

interface TitanResponse {
  persona_id: string;
  name: string;
  title: string;
  avatar_hint: string;
  answer: string;
}

export default function AskPage() {
  const [question, setQuestion]     = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(['li_ka_shing', 'elon_musk']);
  const [responses, setResponses]   = useState<TitanResponse[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [usingMock, setUsingMock]   = useState(false);

  const toggleTitan = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setResponses([]);
    setUsingMock(false);

    try {
      const res = await fetch(`${API_BASE}/chat/ask-titan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, persona_ids: selectedIds }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || '请求失败');
      }

      const data = await res.json();
      setResponses(data.responses);
    } catch (err: unknown) {
      // API 不可用时回退 mock
      setUsingMock(true);
      await new Promise((r) => setTimeout(r, 800));
      const mockResult: TitanResponse[] = selectedIds.map((id) => {
        const titan = TITANS.find((t) => t.id === id)!;
        return {
          persona_id: id,
          name: titan.name,
          title: titan.title,
          avatar_hint: titan.avatar,
          answer: MOCK_RESPONSES[id]?.(question) ?? '暂无回答',
        };
      });
      setResponses(mockResult);
      const message = err instanceof Error ? err.message : '未知错误';
      setError(`（后端未连接，当前展示模拟数据。配置 VOLCENGINE_API_KEY 后可获得真实 AI 回答。原因：${message}）`);
    } finally {
      setLoading(false);
    }
  };

  const selectedTitans = TITANS.filter((t) => selectedIds.includes(t.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">问问巨头</h1>
        <p className="text-gray-500 text-sm">选择 1-4 位巨头，获取 AI 模拟思维视角解读。</p>
      </div>

      {/* 大佬选择 */}
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
          选择大佬视角（最多4位）— 已选 {selectedIds.length}/4
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TITANS.map((titan) => {
            const selected = selectedIds.includes(titan.id);
            return (
              <button
                key={titan.id}
                onClick={() => toggleTitan(titan.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? titan.color + ' border-opacity-100 shadow-md scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="text-2xl mb-1">{titan.avatar}</div>
                <div className="font-bold text-sm text-gray-900">{titan.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{titan.title}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {titan.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded ${titan.tagColor}`}>{tag}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 大佬理念 */}
      {selectedTitans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {selectedTitans.map((titan) => (
            <div key={titan.id} className={`p-3 rounded-lg border text-xs ${titan.color}`}>
              <span className="font-semibold">{titan.avatar} {titan.name}：</span>
              <span className="text-gray-600">{titan.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* 提问 */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：如何看待美联储降息对A股的影响？DeepSeek崛起意味着什么？"
            className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-sm"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? '思考中...' : '提问'}
          </button>
        </div>
      </form>

      {/* 快捷提问 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-400 self-center">快捷提问：</span>
        {[
          '如何看待当前A股市场机会？',
          'AI大模型对传统行业的冲击？',
          '2026年最值得关注的投资赛道？',
          '如何判断一家公司是否值得长期持有？',
        ].map((q) => (
          <button
            key={q}
            onClick={() => setQuestion(q)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-full transition-colors border border-gray-200"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 状态提示 */}
      {usingMock && error && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          ⚠️ {error}
        </div>
      )}

      {/* 回答区 */}
      {responses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            💬 关于「{question}」，巨头们的视角：
            {usingMock && <span className="ml-2 text-xs font-normal text-gray-400">（模拟数据）</span>}
          </h2>
          <div className={`grid gap-5 ${responses.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {responses.map((resp) => {
              const titan = TITANS.find((t) => t.id === resp.persona_id);
              if (!titan) return null;
              return (
                <div key={resp.persona_id} className={`rounded-xl p-5 border shadow-sm relative ${titan.color}`}>
                  <div className={`absolute -top-3.5 left-5 px-3 py-1 rounded-full text-xs font-bold shadow ${titan.badgeColor}`}>
                    {titan.avatar} {resp.name} · {resp.title}
                  </div>
                  <div className="mt-3 text-gray-800 leading-relaxed text-sm">
                    「{resp.answer}」
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {titan.tags.map((tag) => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded ${titan.tagColor}`}>#{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
