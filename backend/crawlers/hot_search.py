"""
热搜榜爬虫
覆盖：微博热搜 Top50、百度热榜 Top30
这两个榜单反映中国社会情绪，是「消费与社会情绪」维度的核心数据源
"""
import json
import re
from datetime import datetime
from crawlers.base import BaseCrawler, NewsItem


class WeiboCrawler(BaseCrawler):
    """
    微博热搜爬虫
    接口：微博开放的热搜榜 JSON 接口
    过滤：去除纯娱乐明星话题，保留财经/社会/科技类
    """
    platform = "weibo"
    section  = "consumer"

    WEIBO_HOT_URL = "https://weibo.com/ajax/side/hotSearch"

    # 过滤关键词：包含这些词的话题才保留
    KEEP_KEYWORDS = [
        "经济", "股市", "A股", "楼市", "房价", "央行", "美联储",
        "AI", "人工智能", "科技", "半导体", "芯片",
        "就业", "裁员", "消费", "降价", "涨价",
        "政策", "监管", "法规", "政府",
        "大学", "考研", "考公", "职场",
        "创业", "融资", "上市", "IPO",
        "能源", "新能源", "电动车",
    ]

    def _should_keep(self, title: str) -> bool:
        """判断话题是否值得保留（非纯娱乐）"""
        for kw in self.KEEP_KEYWORDS:
            if kw in title:
                return True
        return False

    def fetch(self) -> list[NewsItem]:
        items = []
        try:
            resp = self.get(self.WEIBO_HOT_URL, timeout=10)
            data = resp.json()
            hot_list = data.get("data", {}).get("realtime", [])
        except Exception as e:
            self.logger.error(f"微博热搜接口请求失败: {e}")
            return items

        for entry in hot_list[:50]:
            title = entry.get("word", "").strip()
            if not title:
                continue
            if not self._should_keep(title):
                continue

            rank     = entry.get("num", 0)
            hot_word = entry.get("word_scheme", f"#{title}#")
            url      = f"https://s.weibo.com/weibo?q={hot_word}"

            items.append(NewsItem(
                source_platform="weibo",
                title=f"【微博热搜】{title}",
                url=url,
                content=f"热度：{rank}，话题：{hot_word}",
                publish_time=datetime.now(),
                tags=["微博热搜", "社会情绪", title[:10]],
                section="consumer",
            ))

        self.logger.info(f"微博热搜过滤后保留 {len(items)} 条财经/社会类话题")
        return items


class BaiduHotCrawler(BaseCrawler):
    """
    百度热榜爬虫
    接口：百度热搜榜公开 JSON 接口
    """
    platform = "baidu"
    section  = "consumer"

    BAIDU_HOT_URL = "https://top.baidu.com/api/board?platform=wise&tab=realtime"

    def fetch(self) -> list[NewsItem]:
        items = []
        try:
            resp = self.get(self.BAIDU_HOT_URL, timeout=10)
            data = resp.json()
            board_list = data.get("data", {}).get("cards", [{}])[0].get("content", [])
        except Exception as e:
            self.logger.error(f"百度热榜接口请求失败: {e}")
            return items

        for entry in board_list[:30]:
            title = entry.get("word", "").strip()
            url   = entry.get("url", f"https://www.baidu.com/s?wd={title}")
            desc  = entry.get("desc", "")
            hot   = entry.get("hotScore", 0)

            if not title:
                continue

            items.append(NewsItem(
                source_platform="baidu",
                title=f"【百度热榜】{title}",
                url=url,
                content=f"{desc} 热度值：{hot}" if desc else f"热度值：{hot}",
                publish_time=datetime.now(),
                tags=["百度热榜", "热搜", "社会情绪"],
                section="consumer",
            ))

        return items


# ─────────────────────────────────────────
# 单独运行测试
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("--- 微博热搜 ---")
    w = WeiboCrawler()
    for item in w.fetch()[:5]:
        print(f"  {item.title}")

    print("\n--- 百度热榜 ---")
    b = BaiduHotCrawler()
    for item in b.fetch()[:5]:
        print(f"  {item.title}")
