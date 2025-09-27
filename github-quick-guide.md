# 🚀 Быстрая шпаргалка: GitHub Actions для APK

## ⚡ Самый простой способ (2 минуты)

### Через poehali.dev:
1. **Скачать** → **Подключить GitHub** → дождаться создания репозитория
2. Перейти в GitHub → **Actions** → **🎯 Manual APK Build** → **Run workflow**
3. Версия: `1.0.0`, Тип: `release`, Release: ✅ → **Run workflow**
4. Ждать 15 минут → скачать APK из **Releases**

---

## 🔧 Если нужно добавить вручную

### Шаг 1: Создать файлы
В GitHub репозитории создать:
```
.github/workflows/manual-build.yml
.github/workflows/build-android-apk.yml
```

### Шаг 2: Скопировать содержимое
**Из файлов проекта:** [detailed-github-setup.html](detailed-github-setup.html)  
(там есть кнопка "Нажмите для копирования")

### Шаг 3: Commit & Push
```bash
git add .github/
git commit -m "Add GitHub Actions"
git push
```

### Шаг 4: Запустить
Actions → Manual APK Build → Run workflow

---

## 📱 Результат
- ✅ **APK файл:** imperia-promo-v1.0.0-release.apk
- ✅ **Размер:** ~25-30 MB
- ✅ **Поддержка:** Android 7.0+
- ✅ **Скачивание:** GitHub Releases или Artifacts

---

## 🆘 Если что-то не работает
1. **Workflow не появляется** → проверьте путь `.github/workflows/`
2. **Сборка падает** → смотрите логи в failed job
3. **APK не устанавливается** → включите "Неизвестные источники" в Android

---

**💡 Совет:** Используйте [detailed-github-setup.html](detailed-github-setup.html) для подробной инструкции со скриншотами!