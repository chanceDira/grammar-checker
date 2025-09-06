# Grammar Checker

AI-powered grammar checking application with React frontend and a simple Node.js server working as a proxy for the API call to GEMINI/OPEN AI.

## Setup

1. **Install dependencies:**
   ```bash
   # Frontend
   pnpm install
   
   # Backend  
   cd server && npm install
   ```

2. **Configure API keys:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your OpenAI/Gemini API keys
   ```

3. **Start the app:**
   ```bash
   # Run both frontend and backend
   pnpm run dev:full
   
   # Or run separately:
   # Backend: cd server && npm run dev  
   # Frontend: pnpm dev
   ```

## Features

- Grammar, spelling, and punctuation checking
- Real-time error highlighting
- Dark/light theme
- Text statistics and export options

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **AI:** OpenAI GPT / Google Gemini

## API

- `POST /api/grammar-check` - Check text for errors
- `GET /api/health` - Server health status

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:3001`