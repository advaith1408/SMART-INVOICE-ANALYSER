import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

def train_and_save_model():
    print("Training Expense Classification Model...")
    
    # Sample training dataset format as requested
    data = [
        {"text": "uber trip payment receipt ride", "category": "Travel"},
        {"text": "electricity bill payment power utility", "category": "Utilities"},
        {"text": "facebook ads invoice marketing spend", "category": "Marketing"},
        {"text": "office supplies purchase paper pens desks", "category": "Office"},
        {"text": "delta airlines flight ticket booking", "category": "Travel"},
        {"text": "water bill monthly utility", "category": "Utilities"},
        {"text": "google adwords campaign invoice", "category": "Marketing"},
        {"text": "amazon business office equipment chairs", "category": "Office"},
        {"text": "hotel stay holiday inn accommodation", "category": "Travel"},
        {"text": "internet broadband bill payment", "category": "Utilities"},
    ]
    
    df = pd.DataFrame(data)
    
    # Vectorize text using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
    X = vectorizer.fit_transform(df['text'])
    y = df['category']
    
    # Train Logistic Regression classifier
    clf = LogisticRegression(random_state=42)
    clf.fit(X, y)
    
    # Save the model and vectorizer
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
        
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)
        
    print(f"✅ Model saved to {MODEL_PATH}")
    print(f"✅ Vectorizer saved to {VECTORIZER_PATH}")
    
    # Quick test
    sample_text = ["paid for new printer ink for the office"]
    pred = clf.predict(vectorizer.transform(sample_text))
    print(f"Test prediction for '{sample_text[0]}': {pred[0]}")

if __name__ == "__main__":
    train_and_save_model()
