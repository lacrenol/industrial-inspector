# Web and Mobile Camera Fix

## Проблемы:
1. **Web версия**: Camera не работает в браузере
2. **Expo Go iPhone**: Проблемы с разрешениями и ImagePicker
3. **Разрешения**: Неправильная обработка permissions

## Решения:

### 1. Для Web версии:
Нужно заменить CameraView на веб-альтернативу:

```typescript
// В CameraScreen.tsx
import { Platform } from 'react-native';

// Заменить CameraView:
{Platform.OS === 'web' ? (
  <WebCameraComponent onPhotoTaken={handlePhotoTaken} />
) : (
  <CameraView style={styles.camera} ref={cameraRef} facing="back" />
)}
```

### 2. Для Expo Go iPhone:
- Убедиться что ImagePicker permissions запрашиваются правильно
- Добавить fallback для веба

### 3. Быстрое решение:
Использовать только ImagePicker для всех платформ:

```typescript
// Убрать CameraView полностью
// Использовать только ImagePicker.launchImageLibraryAsync
// Для фото использовать ImagePicker.launchCameraAsync
```

## Текущие исправления:

✅ Добавлены permissions для ImagePicker
✅ Добавлена обработка ошибок
✅ Упрощен handleImageUpload для всех платформ

## Что нужно сделать:

### Вариант 1 (Быстрый):
```typescript
// Заменить CameraView на ImagePicker.launchCameraAsync
const handleTakePhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.6,
    base64: true,
  });
  
  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    setPreviewUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  }
};
```

### Вариант 2 (Полный):
1. Создать WebCameraComponent
2. Добавить Platform проверки
3. Обновить package.json для веб-зависимостей

## Тестирование:

### Web:
```powershell
cd C:\Users\vonova\Desktop\build\mobile
npx expo start --web
```

### Mobile:
```powershell
cd C:\Users\vonova\Desktop\build\mobile
npx expo start
```

## Приоритеты:

1. **Сначала** - исправить ImagePicker для веба
2. **Затем** - добавить веб-камеру
3. **Последним** - оптимизировать для iPhone

## Простое решение прямо сейчас:

Заменить CameraView на ImagePicker.launchCameraAsync - будет работать везде кроме веба, но для веба можно использовать только библиотеку.
