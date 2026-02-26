from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import RawNews

router = APIRouter(
    prefix="/news",
    tags=["news"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[dict])
def read_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    news = db.query(RawNews).offset(skip).limit(limit).all()
    return news
