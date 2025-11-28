# Windows Installation - Quick Testing Guide

## 📦 New Installer Location

The **UPDATED** Windows installer is ready (rebuilt with hardcoded credentials):
```
dist-electron/PharmaPro Setup 0.0.0.exe
Size: ~108 MB
Build Time: Nov 28, 2025 13:13 (latest)
```

✅ **Verified**: Hardcoded Supabase credentials are present in the bundled files

## 🔧 What Was Fixed

The app now includes **hardcoded database credentials** as a fallback, ensuring data loads even when environment variables are missing in the production build.

## ✅ Testing Steps

1. **Uninstall old version** (if installed)
   - Settings → Apps → Find "PharmaPro" → Uninstall

2. **Install new version**
   - Run `PharmaPro Setup 0.0.0.exe`
   - Complete installation wizard

3. **Test the app**
   - Launch PharmaPro
   - Click **Inventory** → Should show products
   - Click **Customers** → Should show customer list
   - Click **Invoices** → Should show invoices

## 🐛 Debugging (If Issues Occur)

**Open DevTools**: Press `Ctrl + Shift + I`

**Check Console Logs**: Look for messages like:
```
[Supabase] Initializing Supabase client...
[Supabase] Successfully initialized with fallback credentials
```

**Common Issues**:
- **No internet**: App needs internet to connect to database
- **Firewall blocking**: Check Windows Firewall settings
- **Still empty**: Share console logs for further debugging

## 📝 Expected Console Output

When working correctly, you should see:
```
[Supabase] Initializing Supabase client...
[Supabase] Environment variables: {hasUrl: false, hasKey: false, url: 'undefined'}
[Supabase] Environment variables not found, using hardcoded fallback
[Supabase] This is expected in production builds
[Supabase] Successfully initialized with fallback credentials
```

## 🆘 If Data Still Doesn't Load

1. Press `Ctrl + Shift + I` to open DevTools
2. Go to Console tab
3. Take a screenshot of any error messages
4. Share the screenshot for debugging

---

**Note**: The database credentials are safely embedded in the app. Row Level Security (RLS) policies protect your data on the server.
