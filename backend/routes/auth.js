import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import twilio from 'twilio';
import crypto from 'crypto';

import User from '../models/User.js';
import Form from '../models/Form.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Common disposable email domains
const DISPOSABLE_DOMAINS = ['mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com', 'yopmail.com'];

// Helper for strong password
const isStrongPassword = (pass) => {
  // At least 8 chars, 1 letter, 1 number, no restriction on other characters
  return pass.length >= 8 && /[A-Za-z]/.test(pass) && /\d/.test(pass);
};

function parseUserAgent(ua) {
  let browser = 'Unknown', os = 'Unknown';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  return { browser, os };
}

function recordLoginSession(user, req, token, action = 'Login successful') {
  const ua = req.headers['user-agent'] || '';
  const { browser, os } = parseUserAgent(ua);
  const sessionId = crypto.randomUUID();
  
  user.sessions.push({
    sessionId,
    token,
    browser,
    os,
    location: 'Unknown',
    lastActive: new Date()
  });
  
  if (user.sessions.length > 10) user.sessions.shift();
  
  user.activityLog.push({
    action,
    device: `${os} - ${browser}`,
    date: new Date(),
    success: true
  });
}

// Reusable email sender
async function sendOtpEmail(toEmail, otp, subject = 'Your Formify Verification Code', recipientName = '') {
  let transporter;
  const senderEmail = process.env.EMAIL_USER;
  
  if (senderEmail && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: senderEmail, pass: process.env.EMAIL_PASS }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email", port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,';
  const year = new Date().getFullYear();

  const info = await transporter.sendMail({
    from: `"Formify - Student Feedback Platform" <${senderEmail}>`,
    replyTo: senderEmail,
    to: toEmail,
    subject,
    // Plain text version (critical for anti-spam)
    text: `${greeting}\n\nYou requested a verification code for your Formify account.\n\nYour code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, no action is needed — your account is safe.\n\nThanks,\nThe Formify Team\nhttps://formify.app\n\n© ${year} Formify. All rights reserved.`,
    // HTML version
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 40px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 40px; text-align:center;">
          <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">Formify</h1>
          <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Student Feedback Platform</p>
        </td></tr>
        
        <!-- Body -->
        <tr><td style="padding: 36px 40px 24px;">
          <p style="margin:0 0 16px; color:#111827; font-size:16px; line-height:1.6;">${greeting}</p>
          <p style="margin:0 0 24px; color:#374151; font-size:15px; line-height:1.6;">
            You recently requested a verification code for your Formify account. Please use the code below to complete your verification:
          </p>
          
          <!-- OTP Code Box -->
          <div style="background:#f3f4f6; border: 2px dashed #d1d5db; border-radius:12px; padding:24px; text-align:center; margin: 0 0 24px;">
            <p style="margin:0 0 8px; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">Verification Code</p>
            <p style="margin:0; font-size:36px; font-weight:800; letter-spacing:10px; color:#4f46e5; font-family: 'Courier New', monospace;">${otp}</p>
          </div>
          
          <p style="margin:0 0 8px; color:#6b7280; font-size:13px; line-height:1.5;">⏱ This code will expire in <strong>10 minutes</strong>.</p>
          <p style="margin:0 0 0; color:#6b7280; font-size:13px; line-height:1.5;">If you didn't request this code, no action is needed — your account is safe and no one can access it without this code.</p>
        </td></tr>
        
        <!-- Divider -->
        <tr><td style="padding: 0 40px;"><hr style="border:none; border-top:1px solid #e5e7eb; margin:0;"></td></tr>
        
        <!-- Footer -->
        <tr><td style="padding: 24px 40px 32px; text-align:center;">
          <p style="margin:0 0 8px; color:#9ca3af; font-size:12px;">You received this email because a verification was requested for <strong>${toEmail}</strong>.</p>
          <p style="margin:0; color:#9ca3af; font-size:12px;">© ${year} Formify — Student Feedback Platform. All rights reserved.</p>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>
    `
  });

  console.log(`Email sent to ${toEmail}. Preview: ${nodemailer.getTestMessageUrl(info) || 'N/A (real Gmail)'}`);
  return info;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const domain = email.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return res.status(400).json({ message: 'Disposable or fake emails are not allowed.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
    }

    let user = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
    
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User with this email or phone already exists and is verified' });
    }

    if (!user) {
      user = await User.create({ name, email, phone, password, isVerified: false });
    } else {
      // Update pending user
      user.name = name;
      user.password = password;
      if (phone) user.phone = phone;
    }

    // Generate and send OTP to the email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
    await user.save();

    console.log(`\n========================================`);
    console.log(`REGISTRATION OTP for ${email}: ${otp}`);
    console.log(`========================================\n`);

    // Send the OTP email
    try {
      await sendOtpEmail(email, otp, 'Verify Your Formify Account', name);
    } catch (mailErr) {
      console.error("Failed to send email:", mailErr.message);
      return res.status(500).json({ message: 'Failed to send verification email. Please check server email configuration.' });
    }

    res.status(200).json({ message: `Verification code sent to ${email}`, email: user.email });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
    
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    const token = generateToken(user._id);
    recordLoginSession(user, req, token, 'Registration and Login');
    await user.save();

    res.json({
      _id: user._id, 
      name: user.name, 
      email: user.email,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token
    });
  } catch (error) {
    console.error('Verify Register Error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Google Auth is not configured on the server. Please add GOOGLE_CLIENT_ID.' });
    }

    console.log('Google Auth: Verifying token with audience:', process.env.GOOGLE_CLIENT_ID);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    console.log('Google Auth: Verified user:', email, name);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + 'A1', // meets password validation
        isVerified: true, // Google users are pre-verified
      });
      console.log('Google Auth: Created new user:', email);
    } else if (!user.isVerified) {
      user.isVerified = true;
    }
    const token = generateToken(user._id);
    recordLoginSession(user, req, token, 'Google Auth Login');
    await user.save();

    res.json({
      _id: user._id, 
      name: user.name, 
      email: user.email,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ message: 'Google authentication failed: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }], isVerified: true });
    
    if (user && user.isActive === false) {
      return res.status(403).json({ message: 'Account deactivated' });
    }
    
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      recordLoginSession(user, req, token);
      
      await user.save();
      
      res.json({
        _id: user._id, 
        name: user.name, 
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }], isVerified: true });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 mins
    await user.save();

    console.log(`\n========================================`);
    console.log(`LOGIN OTP for ${identifier}: ${otp}`);
    console.log(`========================================\n`);

    // Real Authentication Email/SMS dispatcher
    if (identifier.includes('@')) {
      try {
        await sendOtpEmail(identifier, otp, 'Your Formify Login Code', user.name);
      } catch (mailErr) {
        console.error("Failed to send login email:", mailErr.message);
        return res.status(500).json({ message: 'Failed to send OTP email. Please check server email configuration.' });
      }
    } else {
      // It's a phone number
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your Formify OTP is: ${otp}. It expires in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: identifier
        });
        console.log("Real SMS successfully dispatched to %s", identifier);
      } else {
        console.log(`To send real SMS to ${identifier}, add Twilio credentials to .env (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)`);
      }
    }

    res.json({ message: 'OTP sent to your device/email successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }], isVerified: true });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    const token = generateToken(user._id);
    recordLoginSession(user, req, token, 'Registration and Login');
    await user.save();

    res.json({
      _id: user._id, 
      name: user.name, 
      email: user.email,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      token
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/onboarding', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    req.user.onboardingAnswers = answers;
    req.user.hasCompletedOnboarding = true;
    await req.user.save();
    res.json({ message: 'Onboarding completed' });
  } catch (error) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
    res.json(user);
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
    user.email = req.body.email || user.email; // Note: Might want to restrict email changes or require verification, but updating for now
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.organization = req.body.organization !== undefined ? req.body.organization : user.organization;
    user.contactEmail = req.body.contactEmail !== undefined ? req.body.contactEmail : user.contactEmail;
    user.displayName = req.body.displayName !== undefined ? req.body.displayName : user.displayName;
    user.location = req.body.location !== undefined ? req.body.location : user.location;
    user.country = req.body.country !== undefined ? req.body.country : user.country;
    user.about = req.body.about !== undefined ? req.body.about : user.about;
    user.website = req.body.website !== undefined ? req.body.website : user.website;
    user.language = req.body.language !== undefined ? req.body.language : user.language;
    user.timezone = req.body.timezone !== undefined ? req.body.timezone : user.timezone;

    if (req.body.socialProfiles) {
      user.socialProfiles = {
        ...user.socialProfiles,
        ...req.body.socialProfiles
      };
    }

    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        form: { ...user.notificationPreferences?.form, ...req.body.notificationPreferences.form },
        management: { ...user.notificationPreferences?.management, ...req.body.notificationPreferences.management },
        analytics: { ...user.notificationPreferences?.analytics, ...req.body.notificationPreferences.analytics },
        communication: { ...user.notificationPreferences?.communication, ...req.body.notificationPreferences.communication }
      };
    }
    
    await user.save();
    
    // Return the updated user without sensitive fields
    const updatedUser = await User.findById(req.user._id).select('-password -otp -otpExpires');
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers.' });
    }
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    const ua = req.headers['user-agent'] || '';
    const { browser, os } = parseUserAgent(ua);
    user.activityLog.push({
      action: 'Password changed',
      device: `${os} - ${browser}`,
      date: new Date(),
      success: true
    });
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/security-preferences', protect, async (req, res) => {
  try {
    const { loginAlerts, suspiciousAlerts, accountChanges } = req.body;
    const user = await User.findById(req.user._id);
    if (loginAlerts !== undefined) user.securityPreferences.loginAlerts = loginAlerts;
    if (suspiciousAlerts !== undefined) user.securityPreferences.suspiciousAlerts = suspiciousAlerts;
    if (accountChanges !== undefined) user.securityPreferences.accountChanges = accountChanges;
    await user.save();
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sessions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    const sessions = user.sessions.map(s => {
      const sessionObj = s.toObject();
      sessionObj.isCurrent = (s.token === currentToken);
      return sessionObj;
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/sessions/others', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    user.sessions = user.sessions.filter(s => s.token === currentToken);
    const ua = req.headers['user-agent'] || '';
    const { browser, os } = parseUserAgent(ua);
    user.activityLog.push({
      action: 'All other sessions revoked',
      device: `${os} - ${browser}`,
      date: new Date(),
      success: true
    });
    await user.save();
    res.json({ message: 'Other sessions revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { sessionId } = req.params;
    user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
    const ua = req.headers['user-agent'] || '';
    const { browser, os } = parseUserAgent(ua);
    user.activityLog.push({
      action: 'Session revoked',
      device: `${os} - ${browser}`,
      date: new Date(),
      success: true
    });
    await user.save();
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/activity', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const log = user.activityLog.sort((a, b) => b.date - a.date).slice(0, 10);
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/recovery-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.recoveryEmail = req.body.recoveryEmail;
    const ua = req.headers['user-agent'] || '';
    const { browser, os } = parseUserAgent(ua);
    user.activityLog.push({
      action: 'Recovery email updated',
      device: `${os} - ${browser}`,
      date: new Date(),
      success: true
    });
    await user.save();
    res.json({ message: 'Recovery email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/deactivate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    user.sessions = [];
    const ua = req.headers['user-agent'] || '';
    const { browser, os } = parseUserAgent(ua);
    user.activityLog.push({
      action: 'Account deactivated',
      device: `${os} - ${browser}`,
      date: new Date(),
      success: true
    });
    await user.save();
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/account', protect, async (req, res) => {
  try {
    await Form.deleteMany({ createdBy: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/backup-codes', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate 10 random 8-character codes
    const codes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
    
    user.backupCodes = codes; // In a real app, these should be hashed, but for simplicity here we store them plain
    user.activityLog.push({
      action: 'Backup codes generated',
      device: 'System',
      date: new Date(),
      success: true
    });
    
    await user.save();
    res.json({ codes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
