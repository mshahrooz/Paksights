# PakSights — GTA-inspired AI Portrait API

Backend for https://paksights.com/tools/gta-vi-ai-photo-generator.html.

- Framework: Vercel Node serverless functions, AI SDK 7.
- Image editor: Vercel AI Gateway model google/gemini-3.1-flash-image.
- Auth: Vercel OIDC token (automatically injected on Vercel) or AI_GATEWAY_API_KEY.
- Uploads: images compressed locally on the visitor's browser; server holds the reference image in memory only and returns the generated data URL; no files are stored.
- CORS: allows PakSights.com and its GitHub Pages mirror.
- Limits: 1.9MB photo, 3 attempts per IP per 24h per warm instance (not distributed), 2 concurrent requests per warm instance.
- Never commit any API key. Model requests can incur usage charges. Recommended: Vercel WAF rate limits + AI Gateway project spending budget.
- The generator is fan-created and does not create genuine game art or screenshots.

Deploy as a separate Vercel project with root directory portrait-api linked to mshahrooz/Paksights. GitHub Pages continues to serve the static website independently.
