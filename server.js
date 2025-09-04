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

// Simple storage using environment variables (works with Vercel)
let pendingRequests = {};
let temporaryPasswords = {};

// Load from environment variables if they exist
function loadFromEnv() {
  try {
    if (process.env.PENDING_REQUESTS) {
      pendingRequests = JSON.parse(process.env.PENDING_REQUESTS);
    }
    if (process.env.TEMPORARY_PASSWORDS) {
      temporaryPasswords = JSON.parse(process.env.TEMPORARY_PASSWORDS);
    }
  } catch (error) {
    console.log('No existing data in environment variables');
  }
}

// Save to environment variables (for persistence across deployments)
function saveToEnv() {
  try {
    // Note: In a real implementation, you'd use a database
    // For now, we'll use in-memory storage that resets on restart
    console.log('Data saved to memory (will reset on restart)');
  } catch (error) {
    console.log('Could not save to environment variables');
  }
}

// Load existing data
loadFromEnv();

// Email configuration
console.log('Email password set:', !!process.env.EMAIL_PASSWORD);
console.log('Email password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: 'melissa.casole@yahoo.com', // Your email
    pass: process.env.EMAIL_PASSWORD // Set this in environment variables
  }
});

// Test email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
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

// Send approval request email to you
async function sendApprovalRequestEmail(requestData, requestId) {
  const mailOptions = {
    from: 'melissa.casole@yahoo.com',
    to: 'melissa.casole@yahoo.com',
    subject: 'Portfolio Access Request - Action Required',
    html: `
      <h2>New Portfolio Access Request</h2>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Name:</strong> ${requestData.name}</p>
      <p><strong>Email:</strong> ${requestData.email}</p>
      <p><strong>Company:</strong> ${requestData.company || 'Not provided'}</p>
      <p><strong>Reason:</strong> ${requestData.reason}</p>
      <p><strong>Other Reason:</strong> ${requestData.otherReason || 'N/A'}</p>
      <p><strong>Timestamp:</strong> ${new Date(requestData.timestamp).toLocaleString()}</p>
      <p><strong>IP Address:</strong> ${requestData.ip}</p>
      <p><strong>User Agent:</strong> ${requestData.userAgent}</p>
      <hr>
      <p><strong>To approve this request:</strong></p>
      <p>Click this link: <a href="https://www.melissacasole.com/api/approve-request/${requestId}">Approve Request</a></p>
      <p><strong>To decline this request:</strong></p>
      <p>Click this link: <a href="https://www.melissacasole.com/api/decline-request/${requestId}">Decline Request</a></p>
      <p><em>Note: Make sure the server is running when you click these links.</em></p>
    `
  };

  try {
    console.log('Attempting to send approval email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Approval email error:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
}

// Send password to requester after approval
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
      <p><strong>Expires:</strong> ${new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleString()}</p>
      <p>This password will expire in 72 hours for security purposes.</p>
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

// Send decline notification to requester
async function sendDeclineEmail(requestData) {
  const mailOptions = {
    from: 'melissa.casole@yahoo.com',
    to: requestData.email,
    subject: 'Portfolio Access Request - Update',
    html: `
      <h2>Portfolio Access Request</h2>
      <p>Hello ${requestData.name},</p>
      <p>Thank you for your interest in my portfolio. Unfortunately, I am unable to grant access at this time.</p>
      <p>If you have any questions, please feel free to reach out directly.</p>
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
  console.log('Received password request:', req.body);
  
  try {
    const requestData = req.body;
    
    // Validate required fields
    if (!requestData.name || !requestData.email || !requestData.reason) {
      console.log('Missing required fields:', { name: !!requestData.name, email: !!requestData.email, reason: !!requestData.reason });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Generate unique request ID
    const requestId = crypto.randomBytes(16).toString('hex');
    
    // Store pending request
    pendingRequests[requestId] = {
      ...requestData,
      status: 'pending',
      createdAt: Date.now()
    };

    // Send approval request email to you
    console.log('Sending approval email for request ID:', requestId);
    const approvalEmailSent = await sendApprovalRequestEmail(requestData, requestId);

    console.log('Approval email sent:', approvalEmailSent);

    if (approvalEmailSent) {
      console.log('Sending success response');
      res.json({ 
        success: true, 
        message: 'Request submitted successfully. You will be notified of the decision.' 
      });
    } else {
      console.log('Sending failure response');
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

// Approve request
app.get('/api/approve-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('Approval request for ID:', requestId);
    
    // Check if request exists in memory
    let requestData = pendingRequests[requestId];
    
    if (!requestData) {
      // If request not found in memory, create a generic approval
      console.log('Request not found in memory, creating generic approval');
      requestData = {
        name: 'Unknown User',
        email: 'unknown@example.com',
        company: 'Unknown Company',
        reason: 'Request approved via direct link',
        timestamp: new Date().toISOString()
      };
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    const expiresAt = Date.now() + (72 * 60 * 60 * 1000); // 72 hours

    // Store temporary password in memory
    temporaryPasswords[temporaryPassword] = {
      email: requestData.email,
      expiresAt: expiresAt,
      requestData: requestData
    };

    // Update request status if it exists
    if (pendingRequests[requestId]) {
      pendingRequests[requestId] = {
        ...requestData,
        status: 'approved',
        approvedAt: Date.now(),
        temporaryPassword: temporaryPassword
      };
    }

    // Send password email to requester
    const passwordSent = await sendPasswordEmail(requestData, temporaryPassword);

    if (passwordSent) {
      res.send(`
        <html>
          <head><title>Request Approved</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #10b981;">✅ Request Approved</h1>
            <p>Access has been granted to <strong>${requestData.name}</strong> (${requestData.email})</p>
            <p>Temporary password: <strong>${temporaryPassword}</strong></p>
            <p>Password has been sent to the requester's email.</p>
            <p><small>You can close this window.</small></p>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <head><title>Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #ef4444;">❌ Error</h1>
            <p>Failed to send password email. Please try again.</p>
            <p>Generated password: <strong>${temporaryPassword}</strong></p>
            <p><small>You can manually send this password to the requester.</small></p>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">❌ Server Error</h1>
          <p>An error occurred while processing the request.</p>
        </body>
      </html>
    `);
  }
});

// Decline request
app.get('/api/decline-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestData = pendingRequests[requestId];
    
    if (!requestData) {
      // If request not found, show a generic decline message
      res.send(`
        <html>
          <head><title>Request Not Found</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f59e0b;">⚠️ Request Not Found</h1>
            <p>The request you're trying to decline was not found in the system.</p>
            <p>This may be because:</p>
            <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
              <li>The server was restarted</li>
              <li>The request was already processed</li>
              <li>The request ID is invalid</li>
            </ul>
            <p><small>You can close this window.</small></p>
          </body>
        </html>
      `);
      return;
    }

    if (requestData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Request has already been processed' 
      });
    }

    // Update request status
    pendingRequests[requestId] = {
      ...requestData,
      status: 'declined',
      declinedAt: Date.now()
    };

    // Send decline email to requester
    const declineEmailSent = await sendDeclineEmail(requestData);

    if (declineEmailSent) {
      res.send(`
        <html>
          <head><title>Request Declined</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #ef4444;">❌ Request Declined</h1>
            <p>Access has been denied to <strong>${requestData.name}</strong> (${requestData.email})</p>
            <p>Decline notification has been sent to the requester.</p>
            <p><small>You can close this window.</small></p>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <head><title>Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #ef4444;">❌ Error</h1>
            <p>Failed to send decline email. Please try again.</p>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('Decline error:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">❌ Server Error</h1>
          <p>An error occurred while processing the request.</p>
        </body>
      </html>
    `);
  }
});

// Verify temporary password
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  
  console.log('Password verification request for:', password);
  console.log('Available temporary passwords:', Object.keys(temporaryPasswords));
  
  if (!password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password required' 
    });
  }

  // First check the hardcoded password
  if (password === 'MelissaAI123!') {
    console.log('Hardcoded password valid');
    res.json({ 
      success: true, 
      message: 'Password valid' 
    });
    return;
  }

  const passwordData = temporaryPasswords[password];
  
  if (!passwordData) {
    console.log('Password not found in temporary passwords');
    return res.json({ 
      success: false, 
      message: 'Invalid password' 
    });
  }

  if (Date.now() > passwordData.expiresAt) {
    console.log('Password expired');
    delete temporaryPasswords[password];
    return res.json({ 
      success: false, 
      message: 'Password expired' 
    });
  }

  console.log('Temporary password valid');
  res.json({ 
    success: true, 
    message: 'Password valid' 
  });
});

// Clean up expired passwords and old pending requests (run every hour)
setInterval(() => {
  const now = Date.now();
  
  // Clean up expired passwords
  for (const password in temporaryPasswords) {
    if (now > temporaryPasswords[password].expiresAt) {
      delete temporaryPasswords[password];
    }
  }
  
  // Clean up old pending requests (older than 7 days)
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  for (const requestId in pendingRequests) {
    if (pendingRequests[requestId].createdAt < sevenDaysAgo) {
      delete pendingRequests[requestId];
    }
  }
}, 60 * 60 * 1000);

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  console.log('Testing email configuration...');
  console.log('Email password set:', !!process.env.EMAIL_PASSWORD);
  console.log('Email password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
  
  try {
    const testMailOptions = {
      from: 'melissa.casole@yahoo.com',
      to: 'melissa.casole@yahoo.com',
      subject: 'Test Email from Portfolio',
      html: '<h2>Test Email</h2><p>This is a test email to verify the email configuration is working.</p>'
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', result);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.json({ success: false, error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
