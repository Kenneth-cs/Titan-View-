'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CrawlerStatus {
  running: boolean;
  last_run: string | null;
  last_count: number;
  last_error: string | null;
}

interface PipelineStatus {
  running: boolean;
  today_report: {
    exists: boolean;
    macro_score: number | null;
    tech_score: number | null;
    created_at: string | null;
  };
}

interface HealthJob {
  id: string;
  next_run: string;
}

interface HealthStatus {
  status: string;
  scheduled_jobs: HealthJob[];
}

type TaskStatus = 'idle' | 'running' | 'success' | 'error';

const JOB_LABELS: Record<string, string> = {
  crawl_04:    '🌙 凌晨 04:00 — 全量爬取',
  pipeline_06: '🌅 早晨 06:00 — AI 简报生成',
  crawl_12:    '☀️ 中午 12:00 — 午间补充爬取',
};

export default function AdminPage() {
  const [crawlerStatus,  setCrawlerStatus]  = useState<CrawlerStatus | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [health,         setHealth]         = useState<HealthStatus | null>(null);
  const [crawlerTask,    setCrawlerTask]     = useState<TaskStatus>('idle');
  const [pipelineTask,   setPipelineTask]    = useState<TaskStatus>('idle');
  const [fullTask,       setFullTask]        = useState<TaskStatus>('idle');
  const [log,            setLog]             = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString('zh-CN')}] ${msg}`, ...prev].slice(0, 50));

  const fetchStatus = useCallback(async () => {
    try {
      const [c, p, h] = await Promise.all([
        fetch(`${API}/crawler/status`).then((r) => r.json()),
        fetch(`${API}/pipeline/status`).then((r) => r.json()),
        fetch(`${API}/health`).then((r) => r.json()),
      ]);
      setCrawlerStatus(c);
      setPipelineStatus(p);
      setHealth(h);
    } catch {
      addLog('❌ 无法连接后端，请确认后端已启动（uvicorn main:app --port 8000）');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 5000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  async function runCrawler() {
    setCrawlerTask('running');
    addLog('🕷️ 爬虫启动中...');
    try {
      const r = await fetch(`${API}/crawler/run`, { method: 'POST' }).then((r) => r.json());
      addLog(`✅ ${r.message}`);
      setCrawlerTask('success');
    } catch {
      addLog('❌ 爬虫触发失败');
      setCrawlerTask('error');
    }
  }

  async function runPipeline() {
    setPipelineTask('running');
    addLog('🤖 AI 流水线启动中...');
    try {
      const r = await fetch(`${API}/pipeline/run`, { method: 'POST' }).then((r) => r.json());
      addLog(`✅ ${r.message}`);
      setPipelineTask('success');
    } catch {
      addLog('❌ 流水线触发失败');
      setPipelineTask('error');
    }
  }

  async function runFull() {
    setFullTask('running');
    addLog('🚀 完整任务启动：爬虫 → AI 简报');
    await runCrawler();
    setTimeout(async () => {
      addLog('⏳ 等待爬虫完成后启动 AI 流水线...');
      await runPipeline();
      setFullTask('success');
      addLog('🎉 完整任务完成！刷新首页查看最新简报');
    }, 8000);
  }

  const btnClass = (task: TaskStatus, color: string) => {
    const base = 'px-5 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-2 text-sm';
    if (task === 'running') return `${base} bg-gray-400 cursor-not-allowed`;
    if (task === 'success') return `${base} bg-green-600`;
    if (task === 'error')   return `${base} bg-red-500`;
    return `${base} ${color} hover:opacity-90 active:scale-95`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">系统管理</h1>
        <p className="text-gray-500 mt-1 text-sm">手动触发数据更新，查看自动调度状态</p>
      </div>

      {/* 手动操作 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1">手动触发</h2>
        <p className="text-gray-400 text-xs mb-5">适合首次初始化或临时补充数据</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={runCrawler} disabled={crawlerTask === 'running'} className={btnClass(crawlerTask, 'bg-blue-600')}>
            {crawlerTask === 'running' ? '⏳ 爬取中...' : crawlerTask === 'success' ? '✅ 爬取完成' : '🕷️ 立即爬取数据'}
          </button>
          <button onClick={runPipeline} disabled={pipelineTask === 'running'} className={btnClass(pipelineTask, 'bg-violet-600')}>
            {pipelineTask === 'running' ? '⏳ 生成中...' : pipelineTask === 'success' ? '✅ 简报已生成' : '🤖 生成 AI 简报'}
          </button>
          <button onClick={runFull} disabled={fullTask === 'running'} className={btnClass(fullTask, 'bg-gradient-to-r from-blue-600 to-violet-600')}>
            {fullTask === 'running' ? '⏳ 运行中...' : fullTask === 'success' ? '✅ 全部完成' : '🚀 一键全部更新'}
          </button>
        </div>

        {/* 执行日志 */}
        {log.length > 0 && (
          <div className="mt-4 bg-gray-950 rounded-lg p-4 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className={l.includes('❌') ? 'text-red-400' : l.includes('✅') || l.includes('🎉') ? 'text-green-400' : 'text-gray-300'}>
                {l}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 实时状态 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 爬虫状态 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            🕷️ 爬虫状态
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${crawlerStatus?.running ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
              {crawlerStatus?.running ? '运行中' : '空闲'}
            </span>
          </h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>上次运行：<span className="text-gray-900 font-medium">{crawlerStatus?.last_run ?? '从未'}</span></p>
            <p>入库条数：<span className="text-gray-900 font-medium">{crawlerStatus?.last_count ?? 0} 条</span></p>
            {crawlerStatus?.last_error && (
              <p className="text-red-500 text-xs">错误：{crawlerStatus.last_error}</p>
            )}
          </div>
        </div>

        {/* AI 简报状态 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            🤖 AI 简报状态
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pipelineStatus?.running ? 'bg-violet-100 text-violet-700 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
              {pipelineStatus?.running ? '生成中' : '空闲'}
            </span>
          </h3>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>今日简报：
              <span className={`font-medium ${pipelineStatus?.today_report.exists ? 'text-green-600' : 'text-gray-400'}`}>
                {pipelineStatus?.today_report.exists ? '✅ 已生成' : '⏳ 未生成'}
              </span>
            </p>
            {pipelineStatus?.today_report.exists && (
              <>
                <p>宏观评分：<span className="text-gray-900 font-medium">{pipelineStatus.today_report.macro_score}/100</span></p>
                <p>科技评分：<span className="text-gray-900 font-medium">{pipelineStatus.today_report.tech_score}/100</span></p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 自动调度计划 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-bold text-base mb-1">⏰ 自动调度计划</h2>
        <p className="text-gray-400 text-xs mb-4">后端启动后自动执行，无需手动干预</p>
        <div className="space-y-2">
          {health?.scheduled_jobs?.map((job) => (
            <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{JOB_LABELS[job.id] ?? job.id}</span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                下次：{job.next_run !== 'None' ? new Date(job.next_run).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
              </span>
            </div>
          ))}
          {!health && (
            <p className="text-sm text-red-400">⚠️ 后端未连接，请先启动：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">uvicorn main:app --port 8000</code></p>
          )}
        </div>
      </div>
    </div>
  );
}
