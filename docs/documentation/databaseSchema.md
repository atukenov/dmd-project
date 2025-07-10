# 💾 Структура базы данных (MongoDB)

## 💡 Основные коллекции

### 1️⃣ Users

- `_id`
- `name`
- `email`
- `phone`
- `role` (admin, businessOwner, client)
- `passwordHash`

---

### 2️⃣ Businesses

- `_id`
- `ownerId` (ссылка на Users)
- `name`
- `address`
- `description`
- `workingHours`
- `socialLinks`
- `kaspiQrLink`

---

### 3️⃣ Clients

- `_id`
- `businessId`
- `name`
- `phone`
- `visitHistory` (список визитов: дата, услуга)

---

### 4️⃣ Services

- `_id`
- `businessId`
- `name`
- `price`
- `duration`
- `description`

---

### 5️⃣ Appointments

- `_id`
- `businessId`
- `clientId`
- `serviceId`
- `date`
- `status` (pending, confirmed, canceled, completed)
- `notes`

---

### 6️⃣ Payments

- `_id`
- `businessId`
- `clientId`
- `amount`
- `status` (pending, paid, refunded)
- `paymentMethod` (Kaspi, cash, etc.)
- `date`
