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

## 📝 Input colors

### Input background

- **HEX**: `#FFFFFF`
- **Usage**: Input field backgrounds
- **Tailwind config**: `input-bg`

### Input border

- **HEX**: `#D1D5DB`
- **Usage**: Default input borders
- **Tailwind config**: `input-border`

### Input border (focus)

- **HEX**: `#1D7FBE`
- **Usage**: Focused input borders
- **Tailwind config**: `input-border-focus`

### Input text

- **HEX**: `#0F172A`
- **Usage**: Input text color
- **Tailwind config**: `input-text`

### Input placeholder

- **HEX**: `#9CA3AF`
- **Usage**: Placeholder text in inputs
- **Tailwind config**: `input-placeholder`

---

## 🃏 Card colors

### Card background

- **HEX**: `#FFFFFF`
- **Usage**: Card backgrounds, content containers
- **Tailwind config**: `card-bg`

### Card border

- **HEX**: `#E5E7EB`
- **Usage**: Card borders, dividers
- **Tailwind config**: `card-border`

### Card shadow

- **HEX**: `rgba(0, 0, 0, 0.1)`
- **Usage**: Card drop shadows
- **Tailwind config**: `card-shadow`

---

## 🖼️ Modal colors

### Modal overlay

- **HEX**: `rgba(0, 0, 0, 0.5)`
- **Usage**: Modal backdrop overlay
- **Tailwind config**: `modal-overlay`

### Modal background

- **HEX**: `#FFFFFF`
- **Usage**: Modal content background
- **Tailwind config**: `modal-bg`

### Modal border

- **HEX**: `#E5E7EB`
- **Usage**: Modal borders
- **Tailwind config**: `modal-border`

---

## 🎨 Additional UI colors

### Border colors

- **HEX**: `#E5E7EB` (default)
- **HEX**: `#D1D5DB` (strong)
- **Usage**: General borders, dividers
- **Tailwind config**: `border` / `border-strong`

### Hover states

- **HEX**: `#F3F4F6`
- **Usage**: Hover backgrounds for interactive elements
- **Tailwind config**: `hover-bg`

### Disabled states

- **HEX**: `#9CA3AF` (text)
- **HEX**: `#F3F4F6` (background)
- **Usage**: Disabled form elements and buttons
- **Tailwind config**: `disabled-text` / `disabled-bg`

### Focus ring

- **HEX**: `rgba(29, 127, 190, 0.3)`
- **Usage**: Focus ring around interactive elements
- **Tailwind config**: `focus-ring`

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
        input: {
          bg: "#FFFFFF",
          border: "#D1D5DB",
          "border-focus": "#1D7FBE",
          text: "#0F172A",
          placeholder: "#9CA3AF",
        },
        card: {
          bg: "#FFFFFF",
          border: "#E5E7EB",
          shadow: "rgba(0, 0, 0, 0.1)",
        },
        modal: {
          overlay: "rgba(0, 0, 0, 0.5)",
          bg: "#FFFFFF",
          border: "#E5E7EB",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        hover: {
          bg: "#F3F4F6",
        },
        disabled: {
          text: "#9CA3AF",
          bg: "#F3F4F6",
        },
        focus: {
          ring: "rgba(29, 127, 190, 0.3)",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        modal:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
};
```

## 💡 Usage Examples

### Card Component

```jsx
<div className="bg-card-bg border border-card-border rounded-lg shadow-card p-6">
  <h3 className="text-text font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content goes here...</p>
</div>
```

### Modal Component

```jsx
{
  /* Modal Overlay */
}
<div className="fixed inset-0 bg-modal-overlay z-50">
  {/* Modal Content */}
  <div className="bg-modal-bg border border-modal-border rounded-lg shadow-modal max-w-md mx-auto mt-20 p-6">
    <h2 className="text-text font-bold mb-4">Modal Title</h2>
    <p className="text-text-secondary mb-6">Modal content...</p>
    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded">
      Action
    </button>
  </div>
</div>;
```

### Input Component

```jsx
<input
  className="bg-input-bg border border-input-border focus:border-input-border-focus text-input-text placeholder-input-placeholder rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-focus-ring focus:outline-none"
  placeholder="Enter text..."
/>
```

### Button States

```jsx
{
  /* Primary Button */
}
<button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded focus:ring-2 focus:ring-focus-ring">
  Primary Action
</button>;

{
  /* Disabled Button */
}
<button
  className="bg-disabled-bg text-disabled-text px-4 py-2 rounded cursor-not-allowed"
  disabled
>
  Disabled Action
</button>;
```
