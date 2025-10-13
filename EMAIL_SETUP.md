# Email Setup Guide

The password request system requires a Yahoo email app password to send notifications.

## Quick Setup Steps

### 1. Get Your Yahoo App Password

1. Go to **[Yahoo Account Security](https://login.yahoo.com/account/security)**
2. **Enable 2-factor authentication** if you haven't already
3. Scroll down to **"Generate app password"** or **"Manage app passwords"**
4. Click **"Generate password"** or **"Add"**
5. Select **"Other App"** and name it "Portfolio Password System"
6. Click **"Generate"**
7. **Copy the generated password** (it will be shown only once)

### 2. Configure Your Local Environment

Open the `.env` file in the project root and replace the placeholder:

```
EMAIL_PASSWORD=your-actual-app-password-here
```

### 3. Start the Server

```bash
npm start
```

The server should now start successfully and show:
```
Email server is ready to send messages
Server running on port 3000
```

## Testing the Email System

1. Go to `http://localhost:3000`
2. Click "Request Access" on the password modal
3. Fill out the form with test information
4. You should receive an email at melissa.casole@yahoo.com with the request details

## Troubleshooting

**"Missing credentials for PLAIN" error:**
- Make sure you've replaced `REPLACE_WITH_YOUR_YAHOO_APP_PASSWORD` in the `.env` file
- The password should have no spaces or quotes around it

**"Invalid credentials" error:**
- Double-check you copied the app password correctly
- Make sure 2-factor authentication is enabled on your Yahoo account
- Try generating a new app password

**Email not received:**
- Check your spam/junk folder
- Verify the email address in `server.js` matches your Yahoo email
- Make sure your Yahoo account is active

## Alternative: Start Script

You can also use the provided script:

```bash
./start-local.sh your-yahoo-app-password-here
```

This is useful for testing without modifying the `.env` file.

