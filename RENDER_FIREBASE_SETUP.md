# Fix: Firebase Admin & AI Chat on Render

## 1. Firebase Admin — "Cannot find module './firebaseServiceKey.json'"

The **SagradaGoAPI** backend has been updated to support Render. It now:

- Uses **env var** `FIREBASE_SERVICE_ACCOUNT_JSON` when set (Render/production).
- Falls back to **`config/firebaseServiceKey.json`** when the env var is not set (local dev).

### What you need to do on Render

1. Open your **SagradaGoAPI** (backend) service on [Render Dashboard](https://dashboard.render.com).
2. Go to **Environment**.
3. Add a variable:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_JSON`
   - **Value:** The **entire contents** of your `firebaseServiceKey.json` as **one line** (valid JSON).  
     Copy the full JSON from your Firebase service account file (Firebase Console → Project Settings → Service accounts → Generate new private key), then paste it as the value. Do not add extra quotes; Render stores it as a string.

4. **Save** and **redeploy** the service.

After redeploy, the backend will start without the "Cannot find module './firebaseServiceKey.json'" error, and sign-in will work.

---

## 2. AI Chat on Render (works everywhere)

The AI chatbot now calls **Gemini from the user’s browser** when the frontend has a Gemini API key. The request comes from the user’s location, so it works on Render (and anywhere) even when the backend is in a blocked region.

### What you need to do

1. **Frontend (SagradaGoWeb)**  
   Add the Gemini API key to the **web app** env so the browser can call Gemini:
   - **Local:** In `.env` add:  
     `VITE_GEMINI_API_KEY=your_gemini_api_key_here`
   - **Render (or Vercel, etc.):** In your **SagradaGoWeb** (frontend) service → **Environment**, add:
     - **Key:** `VITE_GEMINI_API_KEY`
     - **Value:** Your Google AI / Gemini API key (same key you use for the backend).

2. **Redeploy the frontend**  
   Rebuild and deploy SagradaGoWeb so the new env is baked in.

3. **(Optional) Restrict the key in Google Cloud**  
   In [Google AI Studio](https://aistudio.google.com/) or Google Cloud Console, restrict this API key by **HTTP referrer** to your frontend URLs (e.g. `https://yoursite.onrender.com/*`, `http://localhost:*`) so only your app can use it.

When `VITE_GEMINI_API_KEY` is set, the chat uses the browser → Gemini flow and saves the exchange via your backend. If it’s not set, the app falls back to the backend calling Gemini (works on localhost, can fail on Render due to region).
