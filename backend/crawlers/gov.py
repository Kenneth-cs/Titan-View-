"""
政府网站爬虫
覆盖：中国政府网、国家发改委、国家统计局
这是「宏观政策」和「经济数据」维度的权威数据来源
"""
import re
from datetime import datetime
from bs4 import BeautifulSoup
from crawlers.base import BaseCrawler, NewsItem


class ChinaGovCrawler(BaseCrawler):
    """
    中国政府网 最新政策文件
    URL：https://www.gov.cn/zhengce/zuixin/
    """
    platform = "gov"
    section  = "policy"

    GOV_URL = "https://www.gov.cn/zhengce/zuixin/"

    def fetch(self) -> list[NewsItem]:
        items = []
        try:
            resp = self.get(self.GOV_URL, timeout=15)
            resp.encoding = "utf-8"
            soup = BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            self.logger.error(f"政府网站请求失败: {e}")
            return items

        # 解析文章列表
        for li in soup.select("ul.news_box li, .news-list li, li")[:30]:
            a_tag = li.find("a")
            if not a_tag:
                continue

            title = a_tag.get_text(strip=True)
            href  = a_tag.get("href", "")
            if not title or len(title) < 5:
                continue

            # 补全相对 URL
            if href.startswith("/"):
                href = f"https://www.gov.cn{href}"
            elif not href.startswith("http"):
                continue

            # 提取日期
            date_text = li.get_text()
            pub_time  = None
            date_match = re.search(r"(\d{4}-\d{2}-\d{2})", date_text)
            if date_match:
                try:
                    pub_time = datetime.strptime(date_match.group(1), "%Y-%m-%d")
                except ValueError:
                    pass

            items.append(NewsItem(
                source_platform="gov",
                title=title,
                url=href,
                publish_time=pub_time or datetime.now(),
                tags=["政府网", "政策", "国务院"],
                section="policy",
            ))

        return items[:20]


class NdrcCrawler(BaseCrawler):
    """
    国家发展和改革委员会 新闻动态
    URL：https://www.ndrc.gov.cn/xwdt/xwfb/
    """
    platform = "ndrc"
    section  = "policy"

    NDRC_URL = "https://www.ndrc.gov.cn/xwdt/xwfb/"

    def fetch(self) -> list[NewsItem]:
        items = []
        try:
            resp = self.get(self.NDRC_URL, timeout=15)
            resp.encoding = "utf-8"
            soup = BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            self.logger.error(f"发改委请求失败: {e}")
            return items

        for a_tag in soup.select("a[href]")[:50]:
            title = a_tag.get_text(strip=True)
            href  = a_tag.get("href", "")

            if len(title) < 8 or len(title) > 100:
                continue
            if "javascript" in href or "#" in href:
                continue

            if href.startswith("/"):
                href = f"https://www.ndrc.gov.cn{href}"
            elif not href.startswith("http"):
                continue

            items.append(NewsItem(
                source_platform="ndrc",
                title=title,
                url=href,
                publish_time=datetime.now(),
                tags=["发改委", "宏观政策", "产业政策"],
                section="policy",
            ))

            if len(items) >= 15:
                break

        return items


class StatsCrawler(BaseCrawler):
    """
    国家统计局 数据发布
    URL：https://www.stats.gov.cn/sj/zxfb/
    """
    platform = "stats"
    section  = "economy"

    STATS_URL = "https://www.stats.gov.cn/sj/zxfb/"

    def fetch(self) -> list[NewsItem]:
        items = []
        try:
            resp = self.get(self.STATS_URL, timeout=15)
            resp.encoding = "utf-8"
            soup = BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            self.logger.error(f"统计局请求失败: {e}")
            return items

        for a_tag in soup.select("a[href]")[:50]:
            title = a_tag.get_text(strip=True)
            href  = a_tag.get("href", "")

            if len(title) < 8 or len(title) > 100:
                continue
            if "javascript" in href or "#" in href:
                continue

            if href.startswith("/"):
                href = f"https://www.stats.gov.cn{href}"
            elif not href.startswith("http"):
                continue

            items.append(NewsItem(
                source_platform="stats",
                title=title,
                url=href,
                publish_time=datetime.now(),
                tags=["国家统计局", "经济数据", "PMI"],
                section="economy",
            ))

            if len(items) >= 15:
                break

        return items


# ─────────────────────────────────────────
# 单独运行测试
# ─────────────────────────────────────────
if __name__ == "__main__":
    for CrawlerClass in [ChinaGovCrawler, NdrcCrawler, StatsCrawler]:
        c = CrawlerClass()
        items = c.fetch()
        print(f"\n--- {c.platform} ({len(items)} 条) ---")
        for item in items[:3]:
            print(f"  {item.title[:60]}")
            print(f"  {item.url[:80]}")
