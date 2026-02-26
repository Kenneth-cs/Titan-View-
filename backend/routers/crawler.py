"""
POST /crawler/run    — 手动触发全量爬虫
GET  /crawler/status — 查询爬虫运行状态
"""
from __future__ import annotations

import logging
import threading
from datetime import datetime

from fastapi import APIRouter

router = APIRouter(prefix="/crawler", tags=["crawler"])
logger = logging.getLogger(__name__)

# 全局状态（单进程内共享）
_state: dict = {
    "running": False,
    "last_run": None,
    "last_count": 0,
    "last_error": None,
}


def _do_crawl():
    from crawlers.rss import RssCrawler
    from crawlers.hot_search import WeiboCrawler, BaiduHotCrawler
    from crawlers.gov import ChinaGovCrawler, NdrcCrawler, StatsCrawler

    ALL = [RssCrawler, WeiboCrawler, BaiduHotCrawler, ChinaGovCrawler, NdrcCrawler, StatsCrawler]
    total = 0
    for Cls in ALL:
        try:
            total += Cls().run()
        except Exception as e:
            logger.error(f"{Cls.__name__} 异常: {e}")
    return total


def _run_in_background():
    global _state
    _state["running"] = True
    _state["last_error"] = None
    try:
        count = _do_crawl()
        _state["last_count"] = count
        _state["last_run"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"[Crawler] 手动触发完成，入库 {count} 条")
    except Exception as e:
        _state["last_error"] = str(e)
        logger.error(f"[Crawler] 手动触发失败: {e}")
    finally:
        _state["running"] = False


@router.post("/run")
async def run_crawler():
    if _state["running"]:
        return {"status": "already_running", "message": "爬虫正在运行中，请稍候（通常 30-60 秒）"}
    threading.Thread(target=_run_in_background, daemon=True).start()
    return {"status": "started", "message": "爬虫已启动，正在后台运行..."}


@router.get("/status")
async def crawler_status():
    return {
        "running":    _state["running"],
        "last_run":   _state["last_run"],
        "last_count": _state["last_count"],
        "last_error": _state["last_error"],
    }
