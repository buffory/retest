import base64
import io
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from PIL import Image
import re
import os
import xai_sdk

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# FastAPI app instance
app = FastAPI()

XAI_API_KEY = os.getenv("XAI_API_KEY")
image_path = "..."

client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


class ImageData(BaseModel):
    image: str  # Base64 encoded image

@app.post("/process-image")
async def process_image(data: ImageData):
    print('Received screenshot for processing.')

    try:
        # Extract base64 from data URL
        match = re.search(r"base64,(.*)", data.image)
        if not match:
            raise ValueError("Invalid image format")
        base64_image = match.group(1)

        # GPT-4 Vision request
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Solve the math problem in the screenshot. If it is multiple choice, list the correct answers at the end as A, B, etc. If it a drag and drop, list as 1 (contents), 2 (contents), 3 (contents), etc.."},
                        {"type": "image_url", "image_url": {
                            "url": f"data:image/png;base64,{match.group(1)}"
                        }},
                    ],
                }
            ],
            # max_tokens=300
        )

        answer = response.choices[0].message.content
        answer = response.choices[0].message.content
        print("response:", answer)

        return JSONResponse(content={"answer": answer})

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
