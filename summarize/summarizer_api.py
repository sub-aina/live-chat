from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from fastapi.middleware.cors import CORSMiddleware
import hashlib

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load summarization model & tokenizer
model_name = "philschmid/bart-large-cnn-samsum"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)

# Simple in-memory cache
summary_cache = {}

class ChatRequest(BaseModel):
    messages: list[str]

def preprocess_messages(messages):
    """Clean and prepare messages for summarization"""
    if not messages:
        return ""
    
    cleaned_messages = []
    for msg in messages:
        msg = msg.strip()
        if len(msg) > 3:
            msg = ' '.join(msg.split())
            cleaned_messages.append(msg)

    if not cleaned_messages:
        return ""

    full_text = "\n".join(cleaned_messages)
    return full_text

def calculate_optimal_length(input_text):
    """Estimate summary length based on input size"""
    input_length = len(input_text.split())

    if input_length < 20:
        return 10, 5
    elif input_length < 50:
        return 25, 15
    elif input_length < 100:
        return 40, 20
    else:
        return 60, 30

@app.post("/summarize")
async def summarize_chat(data: ChatRequest):
    try:
        if not data.messages or len(data.messages) == 0:
            return {"summary": "No messages to summarize."}

        full_text = preprocess_messages(data.messages)

        if not full_text or len(full_text.strip()) < 10:
            return {"summary": "Not enough content to create a meaningful summary."}

        # Cache check
        text_hash = hashlib.md5(full_text.encode()).hexdigest()
        if text_hash in summary_cache:
            return {"summary": summary_cache[text_hash]}

        inputs = tokenizer(full_text, return_tensors="pt", truncation=True, max_length=1024)
        decoded_input = tokenizer.decode(inputs["input_ids"][0], skip_special_tokens=True)

        max_len, min_len = calculate_optimal_length(decoded_input)

        result = summarizer(
            decoded_input,
            max_length=max_len,
            min_length=min_len,
            do_sample=False,
            repetition_penalty=1.1
        )

        summary = result[0]['summary_text'].strip()
        if not summary.endswith('.'):
            summary += '.'

        if summary.lower() in full_text.lower():
            summary = "The content was too short or repetitive to summarize."

        summary_cache[text_hash] = summary

        # Limit cache size
        if len(summary_cache) > 100:
            oldest_key = next(iter(summary_cache))
            del summary_cache[oldest_key]

        return {"summary": summary}

    except Exception as e:
        print(f"Error: {e}")
        return {"summary": f"Summarization failed. Error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Chat Summarization API is running"}
