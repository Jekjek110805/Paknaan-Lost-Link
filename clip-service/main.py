from io import BytesIO
from typing import List

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

MODEL_NAME = "openai/clip-vit-base-patch32"

app = FastAPI(title="Paknaan LostLink CLIP Service")

device = "cuda" if torch.cuda.is_available() else "cpu"
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME).to(device)
model.eval()


def normalize(vector: torch.Tensor) -> torch.Tensor:
    return vector / vector.norm(dim=-1, keepdim=True).clamp(min=1e-12)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model": MODEL_NAME, "device": device}


@app.post("/embed-image")
async def embed_image(image: UploadFile = File(...)) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file is required")

    try:
        content = await image.read()
        pil_image = Image.open(BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    with torch.no_grad():
        inputs = processor(images=pil_image, return_tensors="pt").to(device)
        features = model.get_image_features(**inputs)
        features = normalize(features)

    embedding: List[float] = features.squeeze(0).cpu().tolist()
    return {"model": MODEL_NAME, "dimensions": len(embedding), "embedding": embedding}
