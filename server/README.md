# AI Proxy for University Accounting System

This small Express server proxies chat requests from the Angular frontend to an LLM provider so API keys are kept on the server.

Usage

1. Install dependencies in the `server/` folder:

```cmd
cd server
npm install
```

2. Run the server (example for mock provider):

```cmd
# mock provider (no API key needed)
set PROVIDER=mock
node index.js
```

3. Run with OpenAI (example):

```cmd
set PROVIDER=openai
set AI_KEY=sk-...your-openai-key...
set MODEL=gpt-4o-mini
node index.js
```

4. Run with a generic provider (e.g., Together.ai) if they expose an HTTP API:

```cmd
set PROVIDER=generic
set PROVIDER_URL=https://api.example-llm.com/v1/chat
set AI_KEY=your_provider_key_if_needed
node index.js
```

Frontend

The Angular `ChatComponent` makes POST requests to `/api/chat` (relative path). In development, start the proxy on port 3000 and run the Angular dev server on port 4200; the browser will call `/api/chat` on the Angular origin — to avoid CORS in production, either run the proxy under the same origin (reverse proxy) or configure CORS appropriately.

Security notes

- Never commit API keys to source control. Use environment variables.
- Add rate limiting and authentication for production usage.
- Sanitize and validate incoming messages if needed.
