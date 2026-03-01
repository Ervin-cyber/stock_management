# 📦 StockFlow - Advanced Warehouse Management System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Fastify](https://img.shields.io/badge/Fastify-4.x-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

StockFlow is a modern, full-stack inventory and warehouse management system designed for speed, reliability, and real-time tracking. It provides a comprehensive dashboard, product tracking, and movement history, fully self-hosted on a Raspberry Pi via Cloudflare Zero Trust.

## ✨ Key Features

* **📊 Interactive Dashboard:** Real-time KPI cards (Total Products, Active Warehouses, Today's Movements) and visual traffic trends.
* **⚠️ Smart Alerts:** Automated "Low Stock" warnings for critical inventory items.
* **🔄 Movement Tracking:** Detailed audit logs for all IN, OUT, and TRANSFER operations.
* **🏢 Multi-Warehouse Support:** Seamlessly manage and transfer stock between different physical locations.
* **🔐 Secure Authentication:** Full JWT-based user authentication and registration system.
* **📱 Responsive UI:** Built with Tailwind CSS and shadcn/ui for a beautiful experience on any device.

## 🛠️ Tech Stack

### Frontend
* **React + Vite:** Lightning-fast frontend tooling.
* **Tailwind CSS & shadcn/ui:** For a highly customizable, accessible, and modern user interface.
* **React Hook Form & Zod:** Robust form validation and error handling.
* **Recharts & Lucide React:** Beautiful data visualization and scalable icons.

### Backend
* **Node.js & Fastify:** High-performance, low-overhead backend framework.
* **Prisma ORM:** Type-safe database access and schema management.
* **PostgreSQL (Neon):** Serverless, scalable relational database.

### Infrastructure & DevOps 🚀
* **Docker & Docker Compose:** Containerized application for consistent environments.
* **Raspberry Pi 4 (ARM64):** Self-hosted production environment.
* **Cloudflare Tunnel (Zero Trust):** Securely exposing local services to the internet (`papstack.net`) without opening router ports or exposing public IPs.

## 🚀 Getting Started (Local Development)

Follow these steps to set up the project locally on your machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker](https://www.docker.com/) and Docker Compose
* A PostgreSQL database (local or cloud like Neon)

### 1. Clone the repository
```bash
git clone [https://github.com/Ervin-cyber/stock_management.git](https://github.com/Ervin-cyber/stock_management.git)
cd stock_management
