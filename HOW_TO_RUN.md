# 🚀 How to Run the Project

Quick guide to run the project with different configurations.

## 📦 Prerequisites

```bash
# Install dependencies (first time only)
npm install
```

---

## 🎯 Quick Start Commands

### 1️⃣ **Run with Mock APIs** (No Backend Needed)

Perfect for frontend development without backend.

```bash
# Using helper script (easiest)
./run-with-mocks.sh

# Or manually
VITE_ENABLE_MOCKS=true npm run dev
```

**What you get:**
- ✅ Mock data for all users
- ✅ Full CRUD operations work
- ✅ No backend required
- ✅ 500ms simulated network delay
- ✅ Orange `🎭 MOCK MODE` badge visible

### 2️⃣ **Run with Real API** (Backend Required)

Uses your actual backend API.

```bash
# Using helper script
./run-with-real-api.sh

# Or manually
npm run dev
```

**What you get:**
- ✅ Real API calls
- ✅ Real database data
- ⚠️ Backend must be running

### 3️⃣ **Run Production Build**

Build and preview production version.

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔧 Configuration Options

### Option A: Temporary (One Session)

Set environment variable when running:

```bash
# Enable mocks
VITE_ENABLE_MOCKS=true npm run dev

# Disable mocks
VITE_ENABLE_MOCKS=false npm run dev

# Instant responses (no delay)
VITE_ENABLE_MOCKS=true VITE_MOCK_DELAY=0 npm run dev
```

### Option B: Personal Override (Recommended) ⭐

Create `.env.development.local` (won't affect team):

```bash
# Create file
cat > .env.development.local << 'EOF'
VITE_ENABLE_MOCKS=true
VITE_MOCK_DELAY=500
EOF

# Then just run
npm run dev
```

**Benefits:**
- File is gitignored (won't affect team)
- Persists across sessions
- Override without editing committed files

### Option C: Edit Default Config

Edit `.env.development`:

```bash
# Open file
nano .env.development

# Change:
VITE_ENABLE_MOCKS=true

# Save and run
npm run dev
```

**Note:** This changes the default for everyone (committed to Git).

---

## 📋 All Available Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (if configured)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## ✅ How to Verify Mock Mode

### When Mock APIs are **ENABLED**, you'll see:

1. **Console Message:**
   ```
   🎭 Mock API is enabled
   ```

2. **Visual Indicator:**
   - Orange badge in bottom-right corner: `🎭 MOCK MODE`

3. **Request Logs:**
   ```
   🎭 Mock GET /api/users
   🎭 Mock POST /api/users
   ```

4. **Click the badge** to see full config in console

### When Mock APIs are **DISABLED**, you'll see:

1. **Console Message:**
   ```
   🔧 Mock API is disabled
   ```

2. **No Badge:** Orange `🎭 MOCK MODE` badge won't appear

---

## 🎭 Testing Mock APIs

### Quick Test:

```bash
# 1. Enable mocks
VITE_ENABLE_MOCKS=true npm run dev

# 2. Open browser to http://localhost:5173
# 3. Go to Users page
# 4. Try creating/editing/deleting a user
# 5. Check console for 🎭 logs
# 6. See orange badge in bottom-right
```

### Test with Different Delays:

```bash
# Instant (0ms delay)
VITE_ENABLE_MOCKS=true VITE_MOCK_DELAY=0 npm run dev

# Fast (100ms delay)
VITE_ENABLE_MOCKS=true VITE_MOCK_DELAY=100 npm run dev

# Slow network (2 seconds delay)
VITE_ENABLE_MOCKS=true VITE_MOCK_DELAY=2000 npm run dev
```

---

## 🔄 Common Workflows

### Workflow 1: Pure Frontend Development

```bash
# Day 1: Enable mocks, develop UI
echo "VITE_ENABLE_MOCKS=true" > .env.development.local
npm run dev

# Develop your components, test CRUD operations
# All data is mocked, no backend needed

# When backend is ready, switch to real API
echo "VITE_ENABLE_MOCKS=false" > .env.development.local
npm run dev
```

### Workflow 2: Mixed Mode Development

Edit `src/shared/api/mockConfig.ts`:

```typescript
endpoints: {
  users: true,      // Mock users (backend not ready)
  branches: false,  // Real API (backend ready)
  loads: true,      // Mock loads (backend not ready)
}
```

Then enable mocks:
```bash
VITE_ENABLE_MOCKS=true npm run dev
```

### Workflow 3: Full Backend Integration

```bash
# Make sure backend is running on port 3000
cd ../backend
npm start

# In another terminal, run frontend
cd ../twy-front
npm run dev

# Or specify backend URL
echo "VITE_API_BASE_URL=http://localhost:3000/api" >> .env.development.local
npm run dev
```

---

## 🐛 Troubleshooting

### Problem: Changes not taking effect

**Solution:**
```bash
# 1. Restart dev server completely (Ctrl+C)
npm run dev

# 2. If still not working, clear cache
rm -rf node_modules/.vite
npm run dev

# 3. Check browser console for current mode
```

### Problem: Not seeing mock data

**Solution:**
```bash
# 1. Check environment variable
echo $VITE_ENABLE_MOCKS

# 2. Verify in console
# Should see: 🎭 Mock API is enabled

# 3. Check orange badge exists

# 4. Try explicit override
VITE_ENABLE_MOCKS=true npm run dev
```

### Problem: Mock badge not appearing

**Causes:**
- Mocks are disabled (check `.env.development`)
- Component not mounted (check `App.tsx`)
- Browser cache (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)

**Solution:**
```bash
# Verify mocks are enabled
grep VITE_ENABLE_MOCKS .env.development

# Should show: VITE_ENABLE_MOCKS=true
```

### Problem: Backend conflicts with mocks

**Solution:**
```bash
# Completely disable mocks
rm .env.development.local
echo "VITE_ENABLE_MOCKS=false" > .env.development
npm run dev
```

---

## 📁 Environment Files Priority

When you run `npm run dev`, Vite loads files in this order (highest priority first):

1. `.env.development.local` ⭐ (Your personal settings - gitignored)
2. `.env.local` (gitignored)
3. `.env.development` (Team defaults - committed)
4. `.env` (Base defaults - committed)

**Tip:** Use `.env.development.local` for your personal settings!

---

## 🚀 Recommended Setup for Teams

### For Team Members:

```bash
# Clone repo
git clone <repo-url>
cd twy-front

# Install dependencies
npm install

# Create personal config (optional)
cp .env.example .env.development.local

# Edit .env.development.local as needed
nano .env.development.local

# Run project
npm run dev
```

### For New Developers:

```bash
# 1. Clone and install
git clone <repo-url> && cd twy-front && npm install

# 2. Run with mocks (no backend setup needed)
./run-with-mocks.sh

# 3. Start developing!
```

---

## 📚 More Documentation

- **Environment Variables**: See `ENV_CONFIG.md`
- **Mock API System**: See `src/shared/api/MOCK_API_GUIDE.md`
- **Quick Reference**: See `src/shared/api/QUICK_START.md`

---

## 🎉 Summary

| Command | Use Case | Backend Required |
|---------|----------|------------------|
| `./run-with-mocks.sh` | Frontend dev | ❌ No |
| `./run-with-real-api.sh` | Full-stack dev | ✅ Yes |
| `npm run dev` | Uses `.env.development` | Depends |
| `VITE_ENABLE_MOCKS=true npm run dev` | Quick mock test | ❌ No |
| `npm run build` | Production build | N/A |

**Quick tip:** Use `./run-with-mocks.sh` for fastest start! 🚀

