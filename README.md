# Chronovault - The Time Capsule
**Disclaimer**: The code published cannot be run live as the API keys are removed to protect confidentiality.

Chronovault is a digital time capsule app built during a hackathon sprint. It lets users record and store audio or media entries that unlock in the future — with an optional AI narration to relive memories in a deeply personal way.
Built with simplicity, creativity, and emotion in mind, Chronovault merges nostalgic memory-keeping with modern tech like AI, voice synthesis, and scheduled content delivery.

🔧 How It Works
1. User signs up → Email stored in Firebase with a unique ID.
2. User creates a capsule → Chooses audio or media; sets unlock time.
3. Voice is captured → Speech is transcribed and stored.
4. Entry unlocks at set time → In-app notifications.
5. User chooses AI narration or not:
   - Yes → User selects tone/gender-based avatars → GPT generates narration → Browser TTS plays it back.
   - No → Entry is displayed plainly with original content.

🚀 What It Does
**Email Sign-up/Login:** Users register using their email (via Firebase).
**Create Time Capsules:** Record media or type letters. Entries are time-locked until a scheduled future date.
**Storage:** The time-locked entries are stored locally until unlocked (including transcriptions)
**Speech-to-Text:** Voice recordings are automatically transcribed behind the scenes.
**In-app Notifications:** Users are alerted when entries become available.
**AI Narration:** Upon unlock, users can choose to have their memory narrated by an AI with options for tone and gender.
**GPT Prompts**: Locally stored text is prompted to the GPT which then gives its personalised comments
**Avatar + Voice Playback:** For AI-narrated entries, an avatar appears and browser TTS reads the comments aloud.
**Pure Experience Option:** Users can skip narration and view the raw entry directly.

⚙️ Tech Stack
| Layer         | Tech Used                                                 |
| ------------- | ----------------------------------------------------------|
| **Frontend**  | Vanilla JavaScript, HTML, CSS                             |
| **Backend**   | Firebase Authentication & Firestore, Local Storage        |
| **AI Engine** | OpenRouter API (Model: **Qwen**) for GPT-based narration  |
| **TTS**       | Browser-based Text-to-Speech API for real-time narration  |
| **Hosting**   | Netlify                                                   |

🖼 Demo
🌐 Live Demo: https://chronovault-thetimecapsule.netlify.app/	

👥 Team
Built with 💡 and ☕ during CS Girlies Hackathon
By: JANT (Janice, Afifa, Nika and Tanvi)
