// This file provides mock data for development when no MongoDB connection is available
import { ObjectId } from "mongodb";

// Mock users collection
export const users = [
  {
    _id: new ObjectId(),
    name: "Admin User",
    email: "admin@example.com",
    passwordHash:
      "$2b$12$bKS8kuf.FtpXEgs3j3xBpuxc7/XbQ.ZEec4DRk8AOolzXjGosQgH6", // hashed "password123"
    role: "admin",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    _id: new ObjectId(),
    name: "Business Owner",
    email: "business@example.com",
    passwordHash:
      "$2b$12$bKS8kuf.FtpXEgs3j3xBpuxc7/XbQ.ZEec4DRk8AOolzXjGosQgH6", // hashed "password123"
    role: "business",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    _id: new ObjectId(),
    name: "Client User",
    email: "client@example.com",
    passwordHash:
      "$2b$12$bKS8kuf.FtpXEgs3j3xBpuxc7/XbQ.ZEec4DRk8AOolzXjGosQgH6", // hashed "password123"
    role: "client",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
];

// Mock businesses collection
const businessOwnerId = users[1]._id;

export const businesses = [
  {
    _id: new ObjectId(),
    name: "Beauty Salon Атырау",
    description: "Premium beauty salon services in the center of Atyrau",
    owner: businessOwnerId,
    address: {
      street: "123 Main Street",
      city: "Atyrau",
      zipCode: "060000",
      coordinates: {
        lat: 47.11,
        lng: 51.92,
      },
    },
    contact: {
      phone: "+77012345678",
      email: "salon@example.com",
    },
    workingHours: {
      monday: { isOpen: true, open: "09:00", close: "18:00" },
      tuesday: { isOpen: true, open: "09:00", close: "18:00" },
      wednesday: { isOpen: true, open: "09:00", close: "18:00" },
      thursday: { isOpen: true, open: "09:00", close: "18:00" },
      friday: { isOpen: true, open: "09:00", close: "18:00" },
      saturday: { isOpen: true, open: "10:00", close: "16:00" },
      sunday: { isOpen: false, open: "10:00", close: "16:00" },
    },
    category: "Beauty",
    images: ["https://example.com/images/salon1.jpg"],
    isActive: true,
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-02-15"),
  },
];

// Mock services collection
const businessId = businesses[0]._id;

export const services = [
  {
    _id: new ObjectId(),
    name: "Haircut",
    description: "Professional haircut by experienced stylists",
    business: businessId,
    price: 5000,
    currency: "KZT",
    duration: 30, // in minutes
    category: "Hair",
    isActive: true,
    createdAt: new Date("2025-02-20"),
    updatedAt: new Date("2025-02-20"),
  },
  {
    _id: new ObjectId(),
    name: "Manicure",
    description: "Professional manicure with premium products",
    business: businessId,
    price: 4000,
    currency: "KZT",
    duration: 45, // in minutes
    category: "Nails",
    isActive: true,
    createdAt: new Date("2025-02-20"),
    updatedAt: new Date("2025-02-20"),
  },
];

// Mock appointments collection
const clientId = users[2]._id;
const serviceId = services[0]._id;

export const appointments = [
  {
    _id: new ObjectId(),
    service: serviceId,
    business: businessId,
    client: clientId,
    clientName: "Client User",
    clientPhone: "+77011234567",
    clientEmail: "client@example.com",
    date: new Date("2025-07-15"),
    startTime: "14:00",
    endTime: "14:30",
    status: "confirmed",
    paymentStatus: "pending",
    createdAt: new Date("2025-07-01"),
    updatedAt: new Date("2025-07-01"),
  },
];
