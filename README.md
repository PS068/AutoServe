# <div align="center">⚡ AutoServe</div>

<div align="center">

### **Next-Generation EV & Smart Vehicle Service Operations Platform**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF6384?style=for-the-badge&logo=chart.js)](https://recharts.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

</div>

---

## 📌 Executive Overview

**AutoServe** is an end-to-end, ultra-modern web application designed for Electric Vehicle (EV) and Smart Automotive Service Centers. It seamlessly connects vehicle owners, service advisors, garage managers, and technicians into a single, unified digital workflow. 

From **real-time AI-inspired intelligence dashboards** and **dynamic interactive charts** to **PDF invoice generation** and **live job card updates**, AutoServe elevates automotive service management to enterprise standards.

---

## ✨ Key Features & Capabilities

### 🚗 Customer Portal
* **Seamless Service Booking Wizard**: 4-step interactive booking for 2-wheelers, 4-wheelers, and heavy EVs with optional vehicle model input.
* **My Garage**: Track active service progress, view historical job cards, and download official invoices.
* **Live Job Tracking**: Visual progress indicators from *Pending* ➔ *In Inspection* ➔ *Servicing* ➔ *Quality Check* ➔ *Ready for Pickup*.

### 📊 Admin & Manager Control Center
* **Business Intelligence & Analytics**: Interactive Power BI / Tableau-style charts using **Recharts** (Monthly Performance Area Charts, Revenue Distribution Pies, Operations Health Radars, Service Mix Bar Charts).
* **Live Operations Kanban & Data Tables**: Filter, search, and manage bookings across multiple garage bays.
* **Quick Intake Modal**: Onboard new walk-in customer vehicles instantly with auto-assigned job cards.

### 🧾 Invoicing & Communication
* **Invoice Generator & Printing**: One-click printable PDF invoice generation with itemized parts & labor costs.
* **WhatsApp / SMS Dispatch**: Pre-formatted dispatch messages for automated customer notification upon service completion.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) with [Vite 8](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Custom Glassmorphism, Dark UI Theme |
| **Data Visualization** | [Recharts 3](https://recharts.org/) (Responsive Area, Pie, Radar & Bar Charts) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State & Auth** | Context API (`AuthContext`), SessionStorage, Firebase integration |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |

---

## 🔑 Demo Access Credentials

To test different roles within the application, use the pre-configured credentials below:

| Role | Email / ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin@autoserve.com` *(or `admin`)* | `Admin@2026` | Full System Access & BI Analytics |
| 🔧 **Mechanic / Staff** | `mike@autoserve.com` | `password123` | Job Card Management & Tech Inspection |
| 👤 **Customer** | `sarah.j@example.com` | `password123` | Vehicle Booking & Garage Dashboard |

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/autoserve.git
   cd autoserve
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173` (or port displayed in your terminal).

---

## 📁 Project Architecture

```
Autoserve/
├── src/
│   ├── components/            # UI Components (IntelligencePanel, Modals, Navbar, etc.)
│   ├── context/               # React Context Providers (AuthContext)
│   ├── data/                  # Mock Databases & Schema Definitions (dummyData.js)
│   ├── pages/                 # Main Views & Routes
│   │   ├── Home.jsx           # Landing Page
│   │   ├── Login.jsx          # Authentication Page
│   │   ├── BookService.jsx    # 4-Step Booking Wizard
│   │   ├── MyGarage.jsx       # Customer Garage View
│   │   ├── AdminDashboard.jsx # Admin Operation Center & BI
│   │   └── ...
│   ├── App.jsx                # Main Router & Protection Wrappers
│   └── main.jsx               # React Application Entry Point
├── package.json               # Project Manifest
└── README.md                  # Project Documentation
```

---

## 📄 License

This project is licensed under the **MIT License** — feel free to customize and expand for your garage or enterprise requirements!
