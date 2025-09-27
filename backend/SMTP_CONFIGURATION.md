# SMTP Email Configuration Guide

## 🔧 Updated Email Service

I've updated your email service to support **both SMTP and service-based configurations**. The system will automatically detect which configuration you're using.

## 📧 SMTP Configuration (Your Current Setup)

Since you mentioned you already have SMTP configuration, here's what you need in your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

## 🔍 Common SMTP Providers

### Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Outlook/Hotmail SMTP
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo SMTP
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## 🧪 Testing Your SMTP Configuration

Run the updated test script:
```bash
cd backend
node test-email.js
```

The script will now:
1. ✅ Detect if you're using SMTP configuration
2. ✅ Check all required SMTP variables
3. ✅ Test the email functionality
4. ✅ Show detailed error messages if something fails

## 🔧 How It Works

The email service now automatically detects your configuration:

1. **If `SMTP_HOST` is set** → Uses SMTP configuration
2. **If `SMTP_HOST` is not set** → Falls back to service-based (Gmail, etc.)

## 📋 SMTP Variables Explained

- **SMTP_HOST**: Your SMTP server address
- **SMTP_PORT**: Port number (usually 587 for TLS, 465 for SSL)
- **SMTP_SECURE**: `true` for SSL (port 465), `false` for TLS (port 587)
- **SMTP_USER**: Your email address
- **SMTP_PASS**: Your email password or app password
- **SMTP_TLS_REJECT_UNAUTHORIZED**: Set to `false` if you have SSL certificate issues

## 🐛 Troubleshooting SMTP Issues

### Common SMTP Errors:

1. **"Connection timeout"**
   - Check your SMTP_HOST and SMTP_PORT
   - Verify firewall settings

2. **"Authentication failed"**
   - Check SMTP_USER and SMTP_PASS
   - For Gmail: Use App Password, not regular password

3. **"Certificate verification failed"**
   - Set `SMTP_TLS_REJECT_UNAUTHORIZED=false`

4. **"Connection refused"**
   - Check if the SMTP server is running
   - Verify port number

## 🚀 Testing Steps

1. **Check your current `.env` file** - make sure it has the SMTP variables
2. **Run the test script**: `node test-email.js`
3. **Check the output** - it will tell you exactly what's configured
4. **Test with a real order** - place an order through your app

## 📞 Need Help?

If you're still having issues:
1. Share your SMTP configuration (without passwords)
2. Check the test script output
3. Verify your email provider's SMTP settings

Your order confirmation emails will work perfectly with SMTP! 🎉
