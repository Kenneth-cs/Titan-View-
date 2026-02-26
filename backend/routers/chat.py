from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.personas import get_persona, PERSONAS
from ai.volcengine import chat

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


class AskTitanRequest(BaseModel):
    question: str
    persona_ids: list[str]  # 支持同时问多个大佬，最多4个


class TitanResponse(BaseModel):
    persona_id: str
    name: str
    title: str
    avatar_hint: str
    answer: str


class AskTitanResponse(BaseModel):
    question: str
    responses: list[TitanResponse]


AVATAR_MAP = {
    "li_ka_shing":  "🏦",
    "elon_musk":    "🚀",
    "buffett":      "📊",
    "munger":       "🧠",
    "ren_zhengfei": "🔧",
    "zhang_lei":    "🌱",
    "jensen_huang": "💻",
    "lei_jun":      "🌪️",
}


@router.post("/ask-titan", response_model=AskTitanResponse)
async def ask_titan(req: AskTitanRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="问题不能为空")
    if len(req.persona_ids) == 0:
        raise HTTPException(status_code=400, detail="至少选择一位大佬")
    if len(req.persona_ids) > 4:
        raise HTTPException(status_code=400, detail="最多同时询问4位大佬")

    responses = []
    for pid in req.persona_ids:
        try:
            persona = get_persona(pid)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        answer = chat(
            system_prompt=persona["system_prompt"],
            user_message=req.question,
            temperature=0.7,
        )
        responses.append(TitanResponse(
            persona_id=pid,
            name=persona["name"],
            title=persona["title"],
            avatar_hint=AVATAR_MAP.get(pid, "👤"),
            answer=answer,
        ))

    return AskTitanResponse(question=req.question, responses=responses)


@router.get("/personas")
def list_personas():
    """返回所有可用大佬列表（供前端渲染选择器）"""
    return [
        {
            "id": pid,
            "name": p["name"],
            "title": p["title"],
            "avatar_hint": AVATAR_MAP.get(pid, "👤"),
        }
        for pid, p in PERSONAS.items()
    ]
