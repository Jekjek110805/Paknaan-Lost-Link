# CLIP Image Embedding Service

FastAPI microservice for image-to-image matching with CLIP.

## Local Run

```bash
cd clip-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## Deploy

Deploy this folder to Render, Railway, or another Python host.

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Then set this in the Vercel app:

```env
CLIP_SERVICE_URL=https://your-clip-service.example.com
```

The Node API will use CLIP first when this URL is configured and fall back to Gemini/text matching if the service is unavailable.
