const axios = require('axios');

async function testChatbot() {
  console.log('🤖 Testing Chatbot Health...\n');
  
  try {
    const response = await axios.get('http://localhost:5000/api/chatbot/health');
    console.log('✅ Chatbot Health Check:');
    console.log(`Status: ${response.data.success ? 'OK' : 'ERROR'}`);
    console.log(`Message: ${response.data.message}`);
    
    if (response.data.error) {
      console.log(`Error: ${response.data.error}`);
    }
    
  } catch (error) {
    console.log('❌ Chatbot Health Check Failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.data.message}`);
      console.log(`Error: ${error.response.data.error}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Add OPENAI_API_KEY to your .env file');
  console.log('2. Get API key from: https://platform.openai.com/api-keys');
  console.log('3. Restart the server');
  console.log('4. Test again with: node test-chatbot.js');
}

testChatbot();
