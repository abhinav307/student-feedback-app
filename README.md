# Formify: Student Feedback & Form Management Platform

A modern, production-ready SaaS application for creating, managing, and distributing student feedback forms, surveys, and quizzes.

## Features
- **Form Builder**: Drag-and-drop interface to create dynamic forms.
- **Form Customization Studio**: Change colors, fonts, and layout instantly.
- **Manager Dashboard**: View all forms, responses, and statistics in real time.
- **Public Form Link**: Instantly share generated forms with students.
- **Digital Receipts**: Students receive a downloadable PDF receipt after submitting a form with a QR code for validation.
- **Analytics**: View insightful metrics on responses.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Recharts, HTML2PDF
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)

## Getting Started Locally

### 1. Using Docker (Recommended)
Make sure you have Docker Desktop installed.
```bash
docker-compose up --build
```
This will start MongoDB, the Backend (Port 5000), and the Frontend (Port 5173).

### 2. Manual Setup
**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials
Once running, go to `http://localhost:5173/login`
You can create an account on the "Register" tab and start creating forms!
