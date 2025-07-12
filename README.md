# Housing Price Prediction API

This is a FastAPI-based REST API to predict housing prices using a pre-trained linear regression model. The API is exposed publicly via ngrok for easy testing.

## Features

- Predict house price based on input features.
- CORS enabled to allow cross-origin requests (e.g. from a React frontend).
- Exposes `/predict/` POST endpoint.
- Publicly accessible via ngrok tunnel.

## Requirements

- Python 3.7+
- `fastapi`
- `uvicorn`
- `pydantic`
- `pandas`
- `joblib`
- `nest_asyncio`
- `pyngrok`

## Installation

Install dependencies with:

```bash
pip install fastapi uvicorn pydantic pandas joblib nest_asyncio pyngrok
```

## Usage

Run the API locally:

```bash
uvicorn main:app --reload
```

To expose the API publicly via ngrok:

```bash
python main.py
```

## Example Requests

**Using Python `requests` library:**

```python
import requests

url = "https://5af4e3e59c08.ngrok-free.app/predict"

data = {
    "area": 3000,
    "bedrooms": 3,
    "bathrooms": 2,
    "stories": 2,
    "mainroad": "yes",
    "guestroom": "yes",
    "basement": "no",
    "hotwaterheating": "no",
    "airconditioning": "yes",
    "parking": 1,
    "prefarea": "yes",
    "furnishingstatus": "unfurnished"
}

response = requests.post(url, json=data)

print(response.json())
```

**Expected Response:**

```json
{
  "predicted_price": 5250000
}
```

## API Documentation

When running locally, API documentation is available at:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
