# Smart Invoice & Document Analyzer

A full-stack application for automated invoice processing, OCR extraction, and AI-powered expense classification.

## Prerequisites

Before you begin, ensure you have the following installed:
1. **Node.js** (v16.0 or higher) - for the frontend and backend.
2. **Python** (v3.9 or higher) - for the OCR and ML service.
3. **MongoDB** - Ensure you have MongoDB installed and running locally on the default port (`mongodb://localhost:27017`), or update the `MONGODB_URI` environment variable if using MongoDB Atlas.
4. **Tesseract OCR** - Required by `pytesseract`. Ensure `tesseract.exe` is installed and accessible (in the current code, the path is hardcoded to `C:\Program Files\Tesseract-OCR\tesseract.exe` inside `python-ocr-service/src/pdf_converter.py` if present, or `main.py`/`main` scripts - make sure it's installed).

---

## 🚀 Setup & Installation

You will need to open **3 separate terminal windows** to run the three different parts of the application.

### 1. Python OCR & ML Service
This service handles PDF/Image processing, text extraction, and Machine Learning classification.

```bash
# Navigate to the Python service directory
cd python-ocr-service

# Create a virtual environment (Optional but Recommended)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Mac/Linux

# Install dependencies
pip install -r requirements.txt

# IMPORTANT: You must train the ML model once before running the server!
python train_model.py

# Start the FastAPI server
uvicorn api:app --reload --port 8000
```
> The Python API will be available at `http://localhost:8000`

### 2. Node.js Backend API
This handles user authentication, database storage, and proxies uploads to the Python service.

Open a **new terminal window**:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the Express server
npm run dev
```
> The Node server will be available at `http://localhost:5000`

### 3. React Frontend UI
This is the user dashboard where you can upload invoices and view analytics.

Open a **third terminal window**:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
> The Frontend UI will be available at `http://localhost:5173`

---

## 🛠️ Usage

1. Open your browser and go to `http://localhost:5173`.
2. Click **Register here** to create a test account (e.g., `test@example.com`).
3. Once in the dashboard, click **New Invoice**.
4. Upload a sample invoice (PNG, JPG, or PDF) – *You can find dummy invoices inside `python-ocr-service/data/raw/` if that folder was included, or use your own*.
5. Wait a few seconds for the OCR to process and classify the text.
6. Observe the extracted fields, AI-assigned category, and updated dashboard charts!

## System Architecture

* **Frontend**: React, Vite, Tailwind CSS, Chart.js, Axios
* **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Auth, Multer
* **AI Service**: Python, FastAPI, Tesseract OCR, OpenCV, Scikit-Learn (Logistic Regression + TF-IDF)
