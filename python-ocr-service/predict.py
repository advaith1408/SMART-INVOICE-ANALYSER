import pickle
import os

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

def predict_category(text: str) -> str:
    """Predicts expense category for the given text."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        raise FileNotFoundError("Model or Vectorizer not found. Run train_model.py first.")
        
    with open(MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
        
    text_vec = vectorizer.transform([text])
    prediction = clf.predict(text_vec)
    return prediction[0]

if __name__ == "__main__":
    # Test cases
    test_texts = [
        "uber trip to airport",
        "monthly electric and gas bill",
        "pens paper notebooks and stapler",
        "facebook and google ads spend"
    ]
    print("Testing ML Classifier Predictions:")
    for text in test_texts:
        category = predict_category(text)
        print(f"Text: '{text}' -> Category: {category}")
