import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String }, // optional for OTP-only users if needed, but required for standard
  role: { type: String, default: 'manager' },
  organization: { type: String, default: '' },
  contactEmail: { type: String },
  displayName: { type: String, default: '' },
  location: { type: String, default: '' },
  country: { type: String, default: '' },
  about: { type: String, default: '' },
  website: { type: String, default: '' },
  language: { type: String, default: 'English' },
  timezone: { type: String, default: 'UTC' },
  
  socialProfiles: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    x: { type: String, default: '' },
    medium: { type: String, default: '' },
    huggingFace: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    snapchat: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },

  notificationPreferences: {
    form: {
      newSubmission: { type: Boolean, default: true },
      newQuizSubmission: { type: Boolean, default: true },
      newFeedbackResponse: { type: Boolean, default: true },
      responseMilestone: { type: Boolean, default: false },
      responseMilestoneThreshold: { type: Number, default: 100 }
    },
    management: {
      formPublished: { type: Boolean, default: true },
      formClosed: { type: Boolean, default: true },
      formUpdated: { type: Boolean, default: false },
      exportReady: { type: Boolean, default: true }
    },
    analytics: {
      weeklySummary: { type: Boolean, default: false },
      responseSummary: { type: Boolean, default: false },
      performanceAlerts: { type: Boolean, default: false },
      scheduledReportReady: { type: Boolean, default: true }
    },
    communication: {
      productUpdates: { type: Boolean, default: true },
      tipsGuides: { type: Boolean, default: false },
      maintenanceAlerts: { type: Boolean, default: true },
      serviceAnnouncements: { type: Boolean, default: true }
    }
  },
  
  securityPreferences: {
    loginAlerts: { type: Boolean, default: true },
    suspiciousAlerts: { type: Boolean, default: true },
    accountChanges: { type: Boolean, default: false }
  },
  sessions: [{
    sessionId: { type: String, required: true },
    token: { type: String, required: true },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    location: { type: String, default: 'Unknown' },
    lastActive: { type: Date, default: Date.now },
    isCurrent: { type: Boolean, default: false }
  }],
  activityLog: [{
    action: { type: String, required: true },
    device: { type: String, default: 'Unknown' },
    date: { type: Date, default: Date.now },
    success: { type: Boolean, default: true }
  }],
  recoveryEmail: { type: String, default: '' },
  backupCodes: [{ type: String }],
  isActive: { type: Boolean, default: true },
  passwordChangedAt: Date,

  // New Onboarding & OTP Fields
  hasCompletedOnboarding: { type: Boolean, default: false },
  onboardingAnswers: { type: Object, default: {} },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
