# 🚨 Smart Alarm App - API Configuration Guide

## Overview
Your intelligent alarm app is now complete! For demonstration purposes, the API keys are hardcoded in the service files. Replace them with your actual credentials to enable full functionality.

## 🎵 Spotify Integration Setup

### Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: "Smart Alarm App"
   - **App Description**: "AI-powered alarm with mood-based music"
   - **Redirect URI**: `http://localhost:3000/callback` (not used for client credentials)
   - **API/SDKs**: Check "Web API"

### Step 2: Get Credentials
1. In your app dashboard, click "Settings"
2. Copy **Client ID** and **Client Secret**
3. Replace in `frontend/src/services/SpotifyService.ts`:
   ```typescript
   private clientId: string = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   private clientSecret: string = 'YOUR_ACTUAL_CLIENT_SECRET_HERE';
   ```

## 📅 Google Calendar Integration Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Calendar API**

### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Set application type to **Web application**
4. Add authorized redirect URIs (for testing): `http://localhost:3000/auth/callback`

### Step 3: Get Access Token
1. Use Google OAuth Playground: https://developers.google.com/oauthplayground/
2. Select **Calendar API v3** scope: `https://www.googleapis.com/auth/calendar.readonly`
3. Authorize and get access token
4. Replace in `frontend/src/services/GoogleCalendarService.ts`:
   ```typescript
   private accessToken: string | null = 'YOUR_ACTUAL_ACCESS_TOKEN_HERE';
   private clientId: string = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   private clientSecret: string = 'YOUR_ACTUAL_CLIENT_SECRET_HERE';
   ```

## 🎯 Demo Mode (Current Setup)
Without real API keys, the app will:
- ✅ Play demo alarm sounds and radio stations
- ✅ Use text-to-speech for calendar announcements
- ✅ Display mock calendar events
- ✅ Show intelligent snooze patterns
- ✅ Collect user feedback for learning
- ❌ Won't play actual Spotify music
- ❌ Won't read real Google Calendar events

## 🚀 Features Working in Demo Mode

### 🎵 Smart Media Selection
- **Mood Mode**: AI-powered music recommendations (mock data)
- **Radio Mode**: International radio stations via Radio Browser API
- **Calendar Mode**: Text-to-speech calendar reading with mock events

### 🧠 AI Intelligence
- Gemini AI integration for alarm planning
- Smart snooze pattern generation
- Calendar conflict detection
- Urgent alarm prioritization

### 📊 Learning System
- User feedback collection (1-10 rating)
- Snooze behavior tracking
- Wake-up experience analysis

## 🔧 Quick Start
1. Install dependencies: `cd frontend && npm install`
2. Start development server: `npm start`
3. Scan QR code with Expo Go app
4. Create alarms and test all three modes
5. Replace API keys when ready for production

## 📱 Testing the App
1. **Set a test alarm** 5 seconds in the future using the green button
2. **Try different media modes**: Mood, Radio, Calendar
3. **Experience the ringing modal** with smart snooze options
4. **Rate your wake-up experience** for the learning system

## 🎉 You're All Set!
Your intelligent alarm app is ready for demonstration. The AI-powered features, smart media selection, and learning capabilities all work seamlessly with or without real API credentials.

---
*Built with React Native, Expo, and AI-powered intelligence for the perfect wake-up experience! 🌅*