# 🚀 Deploy Your Doodle Jump Game to GitHub Pages

## Quick Start (10 Minutes)

### Step 1: Create a GitHub Account
1. Go to [github.com](https://github.com)
2. Click "Sign up" (if you don't have an account)
3. Follow the registration process

### Step 2: Create a New Repository
1. Click the **"+"** icon in the top-right corner
2. Select **"New repository"**
3. Fill in the details:
   - **Repository name**: `doodle-jump-game` (or any name you like)
   - **Description**: "A fun Doodle Jump clone built with HTML5 Canvas"
   - **Public** (so it can be hosted on GitHub Pages for free)
   - ✅ Check "Add a README file" (optional, we already have one)
4. Click **"Create repository"**

### Step 3: Upload Your Game Files
1. On your new repository page, click **"Add file"** → **"Upload files"**
2. Drag and drop these files from your computer:
   - `index.html`
   - `game.js`
   - `style.css`
   - `README.md`
   - `.gitignore` (if present)
3. Scroll down and click **"Commit changes"**

### Step 4: Enable GitHub Pages
1. In your repository, click **"Settings"** (top menu)
2. Scroll down and click **"Pages"** (left sidebar)
3. Under **"Source"**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

### Step 5: Get Your Game URL! 🎉
Your game will be live at:
```
https://YOUR-USERNAME.github.io/doodle-jump-game/
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## Alternative Method: Using Git (For Terminal Users)

If you're comfortable with the command line:

```bash
# Navigate to your game folder
cd "/Users/I572406/Library/CloudStorage/OneDrive-SAPSE/00_Desktop/04_Sr AI PM/Cursor"

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Doodle Jump game"

# Connect to GitHub (replace YOUR-USERNAME and YOUR-REPO)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow Step 4 above to enable GitHub Pages.

---

## Sharing Your Game

Once deployed, share with friends:
- 📱 **Direct link**: `https://YOUR-USERNAME.github.io/doodle-jump-game/`
- 💬 **Short link**: Use [bit.ly](https://bit.ly) or [tinyurl.com](https://tinyurl.com) to create a shorter URL
- 📧 **Email**: Send the link directly
- 💬 **Social media**: Share on Discord, Slack, WhatsApp, etc.

---

## Updating Your Game

When you make changes:

### Via Web Interface:
1. Go to your repository on GitHub
2. Click on the file you want to edit
3. Click the pencil icon (Edit)
4. Make changes
5. Click "Commit changes"
6. Wait 1-2 minutes for redeployment

### Via Git:
```bash
git add .
git commit -m "Description of your changes"
git push
```

---

## Troubleshooting

### Game not loading?
- Wait 2-3 minutes after enabling Pages
- Check the URL is correct
- Clear your browser cache (Ctrl/Cmd + Shift + R)

### 404 Error?
- Make sure `index.html` is in the root folder
- Verify GitHub Pages is enabled in Settings → Pages
- Check the branch is set to `main` or `master`

### Files not found?
- All file paths in your HTML are relative (✅ already correct)
- Check file names match exactly (case-sensitive)

---

## What's Next?

Once your game is live, you can:
1. ✅ Share the link with friends
2. 📱 Add PWA features (installable on phones)
3. 🎮 Add more features and update anytime
4. 📊 Track visitors with Google Analytics (optional)
5. 🔗 Get a custom domain (optional, ~$12/year)

---

## Need Help?

If you run into issues:
1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Verify your repository is Public (not Private)
3. Make sure all files uploaded successfully

Happy gaming! 🎮✨

