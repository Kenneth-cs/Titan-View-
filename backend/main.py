from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import chat, crawler, news, pipeline, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")

Base.metadata.create_all(bind=engine)

# ── 定时调度器 ────────────────────────────────────────────
_scheduler = BackgroundScheduler(timezone="Asia/Shanghai")


def _crawl_job():
    """定时爬虫任务"""
    from routers.crawler import _run_in_background
    _run_in_background()


def _pipeline_job():
    """定时 AI 简报生成"""
    try:
        from ai.pipeline import run_pipeline
        run_pipeline()
    except Exception as e:
        logger.error(f"定时简报生成失败: {e}")


# 04:00 全量爬取
_scheduler.add_job(_crawl_job, CronTrigger(hour=4,  minute=0), id="crawl_04", replace_existing=True)
# 06:00 AI 简报（爬取完成后）
_scheduler.add_job(_pipeline_job, CronTrigger(hour=6, minute=0), id="pipeline_06", replace_existing=True)
# 12:00 午间补充爬取
_scheduler.add_job(_crawl_job, CronTrigger(hour=12, minute=0), id="crawl_12", replace_existing=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时开始调度
    _scheduler.start()
    logger.info("✅ 定时调度器已启动：04:00 爬取 / 06:00 AI简报 / 12:00 补充爬取")
    yield
    # 关闭时停止调度
    _scheduler.shutdown(wait=False)
    logger.info("调度器已停止")


# ── FastAPI 应用 ──────────────────────────────────────────
app = FastAPI(title="Titan View API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)
app.include_router(reports.router)
app.include_router(chat.router)
app.include_router(pipeline.router)
app.include_router(crawler.router)


@app.get("/")
def read_root():
    return {"message": "Titan View API v0.2 — 自动调度已启用"}


@app.get("/health")
def health_check():
    jobs = [
        {"id": j.id, "next_run": str(j.next_run_time)}
        for j in _scheduler.get_jobs()
    ]
    return {"status": "ok", "scheduled_jobs": jobs}
