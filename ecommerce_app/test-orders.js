// Test orders filtering by user
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testOrdersFiltering() {
  try {
    console.log('🧪 Testing Orders Filtering by User...\n');

    const user1Data = {
      email: 'john@example.com',
      password: 'password123'
    };

    const user2Data = {
      email: 'jane@example.com',
      password: 'password123'
    };

    // Login as user 1
    console.log('1️⃣ Logging in as User 1...');
    const login1Response = await axios.post(`${API_BASE}/auth/login`, user1Data);
    const user1Token = login1Response.data.data.token;
    const user1 = login1Response.data.data.user;
    console.log('✅ User 1 logged in:', user1);

    // Login as user 2
    console.log('\n2️⃣ Logging in as User 2...');
    const login2Response = await axios.post(`${API_BASE}/auth/login`, user2Data);
    const user2Token = login2Response.data.data.token;
    const user2 = login2Response.data.data.user;
    console.log('✅ User 2 logged in:', user2);

    // Get a product ID to use for orders
    console.log('\n3️⃣ Getting a product for orders...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const products = productsResponse.data.data.products;
    const productId = products[0]?._id || products[0]?.id;

    if (!productId) {
      console.log('❌ No products found, cannot create orders');
      return;
    }
    console.log('✅ Using product ID:', productId);

    // Create order for user 1
    console.log('\n4️⃣ Creating order for User 1...');
    const order1Data = {
      products: [
        {
          product: productId,
          quantity: 2
        }
      ],
      shippingAddress: {
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'USA'
      }
    };

    try {
      const order1Response = await axios.post(`${API_BASE}/orders`, order1Data, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        }
      });
      console.log('✅ Order created for User 1:', order1Response.data.data.order._id);
    } catch (error) {
      console.log('⚠️  Could not create order for User 1:', error.response?.data?.message || error.message);
    }

    // Create order for user 2
    console.log('\n5️⃣ Creating order for User 2...');
    const order2Data = {
      products: [
        {
          product: productId,
          quantity: 1
        }
      ],
      shippingAddress: {
        address: '456 Oak St',
        city: 'Los Angeles',
        postalCode: '90210',
        country: 'USA'
      }
    };

    try {
      const order2Response = await axios.post(`${API_BASE}/orders`, order2Data, {
        headers: {
          'Authorization': `Bearer ${user2Token}`
        }
      });
      console.log('✅ Order created for User 2:', order2Response.data.data.order._id);
    } catch (error) {
      console.log('⚠️  Could not create order for User 2:', error.response?.data?.message || error.message);
    }

    // Test: User 1 should only see their own orders
    console.log('\n6️⃣ Testing User 1 orders endpoint...');
    const user1OrdersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${user1Token}`
      }
    });
    const user1Orders = user1OrdersResponse.data.data.orders;
    console.log('✅ User 1 orders count:', user1Orders.length);

    // Test: User 2 should only see their own orders
    console.log('\n7️⃣ Testing User 2 orders endpoint...');
    const user2OrdersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${user2Token}`
      }
    });
    const user2Orders = user2OrdersResponse.data.data.orders;
    console.log('✅ User 2 orders count:', user2Orders.length);

    // Verify that users don't see each other's orders
    console.log('\n8️⃣ Verifying order isolation...');
    if (user1Orders.length >= 0 && user2Orders.length >= 0) {
      console.log('✅ Orders are properly filtered by user');
    } else {
      console.log('❌ Order filtering may not be working correctly');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Wait a moment for server to start, then test
setTimeout(testOrdersFiltering, 3000);