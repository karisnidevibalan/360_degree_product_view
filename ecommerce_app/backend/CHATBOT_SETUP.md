# 🤖 E-Commerce Chatbot Setup Guide

## Quick Setup (10 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install openai
```

### 2. Add OpenAI API Key to Environment
Add this to your `backend/.env` file:
```env
# Add this line to your existing .env file
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login to your account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 4. Start the Server
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## 🎯 What the Chatbot Can Do

### ✅ Product Queries
- "What's the price of iPhone 16 Pro?"
- "Do you have wireless mouse in stock?"
- "Show me electronics products"

### ✅ Order Support
- "Where is my order?"
- "What's the status of order #12345678?"
- "When will my order be delivered?"

### ✅ General FAQs
- "What's your return policy?"
- "How long does shipping take?"
- "Do you accept returns?"
- "What payment methods do you accept?"

## 🔧 How It Works

### Backend Integration
- **API Endpoint**: `/api/chatbot/chat`
- **Authentication**: Works with or without user login
- **Context Aware**: Knows about your products and user's orders
- **Smart Responses**: Uses OpenAI GPT-3.5-turbo for intelligent responses

### Frontend Integration
- **Floating Chat Button**: Appears on all pages for logged-in users
- **Real-time Chat**: Instant responses with typing indicators
- **Mobile Friendly**: Responsive design works on all devices
- **Persistent**: Chat history maintained during session

## 🧪 Testing the Chatbot

### 1. Test API Endpoint
```bash
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "What products do you have?"}'
```

### 2. Test Health Check
```bash
curl http://localhost:5000/api/chatbot/health
```

### 3. Test in Browser
1. Login to your account
2. Look for the blue chat button in bottom-right corner
3. Click it and start chatting!

## 💡 Example Conversations

### Product Inquiry
**User**: "Do you have any smartphones?"
**Bot**: "Yes! We have several smartphones available. Here are some options:
- iPhone 16 Pro: ₹99,999 (In Stock)
- Wireless Mouse: ₹1,299 (In Stock)
- T-Shirt: ₹599 (In Stock)

Would you like to know more about any specific product?"

### Order Status
**User**: "Where is my order #12345678?"
**Bot**: "I can see your recent orders. Let me check the status of your order #12345678. Based on your order history, it appears to be in 'processing' status. Your order will be shipped within 1-2 business days and you'll receive a shipping notification email."

### General FAQ
**User**: "What's your return policy?"
**Bot**: "We offer a 30-day return policy for unused items. Here are the key points:
- Items must be unused and in original packaging
- Returns are free within 30 days of delivery
- Refunds are processed within 5-7 business days
- Contact our support team for return requests"

## 🔒 Security Features

### ✅ API Key Protection
- OpenAI API key stored securely in environment variables
- Never exposed to frontend

### ✅ Error Handling
- Graceful fallbacks if OpenAI is unavailable
- User-friendly error messages
- No sensitive data exposure

### ✅ Rate Limiting
- Built-in OpenAI rate limiting
- Prevents API abuse

## 🚀 Production Considerations

### 1. OpenAI Usage Monitoring
- Monitor your OpenAI API usage in the dashboard
- Set up billing alerts
- Consider usage limits

### 2. Enhanced Features (Optional)
- Add conversation history storage
- Implement user feedback system
- Add more product context
- Create admin chatbot analytics

### 3. Alternative AI Providers
- Can be easily switched to other AI providers
- Modular design allows for easy replacement

## 🐛 Troubleshooting

### Common Issues:

1. **"Chatbot service is unavailable"**
   - Check if OPENAI_API_KEY is set correctly
   - Verify API key is valid and has credits
   - Check internet connection

2. **"Invalid API key"**
   - Verify the API key in your .env file
   - Make sure there are no extra spaces
   - Check if the key is active in OpenAI dashboard

3. **Chatbot not appearing**
   - Make sure you're logged in
   - Check browser console for errors
   - Verify backend is running

### Debug Steps:
1. Check backend logs for errors
2. Test API endpoint directly with curl
3. Verify environment variables
4. Check OpenAI account status

## 📞 Support

If you need help:
1. Check the console logs for specific errors
2. Verify your OpenAI API key and credits
3. Test the health endpoint: `/api/chatbot/health`
4. Make sure all dependencies are installed

Your e-commerce chatbot is now ready to help your customers! 🎉
