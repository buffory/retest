import base64
import io
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import openai
from PIL import Image
import os

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAIAPI_KEY")

# FastAPI app instance
app = FastAPI()

class ImageData(BaseModel):
    image: str  # Base64 encoded image

@app.post("/process-image")
async def process_image(data: ImageData):
    try:
        # Decode base64 image
        img_data = base64.b64decode(data.image.split(",")[1])
        img = Image.open(io.BytesIO(img_data))

        # Optionally, save the image if you want to inspect it
        img.save("screenshot.png")

        # Call OpenAI API with the image data
        response = openai.chat_completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {"role": "user", "content": "Analyze the content of this screenshot."},
                {"role": "user", "image": img_data}
            ]
        )
        
        # Extract answer from OpenAI response
        answer = response['choices'][0]['message']['content']

        return JSONResponse(content={"answer": answer})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
