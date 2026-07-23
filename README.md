# 🎒 Amanat Connect Backend

A robust RESTful API for **Amanat Connect**, a campus lost & found platform that enables students to report lost or found items, submit claims, and allows administrators to manage reports and claims through a secure approval workflow.

## ✨ Features

### 🔐 Authentication & Authorization

- User Registration & Login
- JWT Authentication
- HTTP-only Cookie Authentication
- Protected Routes
- Role-based Authorization (User/Admin)
- Forgot Password
- Reset Password
- Change Password

### 📦 Asset Management

- Report Lost Items
- Report Found Items
- Update Asset Details
- Delete Assets
- Get All Approved Assets
- Get Single Asset
- Get User's Reported Assets
- Asset Approval by Admin

### 🤝 Claim Management

- Submit Claim Requests
- Prevent Duplicate Claims
- Prevent Self Claims
- Approve or Reject Claims
- Automatically Update Asset Status

### 👤 User Management

- View User Profile
- Update Profile
- Upload Profile Image

### ☁️ File Uploads

- Multer
- Cloudinary Integration

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- TypeScript
- JWT
- bcrypt
- Multer
- Cloudinary
- Cookie Parser
- Nodemailer
- Express Validator

## 📂 Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── types/
├── utils/
├── validations/
└── index.ts
```

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/Muhammad-Zain-Crafter/amanat-connect-backend.git
```

### Navigate to the project

```bash
cd amanat-connect-backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=6000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USER=
MAILTRAP_PASS=
MAILTRAP_SENDER_EMAIL=
```

### Run Development Server

```bash
npm run dev
```

Server runs on

```
http://localhost:6000
```

## 📌 API Highlights

### Authentication

- Register
- Login
- Logout
- Forgot Password
- Reset Password
- Change Password

### Assets

- Report Asset
- Get All Assets
- Get Single Asset
- Update Asset
- Delete Asset
- Get My Assets
- Approve Asset

### Claims

- Create Claim
- Get My Claims
- Get All Claims (Admin)
- Approve Claim
- Reject Claim

## 🔗 Frontend Repository

https://github.com/Muhammad-Zain-Crafter/amanat-connect-frontend

## 🚧 Project Status

This project is actively under development.

### Planned Improvements

- Email Notifications
- Dashboard Analytics
- Advanced Search & Filtering
- Pagination
- Unit Testing
- Docker Support
- CI/CD Pipeline
- API Documentation (Swagger)

## 👨‍💻 Author

**Muhammad Zain**

- GitHub: https://github.com/Muhammad-Zain-Crafter
- LinkedIn: https://www.linkedin.com/in/muhammad-zain-19ba6a319/

---

⭐ If you found this project helpful, consider giving it a star!
