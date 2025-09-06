# Grammar Checker

AI-powered grammar checking application with secure backend architecture.

## 🏗️ Architecture

This project uses a **secure client-server architecture**:

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express (API proxy)
- **Security:** API keys stored server-side only

## 🚀 Quick Start

### 1. Frontend Setup

```bash
# Install dependencies
pnpm install

# Copy and configure environment
cp .env.example .env
# Edit .env to set VITE_API_BASE_URL if different from default
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies  
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
```

### 3. Run the Application

**Option A: Run both simultaneously**
```bash
# From root directory
pnpm run dev:full
```

**Option B: Run separately**
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend  
pnpm dev
```

## 🔒 Security Features

- ✅ **API Keys Protected**: Stored server-side only, never exposed to browser
- ✅ **Rate Limiting**: 20 requests per minute per IP
- ✅ **CORS Protection**: Only configured origins allowed
- ✅ **Input Validation**: Text length limits and sanitization
- ✅ **Security Headers**: Helmet.js protection

## 🧩 Features

- **AI Grammar Checking**: OpenAI & Gemini API integration
- **Real-time Highlighting**: Interactive error highlighting
- **Smart Suggestions**: Click to apply corrections
- **Text Statistics**: Word, sentence, character counts
- **Dark Mode**: Full theme support
- **Export Options**: Copy or download corrected text
- **Responsive Design**: Works on all devices

## 🛠️ Development

### Available Scripts

**Frontend:**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

**Backend:**
- `npm run dev` - Start with auto-restart
- `npm start` - Production start

**Combined:**
- `pnpm dev:full` - Start both frontend and backend

### Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/          # React contexts  
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend API
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Backend environment template
└── dist/                  # Built frontend
```

### TypeScript

- Fully typed codebase
- Centralized type definitions in `/src/types/`
- Strict TypeScript configuration

## 🌐 API Endpoints

### POST /api/grammar-check
Check grammar for provided text.

**Request:**
```json
{
  "text": "Your text to check"
}
```

**Response:**
```json
{
  "errors": [...],
  "correctedText": "Corrected text",
  "confidence": 0.95
}
```

### GET /api/health
Health check and service status.

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:3001
```

**Backend (server/.env):**
```bash
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

## 🚀 Deployment

### Backend Deployment
1. Deploy server to your hosting provider
2. Set environment variables
3. Ensure `/api/grammar-check` endpoint is accessible

### Frontend Deployment  
1. Update `VITE_API_BASE_URL` to your backend URL
2. Build: `pnpm build`
3. Deploy `dist/` folder

### Recommended Hosting
- **Backend:** Railway, Render, DigitalOcean
- **Frontend:** Vercel, Netlify, GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and linting is clean
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details.