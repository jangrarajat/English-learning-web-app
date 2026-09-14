# 30-Day English Verb Challenge

A complete interactive platform for learning 120 common English verbs in 30 days through active recall, daily practice, and gamification.

## 🚀 Features

- **30-Day Course Structure**: Learn 5 verbs per day with weekly tests
- **Active Recall System**: Practice through multiple question types
- **Progress Tracking**: Streaks, XP, levels, and achievements
- **Spaced Repetition**: Intelligent revision scheduling
- **Gamification**: Badges, points, and progress visualization
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd english-verb-challenge

# Install backend dependencies
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret

# Seed the database
npm run seed

# Start the backend server
npm run dev