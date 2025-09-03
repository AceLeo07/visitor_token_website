import { RequestHandler } from "express";
import { db } from "../database";
import { sendEmail } from "../utils";
import { emailService } from "../emailService";
import { VisitorRegistrationRequest } from "@shared/types";

// Simple password hashing utility (in production, use bcrypt)
const hashPassword = (password: string): string => {
  // Simple hash simulation - in production use bcrypt.hash()
  return `$hash$${Buffer.from(password + 'salt_key_mit_adt').toString('base64')}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Visitor Registration (Profile Creation Only)
export const registerVisitor: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      password
    } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
    }

    // Department and faculty validation removed - no longer needed for profile creation

    // Check if visitor profile already exists
    const existingProfile = db.getVisitorProfileByEmail(email);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "A visitor profile already exists with this email address. Please login instead."
      });
    }

    // Create visitor profile for login functionality
    const visitorProfile = db.createVisitorProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company?.trim(),
      address: address.trim(),
      password: hashPassword(password),
      tokens: []
    });

    // Send welcome email to visitor
    const welcomeEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to MIT ADT University Visitor Portal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 MIT ADT University</h1>
          <h2>Welcome to Visitor Portal</h2>
        </div>

        <div class="content">
          <h3>Dear ${visitorProfile.name},</h3>

          <p>Welcome to MIT ADT University Visitor Portal! Your account has been created successfully.</p>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Login to your account to request campus access tokens</li>
            <li>Submit visit requests with faculty approval</li>
            <li>Track your token status and visit history</li>
          </ul>

          <p>You can now login to your account and request campus access tokens as needed.</p>
        </div>

        <div class="footer">
          <p>© 2024 MIT ADT University. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    sendEmail(visitorProfile.email, 'MIT ADT University - Welcome to Visitor Portal', welcomeEmailContent, 'welcome')
      .catch(error => console.error('Failed to send welcome email:', error));

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please login to request campus access tokens.",
      profileId: visitorProfile.id
    });

  } catch (error) {
    console.error('Visitor registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

// Visitor Profile Login
export const loginVisitorProfile: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Find visitor profile by email
    const visitorProfile = db.getVisitorProfileByEmail(email);
    if (!visitorProfile) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password
    if (!verifyPassword(password, visitorProfile.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login time
    db.updateVisitorProfile(visitorProfile.id, { lastLoginAt: new Date() });

    // Get visitor tokens
    const tokens = db.getVisitorTokens(visitorProfile.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      profile: {
        id: visitorProfile.id,
        name: visitorProfile.name,
        email: visitorProfile.email,
        phone: visitorProfile.phone,
        company: visitorProfile.company,
        address: visitorProfile.address,
        tokens: tokens
      },
      token: `visitor_${visitorProfile.id}_${Date.now()}` // Simple token for session
    });

  } catch (error) {
    console.error('Visitor profile login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};

// Create Token Request (for logged-in visitors)
export const createTokenRequest: RequestHandler = async (req, res) => {
  try {
    const {
      visitorProfileId,
      purpose,
      departmentId,
      facultyId,
      visitDate
    } = req.body;

    // Validation
    if (!visitorProfileId || !purpose || !departmentId || !facultyId || !visitDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Check if visitor profile exists
    const visitorProfile = db.getVisitorProfileById(visitorProfileId);
    if (!visitorProfile) {
      return res.status(404).json({
        success: false,
        message: "Visitor profile not found"
      });
    }

    // Check if department and faculty exist
    const department = db.getDepartmentById(departmentId);
    const faculty = db.getFacultyById(facultyId);

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Invalid department selected"
      });
    }

    if (!faculty) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty selected"
      });
    }

    if (faculty.departmentId !== departmentId) {
      return res.status(400).json({
        success: false,
        message: "Selected faculty does not belong to the selected department"
      });
    }

    // Validate visit date (must be today or future)
    const visitDateTime = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDateTime.setHours(0, 0, 0, 0);

    if (visitDateTime < today) {
      return res.status(400).json({
        success: false,
        message: "Visit date cannot be in the past"
      });
    }

    // Create visitor record (for token request)
    const visitor = db.createVisitor({
      name: visitorProfile.name,
      email: visitorProfile.email,
      phone: visitorProfile.phone,
      company: visitorProfile.company,
      address: visitorProfile.address,
      purpose: purpose.trim()
    });

    // Create token request
    const tokenRequest = db.createTokenRequest({
      visitorId: visitor.id,
      facultyId,
      departmentId,
      purpose: purpose.trim(),
      visitDate: visitDateTime,
      status: 'pending'
    });

    // Send notification email to faculty using enhanced template
    const facultyEmailContent = emailService.generateFacultyNotificationEmail(tokenRequest);
    sendEmail(faculty.email!, `New Visitor Request - ${visitor.name}`, facultyEmailContent, 'faculty_notification')
      .catch(error => console.error('Failed to send faculty notification:', error));

    // Send confirmation email to visitor using enhanced template
    const visitorEmailContent = emailService.generateVisitorConfirmationEmail(tokenRequest);
    sendEmail(visitor.email, 'MIT ADT University - Token Request Submitted', visitorEmailContent, 'visitor_confirmation')
      .catch(error => console.error('Failed to send visitor confirmation:', error));

    res.status(201).json({
      success: true,
      message: "Token request submitted successfully. You will receive an email notification once reviewed.",
      requestId: tokenRequest.id
    });

  } catch (error) {
    console.error('Token request creation error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};
