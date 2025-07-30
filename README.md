# Firebase Studio

# 🌾 KrishiMitra – AI-Powered Assistant for Farmers

KrishiMitra is an AI-powered, voice-first personal assistant designed to support small-scale Indian farmers with real-time crop health diagnosis, market insights, government scheme guidance, and learning resources — all in their native language.

---

## 🚀 Features

- 🧠 **AI Chatbot** powered by Gemini (text, vision, and voice)
- 📸 **Crop Disease Detection** via image upload
- 📊 **Real-Time Mandi Price Tracker** with AI-powered sell/store suggestions
- 🗣 **Voice Interaction** in Kannada, Hindi, and English
- 🏛 **Government Scheme Navigator** with eligibility and links
- 🛒 **Agri Commerce** integrations for tools, seeds, fertilizers
- 📚 **Vernacular Video Learning Hub** (Coming Soon)
- 📢 **Smart Notifications** (In-App + WhatsApp - Coming Soon)
- 🛰️ **IoT Integration & Offline Support** (Planned)
- 📊 **NGO/Admin Dashboard** (Planned)

---

## 🛠 Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **AI Models**: Gemini (via Vertex AI - Image, Text, Speech)
- **Cloud Hosting**: Firebase Hosting
- **Dev Tools**: PostCSS, ESLint, Git

---

## 📂 Project Structure

.
├── src/ # App source files
├── .gitignore
├── .idx / .modified # Internal config/indexing files
├── README.md # Project documentation
├── apphosting.yaml # Firebase Hosting config
├── components.json # UI component registry (Firebase Studio)
├── next.config.ts # Next.js config
├── package.json # Project metadata and scripts
├── postcss.config.mjs # PostCSS config
├── storage.rules # Firebase Storage security rules
├── tailwind.config.ts # Tailwind CSS config
├── tsconfig.json # TypeScript config

yaml
Copy
Edit

---

## 📦 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohit-cg/studio.git
   cd krishimitra
Install dependencies:

bash
Copy
Edit
npm install
Run the app locally:

bash
Copy
Edit
npm run dev
Firebase Setup:

Configure Firebase in .env.local

Deploy using:

bash
Copy
Edit
firebase deploy
🔐 Environment Variables (example)
ini
Copy
Edit
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_VERTEX_AI_KEY=your_vertex_ai_key
🧪 Coming Soon
WhatsApp alerts via Twilio

Offline-first support with Firestore caching

AI-powered community forum

Interactive map-based crop visualizer

📄 License
MIT License. See LICENSE file for details.

🤝 Contributing
We welcome contributions! Please open issues or pull requests for suggestions, fixes, or new features.

🙌 Acknowledgements
Google Firebase & Vertex AI

Government of India Agri APIs

Farmers & NGOs who shared real-world feedback

