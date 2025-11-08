# 🧠 Todo List API (Backend)

A simple RESTful API built with **Express**, **TypeScript**, and **MongoDB** (via Mongoose).  
It provides CRUD operations for a Todo list and can be run locally or with Docker.

## Project Structure

src/
├── models/ # MongoDB models
│ └── Todo.ts # Todo schema and model
├── routes/ # Express routes
│ └── todoRoutes.ts # Todo API endpoints
├── controllers/ # Route controllers
│ └── todoController.ts # Business logic
├── config/ # Configuration files
│ └── database.ts # MongoDB connection
├── types/ # TypeScript type definitions
│ └── todo.ts # Todo-related types
└── constants/ # Application constants
└── todo.ts # Status constants

## 2️⃣ Install Dependencies

```bash
npm install
```

## 🧱 Run Locally (Dev Mode)

first need to run database in docker then you don't need to install and setup mongodb locally

```bash
docker compose up -d mongo

npm run dev
```

## 🐳 Run with Docker (Recommended database and backend will create together)

```bash
cp .env.docker .env
docker compose up --build
```
