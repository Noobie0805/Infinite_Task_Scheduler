# 🗓️ Infinite Scroll Task Scheduler

A full-stack web application that allows users to manage weekly recurring time slots with infinite horizontal scrolling.  
Each week displays Sunday–Saturday with two configurable slots per day.  
Tasks are persisted in a PostgreSQL database with recurring logic and exception handling.

---

## ⚙️ Tech Stack

**Frontend:** React + TypeScript + Tailwind  
**Backend:** Node.js + Express + TypeScript  
**Database:** PostgreSQL (Render Cloud Instance)  
**Hosting:**  
- Backend → Render  
- Frontend → Vercel  

---

## 📂 Folder Structure

```
DilSayCare_Assignment/
│
├── README.md                    # Main project overview
├── .env                         # Environment variables (gitignored)
│
├── backend/                     # Node.js + Express + PostgreSQL
│   ├── README.md               # Backend documentation
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── nodemon.json            # Development server config
│   ├── .gitignore              # Backend git ignore rules
│   ├── dist/                   # Compiled TypeScript output
│   └── src/
│       ├── app.ts              # Main application entry
│       ├── db/
│       │   └── index.ts        # Database connection
│       ├── routes/             # API route definitions
│       ├── controllers/        # Business logic handlers
│       ├── middlewares/        # Custom middleware
│       └── utils/              # Utility functions
│
└── frontend/                    # React + TypeScript (Vercel)
    ├── README.md               # Frontend documentation
    ├── package.json            # Frontend dependencies
    ├── tsconfig.json           # TypeScript configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── vite.config.ts          # Vite build configuration
    ├── dist/                   # Build output
    └── src/
        ├── App.tsx             # Main React component
        ├── main.tsx            # React entry point
        ├── App.css             # Global styles
        ├── components/         # Reusable UI components
        │   ├── TopSection/
        │   ├── WeekdaysBar/
        │   ├── FooterSection/
        │   └── TimerSlots/
        ├── pages/              # Page components
        │   ├── Home/
        │   └── Schedule/
        └── utils/              # Frontend utility functions
            └── getWeek.ts      # Week calculation logic
```

---

## 🚀 Features

1. **Infinite Horizontal Scroll** - Navigate through weeks seamlessly
2. **Recurring Task Logic** - Backend handles weekly pattern management
3. **Exception Handling** - Override specific dates without affecting patterns
4. **Two Slots Per Day** - Maximum flexibility with time management
5. **Responsive UI** - Works on desktop and mobile devices
6. 
---

## 🌐 Live Demo

- **Frontend**: [Deployed on Vercel](your-vercel-url)
- **Backend API**: [Deployed on Render](your-render-url)

---

## 👤 Author 

**Sarvjeet Kumar**  

---
