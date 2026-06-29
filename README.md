<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/38cecceb-4cb5-43b7-aaa3-363973540b5c

## Run Locally

**Prerequisites:**  Node.js

### Quick Start (with Free AI Matching)

1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example`:
   `cp .env.example .env.local`
3. **Set up free Gemini API (for accurate matching):**
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)
   - Click "Get API Key" → "Create API Key in new project"
   - Copy your key and add to `.env.local`:
     ```
     GEMINI_API_KEY=your_free_gemini_api_key_here
     ```
4. *(Optional)* For image-to-image matching, set `IMAGE_MATCH_RERANK="1"` in `.env.local`
5. Run the app:
   `npm run dev`

### Optional: Advanced Setup

**For Gmail sign-in:**
- Create a Google OAuth client and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Add authorized redirect URI in Google Cloud Console: `http://localhost:3000/api/auth/google/callback`

**For Cloudinary storage (image uploads):**
- Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
- Add your `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` to `.env.local`

**Premium AI options (optional, paid):**
- OpenAI: Set `OPENAI_API_KEY` for GPT-4 Vision matching
- Vertex AI: Configure Google Cloud Vertex AI for advanced embeddings
- CLIP Service: Deploy `clip-service/` folder to get state-of-the-art image embeddings

## Demo Accounts

The following demo accounts are automatically created on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@paknaan.gov` | `admin123` |
| Official | `official@paknaan.gov` | `official123` |
| User | `user@example.com` | `user123` |

**Note:** Regular user accounts can also be created through the sign-up page at http://localhost:3000
