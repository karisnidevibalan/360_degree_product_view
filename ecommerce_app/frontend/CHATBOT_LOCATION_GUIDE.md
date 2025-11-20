# 🤖 Chatbot Location Guide

## 📍 **Where to Find the Chatbot in Your Frontend**

### **1. Chatbot Button Location**
The chatbot appears as a **blue floating button** in the **bottom-right corner** of your screen.

### **2. When You'll See It**
- ✅ **Only when logged in** - The chatbot only appears for authenticated users
- ✅ **On all pages** - Available on Home, Products, Cart, Dashboard, etc.
- ✅ **Not for admin users** - Only shows for regular users, not admin panel

### **3. Visual Description**
- **Color**: Blue (#3b82f6)
- **Icon**: Chat bubble icon
- **Position**: Fixed bottom-right corner
- **Size**: Medium circular button
- **Animation**: Hover effects and smooth transitions

## 🎯 **Step-by-Step to Find Your Chatbot**

### **Step 1: Start Your Application**
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **Step 2: Login to Your Account**
1. Go to `http://localhost:3000`
2. Click "Login" or "Register"
3. Login with your credentials
4. You should see the user dashboard or home page

### **Step 3: Look for the Chatbot**
1. **Look at the bottom-right corner** of your screen
2. You should see a **blue circular button** with a chat icon
3. The button should be floating above other content

### **Step 4: Test the Chatbot**
1. Click the blue chat button
2. A chat window should open
3. Type a message like "Hello" or "What products do you have?"
4. The chatbot should respond

## 🔍 **Troubleshooting: Can't See the Chatbot?**

### **Check 1: Are you logged in?**
- The chatbot only appears for logged-in users
- Make sure you're not on the login/register page
- Check if you see your user profile in the header

### **Check 2: Check browser console**
1. Open browser developer tools (F12)
2. Look for any JavaScript errors
3. Check if there are import errors

### **Check 3: Verify the component is loaded**
1. Open browser developer tools (F12)
2. Go to "Elements" tab
3. Search for "chatbot" or "Chatbot"
4. You should see the chatbot component in the DOM

### **Check 4: Check if backend is running**
1. Make sure your backend server is running on port 5000
2. Test the health endpoint: `http://localhost:5000/api/chatbot/health`

## 🎨 **What the Chatbot Looks Like**

### **Closed State (Button)**
```
┌─────────────────┐
│  💬  (Blue)     │  ← Bottom-right corner
└─────────────────┘
```

### **Open State (Chat Window)**
```
┌─────────────────────────┐
│ 🤖 Shopping Assistant   │
├─────────────────────────┤
│ Hi! How can I help?     │
│                         │
│ [Type your message...]  │
│ [Send]                  │
└─────────────────────────┘
```

## 🧪 **Quick Test**

### **Test 1: Visual Check**
1. Login to your app
2. Look at bottom-right corner
3. You should see a blue button

### **Test 2: Functionality Check**
1. Click the blue button
2. Chat window should open
3. Type "Hello"
4. You should get a response (or "service not configured" if no API key)

### **Test 3: API Check**
```bash
# Test if backend is working
curl http://localhost:5000/api/chatbot/health
```

## 🚀 **If Still Not Working**

### **Option 1: Add Test Component**
Add this to your App.jsx temporarily:
```jsx
import ChatbotTest from './components/ChatbotTest';

// Add this line in your JSX
<ChatbotTest />
```

### **Option 2: Check Console Errors**
1. Open browser console (F12)
2. Look for any red error messages
3. Check if there are import errors

### **Option 3: Manual Test**
1. Go to `http://localhost:5000/api/chatbot/health`
2. You should see a JSON response
3. If this works, the backend is fine

## 📱 **Mobile View**
- The chatbot is responsive
- Works on mobile devices
- Button size adjusts for touch screens

## 🎉 **Expected Behavior**

### **Without API Key:**
- ✅ Button appears
- ✅ Chat opens
- ✅ Shows "service not configured" message

### **With API Key:**
- ✅ Button appears  
- ✅ Chat opens
- ✅ AI responds intelligently

Your chatbot should be visible in the bottom-right corner once you're logged in! 🚀
