#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 E-Commerce Chatbot Installation Script');
console.log('==========================================\n');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the backend directory.');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (SMTP)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_TLS_REJECT_UNAUTHORIZED=true

# OpenAI Configuration (Required for Chatbot)
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('📝 .env file already exists');
  
  // Check if OPENAI_API_KEY is already set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('OPENAI_API_KEY')) {
    console.log('✅ OPENAI_API_KEY already configured');
  } else {
    console.log('⚠️  Please add OPENAI_API_KEY to your .env file');
    console.log('   Add this line: OPENAI_API_KEY=your-openai-api-key-here');
  }
}

// Check if openai package is installed
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.dependencies && packageJson.dependencies.openai) {
  console.log('✅ OpenAI package already installed');
} else {
  console.log('📦 Installing OpenAI package...');
  console.log('   Run: npm install openai');
}

console.log('\n🎯 Next Steps:');
console.log('1. Get your OpenAI API key from: https://platform.openai.com/api-keys');
console.log('2. Add it to your .env file: OPENAI_API_KEY=your-key-here');
console.log('3. Install dependencies: npm install openai');
console.log('4. Start your server: npm run dev');
console.log('5. Login to your app and look for the blue chat button!');

console.log('\n📚 For detailed setup instructions, see: CHATBOT_SETUP.md');
console.log('\n🎉 Chatbot installation guide completed!');
