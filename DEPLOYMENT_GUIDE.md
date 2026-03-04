# 🚀 Production Deployment Guide

## 📋 Current Status Assessment

### ✅ What's Working Now:
1. **Backend API** - FastAPI with Gemini AI integration
2. **Supabase Integration** - Database and Storage
3. **Mobile App** - React Native with Expo
4. **Photo Analysis** - Defect detection with AI
5. **Rate Limiting** - Token usage control
6. **Cross-platform** - Web, iOS, Android support

### 🎯 Production Requirements:

## 1. Backend Server Deployment

### Environment Setup:
```bash
# Production server requirements
- Ubuntu 20.04+ / CentOS 8+ / AWS EC2
- Python 3.9+
- SSL Certificate
- Domain name
- Firewall configuration
```

### Docker Deployment (Recommended):
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
```

### Traditional Deployment:
```bash
# Server setup
sudo apt update
sudo apt install python3.9 python3-pip nginx certbot

# Clone and setup
git clone <your-repo>
cd build/backend
pip3 install -r requirements.txt

# Production server
sudo systemctl start uvicorn
sudo systemctl enable uvicorn
```

## 2. Web Frontend Deployment

### Convert Mobile to Web:
```typescript
// src/web/App.tsx - Web version
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthScreen } from './screens/AuthScreen';
import { SurveyListScreen } from './screens/SurveyListScreen';
// ... other imports

export const WebApp = () => (
  <Router>
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route path="/surveys" element={<SurveyListScreen />} />
      {/* ... other routes */}
    </Routes>
  </Router>
);
```

### Build for Production:
```bash
# Web build
npm run build
# Deploy to nginx/Apache/Netlify/Vercel
```

## 3. iOS App Preparation

### React Native to iOS:
```bash
# iOS specific setup
cd mobile
npx expo eject
pod install
```

### iOS Configuration:
```swift
// iOS native modules needed
- Camera permissions
- Photo library access
- Network security
- Background processing
```

## 4. Server Configuration

### Nginx Setup:
```nginx
# /etc/nginx/sites-available/industrial-inspector
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### SSL Certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

## 5. Environment Variables

### Production .env:
```bash
# Production environment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-prod-key
GEMINI_API_KEY=your-prod-gemini-key
BACKEND_BASE_URL=https://yourdomain.com/api
NODE_ENV=production
```

## 6. Database Scaling

### Supabase Production:
```sql
-- Production optimizations
CREATE INDEX CONCURRENTLY idx_defects_survey_id_created 
ON defects(survey_id, created_at);

-- Backup strategy
pg_dump your-db > backup.sql

-- Monitoring
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## 7. Monitoring & Logging

### Application Monitoring:
```python
# Add to main.py
import logging
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('request_latency_seconds', 'Request latency')

@app.middleware("http")
async def monitor_requests(request, call_next):
    start_time = time.time()
    REQUEST_COUNT.inc()
    response = await call_next(request)
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response
```

### Error Tracking:
```python
# Sentry integration
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()]
)
```

## 8. Security Hardening

### API Security:
```python
# Add to main.py
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)
```

### CORS Production:
```python
# Production CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com", "https://www.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 9. CI/CD Pipeline

### GitHub Actions:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          scp -r . user@server:/var/www/
          ssh user@server 'systemctl restart uvicorn'
```

## 10. Performance Optimization

### Caching:
```python
# Redis caching
import redis
r = redis.Redis(host='localhost', port=6379)

@app.get("/surveys/{user_id}")
async def get_surveys(user_id: str):
    cache_key = f"surveys:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Fetch from database
    surveys = fetch_surveys(user_id)
    r.setex(cache_key, 300, json.dumps(surveys))
    return surveys
```

### CDN for Images:
```bash
# CloudFlare/AWS CloudFront setup
# Cache static assets and images
```

## 🎯 Deployment Steps:

### Phase 1: Backend (1-2 days)
1. ✅ Set up production server
2. ✅ Configure environment variables
3. ✅ Deploy FastAPI with Docker
4. ✅ Set up Nginx reverse proxy
5. ✅ Configure SSL certificate

### Phase 2: Web Frontend (1 day)
1. ✅ Convert React Native components to web
2. ✅ Build production bundle
3. ✅ Deploy to static hosting
4. ✅ Configure routing

### Phase 3: iOS App (2-3 days)
1. ✅ Configure Expo for iOS build
2. ✅ Set up Apple Developer account
3. ✅ Build and submit to App Store
4. ✅ Test on physical devices

### Phase 4: Monitoring (1 day)
1. ✅ Set up logging and monitoring
2. ✅ Configure error tracking
3. ✅ Set up backups
4. ✅ Performance optimization

## 📱 Cross-Platform Compatibility:

### Web Version:
- ✅ Responsive design
- ✅ PWA capabilities
- ✅ Offline support
- ✅ Camera API integration

### iOS App:
- ✅ Native camera integration
- ✅ Photo library access
- ✅ Push notifications
- ✅ Offline mode

### Android App:
- ✅ Camera permissions
- ✅ File system access
- ✅ Background processing
- ✅ Google Play Store ready

## 🔧 Next Steps:

1. **Choose hosting provider** (AWS, DigitalOcean, Heroku)
2. **Register domain name**
3. **Set up SSL certificates**
4. **Configure CI/CD pipeline**
5. **Test production environment**
6. **Deploy iOS app to App Store**

**Ready to go live! 🚀**
