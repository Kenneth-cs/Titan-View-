"""
爬虫基础模块：通用工具函数 + 数据入库逻辑
所有爬虫继承 BaseCrawler 并实现 fetch() 方法
"""
from __future__ import annotations

import hashlib
import logging
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from sqlalchemy.orm import Session
from database import SessionLocal
from models import RawNews

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


@dataclass
class NewsItem:
    """爬虫的统一输出格式"""
    source_platform: str          # 平台标识，如 'xinhua', 'weibo', 'sina'
    title: str                    # 新闻标题
    url: str                      # 原文链接（用于去重）
    content: str = ""             # 正文摘要（可为空）
    author: str = ""
    publish_time: Optional[datetime] = None
    tags: list[str] = field(default_factory=list)
    section: str = ""             # 对应首页维度，如 'policy', 'market', 'tech'


class BaseCrawler:
    """所有爬虫的基类"""

    platform: str = "unknown"
    section: str = "unknown"

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch(self) -> list[NewsItem]:
        """子类必须实现，返回 NewsItem 列表"""
        raise NotImplementedError

    def get(self, url: str, timeout: int = 10, **kwargs) -> requests.Response:
        """带错误处理的 GET 请求"""
        try:
            resp = self.session.get(url, timeout=timeout, **kwargs)
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            self.logger.error(f"GET {url} 失败: {e}")
            raise

    def run(self) -> int:
        """执行爬取并写入数据库，返回新增条数"""
        self.logger.info(f"[{self.platform}] 开始爬取...")
        try:
            items = self.fetch()
        except Exception as e:
            self.logger.error(f"[{self.platform}] 爬取失败: {e}")
            return 0

        saved = 0
        db: Session = SessionLocal()
        try:
            for item in items:
                if not item.title or not item.url:
                    continue
                # 以 url md5 做唯一索引，防重
                url_hash = hashlib.md5(item.url.encode()).hexdigest()
                exists = db.query(RawNews).filter(RawNews.url == item.url).first()
                if exists:
                    continue
                news = RawNews(
                    source_platform=item.source_platform,
                    title=item.title,
                    content=item.content,
                    url=item.url,
                    publish_time=item.publish_time or datetime.now(),
                    author=item.author,
                    tags=item.tags + ([item.section] if item.section else []),
                    status=0,
                )
                db.add(news)
                saved += 1
            db.commit()
        except Exception as e:
            db.rollback()
            self.logger.error(f"[{self.platform}] 数据库写入失败: {e}")
        finally:
            db.close()

        self.logger.info(f"[{self.platform}] 完成，新增 {saved} 条")
        return saved
