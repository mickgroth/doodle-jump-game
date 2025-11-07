# 🔥 Firebase Quick Start Checklist

Follow these steps to get your global leaderboard working!

---

## ✅ Step 1: Create Firebase Project (5 min)

- [ ] Go to [https://console.firebase.google.com](https://console.firebase.google.com)
- [ ] Sign in with Google
- [ ] Click "Add project" or "Create a project"
- [ ] Name it: `doodle-jump-leaderboard`
- [ ] Disable Google Analytics (optional)
- [ ] Click "Create project"
- [ ] Wait for creation, then click "Continue"

---

## ✅ Step 2: Set Up Realtime Database (5 min)

- [ ] In left sidebar: Build → Realtime Database
- [ ] Click "Create Database"
- [ ] Choose location closest to you
- [ ] Click "Next"
- [ ] Select **"Start in test mode"**
- [ ] Click "Enable"
- [ ] Wait for database creation

---

## ✅ Step 3: Get Your Firebase Config (3 min)

- [ ] Click gear icon (⚙️) → "Project settings"
- [ ] Scroll down to "Your apps"
- [ ] Click web icon (`</>`)
- [ ] App nickname: `doodle-jump-web`
- [ ] Don't check Firebase Hosting
- [ ] Click "Register app"
- [ ] **COPY the firebaseConfig object** (you'll see code like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123"
};
```

- [ ] Keep this tab open - you'll need this!

---

## ✅ Step 4: Update firebase-config.js (2 min)

- [ ] Open `firebase-config.js` in your game folder
- [ ] Replace the placeholder config with YOUR config
- [ ] Make sure ALL fields are filled in (especially `databaseURL`)
- [ ] Save the file

**Example of what to replace:**
```javascript
// BEFORE (placeholder):
apiKey: "YOUR-API-KEY-HERE",

// AFTER (your actual values):
apiKey: "AIzaSyAbc123...",
```

---

## ✅ Step 5: Test Locally (5 min)

- [ ] Open `index.html` in your browser
- [ ] Open browser console (F12)
- [ ] Look for message: `🔥 Firebase connected! Leaderboard is now global.`
- [ ] Play the game until game over
- [ ] Enter your name
- [ ] Submit score
- [ ] Check console for: `✅ Score saved to Firebase!`

### Verify in Firebase Console:
- [ ] Go back to Firebase Console
- [ ] Click Realtime Database
- [ ] You should see your score appear under "leaderboard"!

---

## ✅ Step 6: Set Security Rules (3 min)

Protect your leaderboard from spam and cheating:

- [ ] In Firebase Console → Realtime Database
- [ ] Click "Rules" tab
- [ ] Replace with these rules:

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

- [ ] Click "Publish"
- [ ] Wait for confirmation

---

## ✅ Step 7: Upload to GitHub (5 min)

Upload these **4 files** to your GitHub repository:

- [ ] `index.html` (updated)
- [ ] `game.js` (updated)
- [ ] `style.css` (updated)
- [ ] `firebase-config.js` (NEW - with your config)

**How to upload:**
1. Go to your GitHub repository
2. Click "Add file" → "Upload files"
3. Drag all 4 files
4. Commit message: "Add Firebase global leaderboard"
5. Click "Commit changes"
6. Wait 2-3 minutes for deployment

---

## ✅ Step 8: Test Live! (5 min)

- [ ] Open your GitHub Pages URL
- [ ] Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- [ ] Play the game
- [ ] Submit a score
- [ ] Click "🏆 Leaderboard" button
- [ ] You should see: "🌍 Global Leaderboard"
- [ ] Have a friend open the same URL
- [ ] Both submit scores
- [ ] You should see each other's scores!

---

## 🎉 Success Indicators

You'll know it's working when you see:

✅ **In Browser Console:**
- `🔥 Firebase connected! Leaderboard is now global.`
- `✅ Loaded X scores from Firebase`
- `✅ Score saved to Firebase!`

✅ **In Game:**
- Leaderboard button in header
- "🌍 Global Leaderboard" text (green badge)
- Your friends' scores appear

✅ **In Firebase Console:**
- Data appears under Realtime Database → leaderboard
- Scores have name, score, and timestamp fields

---

## 🐛 Troubleshooting

### "Firebase not configured" message?
- Check `firebase-config.js` has your actual config
- Make sure file is saved
- Hard refresh browser

### "Permission denied" error?
- Check Firebase rules are published
- Make sure databaseURL is correct
- Wait 1-2 minutes for rules to propagate

### Scores not syncing?
- Check internet connection
- Open browser console for errors
- Verify Firebase project is active
- Check databaseURL format (should be https://...firebaseio.com)

### Still showing "📝 Local Leaderboard"?
- Firebase config is not loaded properly
- Check console for error messages
- Verify firebase-config.js is in same folder
- Make sure all 3 Firebase script tags are in index.html

---

## 📊 Monitor Your Leaderboard

### Delete Fake Scores:
1. Firebase Console → Realtime Database
2. Click on a score entry
3. Click the ❌ icon to delete

### Export Leaderboard:
1. Firebase Console → Realtime Database
2. Click ⋮ menu → "Export JSON"

### View Stats:
1. Firebase Console → Realtime Database
2. Click "Usage" tab
3. See read/write statistics

---

## 🎯 What's Next?

After your leaderboard is working:

- [ ] Share your game with friends
- [ ] Watch scores come in!
- [ ] Monitor Firebase console
- [ ] Celebrate! 🎉

---

**Total Time**: ~30 minutes  
**Difficulty**: Beginner-friendly ⭐⭐

Need help? Check **FIREBASE_SETUP_GUIDE.md** for detailed troubleshooting!

