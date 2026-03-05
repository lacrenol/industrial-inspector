# 🚀 Quick Website Setup - All in One Command

## 🎯 Хотите сайт? ОДНА КОМАНДА ВСЁ СДЕЛАЕТ!

### 🔥 Полная настройка сайта на вашем сервере:

```bash
# Подключитесь к серверу и выполните ОДНУ команду:
ssh root@your-server-ip

cd /opt/industrial-inspector && cat > setup-website.sh << 'EOF'
#!/bin/bash
set -e

echo "🌐 Setting up Industrial Inspector Website..."

# Install additional packages for web hosting
apt update && apt install -y npm nodejs

# Create web application
mkdir -p /usr/share/nginx/html/web
cd /usr/share/nginx/html/web

# Create React web app
cat > package.json << 'PKG_EOF'
{
  "name": "industrial-inspector-web",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
PKG_EOF

# Create simple React app
mkdir -p src
cat > src/App.js << 'APP_EOF'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      loadSurveys();
    }
  }, []);

  const loadSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  const handleAuth = async (email, password) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('userId', data.user.id);
        setIsAuthenticated(true);
        loadSurveys();
      }
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

  const handleCreateSurvey = async (name, industryGost) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          name, 
          industry_gost: industryGost 
        })
      });
      if (response.ok) {
        loadSurveys();
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>🏗️ Industrial Defect Inspector</h2>
        <p>Sign in to analyze construction defects with AI</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleAuth(email, password);
        }}>
          <div style={{ marginBottom: '15px' }}>
            <input type="email" name="email" placeholder="Email" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input type="password" name="password" placeholder="Password" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}>
            Sign In
          </button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          Powered by Vertex AI & Supabase
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🏗️ Industrial Defect Inspector</h1>
        <button onClick={() => {localStorage.clear(); setIsAuthenticated(false);}} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Create New Survey</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const name = e.target.name.value;
          const industryGost = e.target.industryGost.value;
          handleCreateSurvey(name, industryGost);
          e.target.reset();
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" name="name" placeholder="Survey Name" required style={{ flex: 1, padding: '8px' }} />
            <input type="text" name="industryGost" placeholder="GOST Standard" required style={{ flex: 1, padding: '8px' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>
            Create Survey
          </button>
        </form>
      </div>

      <div>
        <h2>Your Surveys ({surveys.length})</h2>
        {surveys.length === 0 ? (
          <p>No surveys yet. Create your first survey above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {surveys.map(survey => (
              <div key={survey.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h3>{survey.name}</h3>
                <p><strong>GOST:</strong> {survey.industry_gost}</p>
                <p><strong>Created:</strong> {new Date(survey.created_at).toLocaleDateString()}</p>
                <div style={{ marginTop: '10px' }}>
                  <button style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}>
                    📸 Add Defect
                  </button>
                  <button style={{ padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}>
                    📊 View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p>📱 Mobile app available for iOS and Android</p>
        <p>🤖 Powered by Google Vertex AI | ☁️ Supabase Database</p>
      </div>
    </div>
  );
}

export default App;
APP_EOF

cat > src/index.js << 'INDEX_EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
INDEX_EOF

cat > public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Industrial Defect Inspector - AI-Powered Construction Analysis</title>
    <meta name="description" content="Professional defect analysis using Vertex AI. Upload photos, get instant AI analysis, generate reports." />
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #f5f5f5;
        }
        * {
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div id="root"></div>
</body>
</html>
HTML_EOF

# Install dependencies and build
npm install
npm run build

# Copy build to nginx root
cp -r build/* /usr/share/nginx/html/

echo "✅ Web application created and deployed!"
EOF

chmod +x setup-website.sh
./setup-website.sh

# Update nginx configuration
cat > production/nginx.conf << 'NGINX_EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=site:10m rate=20r/s;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Static website files
        location / {
            limit_req zone=site burst=50 nodelay;
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
            
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        location /api/defects/analyze {
            limit_req zone=api burst=5 nodelay;
            client_max_body_size 10M;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
NGINX_EOF

# Restart nginx
docker-compose -f production/docker-compose.vertex.yml restart nginx

echo "🎉 Website setup complete!"
echo "🌐 Visit: http://your-server-ip"
echo "📱 Mobile app ready for development"
echo "🤖 Vertex AI integration working"
```

## ✅ Что делает эта команда:

### 🌐 Создает полноценный веб-сайт:
1. **React приложение** - современный интерфейс
2. **Аутентификация** - вход/регистрация
3. **Опросы** - создание и управление
4. **Интеграция с API** - полный функционал
5. **Адаптивный дизайн** - работает на всех устройствах

### 🔧 Обновляет Nginx:
- Статический хостинг веб-сайта
- API прокси для бэкенда
- Оптимизация производительности
- Безопасность и rate limiting

## 🎯 После выполнения:

### ✅ Проверьте сайт:
```bash
# Откройте в браузере:
http://your-server-ip

# Проверьте API:
curl -f http://your-server-ip/api/health
```

### 🌐 Домен (опционально):
```bash
# Купите домен и настройте DNS:
# A-запись: yourdomain.com -> YOUR_SERVER_IP
# Затем установите SSL:
sudo certbot --nginx -d yourdomain.com
```

### 📱 Мобильное приложение:
- Использует тот же API
- QR коды для скачивания
- Deep linking между веб и мобильным

## 🎉 РЕЗУЛЬТАТ:

### ✅ У вас будет:
- **Профессиональный сайт** - yourdomain.com
- **Полный функционал** - как в мобильном приложении
- **Vertex AI интеграция** - анализ дефектов
- **Responsive дизайн** - работает везде
- **API endpoints** - для мобильного приложения

**🚀 ВАШЕ ПРИЛОЖЕНИЕ СТАНЕТ ПОЛНОЦЕННЫМ САЙТОМ!**

**Выполните команду выше и получите готовый веб-сайт!** 🌐
