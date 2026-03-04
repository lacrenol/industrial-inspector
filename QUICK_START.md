# Quick Start Guide - Full Paths

## Backend Setup

```powershell
# Navigate to backend directory
cd C:\Users\vonova\Desktop\build\backend

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

## Mobile Setup

```powershell
# Navigate to mobile directory
cd C:\Users\vonova\Desktop\build\mobile

# Clean install (your preferred method)
rmdir /S /Q node_modules
del package-lock.json
npm install --legacy-peer-deps
npm install --save-dev babel-preset-expo --legacy-peer-deps

# Start Expo development server
npx expo start
```

## Alternative Mobile Install (Simpler)

```powershell
# Navigate to mobile directory
cd C:\Users\vonova\Desktop\build\mobile

# Standard install
npm install

# Start Expo
npx expo start
```

## File Paths Reference

### Important Files:
- **Backend Main**: `C:\Users\vonova\Desktop\build\backend\main.py`
- **Backend Config**: `C:\Users\vonova\Desktop\build\backend\.env`
- **Mobile App**: `C:\Users\vonova\Desktop\build\mobile\App.tsx`
- **Mobile Config**: `C:\Users\vonova\Desktop\build\mobile\src\config.ts`
- **Navigation**: `C:\Users\vonova\Desktop\build\mobile\src\navigation.tsx`
- **Theme**: `C:\Users\vonova\Desktop\build\mobile\src\theme.ts`

### Screen Files:
- **Auth**: `C:\Users\vonova\Desktop\build\mobile\src\screens\AuthScreen.tsx`
- **Survey List**: `C:\Users\vonova\Desktop\build\mobile\src\screens\SurveyListScreen.tsx`
- **New Survey**: `C:\Users\vonova\Desktop\build\mobile\src\screens\NewSurveyScreen.tsx`
- **Camera**: `C:\Users\vonova\Desktop\build\mobile\src\screens\CameraScreen.tsx`
- **Reports**: `C:\Users\vonova\Desktop\build\mobile\src\screens\ReportsScreen.tsx`

## Verification Commands

### Test Backend:
```powershell
cd C:\Users\vonova\Desktop\build\backend
curl http://localhost:8000/health
```

### Test Mobile Dependencies:
```powershell
cd C:\Users\vonova\Desktop\build\mobile
npx expo doctor
```

## Common Issues & Solutions

### If mobile app fails to start:
```powershell
cd C:\Users\vonova\Desktop\build\mobile
npx expo install --fix
```

### If camera permissions are needed:
- iOS: Simulator → Device → Privacy → Camera
- Android: Settings → Apps → Expo Go → Permissions

### If backend connection fails:
1. Check backend is running on port 8000
2. Verify `BACKEND_BASE_URL` in `C:\Users\vonova\Desktop\build\mobile\src\config.ts`
3. Check Windows Firewall settings

## Development Workflow

1. **Start Backend First**:
   ```powershell
   cd C:\Users\vonova\Desktop\build\backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Mobile** (in separate terminal):
   ```powershell
   cd C:\Users\vonova\Desktop\build\mobile
   npx expo start
   ```

3. **Test on Device**:
   - Install Expo Go app on phone
   - Scan QR code from terminal
   - Ensure device and computer are on same WiFi network

## Environment Configuration

### Backend (.env file location):
`C:\Users\vonova\Desktop\build\backend\.env`

### Mobile Config:
`C:\Users\vonova\Desktop\build\mobile\src\config.ts`

Make sure `BACKEND_BASE_URL` points to:
```typescript
export const BACKEND_BASE_URL = "http://localhost:8000";
```

## Database Setup (if needed)

Your Supabase is already configured, but SQL scripts are in:
`C:\Users\vonova\Desktop\build\README.md`

## Port Usage

- **Backend**: 8000
- **Expo Metro**: 19002 (usually)
- **Expo Dev Server**: 8081 (usually)

Make sure these ports are not blocked by Windows Firewall.
