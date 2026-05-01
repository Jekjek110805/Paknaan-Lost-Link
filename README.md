<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/38cecceb-4cb5-43b7-aaa3-363973540b5c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env.local`
3. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key
4. To enable Gmail sign-in, create a Google OAuth client and set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`
5. Add this authorized redirect URI in Google Cloud Console:
   `http://localhost:3000/api/auth/google/callback`
6. Run the app:
   `npm run dev`
