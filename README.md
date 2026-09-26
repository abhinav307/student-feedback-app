# 📝 Formify

Formify is a modern, highly interactive, and scalable full-stack application for building dynamic forms, quizzes, and feedback surveys. It features advanced form validation, timer-based quizzes, conditional logic, Google OAuth authentication, and rich media support.

---

## 🌐 Live Demo & Production Links

- **Frontend (Live Application)**: [https://formify-mocha.vercel.app](https://formify-mocha.vercel.app)
- **Backend API**: [https://formify-backend-38ni.onrender.com](https://formify-backend-38ni.onrender.com)

*(Note: The backend is hosted on Render's free tier, so it may take ~30 seconds to wake up upon initial request if it has been idle).*

---

## 🏗️ Production Tech Stack & Platforms

Formify is built using a modern JavaScript/Node ecosystem and is distributed across highly reliable cloud platforms to ensure scalability and data persistence.

### 🖥️ Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State & Routing**: React Router DOM v6
- **Testing**: Vitest & React Testing Library
- **Hosting**: [Vercel](https://vercel.com) - Provides edge-network delivery and fast SPA routing.

### ⚙️ Backend
- **Framework**: Node.js & Express.js
- **Architecture**: RESTful API
- **Testing**: Vitest & Supertest (Integration Testing)
- **Hosting**: [Render](https://render.com) - Powers the Node API securely in the cloud.

### 🗄️ Database & Storage
- **Primary Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database) - A fully managed cloud NoSQL database that safely stores users, forms, form responses, and metrics.
- **Media Storage**: [Cloudinary](https://cloudinary.com/) - A robust cloud media API used to permanently host uploaded images, videos, and audio (preventing the data-loss issues common with ephemeral PaaS filesystems).

### 🔒 Security & Infrastructure
- **Authentication**: [Google Cloud OAuth 2.0](https://console.cloud.google.com/) - Provides seamless, secure "Sign in with Google" functionality.
- **CI/CD**: **GitHub Actions** - Automated pipelines that run the full 55+ integration & unit test suite on every push to ensure code stability before deployment.

---

## ✨ Key Features

- **Drag & Drop Form Builder**: Create complex layouts intuitively.
- **Quiz Mode**: Assign points, negative marking, explanations, and enforce timed attempts.
- **Rich Media**: Upload images, audio, and videos directly into form blocks.
- **Advanced Logic**: Supports required fields, validation, and date restrictions.
- **Authentication**: Two-Step OTP email verification and one-click Google Sign-In.
- **Analytics Dashboard**: Real-time insights and visualizations of form responses.

---

## 🚀 Local Development Setup

If you want to run Formify locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/abhinav307/student-feedback-app.git
cd student-feedback-app
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
CLOUDINARY_URL=your_cloudinary_url
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Running Tests
Both the frontend and backend have comprehensive test suites.
- To test the backend: `cd backend && npm run test`
- To test the frontend: `cd frontend && npm run test`

---
*Built with ❤️ for modern data collection.*
