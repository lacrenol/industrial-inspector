# 🔧 Vertex AI Integration Guide

## 📋 Your Current Infrastructure:

### ✅ Server Environment:
- **OS**: Ubuntu Server (headless)
- **Python**: 3.12 in ~/myenv
- **Working Directory**: /root/
- **Google Cloud**: stroyka-489218
- **Region**: us-central1
- **Model**: Gemini 2.0 Flash Preview
- **Auth**: ADC (Application Default Credentials)
- **API Keys**: BLOCKED by policy

### 🎯 Required Changes:

## 1. Replace Google Generative AI with Vertex AI

### Current Code (needs replacement):
```python
# ❌ This won't work - API keys blocked
import google.generativeai as genai
genai.configure(api_key="AIzaSy...")  # BLOCKED!
model = genai.GenerativeModel("gemini-1.5-flash")
```

### New Code (Vertex AI):
```python
# ✅ This works with ADC
from vertexai.generative_models import GenerativeModel, Part
import vertexai

# Initialize with project and location
vertexai.init(project="stroyka-489218", location="us-central1")
model = GenerativeModel("gemini-2.0-flash-preview")
```

## 2. Update Backend for Vertex AI

### Modified main.py sections:
```python
# Replace imports
from vertexai.generative_models import GenerativeModel, Part
import vertexai

# Initialize Vertex AI
vertexai.init(project="stroyka-489218", location="us-central1")

# Updated Gemini function
async def _analyze_defect_with_vertex_ai(
    image: Image.Image,
    axis: str,
    construction_type: str,
    location: Optional[str],
) -> dict:
    print(f"DEBUG: Vertex AI analysis started for {construction_type}, axis {axis}")
    
    try:
        model = GenerativeModel("gemini-2.0-flash-preview")
        print("DEBUG: Vertex AI model created")
        
        # Convert PIL image to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format="JPEG")
        img_bytes = img_byte_arr.getvalue()
        print(f"DEBUG: Image converted to bytes, size: {len(img_bytes)}")
        
        # Create image part for Vertex AI
        image_part = Part.from_data(img_bytes, mime_type="image/jpeg")
        print("DEBUG: Vertex AI image part created")
        
        prompt = f"""
{EXAMINER_INSTRUCTIONS}

Axis: {axis}
Type: {construction_type}
Location: {location or 'N/A'}

JSON format: {{"description": "...", "status_category": "A|B|C|D"}
"""
        print(f"DEBUG: Prompt length: {len(prompt)} characters")
        
        # Generate content
        response = await asyncio.to_thread(
            model.generate_content,
            [prompt, image_part],
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 500,
            },
        )
        print("DEBUG: Vertex AI response received")
        
        raw = response.text
        print(f"DEBUG: Vertex AI raw response: {raw[:200]}...")
        
        data = _parse_gemini_response(raw)
        print(f"DEBUG: Parsed response: {data}")
        return data
        
    except Exception as e:
        print(f"DEBUG: Vertex AI analysis failed: {e}")
        print(f"DEBUG: Exception type: {type(e)}")
        print(f"DEBUG: Exception args: {e.args}")
        return {
            "description": f"Analysis failed: {str(e)}",
            "status_category": "B"
        }
```

## 3. Update Environment Configuration

### Remove .env API keys (not needed):
```bash
# ❌ Remove these lines from .env
# GEMINI_API_KEY=AIzaSy...  # BLOCKED!
# EXAMINER_INSTRUCTIONS=...  # Move to code

# ✅ Keep these
SUPABASE_URL=https://ienrlqnjfnoimuuoxmpp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_BUCKET_IMAGES=defect-images
SUPABASE_BUCKET_REPORTS=defect-reports
```

### Add Vertex AI config to code:
```python
# In main.py, replace environment loading
PROJECT_ID = "stroyka-489218"
LOCATION = "us-central1"
EXAMINER_INSTRUCTIONS = "Structural engineer. Analyze defect in photo. Classify: A(исправное) B(работоспособное) C(ограниченно) D(аварийное). JSON format: {\"description\": \"...\", \"status_category\": \"A|B|C|D\"}"
```

## 4. Deployment Steps

### On Your Server:
```bash
# 1. Activate your environment
source ~/myenv/bin/activate

# 2. Navigate to project
cd /root/industrial-inspector/backend

# 3. Install Vertex AI if not installed
pip install google-cloud-aiplatform

# 4. Test Vertex AI connection
python -c "
from vertexai.generative_models import GenerativeModel
import vertexai
vertexai.init(project='stroyka-489218', location='us-central1')
model = GenerativeModel('gemini-2.0-flash-preview')
response = model.generate_content('Hello')
print('Vertex AI working:', response.text)
"

# 5. Update the code
# Replace the Gemini sections with Vertex AI code

# 6. Run the application
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 5. Updated Requirements

### New requirements.txt:
```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
python-dotenv==1.0.1
python-docx==1.1.2
# ❌ Remove: google-generativeai==0.8.3
# ✅ Add: google-cloud-aiplatform>=1.38.0
supabase==2.6.0
httpx==0.27.2
Pillow==10.4.0
```

## 6. Test the Integration

### Simple test script:
```python
#!/usr/bin/env python3
# test_vertex_ai.py

from vertexai.generative_models import GenerativeModel, Part
import vertexai
from PIL import Image
import io

def test_vertex_ai():
    try:
        # Initialize Vertex AI
        vertexai.init(project="stroyka-489218", location="us-central1")
        model = GenerativeModel("gemini-2.0-flash-preview")
        
        # Create a simple test image
        test_image = Image.new('RGB', (100, 100), color='red')
        img_byte_arr = io.BytesIO()
        test_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # Create image part
        image_part = Part.from_data(img_bytes, mime_type="image/jpeg")
        
        # Test prompt
        prompt = "What do you see in this image? JSON format: {\"description\": \"...\"}"
        
        # Generate response
        response = model.generate_content([prompt, image_part])
        
        print("✅ Vertex AI Test Successful!")
        print("Response:", response.text)
        return True
        
    except Exception as e:
        print("❌ Vertex AI Test Failed:", e)
        return False

if __name__ == "__main__":
    test_vertex_ai()
```

## 🎯 Key Differences:

### Gemini API vs Vertex AI:
| Feature | Gemini API | Vertex AI |
|---------|-------------|------------|
| Auth | API Key | ADC (Application Default Credentials) |
| Model | gemini-1.5-flash | gemini-2.0-flash-preview |
| Library | google.generativeai | google-cloud-aiplatform |
| Init | genai.configure(api_key) | vertexai.init(project, location) |
| Image Part | genai.part_from_bytes() | Part.from_data() |
| Cost | Per-token billing | Per-token billing |
| Region | Global | Specified (us-central1) |

## 🚀 Ready to Deploy!

Your server is already configured correctly. Just need to:
1. Update the code to use Vertex AI
2. Install google-cloud-aiplatform
3. Test the integration
4. Deploy with your existing infrastructure

**No API keys needed - ADC handles authentication!** 🔐
