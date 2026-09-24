# Formify
> A modern SaaS platform for creating, customizing, sharing, and analyzing highly engaging student forms.

Formify completely re-imagines data collection. Stop relying on uninspired, rigid forms. Formify allows you to build highly personalized, branded, multi-step forms with embedded media, logic, and comprehensive analytics—all without writing a single line of code.

## 🚀 Features

### 🎨 Form Builder & Customization (Theme Studio)
- **Drag-and-Drop Editor**: Intuitive 3-panel UI to instantly drag fields onto a live canvas.
- **Rich Media**: First-class support for uploading Images, GIFs, Videos, and Logos directly to your form.
- **Deep Theming**: Control background colors, CSS gradients, or upload custom background images.
- **Card Styling**: Adjust form container radius, shadow, transparency, and width.
- **Component Styling**: Configure global fonts, input background colors, borders, and rounded corners.

### ⚙️ Powerful Settings & Workflows
- **Publish Workflow**: Pre-publish checklist to catch empty forms.
- **Lifecycle Management**: Safely transition forms between Draft, Published, Closed, and Archived.
- **Automated Scheduling**: Define strict `Start Dates` and `End Dates` for automated form locking.
- **Submission Quotas**: Set a `Maximum Responses` limit to automatically close the form.
- **QR Code Generation**: Instantly generate, preview, and download HD `.png` QR codes for your live form.

### 📊 Responses & Data Analytics
- **Live Aggregation Engine**: Backend aggregation crunches massive Response arrays efficiently.
- **Dashboard KPIs**: Total responses, Average 1-5 Star Ratings, and 30-day volume trends.
- **Field Distribution Charts**: Automatically generated Pie Charts and Bar Charts for every choice/rating field using `recharts`.
- **Response Explorer**: Paginated data-table with full-text fuzzy searching across all student responses.
- **Exporting**: 1-click export to `CSV` and beautiful Printable `PDF` reports using `html2pdf.js`.

### 🔒 Security & Privacy
- **Student Privacy**: Authentic verifiable submission receipts via public `/verify/:receiptId` endpoints that hide student PII.
- **Local Draft Saving**: Client-side `localStorage` caching ensures students never lose their form progress on accidental refresh.
- **Secure Backend**: Modern Node.js Express server protected by JWT, Bcrypt, and strict Ownership checks on all routes.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Recharts, Lucide React, html2pdf.js, react-qr-code
- **Backend:** Node.js, Express, Mongoose, Multer (Media Uploads), JWT, Bcrypt
- **Database:** MongoDB (uses `mongodb-memory-server` out of the box for instant zero-config local testing, easily connected to MongoDB Atlas for production).

## 💻 Running Locally

You need Node.js (v18 or higher) installed.

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: The backend starts on port `5000`. By default, it provisions a temporary in-memory MongoDB database so you can start testing immediately without signing up for Atlas.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`. Create a manager account and start building!*

## 🐳 Docker Deployment

The repository includes a complete `docker-compose.yml` for production deployments.

```bash
docker-compose up --build -d
```
- The frontend will be served at `http://localhost:80`
- The backend API will be available at `http://localhost:5000`

## ⚙️ Environment Variables

To run the application in a production environment, add the following variables to your `.env` files:

**Backend (`backend/.env`):**
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/formify?retryWrites=true&w=majority
```

## 🌐 API Architecture

The backend REST API exposes standard interfaces for the Manager dashboard and isolated interfaces for Public Form interaction. All Manager routes require `Authorization: Bearer <token>`.

### Core Routes:
- `POST /api/auth/register` & `POST /api/auth/login`
- `GET /api/forms` & `POST /api/forms`
- `GET /api/forms/public/:publicId` *(Handles rate limiting and lifecycle checks)*
- `POST /api/responses/submit/:publicId` *(Handles submission and receipt generation)*
- `GET /api/responses/verify/:receiptId` *(Public verification route)*
- `GET /api/analytics/dashboard` & `GET /api/analytics/form/:formId`

## 🧑‍💻 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 

Please make sure to update tests as appropriate.

---
Built with ❤️ for Modern Data Collection.
