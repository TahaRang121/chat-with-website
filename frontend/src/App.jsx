import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [processingWebsite, setProcessingWebsite] = useState(false);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState("");

  async function processWebsite() {
    try {
      setProcessingWebsite(true);
      setProcessingStep("Reading website...");
      setError("");
      setMessages([]);

      setProcessingStep("Reading website, creating embeddings, and building knowledge base...");
      const response = await fetch("http://localhost:3000/website", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          url: url
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to process website"
        );
      }

      setWebsiteId(data.websiteId);

    } catch (error) {
      console.error(error);
      setError(error.message);

    } finally {
      setProcessingWebsite(false);
      setProcessingStep("");
    }
  }

  async function askQuestion() {
    if (!question.trim()) {
      return;
    }

    try {
      setAskingQuestion(true);
      setError("");

      const currentQuestion = question;

      const response = await fetch("http://localhost:3000/ask", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          websiteId: websiteId,
          question: currentQuestion
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to get answer"
        );
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          question: currentQuestion,
          answer: data.answer,
          sources: data.sources
        }
      ]);

      setQuestion("");

    } catch (error) {
      console.error(error);
      setError(error.message);

    } finally {
      setAskingQuestion(false);
    }
  }

  return (
    <div className="app">

      <header className="header">
        <h1>Chat With Website</h1>
        <p>Ask questions about any website using AI</p>
      </header>

      <main className="container">

        {error && (
          <div className="error-box">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        <section className="website-section">

          <h2>1. Add a Website</h2>

          <div className="input-row">

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              onClick={processWebsite}
              disabled={!url.trim() || processingWebsite}
            >
              {processingWebsite
                ? "Processing..."
                : "Process Website"}
            </button>

          </div>

          {processingWebsite && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <div>
                <strong>Processing website</strong>
                <p>{processingStep}</p>
              </div>
            </div>
          )}

          {websiteId && !processingWebsite && (
            <p className="success">
              ✓ Website processed successfully
            </p>
          )}

        </section>


        <section className="chat-section">

          <h2>2. Ask a Question</h2>

          <div className="input-row">

            <input
              type="text"
              placeholder="Ask something about the website..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  askQuestion();
                }
              }}
              disabled={!websiteId || askingQuestion}
            />

            <button
              onClick={askQuestion}
              disabled={
                !websiteId ||
                !question.trim() ||
                askingQuestion
              }
            >
              {askingQuestion ? "Thinking..." : "Ask"}
            </button>

          </div>


          {askingQuestion && (
            <div className="loading">
              AI is thinking...
            </div>
          )}


          {messages.length > 0 && (
            <div className="chat-result">

              {messages.map((message, index) => (

                <div key={index}>

                  <div className="user-message">

                    <span className="message-label">
                      You
                    </span>

                    <p>{message.question}</p>

                  </div>


                  <div className="ai-message">

                    <span className="message-label">
                      AI
                    </span>

                    <p>{message.answer}</p>

                  </div>


                  {message.sources &&
                    message.sources.length > 0 && (

                    <div className="sources">

                      <h3>Sources</h3>

                      {message.sources.map(
                        (source, sourceIndex) => (

                        <div
                          className="source-card"
                          key={sourceIndex}
                        >

                          <p>
                            <strong>
                              Source {sourceIndex + 1}
                            </strong>
                          </p>

                          <p className="source-text">
                            {source.text}
                          </p>
                          <div className="source-meta">
                            <small>
                              Relevance: {source.score.toFixed(3)}
                            </small>
                            <small>
                              Chunk: {source.chunkIndex + 1}
                            </small>
                            <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                              Open website
                            </a>
                            
                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;