const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Store temporary passwords (in production, use a database)
const temporaryPasswords = new Map();

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: 'melissa.casole@yahoo.com', // Your email
    pass: process.env.EMAIL_PASSWORD // Set this in environment variables
  }
});

// Generate random password
function generateTemporaryPassword() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Send email notification
async function sendNotificationEmail(requestData, temporaryPassword) {
  const mailOptions = {
    from: 'melissa.casole@yahoo.com',
    to: 'melissa.casole@yahoo.com',
    subject: 'Portfolio Access Request',
    html: `
      <h2>New Portfolio Access Request</h2>
      <p><strong>Name:</strong> ${requestData.name}</p>
      <p><strong>Email:</strong> ${requestData.email}</p>
      <p><strong>Company:</strong> ${requestData.company || 'Not provided'}</p>
      <p><strong>Reason:</strong> ${requestData.reason}</p>
      <p><strong>Other Reason:</strong> ${requestData.otherReason || 'N/A'}</p>
      <p><strong>Timestamp:</strong> ${new Date(requestData.timestamp).toLocaleString()}</p>
      <p><strong>IP Address:</strong> ${requestData.ip}</p>
      <p><strong>User Agent:</strong> ${requestData.userAgent}</p>
      <hr>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p><strong>Expires:</strong> ${new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

// Send password to requester
async function sendPasswordEmail(requestData, temporaryPassword) {
  const mailOptions = {
    from: 'melissa.casole@yahoo.com',
    to: requestData.email,
    subject: 'Portfolio Access Granted',
    html: `
      <h2>Portfolio Access Granted</h2>
      <p>Hello ${requestData.name},</p>
      <p>Your request for portfolio access has been approved.</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p><strong>Expires:</strong> ${new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString()}</p>
      <p>This password will expire in 48 hours for security purposes.</p>
      <p>Best regards,<br>Melissa Casole</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

// API Routes
app.post('/api/password-request', async (req, res) => {
  try {
    const requestData = req.body;
    
    // Validate required fields
    if (!requestData.name || !requestData.email || !requestData.reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    const expiresAt = Date.now() + (48 * 60 * 60 * 1000); // 48 hours

    // Store temporary password
    temporaryPasswords.set(temporaryPassword, {
      email: requestData.email,
      expiresAt: expiresAt,
      requestData: requestData
    });

    // Send notification email to you
    const notificationSent = await sendNotificationEmail(requestData, temporaryPassword);
    
    // Send password email to requester
    const passwordSent = await sendPasswordEmail(requestData, temporaryPassword);

    if (notificationSent && passwordSent) {
      res.json({ 
        success: true, 
        message: 'Request processed successfully' 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Request received but email delivery failed' 
      });
    }

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify temporary password
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password required' 
    });
  }

  const passwordData = temporaryPasswords.get(password);
  
  if (!passwordData) {
    return res.json({ 
      success: false, 
      message: 'Invalid password' 
    });
  }

  if (Date.now() > passwordData.expiresAt) {
    temporaryPasswords.delete(password);
    return res.json({ 
      success: false, 
      message: 'Password expired' 
    });
  }

  res.json({ 
    success: true, 
    message: 'Password valid' 
  });
});

// Clean up expired passwords (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [password, data] of temporaryPasswords.entries()) {
    if (now > data.expiresAt) {
      temporaryPasswords.delete(password);
    }
  }
}, 60 * 60 * 1000);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
