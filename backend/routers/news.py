from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import RawNews

router = APIRouter(
    prefix="/news",
    tags=["news"],
)

SECTION_MAP = {
    "policy":   ["gov", "ndrc", "xinhua"],
    "global":   ["reuters", "xinhua"],
    "market":   ["sina", "stcn"],
    "tech":     ["36kr", "hackernews"],
    "consumer": ["weibo", "baidu"],
    "industry": ["36kr", "caixin"],
    "vc":       ["36kr"],
    "economy":  ["stats", "caixin"],
}


@router.get("/")
def list_news(
    skip:     int            = 0,
    limit:    int            = 20,
    section:  Optional[str] = Query(None, description="维度筛选：policy/global/market/tech/consumer/industry/vc/economy"),
    platform: Optional[str] = Query(None, description="平台筛选：weibo/baidu/xinhua/sina/36kr/gov..."),
    db: Session = Depends(get_db),
):
    query = db.query(RawNews).order_by(RawNews.crawl_time.desc())

    if platform:
        query = query.filter(RawNews.source_platform == platform)
    elif section and section in SECTION_MAP:
        platforms = SECTION_MAP[section]
        query = query.filter(RawNews.source_platform.in_(platforms))

    total = query.count()
    news  = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id":              n.id,
                "source_platform": n.source_platform,
                "title":           n.title,
                "url":             n.url,
                "content":         n.content,
                "publish_time":    n.publish_time.isoformat() if n.publish_time else None,
                "tags":            n.tags or [],
            }
            for n in news
        ],
    }


@router.get("/sections")
def get_sections():
    """返回维度与平台的对应关系（供前端筛选器使用）"""
    return SECTION_MAP
