from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class RawNews(Base):
    __tablename__ = "raw_news"

    id = Column(Integer, primary_key=True, index=True)
    source_platform = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text)
    url = Column(String(1000), unique=True, index=True)
    publish_time = Column(DateTime)
    crawl_time = Column(DateTime, server_default=func.now())
    author = Column(String(100))
    tags = Column(JSON)
    status = Column(Integer, default=0) # 0: Unprocessed, 1: Processed

    insights = relationship("TitanInsight", back_populates="news")

class DailyReport(Base):
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(Date, unique=True, nullable=False, index=True)
    summary_markdown = Column(Text) # MEDIUMTEXT in MySQL, Text in SQLite
    macro_score = Column(Integer)
    tech_score = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

class TitanInsight(Base):
    __tablename__ = "titan_insights"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("raw_news.id"))
    persona = Column(String(50)) # 'li_ka_shing', 'elon_musk'
    insight_text = Column(Text)
    sentiment_score = Column(Float)
    relevance_score = Column(Float)

    news = relationship("RawNews", back_populates="insights")
