# 🔄 How to Update Your Game on GitHub

After making changes to your game locally, here's how to update the live version.

---

## Method 1: GitHub Web Interface (Easiest - 5 minutes)

Perfect if you're not comfortable with Git commands.

### Step-by-Step:

1. **Go to your repository** on GitHub.com
   - URL: `https://github.com/YOUR-USERNAME/doodle-jump-game`

2. **For each file you changed:**
   
   **Option A: Edit directly on GitHub**
   - Click on the file (e.g., `game.js`)
   - Click the **pencil icon** (✏️) to edit
   - Delete all content (Ctrl/Cmd + A, then Delete)
   - Copy content from your local file and paste it in
   - Scroll down, add a commit message like "Updated game logic"
   - Click **"Commit changes"**

   **Option B: Replace the file**
   - Click on the file (e.g., `game.js`)
   - Click the **trash icon** (🗑️) to delete it
   - Commit the deletion
   - Go back to main page
   - Click **"Add file"** → **"Upload files"**
   - Drag your updated file
   - Click **"Commit changes"**

3. **Wait 1-2 minutes** for GitHub Pages to rebuild

4. **Refresh your game URL** to see the changes!
   - Your URL: `https://YOUR-USERNAME.github.io/doodle-jump-game/`
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### 💡 Quick Tip:
You can update multiple files at once using "Upload files":
- Go to your repository main page
- Click **"Add file"** → **"Upload files"**
- Drag all your updated files
- GitHub will automatically replace the old versions
- Click **"Commit changes"**

---

## Method 2: Git Command Line (Faster after setup)

If you're comfortable with terminal/command line, this is faster for frequent updates.

### One-Time Setup:

```bash
# Navigate to your game folder
cd "/Users/I572406/Library/CloudStorage/OneDrive-SAPSE/00_Desktop/04_Sr AI PM/Cursor"

# Initialize git (if not already done)
git init

# Connect to your GitHub repository (replace YOUR-USERNAME and YOUR-REPO)
git remote add origin https://github.com/YOUR-USERNAME/doodle-jump-game.git

# Pull existing files from GitHub (important!)
git pull origin main

# If it says 'main' doesn't exist, try:
git pull origin master
```

### Every Time You Update:

```bash
# 1. Make your changes to the files locally

# 2. Navigate to your game folder (if not already there)
cd "/Users/I572406/Library/CloudStorage/OneDrive-SAPSE/00_Desktop/04_Sr AI PM/Cursor"

# 3. Check what files changed
git status

# 4. Add all changed files
git add .

# Or add specific files only:
git add game.js style.css

# 5. Commit with a descriptive message
git commit -m "Fixed enemy spawning bug and improved performance"

# 6. Push to GitHub
git push origin main

# If 'main' doesn't work, try:
git push origin master
```

### Common Git Commands:

```bash
# See what changed
git status

# See what you modified in detail
git diff

# See commit history
git log --oneline

# Undo uncommitted changes to a file
git checkout -- filename.js

# Pull latest changes from GitHub
git pull origin main
```

---

## Method 3: GitHub Desktop (User-Friendly Git Client)

For those who want Git power without command line.

### Setup:

1. **Download GitHub Desktop**
   - Go to [desktop.github.com](https://desktop.github.com)
   - Install the application

2. **Clone your repository**
   - Open GitHub Desktop
   - Click **"File"** → **"Clone repository"**
   - Select your `doodle-jump-game` repository
   - Choose where to save it locally

### Every Time You Update:

1. **Make changes** to your local files
2. **Open GitHub Desktop**
3. You'll see all changed files listed on the left
4. **Check the files** you want to update
5. **Write a commit message** (e.g., "Updated game mechanics")
6. Click **"Commit to main"**
7. Click **"Push origin"** (top right)
8. Done! Wait 1-2 minutes for GitHub Pages to rebuild

---

## 🚀 Deployment Speed

After pushing changes:
- **Commit appears on GitHub**: Instant
- **GitHub Pages rebuilds**: 1-3 minutes
- **Changes visible on your URL**: 1-3 minutes

### How to verify deployment:
1. Go to your repository on GitHub
2. Click **"Actions"** tab (if available)
3. You'll see the deployment status
4. Wait for the green checkmark ✅

---

## 🔍 Troubleshooting Updates

### Changes not showing up?

**Try these in order:**

1. **Hard refresh your browser**
   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

2. **Clear browser cache**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Click "Clear data"

3. **Wait longer**
   - Sometimes GitHub Pages takes up to 10 minutes
   - Check back in 5-10 minutes

4. **Verify files updated on GitHub**
   - Go to your repository
   - Click on the file (e.g., `game.js`)
   - Check if your changes are there
   - Look at the timestamp - it should be recent

5. **Check GitHub Pages settings**
   - Settings → Pages
   - Make sure it's still enabled
   - Branch should be set to `main` or `master`

6. **Open in incognito/private mode**
   - This bypasses all cache
   - If it works here, it's a cache issue

### Git push rejected?

```bash
# Pull changes first, then push
git pull origin main
git push origin main

# If conflicts occur, resolve them in your files
# Then commit and push again
```

### File not updating?

Make sure:
- ✅ You saved the file locally before committing
- ✅ You actually committed the file (check `git status`)
- ✅ You pushed to the correct branch (`main` or `master`)
- ✅ The filename is spelled exactly the same (case-sensitive!)

---

## 📋 Update Checklist

Use this checklist every time you update:

- [ ] Made changes to local files
- [ ] Saved all files (Ctrl/Cmd + S)
- [ ] Tested locally (opened index.html in browser)
- [ ] Uploaded/pushed changes to GitHub
- [ ] Verified changes appear on GitHub.com
- [ ] Waited 2-3 minutes
- [ ] Hard refreshed game URL (Ctrl+Shift+R)
- [ ] Changes are live! 🎉

---

## 💡 Best Practices

### Write Good Commit Messages:
- ❌ Bad: "updated stuff"
- ❌ Bad: "changes"
- ✅ Good: "Fixed enemy collision detection bug"
- ✅ Good: "Added new power-up: shield"
- ✅ Good: "Improved mobile responsiveness"

### Test Before Pushing:
1. Open `index.html` locally in your browser
2. Test your changes work
3. Then push to GitHub

### Commit Often:
- Make small, focused changes
- Commit after each feature/fix
- Easier to track what changed
- Easier to undo if something breaks

---

## 🎯 Quick Reference

| Method | Difficulty | Speed | Best For |
|--------|-----------|-------|----------|
| Web Interface | ⭐ Easy | Slow | Beginners, small changes |
| Git Command Line | ⭐⭐⭐ Medium | Fast | Frequent updates, developers |
| GitHub Desktop | ⭐⭐ Easy-Medium | Fast | Best of both worlds |

---

## Need Help?

If you're stuck:
1. Check the troubleshooting section above
2. Make sure you're following the steps exactly
3. Try the web interface method first - it's most reliable
4. Check your repository's Actions tab for deployment status

Happy coding! 🚀

