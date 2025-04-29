import os
from dotenv import load_dotenv
import json
import re
from fastapi import APIRouter, FastAPI, HTTPException
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class TopicRequest(BaseModel):
    topic: str
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_GEMINI_KEY = os.getenv("GEMINI_GEMINI_KEY")
genai.configure(api_key=GOOGLE_GEMINI_KEY)

gemini_router = APIRouter(prefix="/negotiations")

@gemini_router.post("/generate-cards")
async def generate_cards(request: TopicRequest):
    topic = request.topic
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            ),
            system_instruction=(
                "Ты создаешь флеш-карточки (вопрос-ответ) по введённой теме. "
                "Ответ должен быть списком из 5 карточек в виде JSON. Формат:\n"
                "[{\"question\": \"...\", \"answer\": \"...\"}, ...]\n"
            )
        )
        chat = model.start_chat()
        stream = await chat.send_message_async(topic)

        match = re.search(r'\[.*\]', stream.text, re.DOTALL)
        cards = json.loads(match.group(0)) if match else []

        return {"idx": 0, "cards": cards}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cards: {str(e)}")

app.include_router(gemini_router)
