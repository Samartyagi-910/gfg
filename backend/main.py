import os
import json
import re
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GEMINI_API_KEY = "AIzaSyB4LRypxolcJ3o-NWqHdVZe5liPZgDYvXY"
genai.configure(api_key=GEMINI_API_KEY)

# Globals to store current dataset
df = pd.DataFrame()

# Try to load a default file if it exists
DEFAULT_FILE = os.path.join("backend", "data", "BMW Vehicle Inventory.csv")
if not os.path.exists(DEFAULT_FILE):
    DEFAULT_FILE = os.path.join("data", "BMW Vehicle Inventory.csv")

if os.path.exists(DEFAULT_FILE):
    try:
        df = pd.read_csv(DEFAULT_FILE)
    except Exception:
        pass

class QueryRequest(BaseModel):
    query: str

@app.get("/")
async def root():
    return {"message": "AI BI Dashboard API is running"}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    global df
    try:
        os.makedirs("data", exist_ok=True)
        # Sanitize filename
        safe_filename = re.sub(r'[^\w\.-]', '_', file.filename)
        file_path = os.path.join("data", safe_filename)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        df = pd.read_csv(file_path)
        return {
            "message": "CSV uploaded successfully", 
            "file_saved_at": file_path, 
            "columns": list(df.columns), 
            "rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

@app.post("/generate-dashboard")
async def generate_dashboard(req: QueryRequest):
    global df
    if df.empty:
        raise HTTPException(status_code=400, detail="No dataset loaded. Please upload a CSV first.")

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Provide metadata and a small sample to Gemini
    columns_info = ", ".join(df.columns)
    data_sample = df.head(30).to_csv(index=False)
    
    prompt = f"""
You are a expert data analyst. Generate a visualization configuration based on the provided dataset and user query.

DATASET COLUMNS: {columns_info}

SAMPLE DATA (first 30 rows):
{data_sample}

USER QUERY: "{req.query}"

INSTRUCTIONS:
1. Analyze the sample data and columns to understand how to answer the query.
2. Group or aggregate the data as necessary to produce a clear visualization (e.g., sum of sales by region).
3. Return a clean JSON object that maps to the frontend Recharts structure.
4. The output must be EXACTLY in this JSON format:
{{
  "title": "A descriptive title for the chart",
  "data": [
    {{ "category": "Group A", "value": 123 }},
    {{ "category": "Group B", "value": 456 }}
  ],
  "chart": {{
    "type": "bar", 
    "x": "category",
    "y": "value"
  }},
  "insights": [
    "Insight 1 about the data trend",
    "Insight 2 about the data trend"
  ]
}}

GUIDELINES:
- Supported chart types: "bar", "line", "pie".
- Choose the chart type that best represents the answer if the user didn't specify.
- The "data" array should contain the actual aggregated results.
- The keys in the "data" objects (e.g., "category", "value") must match the "x" and "y" values in the "chart" object.
- DO NOT include any text, markdowns (like ```json), or explanations outside the JSON object.
"""
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        
        # Robust JSON extraction specifically looking for the first { and last }
        json_match = re.search(r'\{.*\}', text_response, re.DOTALL)
        if json_match:
            text_response = json_match.group(0)
            
        dashboard_config = json.loads(text_response)
        return dashboard_config
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")
