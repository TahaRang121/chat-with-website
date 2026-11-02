# 🌐 Chat With Website

> Turn any public website into an interactive knowledge base and ask questions about its content using RAG.

🔗 **Live Demo:** https://chat-with-website-zeta.vercel.app

📦 **GitHub:** https://github.com/TahaRang121/chat-with-website

---

## 📌 Overview

**Chat With Website** is a full-stack RAG (Retrieval-Augmented Generation) application that allows users to enter a public website URL and ask questions about its content.

The application:

1. Fetches the website
2. Extracts readable content
3. Cleans and chunks the text
4. Generates vector embeddings
5. Stores the chunks in Qdrant
6. Retrieves the most relevant content for a question
7. Uses Gemini to generate an answer based only on the retrieved website content

The goal is to make website content searchable and conversational without requiring users to manually read through large pages.

---

## ✨ Features

- 🌐 Process public website URLs
- 🧹 Extract and clean readable website content
- ✂️ Split content into overlapping chunks
- 🧠 Generate embeddings using `Xenova/all-MiniLM-L6-v2`
- 🔎 Semantic search using Qdrant
- 🤖 AI-generated answers using Google Gemini
- 📚 Retrieval-Augmented Generation (RAG)
- 🔗 Display relevant source information
- ⚡ React + Vite frontend
- 🚀 Deployed frontend and backend
- ☁️ Qdrant Cloud vector database

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Cheerio
- Transformers.js

### AI / RAG
- Google Gemini API
- `Xenova/all-MiniLM-L6-v2`
- Retrieval-Augmented Generation (RAG)

### Database
- Qdrant Cloud

### Deployment
- Vercel — Frontend
- Render — Backend
- Qdrant Cloud — Vector Database

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    │  Website URL +   │
                    │     Question     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React + Vite     │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Express / Node   │
                    │     Backend      │
                    └────────┬─────────┘
                             │
             ┌───────────────┴────────────────┐
             │                                │
             ▼                                ▼
    ┌─────────────────┐              ┌─────────────────┐
    │ Website Content │              │    Question     │
    │ Extraction      │              │    Embedding    │
    └────────┬────────┘              └────────┬────────┘
             │                                │
             ▼                                │
    ┌─────────────────┐                       │
    │ Cleaning +      │                       │
    │ Chunking        │                       │
    └────────┬────────┘                       │
             │                                │
             ▼                                ▼
    ┌─────────────────────────────────────────────────┐
    │                  Qdrant Cloud                   │
    │              Vector Search / Retrieval          │
    └────────────────────────┬────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Relevant Website │
                    │     Context      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Google Gemini   │
                    │  Answer Generation│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Answer       │
                    │   + Sources      │
                    └──────────────────┘
```

---

## 🔄 RAG Pipeline

```text
Website URL
    ↓
Fetch HTML
    ↓
Extract readable text
    ↓
Clean text
    ↓
Create chunks
    ↓
Generate embeddings
    ↓
Store in Qdrant
    ↓
User asks a question
    ↓
Generate question embedding
    ↓
Semantic similarity search
    ↓
Retrieve relevant chunks
    ↓
Send context + question to Gemini
    ↓
Generate grounded answer
```

---

## 📁 Project Structure

```text
chat-with-website/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── services/
│   │       ├── contentExtractor.js
│   │       ├── textCleaner.js
│   │       ├── chunker.js
│   │       ├── embeddingService.js
│   │       ├── vectorDatabase.js
│   │       ├── retrievalService.js
│   │       ├── geminiService.js
│   │       ├── summaryService.js
│   │       ├── summaryStore.js
│   │       └── questionClassifier.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/TahaRang121/chat-with-website.git
cd chat-with-website
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=your_qdrant_cloud_url
QDRANT_API_KEY=your_qdrant_api_key
```

Never commit real API keys to GitHub.

### 4. Start the backend

```bash
node src/server.js
```

The backend will run locally on:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

Configure the frontend environment:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🌍 Deployment

The project is deployed using:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Vector Database | Qdrant Cloud |
| AI | Google Gemini |

### Live Application

👉 https://chat-with-website-zeta.vercel.app

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "healthy"
}
```

### Process Website

```http
POST /website
```

Request:

```json
{
  "url": "https://example.com"
}
```

The API processes the website, creates embeddings, and stores the content in Qdrant.

### Ask a Question

```http
POST /ask
```

Request:

```json
{
  "websiteId": "generated-website-id",
  "question": "What is this website about?"
}
```

The backend retrieves relevant website content and sends the retrieved context to Gemini for answer generation.

---

## 🧠 Why RAG?

Instead of sending an entire website directly to an AI model, the application uses **Retrieval-Augmented Generation**.

Only the most relevant chunks are retrieved from the vector database and provided to the AI model.

This helps the system:

- Focus on relevant website information
- Reduce unnecessary context
- Ground answers in the processed website content
- Avoid relying on unrelated general knowledge

---

## ⚠️ Current Limitations

- The application works best with publicly accessible websites.
- Server-side fetching may not capture content rendered entirely through client-side JavaScript.
- Website content can change after it has been processed.
- AI responses depend on the quality of the extracted and retrieved content.
- Some AI requests may temporarily fail if the model provider is experiencing high demand.

---

## 🚀 Future Improvements

- [ ] Support multiple pages from the same website
- [ ] Improve JavaScript-rendered website extraction
- [ ] Add conversation history
- [ ] Improve summary generation and fallback handling
- [ ] Add authentication
- [ ] Add persistent website management
- [ ] Improve source citations
- [ ] Add custom domains
- [ ] Add streaming AI responses
- [ ] Improve UI/UX

---

## 👨‍💻 Author

**Taha Rangwala**

B.Tech CSE — Data Science

Built as a practical project to understand:

- Web scraping and content extraction
- Text processing
- Embeddings
- Vector databases
- Retrieval-Augmented Generation
- LLM integration
- Full-stack development
- Cloud deployment

---

## ⭐ If you find this project interesting

Feel free to explore the code, try the live demo, or star the repository.
