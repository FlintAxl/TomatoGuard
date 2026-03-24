# Step-by-Step Ngrok Setup (Follow in Order!)

## Current Status Check ✅

Your `.env` file currently has:
```
EXPO_PUBLIC_API_URL=http://192.168.100.97:8000
```

This is your LOCAL IP address. We need to replace it with a Ngrok URL.

---

## Step-by-Step Process

### ✅ Step 1: Install Ngrok (If Not Done)

**Check if installed:**
```bash
ngrok version
```

**If not installed:**

**Windows:**
1. Download from: https://ngrok.com/download
2. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)
3. Add to PATH or use full path

**Mac:**
```bash
brew install ngrok/ngrok/ngrok
```

---

### ✅ Step 2: Get Ngrok Auth Token (If Not Done)

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up for free account
3. After login, go to: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

**Configure it:**
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

**Verify:**
```bash
ngrok config check
```

---

### ✅ Step 3: Start Your Backend First

**Open Terminal 1:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Wait until you see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal running!**

---

### ✅ Step 4: Start Ngrok (THIS IS WHERE YOU GET THE URL!)

**Open Terminal 2 (NEW TERMINAL):**
```bash
ngrok http 8000
```

**You will see output like this:**
```
ngrok                                                                              
                                                                                   
Session Status                online                                               
Account                       Your Name (Plan: Free)                              
Version                       3.x.x                                                
Region                        United States (us)                                  
Latency                       -                                                    
Web Interface                 http://127.0.0.1:4040                               
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8000
                                                                                   
Connections                   ttl     opn     rt1     rt5     p50     p90          
                              0       0       0.00    0.00    0.00    0.00         
```

**🔍 LOOK FOR THIS LINE:**
```
Forwarding    https://abc123def456.ngrok-free.app -> http://localhost:8000
```

**📋 COPY THE HTTPS URL:** `https://abc123def456.ngrok-free.app`

**This is your Ngrok URL!** (Yours will be different)

---

### ✅ Step 5: Update Your .env File

**Edit `TomatoGuardExpo/.env`:**

**Replace:**
```
EXPO_PUBLIC_API_URL=http://192.168.100.97:8000
```

**With:**
```
EXPO_PUBLIC_API_URL=https://YOUR_NGROK_URL_HERE.ngrok-free.app
```

**Example (use YOUR actual URL):**
```
EXPO_PUBLIC_API_URL=https://abc123def456.ngrok-free.app
```

---

### ✅ Step 6: Restart Expo

**Open Terminal 3 (or stop current Expo and restart):**
```bash
cd TomatoGuardExpo
npx expo start --clear
```

The `--clear` flag is important to reload the environment variables!

---

### ✅ Step 7: Test!

1. **Test in Browser:**
   - Open: `https://YOUR_NGROK_URL.ngrok-free.app/api/health`
   - Should see: `{"status":"healthy",...}`

2. **Test on Phone:**
   - Scan QR code from Expo terminal
   - App should connect via Ngrok

---

## 🎯 Quick Checklist

- [ ] Ngrok installed (`ngrok version` works)
- [ ] Ngrok authtoken configured (`ngrok config check` works)
- [ ] Backend running on port 8000 (Terminal 1)
- [ ] Ngrok tunnel active (Terminal 2)
- [ ] **Ngrok URL copied** (from Terminal 2 output)
- [ ] `.env` file updated with Ngrok URL
- [ ] Expo restarted with `--clear` flag
- [ ] Health check works in browser
- [ ] Mobile app connects successfully

---

## ⚠️ Important Notes

1. **Ngrok URL is generated when you run `ngrok http 8000`**
   - You won't have a URL until you start Ngrok!
   - The URL appears in the terminal output

2. **Keep Ngrok Running:**
   - Don't close Terminal 2 (where Ngrok is running)
   - If you restart Ngrok, you'll get a NEW URL
   - You'll need to update `.env` again if URL changes

3. **Free Plan Limitation:**
   - URL changes each time you restart Ngrok
   - For presentations: Keep Ngrok running, don't restart!

---

## 🐛 Troubleshooting

**"I don't see the Forwarding line in Ngrok output"**
- Make sure backend is running first
- Wait a few seconds for Ngrok to connect
- Check Terminal 1 (backend) for errors

**"Ngrok says 'ERR_NGROK_108 - Invalid authtoken'"**
- Run: `ngrok config add-authtoken YOUR_TOKEN`
- Make sure you copied the token correctly

**"Connection refused" after updating .env**
- Make sure backend is still running (Terminal 1)
- Make sure Ngrok is still running (Terminal 2)
- Restart Expo with `--clear` flag

---

## 📝 Summary

**The key point:** You get the Ngrok URL by running `ngrok http 8000`. The URL appears in the terminal output. Copy that URL and put it in your `.env` file!

Good luck! 🚀
