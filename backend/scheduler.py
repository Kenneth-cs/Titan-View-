"""
定时任务调度器
每日凌晨 4:00 自动执行全量爬取
手动运行：python scheduler.py
"""
import logging
import time
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from crawlers.rss import RssCrawler
from crawlers.hot_search import WeiboCrawler, BaiduHotCrawler
from crawlers.gov import ChinaGovCrawler, NdrcCrawler, StatsCrawler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scheduler")

ALL_CRAWLERS = [
    RssCrawler,
    WeiboCrawler,
    BaiduHotCrawler,
    ChinaGovCrawler,
    NdrcCrawler,
    StatsCrawler,
]


def run_all_crawlers():
    """执行所有爬虫，统计总入库数量"""
    start = datetime.now()
    logger.info(f"===== 爬虫任务开始 {start.strftime('%Y-%m-%d %H:%M:%S')} =====")

    total = 0
    for CrawlerClass in ALL_CRAWLERS:
        try:
            crawler = CrawlerClass()
            count = crawler.run()
            total += count
        except Exception as e:
            logger.error(f"{CrawlerClass.__name__} 异常: {e}")

    elapsed = (datetime.now() - start).seconds
    logger.info(f"===== 爬虫任务完成，共入库 {total} 条，耗时 {elapsed}s =====")
    return total


def run_pipeline():
    """执行 AI 流水线，生成每日简报"""
    logger.info("===== AI 流水线开始 =====")
    try:
        from ai.pipeline import run_pipeline as _pipeline
        report = _pipeline()
        logger.info(f"===== 简报生成完成，宏观={report.macro_score} 科技={report.tech_score} =====")
    except Exception as e:
        logger.error(f"AI 流水线异常: {e}")


def run_full_daily_job():
    """完整每日任务：先爬虫，再 AI 流水线"""
    run_all_crawlers()
    run_pipeline()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "--once":
            # 立即执行一次爬虫（用于测试）
            run_all_crawlers()
        elif sys.argv[1] == "--pipeline":
            # 单独触发 AI 流水线
            run_pipeline()
        elif sys.argv[1] == "--full":
            # 爬虫 + AI 流水线（完整流程）
            run_full_daily_job()
    else:
        # 启动定时调度
        scheduler = BlockingScheduler(timezone="Asia/Shanghai")

        # 每日凌晨 4:00 执行全量爬取
        scheduler.add_job(
            run_all_crawlers,
            trigger=CronTrigger(hour=4, minute=0),
            id="daily_crawl",
            name="每日全量爬取",
            replace_existing=True,
        )

        # 每日中午 12:00 补充爬取
        scheduler.add_job(
            run_all_crawlers,
            trigger=CronTrigger(hour=12, minute=0),
            id="noon_crawl",
            name="午间补充爬取",
            replace_existing=True,
        )

        # 每日早晨 6:00 生成 AI 简报（爬虫完成后）
        scheduler.add_job(
            run_pipeline,
            trigger=CronTrigger(hour=6, minute=0),
            id="morning_pipeline",
            name="晨间AI简报生成",
            replace_existing=True,
        )

        logger.info("调度器启动，执行时间：")
        logger.info("  04:00 — 全量爬取")
        logger.info("  06:00 — AI 简报生成")
        logger.info("  12:00 — 午间补充爬取")
        logger.info("立即测试：python scheduler.py --once | --pipeline | --full")

        try:
            scheduler.start()
        except KeyboardInterrupt:
            logger.info("调度器已停止")
