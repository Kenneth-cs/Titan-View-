from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import news, reports, chat
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Titan View API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)
app.include_router(reports.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Titan View API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
