# DearMe 🔮

DearMe is a premium, AI-powered personal growth and reflection application. It allows users to reflect on their current life parameters (goals, age, struggles, timelines) and receive an emotionally intelligent, personalized, and tactical message from their future self using the Gemini API. It also includes an active chat window to hold follow-up conversations with their future identity.

Developed with a dark, glassmorphic, Apple-inspired luxury user interface.

---

## 🛠️ Project Structure

```
futureme/
  frontend/
    index.html        # Main user interface, loading screens, dynamic chat layouts
    style.css         # Styling system (fonts, glassmorphism, background orbs, chat animations)
    script.js         # Frontend controller (validation, API calls, dynamic text typing, state)
  backend/
    server.js         # Node.js + Express API server communicating with Gemini API
    package.json      # Dependencies and execution scripts
    .env.example      # Example environment template
  README.md           # Documentation and setup instructions
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16.x or newer is recommended).

### 2. Configure Workspace
To run and edit this project in your IDE, set the active workspace folder to:
`C:\Users\Dell\.gemini\antigravity-ide\scratch\futureme`

### 3. Install Dependencies
Open your terminal in the backend directory and run:
```bash
cd backend
npm install
```

### 4. Set Up the Gemini API Key
Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
cp .env.example .env
```
Open the `.env` file and replace the placeholder value with your actual Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
```

---

## 🚀 Running the App

Start the backend server in development mode (utilizes `nodemon` for auto-reloading):
```bash
npm run dev
```

The Express server will start up on port `5000` and output:
```
🚀 FutureMe Backend Server running on port 5000
📂 Serving Frontend from: .../frontend
🌍 Open your browser at http://localhost:5000
```

Simply open your browser and navigate to **[http://localhost:5000](http://localhost:5000)**. The Express server serves both the backend API and the frontend client assets simultaneously, offering a seamless setup.

---

## 🔌 API Routes Specification

### 1. `POST /api/generate-futureme`
Creates the initial future identity blueprint.

* **Request Body:**
```json
{
  "name": "Anshu",
  "age": "23",
  "goal": "Build a successful AI startup",
  "struggle": "Lack of consistency",
  "oneYearVision": "Running a profitable AI company",
  "tone": "Brutally Honest"
}
```

* **Response Body:**
```json
{
  "success": true,
  "data": {
    "message": "A powerful 120-180 word message from the future self.",
    "futureIdentity": "A concise description of who the user is becoming.",
    "nextMoves": ["Action 1", "Action 2", "Action 3"],
    "habit": "One small daily habit they should start today.",
    "warning": "One mistake their future self warns them about.",
    "mantra": "A short memorable line they can repeat daily."
  }
}
```

### 2. `POST /api/chat-futureme`
Exchanges messages with the simulated future self maintaining the conversation context.

* **Request Body:**
```json
{
  "userProfile": {
    "name": "Anshu",
    "age": "23",
    "goal": "Build a successful .NET SaaS startup",
    "struggle": "Maintaining coding consistency",
    "oneYearVision": "Running a profitable Azure-hosted SaaS platform",
    "tone": "Brutally Honest"
  },
  "chatHistory": [
    {
      "role": "user",
      "message": "Will I actually make it?"
    },
    {
      "role": "futureme",
      "message": "Only if your daily actions stop negotiating with your dreams."
    }
  ],
  "question": "What should I focus on this week?"
}
```

* **Response Body:**
```json
{
  "success": true,
  "reply": "FutureMe response paragraph content..."
}
```
