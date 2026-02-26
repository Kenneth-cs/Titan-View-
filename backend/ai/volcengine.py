"""
火山引擎 (Volcengine) AI 调用封装
兼容 OpenAI SDK 接口规范，调用 DeepSeek / Doubao-pro 模型
"""
from __future__ import annotations
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("VOLCENGINE_API_KEY")
        base_url = os.getenv("VOLCENGINE_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
        if not api_key:
            raise ValueError("VOLCENGINE_API_KEY 未配置，请在 .env 文件中设置")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


def chat(system_prompt: str, user_message: str, temperature: float = 0.7) -> str:
    """
    通用 Chat 调用
    :param system_prompt: 系统角色提示词
    :param user_message: 用户消息
    :param temperature: 创意度，0=保守，1=随机
    :return: 模型回复文本
    """
    model_id = os.getenv("VOLCENGINE_MODEL_ID")
    if not model_id:
        raise ValueError("VOLCENGINE_MODEL_ID 未配置，请在 .env 中设置推理接入点 ID")

    client = get_client()
    response = client.chat.completions.create(
        model=model_id,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message},
        ],
        temperature=temperature,
    )
    return response.choices[0].message.content or ""
