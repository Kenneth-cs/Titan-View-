from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from database import get_db
from models import DailyReport

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{report_date}", response_model=dict)
def read_report(report_date: date, db: Session = Depends(get_db)):
    report = db.query(DailyReport).filter(DailyReport.report_date == report_date).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
