import { NotificationTemplates } from "./types";

export const notificationTemplates: NotificationTemplates = {
  // Authentication
  loginSuccess: {
    title: "Добро пожаловать!",
    message: "Вы успешно вошли в систему",
  },
  loginError: {
    title: "Ошибка входа",
    message: "Неверный email или пароль",
  },
  logoutSuccess: {
    title: "До свидания!",
    message: "Вы успешно вышли из системы",
  },
  registrationSuccess: {
    title: "Регистрация завершена",
    message: "Ваш аккаунт успешно создан",
  },

  // Business operations
  businessProfileSaved: {
    title: "Профиль сохранен",
    message: "Информация о бизнесе успешно обновлена",
  },
  businessProfileError: {
    title: "Ошибка сохранения",
    message: "Не удалось сохранить профиль бизнеса",
  },

  // Service management
  serviceCreated: {
    title: "Услуга добавлена",
    message: "Новая услуга успешно создана",
  },
  serviceUpdated: {
    title: "Услуга обновлена",
    message: "Информация об услуге сохранена",
  },
  serviceDeleted: {
    title: "Услуга удалена",
    message: "Услуга была успешно удалена",
  },
  serviceError: {
    title: "Ошибка услуги",
    message: "Не удалось выполнить операцию с услугой",
  },

  // Client management
  clientCreated: {
    title: "Клиент добавлен",
    message: "Новый клиент успешно добавлен в базу",
  },
  clientUpdated: {
    title: "Клиент обновлен",
    message: "Информация о клиенте сохранена",
  },
  clientDeleted: {
    title: "Клиент удален",
    message: "Клиент был удален из базы данных",
  },
  clientError: {
    title: "Ошибка клиента",
    message: "Не удалось выполнить операцию с клиентом",
  },

  // Appointments
  appointmentCreated: {
    title: "Запись создана",
    message: "Новая запись успешно добавлена",
  },
  appointmentUpdated: {
    title: "Запись обновлена",
    message: "Информация о записи сохранена",
  },
  appointmentCancelled: {
    title: "Запись отменена",
    message: "Запись была успешно отменена",
  },
  appointmentError: {
    title: "Ошибка записи",
    message: "Не удалось выполнить операцию с записью",
  },

  // Payments
  paymentSuccess: {
    title: "Платеж прошел",
    message: "Платеж успешно обработан",
  },
  paymentPending: {
    title: "Ожидание платежа",
    message: "Платеж находится в обработке",
  },
  paymentError: {
    title: "Ошибка платежа",
    message: "Не удалось обработать платеж",
  },

  // General
  saveSuccess: {
    title: "Сохранено",
    message: "Изменения успешно сохранены",
  },
  saveError: {
    title: "Ошибка сохранения",
    message: "Не удалось сохранить изменения",
  },
  deleteSuccess: {
    title: "Удалено",
    message: "Элемент успешно удален",
  },
  deleteError: {
    title: "Ошибка удаления",
    message: "Не удалось удалить элемент",
  },
  networkError: {
    title: "Ошибка сети",
    message: "Проверьте подключение к интернету",
  },
  validationError: {
    title: "Ошибка валидации",
    message: "Проверьте правильность заполнения полей",
  },
};
