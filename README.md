3# Chat With Website

Chat With Website is a local full-stack application that lets you enter a website URL and ask questions about its content. The backend fetches and cleans the page, splits it into overlapping chunks, creates embeddings, stores them in Qdrant, and uses retrieval-augmented generation (RAG) with Gemini to answer questions from the retrieved content.

## Features

- Process a public website URL and create a searchable knowledge base.
- Extract useful page text while removing navigation, scripts, styles, forms, and other non-content elements.
- Generate normalized embeddings with `Xenova/all-MiniLM-L6-v2`.
- Store and search website chunks in a local Qdrant collection named `website_chunks`.
- Generate a website summary during processing.
- Ask follow-up questions and view the retrieved source chunks and relevance scores.

## Project structure

```text
.
├── backend/
│   └── src/
│       ├── server.js
│       └── services/
└── frontend/
    └── src/
```

The backend is an Express API. The frontend is a React application built with Vite.

## Prerequisites

- Node.js 18 or newer (the backend uses the built-in `fetch` API).
- npm.
- A running Qdrant instance at `http://localhost:6333`.
- A Google Gemini API key.

The backend creates the `website_chunks` collection automatically on startup when it does not already exist. The collection uses 384-dimensional vectors and cosine similarity.

## Configuration

Create or update `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep the real API key private. The `.env` file is ignored by Git and should not be committed or copied into the frontend.

Qdrant is currently configured directly in `backend/src/services/vectorDatabase.js` at `http://localhost:6333`. The frontend is currently configured to call the backend at `http://localhost:3000`. Update the corresponding source configuration if either service runs elsewhere.

## Installation

Install the root dependencies and the dependencies for each application:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
```

## Running the application

Start Qdrant first, then open two terminals from the project root.

### Backend

```bash
cd backend
node src/server.js
```

The API starts at `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

For a production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## API

### `GET /`

Health check. Returns `Chat with Website API is running!`.

### `POST /website`

Fetch and process a website.

Request:

```json
{
  "url": "https://example.com"
}
```

Successful responses include the generated website ID, chunk counts, embedding dimensions, and a summary:

```json
{
  "message": "Website processed successfully",
  "url": "https://example.com",
  "websiteId": "generated-uuid",
  "numberOfChunks": 10,
  "numberOfEmbeddings": 10,
  "embeddingDimensions": 384,
  "summary": "..."
}
```

The returned `websiteId` is required when asking questions.

### `POST /ask`

Retrieve relevant chunks for a website and generate an answer with Gemini.

Request:

```json
{
  "websiteId": "generated-uuid",
  "question": "What is this website about?"
}
```

The response contains the question, answer, and matching source chunks. Source fields are returned by Qdrant and may be nested under `payload`:

```json
{
  "question": "What is this website about?",
  "answer": "...",
  "sources": [
    {
      "score": 0.82,
      "payload": {
        "websiteId": "generated-uuid",
        "url": "https://example.com",
        "chunkIndex": 0,
        "text": "..."
      }
    }
  ]
}
```

## Processing flow

1. The frontend sends a URL to `POST /website`.
2. The backend fetches the URL and extracts readable content.
3. Text is cleaned and divided into chunks of about 1,000 characters with 200 characters of overlap.
4. Each chunk is embedded and stored in Qdrant under a generated website ID.
5. Representative chunks are sent to Gemini to create a summary.
6. A question is embedded and matched against that website’s chunks.
7. The retrieved context is sent to Gemini, which returns an answer and the matching sources.

## Notes and limitations

- Only content accessible through a server-side HTTP fetch can be processed; client-rendered pages may not contain their final content in the fetched HTML.
- Website summaries are kept in memory and are lost when the backend restarts. Search chunks remain in Qdrant.
- The backend filters search results below a relevance score of `0.30`.
- The frontend currently uses hardcoded local backend and Qdrant URLs.
- The backend package does not define a `start` script; use `node src/server.js` as shown above.

## Available frontend scripts

From `frontend/`:

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```
