# 📝 Formify

Formify is a modern, highly interactive, and scalable full-stack application for building dynamic forms, quizzes, and feedback surveys. It features advanced form validation, timer-based quizzes, conditional logic, Google OAuth authentication, and rich media support.

---

## 🌍 Live Demo & Production Links

- **Main Website**: [https://www.foramify.top](https://www.foramify.top)
- **Frontend Vercel Link**: [https://formify-mocha.vercel.app](https://formify-mocha.vercel.app)
- **Backend API**: [https://formify-backend-38ni.onrender.com](https://formify-backend-38ni.onrender.com)

*(Note: The backend is hosted on Render's free tier, so it may take ~30 seconds to wake up upon initial request if it has been idle).*

---

## 🏗️ Production Tech Stack & Cloud Services

Formify relies on a powerful, distributed cloud architecture to ensure scalability, security, and permanent data persistence. We use the following industry-standard services to make the project fully workable:

### 1. Frontend & Domain Management
- **Framework**: React.js (via Vite) + Tailwind CSS
- **Frontend Hosting (Vercel)**: Vercel powers the core React application, providing Edge Network content delivery and fast Single Page Application (SPA) routing.
- **Domain Registrar (Spaceship)**: The custom domain \`foramify.top\` is registered via Spaceship and handles all global DNS routing (CNAMEs, A Records, and TXT verification records) for the frontend and email systems.

### 2. Backend & Authentication
- **Framework**: Node.js & Express.js
- **Backend Hosting (Render)**: Render runs the Node.js API server securely in the cloud, handling all business logic, form validation, and database operations.
- **Authentication (Google Cloud Console)**: Formify integrates **Google OAuth 2.0** for seamless "Sign in with Google" functionality. Security constraints are strictly bound to our custom domain origins.

### 3. Database & Media Storage
- **Primary Database (MongoDB Atlas)**: A fully managed cloud NoSQL database. Atlas safely and persistently stores all users, forms, form responses, quiz attempts, and system metrics.
- **Media Storage (Cloudinary)**: A robust cloud media API used to permanently host user-uploaded images, videos, and audio. This bypasses the data-loss issues common with ephemeral PaaS filesystems (like Render's disk) by streaming files directly to Cloudinary via \`multer-storage-cloudinary\`.

### 4. Transactional Email Delivery
- **Email Infrastructure (Resend API)**: Formify utilizes the official **Resend Node.js SDK** to deliver ultra-fast OTP verification emails and system alerts.
- **Domain Authentication (DKIM/SPF/DMARC)**: The \`foramify.top\` domain is fully verified in Resend using advanced DNS records to bypass spam filters and ensure 100% email deliverability from \`noreply@foramify.top\`.

### 5. CI/CD & Testing
- **Continuous Integration (GitHub Actions)**: Automated pipelines run the full 55+ integration & unit test suite (via Vitest) on every push to ensure code stability before deployment.

---

## ✨ Key Features

- **Drag & Drop Form Builder**: Create complex layouts intuitively.
- **Quiz Mode**: Assign points, negative marking, explanations, and enforce timed attempts.
- **Rich Media**: Upload images, audio, and videos directly into form blocks.
- **Advanced Logic**: Supports required fields, validation, and date restrictions.
- **Authentication**: Custom OTP email verification (via Resend) and one-click Google Sign-In.
- **Analytics Dashboard**: Real-time insights and visualizations of form responses.

---

## 💻 Local Development Setup

If you want to run Formify locally, follow these steps:

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/abhinav307/student-feedback-app.git
cd student-feedback-app
\`\`\`

### 2. Setup the Backend
\`\`\`bash
cd backend
npm install
\`\`\`
Create a \`.env\` file in the \`backend/\` directory:
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_URL=your_cloudinary_url
RESEND_API_KEY=your_resend_api_key
EMAIL_USER=noreply@foramify.top
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Setup the Frontend
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
Create a \`.env\` file in the \`frontend/\` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Running Tests
Both the frontend and backend have comprehensive test suites using Vitest.
- To test the backend: \`cd backend && npm run test\`
- To test the frontend: \`cd frontend && npm run test\`

---
*Built with ❤️ for modern data collection.*
