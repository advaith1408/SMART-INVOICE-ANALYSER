import os
import cv2
import pickle
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import shutil
import tempfile

from src.pdf_converter import convert_pdfs_to_images
from src.preprocess import preprocess_image
from src.ocr_engine import run_ocr, get_full_text
from src.extractor import extract_fields

app = FastAPI(title="Smart Invoice & Document Analyzer OCR API")

# Setup paths for temp processing
TEMP_DIR = "data/temp"
os.makedirs(TEMP_DIR, exist_ok=True)
poppler_bin_path = os.path.join(os.getcwd(), "poppler-24.08.0", "Library", "bin")

# ML Models paths
MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

class TextPayload(BaseModel):
    text: str

@app.post("/process-invoice")
async def process_invoice(file: UploadFile = File(...)):
    """
    Receives an invoice image or PDF, runs OCR, and extracts structured fields.
    """
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF, PNG, or JPEG.")

    temp_file_path = os.path.join(TEMP_DIR, file.filename)
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    images_to_process = []

    try:
        if file.filename.lower().endswith('.pdf'):
            # It's a PDF, convert to image
            # convert_pdfs_to_images uses directory paths, so we make a specific temp dir for this pdf
            pdf_temp_dir = tempfile.mkdtemp(dir=TEMP_DIR)
            img_temp_dir = tempfile.mkdtemp(dir=TEMP_DIR)
            
            # move the single pdf into pdf_temp_dir
            shutil.move(temp_file_path, os.path.join(pdf_temp_dir, file.filename))
            
            convert_pdfs_to_images(pdf_dir=pdf_temp_dir, image_dir=img_temp_dir, dpi=300, poppler_path=poppler_bin_path)
            
            for img_name in os.listdir(img_temp_dir):
                images_to_process.append(os.path.join(img_temp_dir, img_name))
        else:
            # It's an image
            images_to_process.append(temp_file_path)

        if not images_to_process:
            raise HTTPException(status_code=500, detail="Failed to process document into images.")

        # For simplicity, we process the first page/image
        img_path = images_to_process[0]
        img = cv2.imread(img_path)
        
        if img is None:
            raise HTTPException(status_code=500, detail="Failed to load image for OCR.")

        # Preprocess + OCR
        preprocessed = preprocess_image(img)
        ocr_result = run_ocr(preprocessed)
        full_text = get_full_text(ocr_result)

        # Extract fields
        fields = extract_fields(full_text)
        fields["rawText"] = full_text

        return JSONResponse(content=fields)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp directory
        for f in os.listdir(TEMP_DIR):
            f_path = os.path.join(TEMP_DIR, f)
            try:
                if os.path.isfile(f_path):
                    os.unlink(f_path)
                elif os.path.isdir(f_path):
                    shutil.rmtree(f_path)
            except Exception as e:
                pass

@app.post("/classify-text")
async def classify_text(payload: TextPayload):
    """
    Receives raw text from an invoice and returns the predicted expense category.
    """
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
         # If model is not trained yet, return a default category or error
         return {"category": "Uncategorized", "message": "ML model not found. Please train first."}
    
    try:
        with open(MODEL_PATH, "rb") as f:
            clf = pickle.load(f)
        with open(VECTORIZER_PATH, "rb") as f:
            vectorizer = pickle.load(f)

        text_vec = vectorizer.transform([payload.text])
        prediction = clf.predict(text_vec)

        return {"category": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

# To run: uvicorn api:app --reload --port 8000
