# Portfolio Password Request System

This system allows recruiters and other interested parties to request access to your portfolio with temporary passwords that expire after 48 hours.

## Features

- **Password Request Form**: Collects requester information including name, email, company, and reason for access
- **Email Notifications**: You receive detailed notifications about each request
- **Temporary Passwords**: Automatically generated 16-character passwords that expire in 48 hours
- **Security**: Tracks IP addresses and user agents to prevent abuse
- **Professional UI**: Clean, modern interface that matches your portfolio theme

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Email

You need to set up your Yahoo email password as an environment variable:

**For local development:**
```bash
export EMAIL_PASSWORD="your-yahoo-app-password"
```

**For production (Heroku, etc.):**
```bash
heroku config:set EMAIL_PASSWORD="your-yahoo-app-password"
```

### 3. Yahoo App Password Setup

1. Go to your Yahoo account settings
2. Enable 2-factor authentication
3. Generate an app password for this service
4. Use that password in the EMAIL_PASSWORD environment variable

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## How It Works

1. **Request Process**:
   - User clicks "Request Access" on the password screen
   - Fills out the form with their information
   - System generates a unique request ID and stores the request
   - You receive an email notification with all details and approval/decline links
   - User sees a confirmation that their request has been submitted

2. **Approval Process**:
   - You review the request details in your email
   - Click "Approve Request" link to grant access
   - System generates a random 16-character password
   - User receives an email with their temporary password
   - Or click "Decline Request" to deny access

3. **Password Validation**:
   - Temporary passwords are stored in memory (use a database in production)
   - Passwords automatically expire after 72 hours
   - System cleans up expired passwords every hour

4. **Security Features**:
   - Tracks IP addresses and user agents
   - Validates required fields
   - Manual approval process prevents unauthorized access
   - Automatic password expiration
   - Pending requests are cleaned up after 7 days

## Production Deployment

### Option 1: Heroku
```bash
heroku create your-portfolio-app
git push heroku main
heroku config:set EMAIL_PASSWORD="your-app-password"
```

### Option 2: Vercel
1. Install Vercel CLI
2. Run `vercel` in the project directory
3. Set environment variables in Vercel dashboard

### Option 3: Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

## Customization

### Email Templates
Edit the email templates in `server.js`:
- `sendNotificationEmail()` - Email sent to you
- `sendPasswordEmail()` - Email sent to requester

### Password Expiration
Change the expiration time in `server.js`:
```javascript
const expiresAt = Date.now() + (48 * 60 * 60 * 1000); // 48 hours
```

### Form Fields
Add or modify fields in `index.html` and update the server validation accordingly.

## Security Notes

- In production, use a proper database instead of in-memory storage
- Consider rate limiting to prevent spam
- Add CAPTCHA for additional protection
- Use HTTPS in production
- Regularly rotate email passwords

## Troubleshooting

### Email Not Sending
- Check your Yahoo app password is correct
- Ensure 2-factor authentication is enabled
- Verify the EMAIL_PASSWORD environment variable is set

### Server Won't Start
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check Node.js version (requires 14+)

### Form Not Working
- Check browser console for errors
- Verify the server is running
- Check CORS settings if accessing from different domain
