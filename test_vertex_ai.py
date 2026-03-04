#!/usr/bin/env python3
"""
Test Vertex AI integration
Run this on your server to verify Vertex AI is working
"""

import os
import sys
from vertexai.generative_models import GenerativeModel, Part
import vertexai
from PIL import Image
import io

def test_vertex_ai():
    print("🧪 Testing Vertex AI Configuration...")
    print("-" * 50)
    
    try:
        # Initialize Vertex AI
        project_id = "stroyka-489218"
        location = "us-central1"
        
        print(f"📋 Project ID: {project_id}")
        print(f"📍 Location: {location}")
        
        vertexai.init(project=project_id, location=location)
        print("✅ Vertex AI initialized successfully")
        
        # Test with text first
        print("\n🔤 Testing text generation...")
        model = GenerativeModel("gemini-2.0-flash-preview")
        response = model.generate_content("Hello, respond with 'Vertex AI is working!'")
        print(f"✅ Text response: {response.text}")
        
        # Test with image
        print("\n📸 Testing image analysis...")
        
        # Create a simple test image (red square)
        test_image = Image.new('RGB', (100, 100), color='red')
        img_byte_arr = io.BytesIO()
        test_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        print(f"📊 Test image size: {len(img_bytes)} bytes")
        
        # Create image part
        image_part = Part.from_data(img_bytes, mime_type="image/jpeg")
        print("✅ Image part created")
        
        # Test prompt for defect analysis
        prompt = """Structural engineer. Analyze defect in photo. Classify: A(исправное) B(работоспособное) C(ограниченно) D(аварийное). JSON format: {"description": "...", "status_category": "A|B|C|D"}"""
        
        print(f"📝 Prompt length: {len(prompt)} characters")
        
        # Generate response
        response = model.generate_content([prompt, image_part])
        
        print("✅ Vertex AI image analysis successful!")
        print(f"📄 Response: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Vertex AI Test Failed: {e}")
        print(f"🔍 Error type: {type(e)}")
        print(f"📋 Error details: {e.args}")
        
        # Check for common issues
        error_str = str(e).lower()
        if "permission" in error_str or "access" in error_str:
            print("\n💡 Permission issue detected:")
            print("   - Run: gcloud auth application-default login")
            print("   - Check ADC is properly configured")
        elif "quota" in error_str or "limit" in error_str:
            print("\n💡 Quota issue detected:")
            print("   - Check Google Cloud quotas")
            print("   - Verify billing is enabled")
        elif "project" in error_str:
            print("\n💡 Project issue detected:")
            print("   - Verify project ID: stroyka-489218")
            print("   - Check project exists and is active")
        
        return False

def check_environment():
    print("\n🔍 Checking Environment...")
    print("-" * 30)
    
    # Check if running in correct environment
    if 'VIRTUAL_ENV' in os.environ:
        print(f"✅ Virtual environment: {os.environ['VIRTUAL_ENV']}")
    else:
        print("⚠️  No virtual environment detected")
        print("   Activate with: source ~/myenv/bin/activate")
    
    # Check Google Cloud auth
    try:
        import subprocess
        result = subprocess.run(['gcloud', 'auth', 'list'], 
                            capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Google Cloud auth configured")
            accounts = result.stdout.strip().split('\n')
            for account in accounts:
                if account.strip():
                    print(f"   📧 Account: {account}")
        else:
            print("❌ Google Cloud auth not configured")
    except FileNotFoundError:
        print("❌ gcloud CLI not found")
        print("   Install with: curl https://sdk.cloud.google.com | bash")
    
    # Check Python version
    print(f"🐍 Python version: {sys.version}")

def show_next_steps():
    print("\n🚀 Next Steps:")
    print("-" * 20)
    print("1. ✅ If test passed - Vertex AI is working!")
    print("2. 📝 Replace main.py with main_vertex_ai.py")
    print("3. 📦 Install required packages:")
    print("   pip install google-cloud-aiplatform")
    print("4. 🔄 Restart your application:")
    print("   uvicorn main_vertex_ai:app --host 0.0.0.0 --port 8000")
    print("5. 🧪 Test with mobile app")

if __name__ == "__main__":
    print("🎯 Vertex AI Integration Test")
    print("=" * 50)
    
    check_environment()
    print()
    
    success = test_vertex_ai()
    print()
    
    if success:
        print("🎉 Vertex AI is ready for production!")
        show_next_steps()
    else:
        print("🔧 Fix the issues above and try again")
        print("\n📞 For help:")
        print("   - Google Cloud Console: https://console.cloud.google.com/")
        print("   - Vertex AI docs: https://cloud.google.com/vertex-ai")
