"""
POST /pipeline/run   — 手动触发完整 AI 流水线
GET  /pipeline/status — 查看今日简报状态
"""
from __future__ import annotations

import logging
from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import DailyReport

router = APIRouter(prefix="/pipeline", tags=["pipeline"])
logger = logging.getLogger(__name__)

_running = False


def _run_in_background():
    global _running
    _running = True
    try:
        from ai.pipeline import run_pipeline
        run_pipeline()
        logger.info("[Pipeline] 后台任务完成")
    except Exception as e:
        logger.error(f"[Pipeline] 后台任务失败: {e}")
    finally:
        _running = False


@router.post("/run")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    """手动触发 AI 流水线，在后台异步执行"""
    if _running:
        return {"status": "already_running", "message": "流水线已在运行中，请稍候"}
    background_tasks.add_task(_run_in_background)
    return {"status": "started", "message": "AI 流水线已启动，通常需要 30-60 秒，请稍后刷新"}


@router.get("/status")
async def pipeline_status(db: Session = Depends(get_db)):
    """查询今日简报生成状态"""
    report = db.query(DailyReport).filter(DailyReport.report_date == date.today()).first()
    return {
        "running": _running,
        "today_report": {
            "exists": report is not None,
            "macro_score": report.macro_score if report else None,
            "tech_score":  report.tech_score  if report else None,
            "created_at":  str(report.created_at) if report else None,
        },
    }
