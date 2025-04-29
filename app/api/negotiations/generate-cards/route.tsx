import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      systemInstruction:
        "Ты создаешь флеш-карточки (вопрос-ответ) по введённой теме. Ответ должен быть списком из 5 карточек в виде JSON. Формат: [{\"question\": \"...\", \"answer\": \"...\"}, ...]",
    });

    const result = await model.generateContent(topic);
    const text = result.response.text();

    const match = text.match(/\[.*\]/s);
    const cards = match ? JSON.parse(match[0]) : [];

    return NextResponse.json({ idx: 0, cards });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate cards" }, { status: 500 });
  }
}
