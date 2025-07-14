# 🎨 Color Palette & Tailwind Configuration

## 💙 Primary color

- **HEX**: `#1D7FBE`
- **Usage**: Main actions, primary buttons, important highlights
- **Tailwind config**: `primary`

---

## 🌊 Accent color

- **HEX**: `#21B6A8`
- **Usage**: Hover states, interactive accents, subtle highlights
- **Tailwind config**: `accent`

---

## ⚪ Background color

- **HEX**: `#F9FAFB`
- **Usage**: Main page background, content sections
- **Tailwind config**: `background`

---

## ⚫ Text color (main)

- **HEX**: `#0F172A`
- **Usage**: Main text, headlines
- **Tailwind config**: `text`

---

## ⚫ Text color (secondary)

- **HEX**: `#64748B`
- **Usage**: Descriptions, secondary information, muted text
- **Tailwind config**: `text-secondary`

---

## 🟢 Success color

- **HEX**: `#22C55E`
- **Usage**: Success notifications, status indicators
- **Tailwind config**: `success`

---

## 🔴 Error color

- **HEX**: `#EF4444`
- **Usage**: Error states, error notifications, delete actions
- **Tailwind config**: `error`

---

## ⚪ White

- **HEX**: `#FFFFFF`
- **Usage**: Text on dark backgrounds, button text, cards
- **Tailwind config**: `white`

---

## 🛠️ Tailwind configuration example

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D7FBE",
          hover: "#21B6A8",
        },
        accent: "#21B6A8",
        background: "#F9FAFB",
        text: {
          DEFAULT: "#0F172A",
          secondary: "#64748B",
        },
        success: "#22C55E",
        error: "#EF4444",
        white: "#FFFFFF",
      },
    },
  },
};
```
