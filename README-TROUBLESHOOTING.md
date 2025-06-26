# Troubleshooting Guide - Beyond Solutions

## 🚨 Common Server Issues & Solutions

### 1. **Directory Not Found Errors**

#### Error Messages:
```
Error: ENOENT: no such file or directory, uv_cwd
FileNotFoundError: [Errno 2] No such file or directory
```

#### Root Cause:
The terminal is trying to access a directory that was deleted, moved, or doesn't exist.

#### Solutions:

**Option A: Use the startup script (Recommended)**
```bash
./start-server.sh
```

**Option B: Manual navigation**
```bash
# Navigate to project root first
cd /beyond-solutions-landing

# Then start server
cd dist && python3 -m http.server 8000
```

**Option C: Reset terminal**
```bash
# Open a new terminal window/tab
# Navigate to the project directory
cd /beyond-solutions-landing
```

### 2. **Port Already in Use**

#### Error Message:
```
OSError: [Errno 48] Address already in use
```

#### ✅ **Automatic Solution (Recommended):**
The `start-server.sh` script now handles this automatically:
- 🔍 **Detects** if port 8000 is in use
- 🔄 **Attempts** to terminate the conflicting process safely  
- 📡 **Falls back** to alternative ports (8001, 8002, etc.) if needed
- 🎯 **Shows** exactly which port the server is running on

Simply run:
```bash
./start-server.sh
```

#### 🛠️ **Manual Solutions:**

**Check what's using the port:**
```bash
lsof -i :8000
```

**Kill the existing process:**
```bash
kill -9 [PID_FROM_ABOVE_COMMAND]
```

**Use a different port:**
```bash
python3 -m http.server 8080
```

**Kill all HTTP servers:**
```bash
pkill -f "python.*http.server"
```

### 3. **Build Issues**

#### Missing dist directory:
```bash
# Rebuild the project
node build.js
```

#### Node.js/NPM issues:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### 4. **Google Maps API Issues**

#### API Key not configured:
1. Copy `config.example.js` to `config.js`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key
3. Rebuild: `node build.js`

#### CSP Violations:
These are already fixed in the current version. If you see CSP errors:
1. Ensure you're using the latest build
2. Check browser console for specific blocked resources

### 5. **Permission Issues**

#### Script not executable:
```bash
chmod +x start-server.sh
```

#### File system permissions:
```bash
# Check permissions
ls -la start-server.sh

# Fix if needed
chmod 755 start-server.sh
```

## 🛠️ Development Workflow

### Starting Development

1. **Always use the startup script:**
   ```bash
   ./start-server.sh
   ```

2. **Or manual workflow:**
   ```bash
   # 1. Navigate to project
   cd ~/Documents/WORK/beyond-solutions-landing
   
   # 2. Rebuild if needed
   node build.js
   
   # 3. Start server
   cd dist && python3 -m http.server 8000
   ```

### Making Changes

1. **Edit source files** (not dist files)
2. **Rebuild:** `node build.js`
3. **Refresh browser** to see changes

### Testing Features

- **Home:** http://localhost:8000/
- **Calculator:** http://localhost:8000/calculator-gamified.html
- **Wizard:** http://localhost:8000/wizard.html
- **Dashboard:** http://localhost:8000/dashboard.html

## 🔍 Debugging Tips

### Browser Console

1. **Open Developer Tools:** F12 or Cmd+Option+I
2. **Check Console tab** for JavaScript errors
3. **Check Network tab** for failed requests
4. **Check Application > Storage** for IndexedDB data

### Common Console Errors

#### Google Maps not loading:
- Check API key configuration
- Verify internet connection
- Look for CSP violations

#### Module not found:
- Rebuild the project: `node build.js`
- Clear browser cache: Cmd+Shift+R

#### Database errors:
- Clear IndexedDB data in browser dev tools
- Refresh the page

### Server Logs

The Python HTTP server shows request logs. Look for:
- **200**: Success
- **404**: File not found (rebuild needed)
- **500**: Server error

## 📋 Quick Checklist

When something isn't working:

- [ ] Are you in the correct directory?
- [ ] Does the `dist` folder exist?
- [ ] Is the server running on port 8000?
- [ ] Is your Google Maps API key configured?
- [ ] Are there any console errors?
- [ ] Have you tried refreshing the browser?
- [ ] Have you rebuilt the project recently?

## 🚀 Server Management

### Starting the Server
```bash
# Recommended method
./start-server.sh

# Alternative methods
cd dist && python3 -m http.server 8000
# OR
npx serve -l 8000 dist
# OR
npx http-server dist -p 8000
```

### Stopping the Server
- **Terminal:** Press `Ctrl+C`
- **Background process:** Find PID with `lsof -i :8000`, then `kill -9 [PID]`

### Changing Ports
```bash
# Use port 8080 instead
python3 -m http.server 8080

# Update URLs accordingly
# http://localhost:8080/calculator-gamified.html
```

## 🔧 Environment Setup

### Required Software
- **Node.js:** v16+ (for build process)
- **Python 3:** (for development server)
- **Modern Browser:** Chrome, Firefox, Safari, Edge

### Project Structure
```
beyond-solutions-landing/
├── dist/                 # Built files (served by web server)
├── js/                   # Source JavaScript
├── css/                  # Source CSS
├── img/                  # Images
├── i18n/                 # Translations
├── build.js              # Build script
├── start-server.sh       # Server startup script
└── README-TROUBLESHOOTING.md
```

## 💡 Pro Tips

1. **Always use the startup script** to avoid directory issues
2. **Rebuild after making changes** to source files
3. **Use browser dev tools** to debug issues
4. **Check the terminal output** for build/server messages
5. **Keep your API keys secure** and never commit them to git

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check the console output** for error messages
2. **Look at browser developer tools** for client-side errors
3. **Verify your environment** matches the requirements
4. **Try the basic troubleshooting steps** above
5. **Document the exact error message** and steps to reproduce

## 📞 Emergency Recovery

If everything seems broken:

```bash
# 1. Navigate to a safe directory
cd ~

# 2. Navigate back to project
cd /beyond-solutions-landing

# 3. Check if you're in the right place
ls -la

# 4. Rebuild everything
node build.js

# 5. Start fresh
./start-server.sh
```

---

**Last Updated:** June 26, 2025  
**Version:** 1.9.1  
**Status:** All known issues resolved ✅ 