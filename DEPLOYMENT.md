# 🚀 Quick Start Commands

## Initial Setup (First Time Only)

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Create first commit
git commit -m "Initial commit - Pharmacy Management System"

# 4. Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pharmacy-management-system.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## Future Updates

```bash
# 1. Make your changes, then:
git add .

# 2. Commit with a message
git commit -m "Your change description here"

# 3. Push to GitHub (triggers auto-deploy on Vercel)
git push origin main
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (test before deploying)
npm run build

# Preview production build
npm run preview
```

## Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

Done! Your app will be live at `https://your-project.vercel.app`

---

**Need help?** Check `deployment_guide.md` for detailed instructions.
