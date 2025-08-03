from fastapi import FastAPI;
from pydantic import BaseModel;
from transformers import pipeline;

app= FastAPI();

summarizer=pipeline("summarization", model="facebook/bart-large-cnn");

class ChatRequest(BaseModel):
    messages:list[str];

@app.post("/summarize")

async def summarize_chat(data:ChatRequest):
    full_text = ". ".join(msg.strip().rstrip('.') for msg in data.messages) + "."
    if len(full_text) > 1024:
       full_text = full_text[:1024]


    result=summarizer(full_text, max_length=150, min_length=30, do_sample=False)
    return {"summary": result[0]['summary_text']};