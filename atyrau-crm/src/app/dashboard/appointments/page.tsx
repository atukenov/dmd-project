"use client";

import { Calendar } from "@/components/molecules/Calendar";
import { useAppointments } from "@/hooks/useAppointments";
import { formatDate, formatTimeDisplay } from "@/lib/utils/date-utils";
import { useBusinessStore } from "@/store/businessStore";
import { useCallback, useEffect, useState } from "react";

interface Appointment {
  _id: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  paymentStatus: "pending" | "paid" | "refunded";
  notes: string;
  client: {
    name: string;
    phone: string;
    email: string;
  };
  service?: {
    name: string;
    duration: number;
    price: number;
  };
}

interface SlotAppointment extends Appointment {
  isMainSlot?: boolean;
  isSpannedSlot?: boolean;
  slotsToSpan?: number;
  availableMinutesInLastSlot?: number;
  durationMinutes?: number;
}

interface TimeSlot {
  time: string;
  hour: number;
  minutes: number;
  dateTime: Date;
  appointments: SlotAppointment[];
}

export default function AppointmentsPage() {
  const { businessId } = useBusinessStore();
  const {
    services,
    servicesLoading,
    servicesError,
    createAppointment,
    isCreating,
  } = useAppointments();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showNewAppointmentForm, setShowNewAppointmentForm] =
    useState<boolean>(false);
  const [isUpdatingAppointment, setIsUpdatingAppointment] =
    useState<boolean>(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    serviceId: "",
    startTime: `${selectedDate.toISOString().split("T")[0]}T09:00`,
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
  });

  // Function to fetch appointments for the selected date
  const fetchAppointments = useCallback(async () => {
    if (!selectedDate || !businessId) return;

    setIsLoading(true);
    setError(null);

    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/appointments/list?businessId=${businessId}&startDate=${dateString}&endDate=${dateString}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();

      // Handle the ApiResponseService structure: { success: true, data: { appointments: [...] } }
      if (data.success && data.data && data.data.appointments) {
        setAppointments(data.data.appointments);
      } else if (data.success === false) {
        // Handle API error response
        throw new Error(data.error || "Failed to fetch appointments");
      } else {
        // Fallback for unexpected response structure
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, businessId]);

  // Fetch appointments when selectedDate or businessId changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle status change
  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      setIsUpdatingAppointment(true);
      const response = await fetch("/api/appointments/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      // Refresh appointments from server to ensure consistency
      await fetchAppointments();

      // Update selected appointment if it's the one being updated
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, status: newStatus as Appointment["status"] } : null
        );
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(
        `Failed to update appointment: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChange = async (
    appointmentId: string,
    newPaymentStatus: string
  ) => {
    try {
      setIsUpdatingAppointment(true);
      const response = await fetch("/api/appointments/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      // Refresh appointments from server to ensure consistency
      await fetchAppointments();

      // Update selected appointment if it's the one being updated
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: newPaymentStatus as Appointment["paymentStatus"],
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(
        `Failed to update payment status: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (
    appointmentId: string,
    reason: string
  ) => {
    try {
      setIsUpdatingAppointment(true);
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          cancellationReason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      // Refresh appointments from server to ensure consistency
      await fetchAppointments();

      // Close the modal since appointment is cancelled
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(
        `Failed to cancel appointment: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    } finally {
      setIsUpdatingAppointment(false);
    }
  };

  // Generate time slots for the day (8 AM to 8 PM) with 15-minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 20;

    // Generate 15-minute time slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hour, minutes, 0, 0);

        slots.push({
          time: timeSlot,
          hour: hour,
          minutes: minutes,
          dateTime: slotDateTime,
          appointments: [],
        });
      }
    }

    // Track which slots should be hidden due to spanning appointments
    const hiddenSlots = new Set<number>();
    const processedAppointments = new Set<string>();

    appointments.forEach((appointment) => {
      if (processedAppointments.has(appointment._id)) return;

      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);

      // Find the starting slot
      const startSlotIndex = slots.findIndex((slot) => {
        const slotTime = slot.dateTime.getTime();
        const nextSlotTime = slotTime + 15 * 60 * 1000; // 15 minutes later
        return startTime >= slot.dateTime && startTime < new Date(nextSlotTime);
      });

      if (startSlotIndex !== -1) {
        // Calculate how many 15-minute slots this appointment spans
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));
        const slotsToSpan = Math.ceil(durationMinutes / 15);

        // Add appointment only to the starting slot with spanning info
        slots[startSlotIndex].appointments.push({
          ...appointment,
          isMainSlot: true,
          slotsToSpan,
          durationMinutes: durationMinutes,
        });

        // Mark all subsequent spanned slots to be hidden
        for (let i = 1; i < slotsToSpan; i++) {
          if (startSlotIndex + i < slots.length) {
            hiddenSlots.add(startSlotIndex + i);
          }
        }

        processedAppointments.add(appointment._id);
      }
    });

    // Filter out hidden slots to create a clean view
    return slots.filter((_, index) => !hiddenSlots.has(index));
  };

  const timeSlots = generateTimeSlots();

  // Calculate and display end time based on selected service
  const getCalculatedEndTime = () => {
    if (!newAppointmentData.serviceId || !newAppointmentData.startTime) {
      return "";
    }

    const selectedService = services.find(
      (s) => s.id === newAppointmentData.serviceId
    );
    if (!selectedService) {
      return "";
    }

    // Parse the datetime-local string correctly (it's in local time format)
    // datetime-local format: "2025-07-13T12:00"
    const startTimeStr = newAppointmentData.startTime;

    // Create date object from local time string
    const [datePart, timePart] = startTimeStr.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create date in local timezone
    const startTime = new Date(year, month - 1, day, hour, minute);

    // Add service duration in minutes
    const endTime = new Date(
      startTime.getTime() + selectedService.duration * 60 * 1000
    );

    // Format back to datetime-local string (YYYY-MM-DDTHH:MM)
    const year2 = endTime.getFullYear();
    const month2 = String(endTime.getMonth() + 1).padStart(2, "0");
    const day2 = String(endTime.getDate()).padStart(2, "0");
    const hour2 = String(endTime.getHours()).padStart(2, "0");
    const minute2 = String(endTime.getMinutes()).padStart(2, "0");

    return `${year2}-${month2}-${day2}T${hour2}:${minute2}`;
  };

  // Handle clicking on a free time slot to create appointment
  const handleTimeSlotClick = (hour: number, minutes: number) => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");

    // Build date string in YYYY-MM-DD
    const dateStr = `${year}-${month}-${day}`;

    const timeStr = `${hour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    const startTime = `${dateStr}T${timeStr}`;

    setNewAppointmentData({
      serviceId: "",
      startTime: startTime,
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      notes: "",
    });

    setShowNewAppointmentForm(true);
  };

  // Handle form field changes
  const handleAppointmentFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setNewAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new appointment creation
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createAppointment(newAppointmentData);

      // Close form and refresh appointments
      setShowNewAppointmentForm(false);

      // Reset form data
      setNewAppointmentData({
        serviceId: "",
        startTime: `${selectedDate.toISOString().split("T")[0]}T09:00`,
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        notes: "",
      });

      // Refresh appointments for the selected date
      fetchAppointments();

      alert("Appointment created successfully");
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(
        `Failed to create appointment: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Управление записями</h1>
        <p className="text-text-muted mt-1">Просматривайте и управляйте записями клиентов</p>
      </div>

      {!businessId && (
        <div className="bg-warning/10 border-l-4 border-warning text-warning-dark p-4 mb-6 rounded-r-md">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">Внимание!</p>
              <p>
                Бизнес не выбран. Пожалуйста, выберите или создайте бизнес в
                настройках.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-content-bg rounded-lg shadow-card border border-card-border p-4">
          <h2 className="text-lg font-semibold mb-3 text-heading">
            Выберите дату
          </h2>
          <Calendar
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Appointments List */}
        <div className="md:col-span-2 bg-content-bg rounded-lg shadow-card border border-card-border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-heading">
              Записи на {formatDate(selectedDate)}
            </h2>
            <div className="text-sm text-text-muted">
              Нажмите на свободное время чтобы создать запись
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-error p-4 text-center font-medium">{error}</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="border border-card-border rounded-md"
                >
                  {/* Time Slot Header */}
                  <div
                    className={`bg-card-muted px-4 py-2 border-b border-card-border ${
                      slot.appointments.length === 0
                        ? "cursor-pointer hover:bg-hover-bg transition-colors"
                        : ""
                    }`}
                    onClick={
                      slot.appointments.length === 0
                        ? () => handleTimeSlotClick(slot.hour, slot.minutes)
                        : undefined
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {slot.time}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {slot.appointments.length === 0 ? (
                          <span className="flex items-center space-x-1">
                            <span>📅</span>
                            <span>Свободно</span>
                          </span>
                        ) : (
                          `${slot.appointments.length} ${
                            slot.appointments.length === 1
                              ? "запись"
                              : "записей"
                          }`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Appointments in this time slot */}
                  <div className="p-2">
                    {slot.appointments.length === 0 ? (
                      <div
                        className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        onClick={() =>
                          handleTimeSlotClick(slot.hour, slot.minutes)
                        }
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span>💡</span>
                          <span>Нажмите чтобы создать запись</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slot.appointments.map((appointment) => {
                          // All appointments here are main appointments since spanned slots are hidden
                          return (
                            <div
                              key={appointment._id}
                              className={`p-4 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 border-l-4 ${
                                appointment.status === "cancelled"
                                  ? "border-gray-400 bg-gray-50 dark:bg-gray-700 opacity-60"
                                  : appointment.status === "completed"
                                  ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                                  : appointment.status === "no-show"
                                  ? "border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                  : "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              }`}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {appointment.client.name}
                                    </p>
                                  </div>

                                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">
                                      {formatTimeDisplay(appointment.startTime)}{" "}
                                      - {formatTimeDisplay(appointment.endTime)}
                                    </span>
                                    {appointment.durationMinutes && (
                                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                        ({appointment.durationMinutes} мин)
                                      </span>
                                    )}
                                  </div>

                                  {appointment.service && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {appointment.service.name} •{" "}
                                      {appointment.service.price} ₸
                                    </p>
                                  )}

                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    📞 {appointment.client.phone}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-1 items-end">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      appointment.status === "scheduled"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                                        : appointment.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                        : appointment.status === "cancelled"
                                        ? "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                                    }`}
                                  >
                                    {appointment.status === "scheduled" &&
                                      "Запланировано"}
                                    {appointment.status === "completed" &&
                                      "Завершено"}
                                    {appointment.status === "cancelled" &&
                                      "Отменено"}
                                    {appointment.status === "no-show" &&
                                      "Не явился"}
                                  </span>

                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      appointment.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                        : appointment.paymentStatus ===
                                          "refunded"
                                        ? "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                                    }`}
                                  >
                                    {appointment.paymentStatus === "paid" &&
                                      "💰 Оплачено"}
                                    {appointment.paymentStatus === "refunded" &&
                                      "↩️ Возмещено"}
                                    {appointment.paymentStatus === "pending" &&
                                      "⏳ Ожидает"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-lg font-medium">Нет записей на эту дату</p>
                  <p className="text-sm">
                    Нажмите на любое время выше чтобы создать первую запись
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Form Modal */}
      {showNewAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-content-bg rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-modal border border-card-border">
            <h2 className="text-xl font-bold mb-4 text-heading">
              Создать новую запись
            </h2>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label
                  htmlFor="serviceId"
                  className="block text-sm font-medium text-text mb-1"
                >
                  Услуга *
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={newAppointmentData.serviceId}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-input-border bg-input-bg text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">Выберите услугу</option>
                  {servicesLoading ? (
                    <option disabled>Загрузка услуг...</option>
                  ) : servicesError ? (
                    <option disabled>Ошибка загрузки услуг: {servicesError}</option>
                  ) : services.length === 0 ? (
                    <option disabled>Услуги не найдены</option>
                  ) : (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.duration} мин, {service.price}{" "}
                        KZT)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Дата и время начала *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={newAppointmentData.startTime}
                    onChange={handleAppointmentFormChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="calculatedEndTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Время окончания
                  </label>
                  <input
                    type="datetime-local"
                    id="calculatedEndTime"
                    name="calculatedEndTime"
                    value={getCalculatedEndTime()}
                    disabled
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md bg-gray-100 dark:bg-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Рассчитывается автоматически на основе длительности услуги
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Имя клиента *
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={newAppointmentData.clientName}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="clientPhone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={newAppointmentData.clientPhone}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={newAppointmentData.clientEmail}
                  onChange={handleAppointmentFormChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Заметки
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newAppointmentData.notes}
                  onChange={handleAppointmentFormChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentForm(false)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                >
                  {isCreating ? "Создание..." : "Создать запись"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Детали записи
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Клиент
                </p>
                <p className="font-semibold dark:text-white">
                  {selectedAppointment.client.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Контактная информация
                </p>
                <p className="dark:text-white">
                  {selectedAppointment.client.phone}
                </p>
                {selectedAppointment.client.email && (
                  <p className="dark:text-white">
                    {selectedAppointment.client.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Дата
                  </p>
                  <p className="dark:text-white">
                    {formatDate(new Date(selectedAppointment.startTime))}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Время
                  </p>
                  <p className="dark:text-white">
                    {formatTimeDisplay(selectedAppointment.startTime)} -{" "}
                    {formatTimeDisplay(selectedAppointment.endTime)}
                  </p>
                </div>
              </div>

              {selectedAppointment.service && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Услуга
                  </p>
                  <p className="dark:text-white">
                    {selectedAppointment.service.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAppointment.service.duration} мин ·{" "}
                    {selectedAppointment.service.price} KZT
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Заметки
                  </p>
                  <p className="dark:text-white">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Статус записи
                </p>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  value={selectedAppointment.status}
                  onChange={(e) =>
                    handleStatusChange(selectedAppointment._id, e.target.value)
                  }
                  disabled={
                    selectedAppointment.status === "cancelled" ||
                    isUpdatingAppointment
                  }
                >
                  <option value="scheduled">Запланировано</option>
                  <option value="completed">Завершено</option>
                  <option value="no-show">Не явился</option>
                  <option value="cancelled" disabled>
                    Отменено
                  </option>
                </select>
                {isUpdatingAppointment && (
                  <p className="text-xs text-blue-500 mt-1">Обновление...</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Статус оплаты
                </p>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  value={selectedAppointment.paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusChange(
                      selectedAppointment._id,
                      e.target.value
                    )
                  }
                  disabled={
                    selectedAppointment.status === "cancelled" ||
                    isUpdatingAppointment
                  }
                >
                  <option value="pending">Ожидает оплаты</option>
                  <option value="paid">Оплачено</option>
                  <option value="refunded">Возмещено</option>
                </select>
                {isUpdatingAppointment && (
                  <p className="text-xs text-blue-500 mt-1">Обновление...</p>
                )}
              </div>

              {selectedAppointment.status !== "cancelled" && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Отменить запись
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Причина отмены"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      id="cancellationReason"
                    />
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      disabled={isUpdatingAppointment}
                      onClick={() => {
                        const reason = (
                          document.getElementById(
                            "cancellationReason"
                          ) as HTMLInputElement
                        ).value;
                        handleCancelAppointment(
                          selectedAppointment._id,
                          reason
                        );
                      }}
                    >
                      {isUpdatingAppointment ? "Отмена..." : "Отменить"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
                onClick={() => setSelectedAppointment(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
