import { RequestHandler } from "express";
import { db } from "../database";
import { sendEmail, generateApprovalEmail } from "../utils";
import { VisitorRegistrationRequest } from "@shared/types";

// Visitor Registration and Token Request
export const registerVisitor: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      purpose,
      departmentId,
      facultyId,
      visitDate
    }: VisitorRegistrationRequest = req.body;

    // Validation
    if (!name || !email || !phone || !address || !purpose || !departmentId || !facultyId || !visitDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
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

    // Create visitor
    const visitor = db.createVisitor({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company?.trim(),
      address: address.trim(),
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

    // Send notification email to faculty
    const facultyEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - New Visitor Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .visitor-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 MIT ADT University</h1>
          <h2>New Visitor Request</h2>
        </div>
        
        <div class="content">
          <h3>Dear ${faculty.name},</h3>
          
          <p>You have received a new visitor request that requires your approval:</p>
          
          <div class="visitor-card">
            <h4>👤 Visitor Details</h4>
            <p><strong>Name:</strong> ${visitor.name}</p>
            <p><strong>Email:</strong> ${visitor.email}</p>
            <p><strong>Phone:</strong> ${visitor.phone}</p>
            ${visitor.company ? `<p><strong>Company:</strong> ${visitor.company}</p>` : ''}
            <p><strong>Address:</strong> ${visitor.address}</p>
            <p><strong>Purpose:</strong> ${visitor.purpose}</p>
            <p><strong>Requested Visit Date:</strong> ${visitDateTime.toLocaleDateString('en-IN')}</p>
            <p><strong>Department:</strong> ${department.name}</p>
          </div>
          
          <p>Please log in to your faculty dashboard to approve or reject this request.</p>
          <p><strong>Request ID:</strong> ${tokenRequest.id}</p>
        </div>
        
        <div class="footer">
          <p>© 2024 MIT ADT University. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    // Send email to faculty (async, don't wait)
    sendEmail(faculty.email!, `New Visitor Request - ${visitor.name}`, facultyEmailContent)
      .catch(error => console.error('Failed to send faculty notification:', error));

    // Send confirmation email to visitor
    const visitorEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Request Submitted</title>
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
          <h2>Request Submitted Successfully</h2>
        </div>
        
        <div class="content">
          <h3>Dear ${visitor.name},</h3>
          
          <p>Thank you for submitting your visitor request to MIT ADT University. Your request has been forwarded to:</p>
          
          <p><strong>Faculty:</strong> ${faculty.name}<br/>
          <strong>Department:</strong> ${department.name}<br/>
          <strong>Requested Date:</strong> ${visitDateTime.toLocaleDateString('en-IN')}</p>
          
          <p>You will receive an email notification once your request is reviewed. This typically takes 1-2 business days.</p>
          
          <p><strong>Request ID:</strong> ${tokenRequest.id}</p>
          
          <p>If you have any questions, please contact the faculty member directly at ${faculty.email}.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 MIT ADT University. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email to visitor (async, don't wait)
    sendEmail(visitor.email, 'MIT ADT University - Visitor Request Submitted', visitorEmailContent)
      .catch(error => console.error('Failed to send visitor confirmation:', error));

    res.status(201).json({
      success: true,
      message: "Visitor request submitted successfully. You will receive an email notification once reviewed.",
      requestId: tokenRequest.id
    });

  } catch (error) {
    console.error('Visitor registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};
