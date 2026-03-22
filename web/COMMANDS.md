# Quick Command Reference

## ⚠️ Important: Always Run Commands from the `web` Directory

### ❌ Wrong (from root):
```bash
cd vstep-writing-lab
npm run dev  # This will fail - no scripts in root!
```

### ✅ Correct:
```bash
cd web
npm run dev  # This works!
```

---

## 📁 Project Structure Reminder

```
vstep-writing-lab/
├── backend/          # .NET API
├── web/             # Next.js Frontend ← RUN COMMANDS HERE
│   ├── src/
│   ├── package.json
│   └── ...
└── mobile-app/      # React Native Expo App
```

---

## 🚀 Starting the Web Application

### Option 1: Navigate First
```bash
cd web
npm install      # Install dependencies (first time only)
npm run dev      # Start development server
```

### Option 2: One Command
```bash
cd "d:\FPT STUDY\8_SPRING 2026\SWD392\vstep-writing-lab\web"; npm run dev
```

### Option 3: Full Path
```bash
cd d:\FPT\STUDY\8_SPRING\2026\SWD392\vstep-writing-lab\web
npm run dev
```

---

## 🔗 Access URLs

The app will automatically find an available port:

- **Port 3000** → http://localhost:3000 (default)
- **Port 3001** → http://localhost:3001 (if 3000 busy)
- **Port 3002** → http://localhost:3002 (if 3001 busy)
- **Port 3003** → http://localhost:3003 (current)

**Current Running Instance:** Check your terminal output for the exact URL.

---

## 🛑 Stopping the Server

Press `Ctrl + C` in the terminal where it's running.

---

## 🧹 Troubleshooting

### "Missing script: dev"
**Cause:** You're in the wrong directory.
**Fix:** 
```bash
cd web
npm run dev
```

### Port Already in Use
**Normal behavior** - Next.js will automatically try the next port (3001, 3002, etc.)
**Fix:** Just use the port shown in the terminal output.

### Want to Free Up Ports?
Find and kill processes:
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 📦 Common Commands (from `web` directory)

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check code quality
npm run lint
```

---

## 💡 Pro Tips

1. **Keep the web directory as your working directory** when developing frontend
2. **Use separate terminals** for backend and frontend development
3. **Check which port** the app is using in the terminal output
4. **Bookmark your dev URL** (e.g., http://localhost:3003)

---

## 🎯 Quick Test Checklist

After running `npm run dev`:

✅ Terminal shows "Ready in X.Xs"
✅ No error messages
✅ Can access http://localhost:[PORT]
✅ Landing page loads
✅ Can navigate to /login
✅ Can navigate to /register

---

**Remember:** Always run frontend commands from the `web` directory! 🎉
