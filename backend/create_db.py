from sqlalchemy import create_engine
from database import Base, engine
from models import RawNews, DailyReport, TitanInsight

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Tables created successfully.")
