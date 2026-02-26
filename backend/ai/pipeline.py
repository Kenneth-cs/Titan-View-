"""
三步 AI 流水线
Step 1: 对今日 RawNews 进行维度分类（policy/global/market/tech/consumer/industry/vc/economy）
Step 2: 每个维度挑选最相关的 3-5 条，生成巨头视角洞察
Step 3: 合并成完整 Markdown 格式的每日决策简报，并写入 DailyReport 表
"""
from __future__ import annotations

import json
import logging
import os
import sys
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import DailyReport, RawNews

logger = logging.getLogger(__name__)

# 维度定义
SECTIONS: dict[str, str] = {
    "policy":   "宏观政策（政府文件、央行货币政策、监管动态、财税改革）",
    "global":   "国际形势（地缘政治、中美关系、外贸进出口、汇率变动）",
    "market":   "资本市场（A股港股美股、大宗商品、债券、加密货币）",
    "tech":     "AI与硬科技（人工智能、芯片、新材料、量子计算）",
    "consumer": "消费与社会情绪（消费趋势、社会热点、舆论动向）",
    "industry": "产业赛道（新能源、生物医药、房地产、汽车）",
    "vc":       "创投生态（融资并购、IPO、独角兽、投资机构动态）",
    "economy":  "经济数据（GDP、PMI、CPI、就业、外汇储备）",
}

SECTION_TITLES: dict[str, str] = {
    "policy":   "🏛️ 宏观政策",
    "global":   "🌏 国际形势",
    "market":   "📈 资本市场",
    "tech":     "🤖 AI 与硬科技",
    "consumer": "🛍️ 消费与社会情绪",
    "industry": "⚡ 产业赛道",
    "vc":       "🦄 创投生态",
    "economy":  "📊 经济数据",
}

TITAN_PERSPECTIVES = """
以下是你需要模拟的8位巨头视角：
- 李嘉诚（稳健资本主义，现金为王，逆向布局）
- 巴菲特（价值投资，护城河，长期持有）
- 查理·芒格（多元思维模型，逆向思考，避免蠢事）
- 任正非（技术自主，组织韧性，华为生存哲学）
- 张磊（长期主义，中国消费升级，深度研究）
- 马斯克（第一性原理，指数增长，颠覆性创新）
- 黄仁勋（AI基础设施，算力即未来）
- 雷军（风口判断，生态整合，极致效率）
"""


def _ai_classify(titles_text: str) -> dict[str, list[int]]:
    """
    Step 1: 调用 AI 将新闻列表分类到八大维度。
    返回 {section: [news_id, ...]}
    """
    try:
        from ai.volcengine import chat
        prompt = f"""
你是一个专业的财经信息分类助手。请将下面的新闻列表分类到对应的维度中。

维度说明：
{json.dumps(SECTIONS, ensure_ascii=False, indent=2)}

新闻列表（格式：ID | 标题）：
{titles_text}

请返回 JSON，格式为 {{"policy": [id1, id2, ...], "global": [...], ...}}
只返回 JSON，不要有其他文字。如果某维度无对应新闻，值为空数组。
"""
        result = chat("你是专业的财经信息分类助手，用JSON格式回复。", prompt, temperature=0.2)
        # 提取 JSON 部分
        start = result.find('{')
        end   = result.rfind('}') + 1
        if start == -1 or end == 0:
            logger.warning("AI 分类未返回有效 JSON，fallback 到空分类")
            return {k: [] for k in SECTIONS}
        return json.loads(result[start:end])
    except Exception as e:
        logger.warning(f"AI 分类失败（可能 API 未配置）: {e}")
        return {k: [] for k in SECTIONS}


def _ai_generate_brief(section_news: dict[str, list[dict]]) -> tuple[str, int, int]:
    """
    Step 3: 生成完整 Markdown 简报。
    返回 (markdown, macro_score, tech_score)
    """
    try:
        from ai.volcengine import chat

        sections_text = ""
        for sec, items in section_news.items():
            if not items:
                continue
            title = SECTION_TITLES.get(sec, sec)
            sections_text += f"\n\n### {title}\n"
            for it in items[:20]:
                sections_text += f"- {it['title']}\n"

        prompt = f"""
你是一位顶级商业决策顾问，请根据今日情报生成每日晨间决策简报。

{TITAN_PERSPECTIVES}

今日关键情报：
{sections_text}

请生成一份专业的 Markdown 格式简报，包含：
1. **今日市场概述**（2-3句）
2. **八大维度解读**（每个维度2-3条要点，结合巨头视角）
3. **今日信号灯**：
   - 🔴 风险预警（2-3条）
   - 🟢 机会信号（2-3条）
   - 🔵 价值洼地（1-2条）
4. **宏观评分** (0-100) 和 **科技评分** (0-100)（最后单独一行，格式：SCORES: macro=XX tech=XX）

保持专业、简洁，面向企业家和投资人。
"""
        result = chat(
            "你是顶级商业决策顾问，生成专业的投资决策简报。",
            prompt,
            temperature=0.6,
        )

        # 提取评分
        macro_score, tech_score = 70, 70
        for line in result.splitlines():
            if line.strip().startswith("SCORES:"):
                parts = line.replace("SCORES:", "").strip().split()
                for p in parts:
                    if p.startswith("macro="):
                        macro_score = int(p.split("=")[1])
                    elif p.startswith("tech="):
                        tech_score = int(p.split("=")[1])
                result = result.replace(line, "").strip()
                break

        return result, macro_score, tech_score

    except Exception as e:
        logger.warning(f"AI 生成简报失败: {e}")
        # Fallback：用规则生成简单 Markdown
        sections_md = ""
        for sec, items in section_news.items():
            if not items:
                continue
            title = SECTION_TITLES.get(sec, sec)
            sections_md += f"\n### {title}\n"
            for it in items[:20]:
                sections_md += f"- [{it['title']}]({it.get('url', '#')})\n"

        md = f"# 每日晨间决策简报\n\n> ⚠️ AI 简报生成失败（API 未配置），以下为原始情报汇总\n\n{sections_md}"
        return md, 70, 70


def run_pipeline(target_date: date | None = None) -> DailyReport:
    """
    执行完整的三步 AI 流水线，生成并保存 DailyReport。
    如果当天简报已存在则先删除再重建。
    """
    if target_date is None:
        target_date = date.today()

    db = SessionLocal()
    try:
        # 删除已有简报（允许重跑）
        existing = db.query(DailyReport).filter(DailyReport.report_date == target_date).first()
        if existing:
            db.delete(existing)
            db.commit()

        # 取最近24小时新闻
        since = datetime.combine(target_date, datetime.min.time()) - timedelta(hours=6)
        news_items = (
            db.query(RawNews)
            .filter(RawNews.crawl_time >= since)
            .order_by(RawNews.crawl_time.desc())
            .limit(200)
            .all()
        )

        if not news_items:
            logger.warning(f"[Pipeline] {target_date} 无新闻，生成空简报")
            report = DailyReport(
                report_date=target_date,
                summary_markdown="# 今日暂无情报\n\n请先运行爬虫：`python scheduler.py --once`",
                macro_score=None,
                tech_score=None,
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            return report

        logger.info(f"[Pipeline] Step 1: 对 {len(news_items)} 条新闻进行分类...")
        titles_text = "\n".join(f"{n.id} | {n.title}" for n in news_items)
        classified   = _ai_classify(titles_text)

        # 构建分类映射 {id: news_obj}
        news_map = {n.id: n for n in news_items}

        # 如果分类全为空（AI 未配置），按来源平台做简单映射
        total_classified = sum(len(v) for v in classified.values())
        if total_classified == 0:
            logger.info("[Pipeline] 分类结果为空，使用平台规则分类")
            PLATFORM_SECTION_MAP = {
                "gov":   "policy", "ndrc": "policy", "stats": "economy",
                "xinhua": "global", "reuters": "global", "sina": "market",
                "stcn": "market", "caixin": "market", "36kr": "vc",
                "hackernews": "tech", "weibo": "consumer", "baidu": "consumer",
            }
            for n in news_items:
                sec = PLATFORM_SECTION_MAP.get(n.source_platform, "global")
                classified.setdefault(sec, []).append(n.id)

            # 用 tags 覆盖
            for n in news_items:
                if n.tags:
                    for t in (n.tags if isinstance(n.tags, list) else []):
                        if t in SECTIONS:
                            for sec in classified.values():
                                if n.id in sec:
                                    sec.remove(n.id)
                            classified.setdefault(t, []).append(n.id)
                            break

        # 更新 RawNews.tags 为分类结果
        for sec, ids in classified.items():
            for nid in ids:
                n = news_map.get(nid)
                if n:
                    existing_tags = list(n.tags) if n.tags else []
                    if sec not in existing_tags:
                        existing_tags = [sec] + [t for t in existing_tags if t != sec]
                    n.tags = existing_tags[:5]
        db.commit()

        logger.info("[Pipeline] Step 2: 构建各维度新闻摘要...")
        section_news: dict[str, list[dict]] = {}
        for sec, ids in classified.items():
            section_news[sec] = []
            for nid in ids[:20]:
                n = news_map.get(nid)
                if n:
                    section_news[sec].append({
                        "id": n.id, "title": n.title,
                        "url": n.url or "", "platform": n.source_platform,
                    })

        logger.info("[Pipeline] Step 3: 生成 AI 简报...")
        summary_md, macro_score, tech_score = _ai_generate_brief(section_news)

        report = DailyReport(
            report_date=target_date,
            summary_markdown=summary_md,
            macro_score=macro_score,
            tech_score=tech_score,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        logger.info(f"[Pipeline] 简报生成完成，宏观={macro_score} 科技={tech_score}")
        return report

    finally:
        db.close()


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)
    d = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else date.today()
    r = run_pipeline(d)
    print(f"\n=== 简报生成完成 ===\n日期: {r.report_date}\n宏观评分: {r.macro_score}\n科技评分: {r.tech_score}")
    print(f"\n--- 简报预览 (前500字) ---\n{(r.summary_markdown or '')[:500]}...")
