// Test authentication flow
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');
    
    // Test 1: Login as admin
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      console.log('👤 User:', loginResponse.data.data.user);
      console.log('🔑 Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
      
      const token = loginResponse.data.data.token;
      
      // Test 2: Access analytics endpoint
      console.log('\n2️⃣ Testing analytics endpoint...');
      const analyticsResponse = await axios.get(`${API_BASE}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (analyticsResponse.data.success) {
        console.log('✅ Analytics access successful');
        console.log('📊 Data received:', {
          totalUsers: analyticsResponse.data.data.totalUsers,
          totalProducts: analyticsResponse.data.data.totalProducts,
          totalOrders: analyticsResponse.data.data.totalOrders
        });
      } else {
        console.log('❌ Analytics access failed');
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Wait a moment for server to start, then test
setTimeout(testAuth, 3000);

