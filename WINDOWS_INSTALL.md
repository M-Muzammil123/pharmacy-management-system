# PharmaPro - Windows Installation Guide

## Quick Start

**File**: `PharmaPro Setup 0.0.0.exe` (102 MB)  
**Location**: `dist-electron/PharmaPro Setup 0.0.0.exe`

## System Requirements

- Windows 10 or 11 (64-bit)
- 4 GB RAM minimum
- 300 MB disk space
- Internet connection

## Installation Steps

1. **Run Installer**
   - Double-click `PharmaPro Setup 0.0.0.exe`
   - If Windows shows security warning: Click "More info" → "Run anyway"

2. **Install**
   - Choose installation folder
   - Select shortcuts (Desktop ✅, Start Menu ✅)
   - Click "Install"

3. **Launch**
   - Open PharmaPro from desktop or Start Menu
   - Application connects to database automatically

## Features

✅ Inventory Management  
✅ Point of Sale (POS)  
✅ Customer Management  
✅ Supplier Management  
✅ Invoice Generation & PDF Export  
✅ Pharmacy Settings & Configuration  

## Troubleshooting

**Security Warning**
- Normal for unsigned apps
- Click "More info" → "Run anyway"

**Installation Fails**
- Run as administrator
- Check disk space
- Temporarily disable antivirus

**No Data / Empty Inventory**
- This happens if the installer was built without environment variables.
- The app defaults to "Offline Mode".
- **Fix**: Go to **Settings** > **Database Configuration** and enter your Supabase URL and API Key manually.

**App Won't Start**
- Check internet connection
- Run as administrator
- Reinstall if needed

## Support

For issues or questions, refer to the full documentation in `walkthrough.md`.

---

**Version**: 0.0.0  
**Build Date**: November 27, 2025  
**Platform**: Windows 10/11 (64-bit)
