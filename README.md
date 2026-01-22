# 🧠 Memory Line

**Memory Line** is a modern web app for storing and viewing personal memories on a timeline.  
Build with **Next.js**, **React**, **Tailwind CSS**, and **Firebase**, this app lets authenticated users add, browse, and visualize memories in a timeline view.

🔗 Live Demo: https://memory-line.vercel.app :contentReference[oaicite:1]{index=1}

---

## 🚀 Features

✨ Add and view personal memories  
🔐 User authentication (Firebase Auth)  
📅 Timeline view for memories  
🗂️ Organized memory cards with photos and descriptions  
📱 Responsive design (mobile + desktop)  
☁️ Firebase storage/backend

---

## 🧱 Tech Stack

- **Next.js** (React framework)  
- **Firebase** (Auth, Firestore, Storage)  
- **Tailwind CSS** (Styling)  
- **JavaScript** & modern ES modules

---

## 🛠 Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/desireeye/memory-line.git
   cd memory-line
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   Create a Firebase project and enable:

   * Authentication (Email/Password)
   * Firestore Database
   * Storage

   Create a `.env.local` file with your Firebase config:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   App will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧠 How It Works

* **AuthContext.js** manages user auth state (sign in, sign up, sign out).([GitHub][1])
* **Home.js** shows memories in a timeline.([GitHub][1])
* **AddMemory.js** lets users add new memories.([GitHub][1])
* **firebase.js** contains Firebase initialization.([GitHub][1])

---

## 📦 Project Structure

```
.
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── index.js
│   │   ├── _app.js
│   ├── firebase.js
├── .gitignore
├── package.json
├── tailwind.config.js
```

---

## 🌟 Contributing

Contributions are welcome! To get started:

1. Fork the repo
2. Create a feature branch
3. Push your changes
4. Open a Pull Request

---

## 📄 License

This project is open-source and available under the **MIT License**.

````

---

## 📗 `devops-travel-planner` — README Template

Since the repo at the URL you shared appears to be missing (404), here’s a **starter README** you can paste into that project **once it exists or if you rename/update it**:

```markdown
# 🌍 DevOps Travel Planner

DevOps Travel Planner is a full-stack web application for generating personalized travel itineraries and managing trip planning workflows.  
It emphasizes **DevOps automation**, **scalable infrastructure**, and **CI/CD deployment** for a production-ready travel planning service.

---

## 🎯 Features

- ✈️ Build custom day-by-day travel plans  
- 🏨 Destination recommendations (hotels/attractions)  
- 📅 User itinerary dashboard  
- ☁️ Cloud-ready deployment with automated pipelines  
- 🧪 CI/CD, Docker, and IaC support

---

## ⚙️ Tech Stack

- **Frontend:** React / Next.js  
- **Backend:** Node.js / Express or Python FastAPI  
- **Database:** MongoDB / PostgreSQL  
- **DevOps:** Docker, Kubernetes, Terraform  
- **CI/CD:** GitHub Actions

---

## 🛠 Setup

```bash
git clone https://github.com/desireeye/devops-travel-planner.git
cd devops-travel-planner
````

### Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` with keys:

```
DATABASE_URL=
API_KEY=
OTHER_SECRET=
```

### Run

```bash
npm run dev
```

---

## 🚀 Deployment

The project is containerized with Docker. Run:

```bash
docker compose up -d
```

Add CI/CD workflows under `.github/workflows/`.

---

## 🤝 Contributing

1. Fork it
2. Create feature branch
3. Push
4. Open PR

---

## 📄 License

MIT License

```

---

```

[1]: https://github.com/desireeye/memory-line "GitHub - desireeye/memory-line"
