"""
RSS 通用爬虫
覆盖：新华社、新浪财经、36氪、Hacker News、财新、证券时报
RSS 最稳定，无需 JS 渲染，无反爬风险，是首选数据源
"""
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from crawlers.base import BaseCrawler, NewsItem

# ─────────────────────────────────────────
# RSS 源配置表
# ─────────────────────────────────────────
RSS_SOURCES = [
    # 新华社
    {
        "platform": "xinhua",
        "section":  "policy",
        "name":     "新华社 - 时政",
        "url":      "https://feeds.bbci.co.uk/zhongwen/simp/china/rss.xml",
        "tags":     ["政策", "时政", "新华社"],
    },
    # 新浪财经
    {
        "platform": "sina",
        "section":  "market",
        "name":     "新浪财经 - 宏观",
        "url":      "https://rss.sina.com.cn/news/global/finance.xml",
        "tags":     ["金融", "资本市场", "新浪财经"],
    },
    # 36氪 - 科技
    {
        "platform": "36kr",
        "section":  "tech",
        "name":     "36氪 - 科技",
        "url":      "https://36kr.com/feed",
        "tags":     ["创投", "科技", "36氪"],
    },
    # Hacker News Top
    {
        "platform": "hackernews",
        "section":  "tech",
        "name":     "Hacker News Top",
        "url":      "https://hnrss.org/frontpage",
        "tags":     ["AI", "硬科技", "HackerNews"],
    },
    # 财新网
    {
        "platform": "caixin",
        "section":  "economy",
        "name":     "财新 - 经济",
        "url":      "https://www.caixin.com/rss/home.xml",
        "tags":     ["财经", "经济数据", "财新"],
    },
    # 证券时报
    {
        "platform": "stcn",
        "section":  "market",
        "name":     "证券时报",
        "url":      "https://www.stcn.com/rss.xml",
        "tags":     ["A股", "资本市场", "证券时报"],
    },
    # 路透中文 - 国际
    {
        "platform": "reuters",
        "section":  "global",
        "name":     "路透中文 - 国际",
        "url":      "https://cn.reuters.com/rssFeed/CNTopNews",
        "tags":     ["国际", "地缘政治", "路透社"],
    },
]

# RSS 命名空间
NS = {
    "atom":    "http://www.w3.org/2005/Atom",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "media":   "http://search.yahoo.com/mrss/",
}


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return parsedate_to_datetime(date_str)
    except Exception:
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except Exception:
            return None


def _parse_rss_feed(xml_text: str, platform: str, section: str, tags: list[str]) -> list[NewsItem]:
    """解析标准 RSS 2.0 / Atom feed"""
    items = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return items

    # 尝试 RSS 2.0
    for item in root.findall(".//item"):
        title = item.findtext("title", "").strip()
        url   = item.findtext("link",  "").strip()
        if not title or not url:
            continue
        desc  = item.findtext("description", "").strip()
        pub   = _parse_date(item.findtext("pubDate"))
        items.append(NewsItem(
            source_platform=platform,
            title=title,
            url=url,
            content=desc[:500] if desc else "",
            publish_time=pub,
            tags=tags.copy(),
            section=section,
        ))

    # 尝试 Atom
    if not items:
        for entry in root.findall(".//{http://www.w3.org/2005/Atom}entry"):
            title = (entry.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
            link_el = entry.find("{http://www.w3.org/2005/Atom}link")
            url = (link_el.get("href") if link_el is not None else "") or ""
            if not title or not url:
                continue
            summary = (entry.findtext("{http://www.w3.org/2005/Atom}summary") or "").strip()
            pub = _parse_date(entry.findtext("{http://www.w3.org/2005/Atom}updated"))
            items.append(NewsItem(
                source_platform=platform,
                title=title,
                url=url,
                content=summary[:500],
                publish_time=pub,
                tags=tags.copy(),
                section=section,
            ))

    return items


class RssCrawler(BaseCrawler):
    """RSS 通用爬虫，一次运行拉取所有配置的 RSS 源"""

    platform = "rss_multi"
    section  = "mixed"

    def fetch(self) -> list[NewsItem]:
        all_items: list[NewsItem] = []
        for source in RSS_SOURCES:
            self.logger.info(f"  拉取 {source['name']} ({source['url']})")
            try:
                resp = self.get(source["url"], timeout=15)
                items = _parse_rss_feed(
                    resp.text,
                    platform=source["platform"],
                    section=source["section"],
                    tags=source["tags"],
                )
                self.logger.info(f"  ✓ {source['name']} 获取 {len(items)} 条")
                all_items.extend(items)
            except Exception as e:
                self.logger.warning(f"  ✗ {source['name']} 失败: {e}")
        return all_items


# ─────────────────────────────────────────
# 单独运行测试
# ─────────────────────────────────────────
if __name__ == "__main__":
    crawler = RssCrawler()
    count = crawler.run()
    print(f"共写入 {count} 条新闻")
