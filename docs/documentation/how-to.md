---
# ✅ Как сделать, чтобы Copilot ссылался на эти файлы

## 💡 Как работает Copilot

Copilot использует **контекст открытых файлов и недавнюю историю в редакторе**, а также глобально видит твои файлы проекта.
Если ты открываешь несколько Markdown-файлов (например, `ARCHITECTURE.md`, `DATABASE.md`), он использует их как «hint» при генерации кода.
---

## ⚙️ Настройка в VS Code

### 1️⃣ Включи Copilot и Copilot Labs

- Установи **GitHub Copilot** и **GitHub Copilot Labs** из Extensions
- В настройках (`Cmd/Ctrl + ,`) включи:
  - ✅ `Copilot: Enable`
  - ✅ `Copilot: Enable for All Languages`
  - ✅ `Copilot: Inline Suggest`
- В Copilot Labs активируй функции Explain, Test, Brushes

---

### 2️⃣ Открой архитектурные файлы вместе с кодом

- Открой, например, `ARCHITECTURE.md` и одновременно `index.tsx` или `api/appointments.ts`.
- Copilot будет видеть открытые файлы как контекст и подсказывать более осмысленные предложения (с учетом твоей структуры).

---

### 3️⃣ Закрепи архитектурные файлы в редакторе

- VS Code поддерживает функцию "Keep Open" (маленький пин 📌 на вкладке).
- Закрепи ключевые файлы (`ARCHITECTURE.md`, `DATABASE.md`, `FRONTEND.md`, `USER_FLOWS.md`).

---

### 4️⃣ Используй Copilot comments (prompts)

Ты можешь прямо в коде писать:

```ts
// Copilot: Create API route for creating a new appointment using MongoDB schema from ARCHITECTURE.md
```
