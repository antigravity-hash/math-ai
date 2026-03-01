# Math AI — System Architecture & How it Works

This document provides a technical overview of the Math AI platform, explaining the core components, data flow, and the integration of AI for mathematical reasoning.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Vanilla CSS.
- **Backend**: Next.js API Routes (Node.js runtime).
- **Database**: SQLite (via `better-sqlite3`) for persistent storage of users, solutions, and proficiency.
- **AI Engine**: Llama 3.3 70B (via Groq API) for mathematical problem solving and evaluation.
- **Authentication**: JWT-based session management with `jose` and `httpOnly` cookies.

---

## 🏗️ Core Components

### 1. AI Solving Engine (`lib/gemini.js`)
The heart of the application. It interfaces with the Groq API to:
- **Solve Problems**: Converts natural language math problems into structured JSON containing step-by-step explanations, formulas, and final answers.
- **Generate Practice**: Creates unique math problems based on topic and difficulty.
- **Evaluate Answers**: Compares student answers against correct ones, providing encouraging feedback and hints.

### 2. Database Schema (`lib/db.js`)
A local SQLite database manages:
- **Users**: Credentials (hashed with bcrypt), coins, streaks, and ranks.
- **Solutions**: A history of solved problems linked to users.
- **Proficiency**: Tracking user's skill levels across different math topics (Algebra, Calculus, etc.).
- **Daily Challenges**: Scheduled math tasks with rewards.

### 3. Authentication Flow (`lib/auth.js` & API)
- **Login/Signup**: Validates credentials, issues a JWT, and sets it as an `httpOnly` cookie.
- **Session Sync**: The `/api/auth/me` endpoint allows the frontend to verify the session on page load, ensuring the UI stays in sync with the server.

---

## 🔄 Data Flow: Solving a Problem

1. **User Input**: The user enters a math problem in the Solver UI.
2. **API Request**: The frontend sends a POST request to `/api/solve`.
3. **AI Reasoning**: The server calls `solveMathProblem()`, which sends a specialized system prompt to Llama 3.3.
4. **Structured Mapping**: The AI returns a JSON object. The server parses this and:
   - Saves the solution to the database (if the user is logged in).
   - Awards 15 coins to the user.
   - Updates the user's proficiency score for that specific topic.
5. **UI Update**: The frontend receives the JSON and renders the steps, the final answer, and an interactive SVG graph (if applicable).

---

## 📈 Interactive Graphing
The system uses a custom `MiniGraph` component (`components/shared.jsx`) that:
- Receives a JavaScript-compatible equation string from the AI (e.g., `Math.pow(x, 2)`).
- Safely evaluates the function over a range of X values.
- Renders a responsive SVG path to visualize the function's curve.

---

## 🔒 Security & Optimization
- **Password Hashing**: All passwords are stored using BCRYPT.
- **JWT Protection**: Sessions are protected by signed tokens that expire after 7 days.
- **Middleware-ready**: API routes check for authentication using the `getUserFromRequest` utility.
- **Zero-Dependency Styling**: Uses pure CSS for lightning-fast performance and full control over the "glassmorphism" aesthetic.
