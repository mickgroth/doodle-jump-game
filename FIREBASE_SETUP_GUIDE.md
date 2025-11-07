# 🔥 Firebase Leaderboard Setup Guide

This guide will help you add a **global shared leaderboard** to your Doodle Jump game using Firebase.

**Time needed**: 30-45 minutes  
**Cost**: Free (Firebase free tier is generous)

---

## 📋 Overview

After setup, your game will have:
- ✅ Global leaderboard showing top 10 players
- ✅ Player names/nicknames
- ✅ Real-time score updates
- ✅ Personal high score tracking
- ✅ Your rank among all players

---

## Part 1: Create Firebase Project (10 minutes)

### Step 1: Create Firebase Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with your Google account (or create one)
3. Click **"Add project"** or **"Create a project"**

### Step 2: Set Up Your Project

1. **Project name**: `doodle-jump-leaderboard` (or any name you like)
2. Click **"Continue"**
3. **Google Analytics**: Toggle OFF (not needed for this) or leave ON (optional)
4. Click **"Create project"**
5. Wait for project creation (~30 seconds)
6. Click **"Continue"**

### Step 3: Set Up Realtime Database

1. In the left sidebar, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. **Location**: Choose closest to your location (e.g., `us-central1`)
4. Click **"Next"**
5. **Security rules**: Select **"Start in test mode"** (we'll secure it later)
6. Click **"Enable"**

**Important**: Test mode allows anyone to read/write for 30 days. We'll add proper rules later.

### Step 4: Get Your Configuration

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **Web icon** (`</>`)
5. **App nickname**: `doodle-jump-web`
6. ❌ Don't check "Firebase Hosting" (we're using GitHub Pages)
7. Click **"Register app"**
8. You'll see code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...your-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123"
};
```

9. **COPY THIS CONFIG** - You'll need it in the next step!
10. Click **"Continue to console"**

---

## Part 2: Add Firebase to Your Game (5 minutes)

### Step 1: Create Firebase Config File

1. Open the file `firebase-config.js` (I've created this for you)
2. **Replace the placeholder config** with YOUR config from Firebase
3. Save the file

### Step 2: Files to Upload to GitHub

After I create the updated files, you'll need to upload these to GitHub:

- ✅ `index.html` (updated with Firebase SDK and leaderboard UI)
- ✅ `game.js` (updated with Firebase integration)
- ✅ `style.css` (updated with leaderboard styles)
- ✅ `firebase-config.js` (NEW - your Firebase configuration)

---

## Part 3: Configure Security Rules (5 minutes)

Important: Let's secure your database so people can't cheat easily.

### Step 1: Set Up Rules

1. Go to Firebase Console → Realtime Database
2. Click the **"Rules"** tab
3. Replace the rules with:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$scoreId": {
        ".validate": "newData.hasChildren(['name', 'score', 'timestamp']) && 
                     newData.child('name').isString() && 
                     newData.child('name').val().length > 0 && 
                     newData.child('name').val().length <= 20 &&
                     newData.child('score').isNumber() && 
                     newData.child('score').val() >= 0 && 
                     newData.child('score').val() <= 100000"
      }
    }
  }
}
```

4. Click **"Publish"**

**What these rules do:**
- ✅ Anyone can read the leaderboard
- ✅ Anyone can write scores
- ✅ Names must be 1-20 characters
- ✅ Scores must be between 0-100,000 (prevents cheating)
- ✅ Scores must include name, score, and timestamp

### Optional: More Secure Rules

If you want to prevent spam submissions:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      "$scoreId": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['name', 'score', 'timestamp']) && 
                     newData.child('name').isString() && 
                     newData.child('name').val().length > 0 && 
                     newData.child('name').val().length <= 20 &&
                     newData.child('score').isNumber() && 
                     newData.child('score').val() >= 0 && 
                     newData.child('score').val() <= 100000 &&
                     newData.child('timestamp').val() <= now"
      }
    }
  }
}
```

This prevents updating existing scores (write-once).

---

## Part 4: Testing (5 minutes)

### Test Locally First:

1. Open `index.html` in your browser
2. Play the game
3. When game ends, enter your name
4. Check if leaderboard appears

### Test on Firebase Console:

1. Go to Realtime Database in Firebase Console
2. You should see data appear under "leaderboard"
3. It should look like:
```
leaderboard
  └─ -AbCd123...
      ├─ name: "YourName"
      ├─ score: 1234
      └─ timestamp: 1234567890
```

### Test Globally:

1. Upload all files to GitHub
2. Wait 2-3 minutes
3. Open your game URL
4. Have a friend open it too
5. Both play and submit scores
6. You should see each other on the leaderboard!

---

## 🎮 How It Works

### For Players:

1. **Play the game**
2. **Game over** → Enter your name in the popup
3. **Score submits** to Firebase
4. **Leaderboard updates** automatically
5. **See your rank** among all players

### Data Structure:

```javascript
leaderboard: {
  -UniqueId1: {
    name: "Player1",
    score: 5000,
    timestamp: 1234567890
  },
  -UniqueId2: {
    name: "Player2", 
    score: 3500,
    timestamp: 1234567891
  }
}
```

---

## 🔒 Security Notes

### Current Setup:
- ✅ Basic validation (name length, score range)
- ✅ Read access for everyone
- ✅ Write access for everyone (with validation)
- ⚠️ Players can still cheat by modifying client-side code

### To Prevent Cheating (Advanced):

If cheating becomes a problem, you can:

1. **Add Firebase Authentication** - Require login
2. **Use Cloud Functions** - Validate scores server-side
3. **Rate Limiting** - Limit submissions per IP/user
4. **Score Verification** - Check if score is realistic based on time played

For now, the basic validation is good enough for friends!

---

## 🎨 Customization Options

You can customize the leaderboard in `style.css`:

- Change colors
- Adjust positioning
- Modify animations
- Add more info (date, time played, etc.)

You can also modify `game.js` to:

- Show more/fewer players (default: top 10)
- Add filtering (today's scores, this week, etc.)
- Display additional stats
- Add avatars/emojis

---

## 💰 Firebase Free Tier Limits

Firebase Realtime Database free tier includes:

- ✅ **1 GB storage** (millions of scores)
- ✅ **10 GB/month downloads** (thousands of players)
- ✅ **100 simultaneous connections**

**You won't hit these limits** unless your game goes viral! 🚀

---

## 🐛 Troubleshooting

### Leaderboard not showing?

1. Check browser console (F12) for errors
2. Verify `firebase-config.js` has correct configuration
3. Check Firebase Console → Realtime Database for data
4. Make sure rules are published
5. Hard refresh browser (Ctrl+Shift+R)

### Can't submit scores?

1. Check Firebase rules allow writes
2. Verify `databaseURL` in config is correct
3. Check console for error messages
4. Make sure you entered a name

### Scores not updating?

1. Check internet connection
2. Verify Firebase project is active
3. Check Firebase usage limits (unlikely)
4. Clear browser cache

### "Permission denied" error?

1. Check Firebase rules are set correctly
2. Make sure rules are published
3. Wait 1-2 minutes for rules to propagate

---

## 📊 Monitor Your Game

### Firebase Console:

- **Realtime Database**: See all scores live
- **Usage tab**: Monitor reads/writes
- **Rules**: Update security

### What to Watch:

- Number of scores submitted
- Top scores (watch for cheaters)
- Database size
- Monthly usage

---

## 🚀 Next Steps

After setup:

1. ✅ Test with friends
2. ✅ Monitor for cheating
3. ✅ Adjust rules if needed
4. ✅ Add more features (see customization options)

---

## ❓ Common Questions

**Q: Can I delete fake scores?**  
A: Yes! Go to Firebase Console → Realtime Database and delete entries manually.

**Q: Can I export the leaderboard?**  
A: Yes! Firebase Console → Realtime Database → Export JSON.

**Q: What if someone cheats?**  
A: You can delete their score or implement stricter validation rules.

**Q: Can I have multiple leaderboards?**  
A: Yes! Modify the code to use different database paths (e.g., "leaderboard_daily", "leaderboard_weekly").

**Q: Is my API key secret?**  
A: No, it's safe to expose in client-side code. Firebase uses rules to secure data.

---

Ready to start? Let's set up your Firebase project! 🎮🔥

