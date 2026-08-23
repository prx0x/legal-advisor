import os
# os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

from google import genai
from google.genai import types
import pymupdf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
from prompt import get_legal_prompt

load_dotenv()
# tesseract prefix setup
TESSDATA_PREFIX = os.getenv("TESSDATA_PREFIX")
if not TESSDATA_PREFIX:
    raise RuntimeError("TESSDATA_PREFIX is not configured")
os.environ["TESSDATA_PREFIX"] = TESSDATA_PREFIX

# api key setup
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from environemnt variables.")



client = genai.Client(api_key=api_key)

class ClauseEvaluation(BaseModel):
    id: str=Field(description="Unique ID for the clause")
    text: str=Field(description="The exact text extracted from PDF")
    risk_level: str=Field(description="'Red', 'Yellow', 'Green'")
    explaination: str=Field(description="Plain English explaination")
    # counter_proposal --> for later versions

class ClauseList(BaseModel):
    clauses: List[ClauseEvaluation]

class ContractResponse(BaseModel):
    document_id: str
    clauses: List[ClauseEvaluation]

# start server
app = FastAPI(title="Legal Advisor")

# connectinh with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health(): #checking the health of the system
    return {
        "status": "System Operational"
    }

# extract the text from pdf
def extract_text(file_bytes: bytes) -> str:
    all_text_chunk = []
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")

    for page in doc:
        try:
            ocr_text = page.get_textpage_ocr(language="eng+hin", dpi=150)
            text = page.get_text(textpage=ocr_text)
            if text.strip():
                all_text_chunk.append(text.strip())
        except RuntimeError as e:
            print(f"make sure Tesseract-OCR is installed. {e}")
            break
    doc.close()

    # joining chunks in a single flow
    raw_text = " ".join(all_text_chunk)
    global text_import
    text_import = raw_text
    return raw_text


# analyse text with gemini
def analyze_text_with_gemini(raw_text:str, filename:str) -> ContractResponse:
    try:
        response = client.models.generate_content(
            model= "gemini-3.6-flash",
            contents=get_legal_prompt(raw_text),
            config=types.GenerateContentConfig(
                response_mime_type= "application/json",
                response_schema= ClauseList
            )
        )
        gemini_output = response.parsed
        return ContractResponse(
            document_id=filename,
            clauses=gemini_output.clauses
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Processinf failed: {str(e)}")

    

# uploading route
@app.post("/analyze-clause/", response_model=ContractResponse)
async def analyze_clause(file: UploadFile = File(...)):
    """Receives pdf upload, extract text and return json risk analysis"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="upload pdf file only")

    # read file in memory
    file_bytes = await file.read()

    # extract text
    raw_text = extract_text(file_bytes)

    # send data to gemini
    contract_data = analyze_text_with_gemini(raw_text, file.filename)

    return contract_data

