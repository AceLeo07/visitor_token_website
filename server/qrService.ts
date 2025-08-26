// QR Code Service for token generation and validation
// In production, you would use libraries like 'qrcode' for generation and 'jsqr' for reading

interface QRCodeData {
  tokenCode: string;
  visitorName: string;
  facultyName: string;
  departmentName: string;
  visitDate: string;
  expiresAt: string;
  timestamp: number;
}

class QRCodeService {
  // Generate QR code data URL (Base64 encoded)
  generateQRCode(tokenCode: string, visitorData: any): string {
    // In production, use a proper QR code library like 'qrcode'
    // This is a simplified version for demo purposes
    
    const qrData: QRCodeData = {
      tokenCode,
      visitorName: visitorData.visitorName || '',
      facultyName: visitorData.facultyName || '',
      departmentName: visitorData.departmentName || '',
      visitDate: visitorData.visitDate || '',
      expiresAt: visitorData.expiresAt || '',
      timestamp: Date.now()
    };

    // Create verification URL
    const baseUrl = process.env.BASE_URL || 'https://visitor.mitadt.edu.in';
    const verificationUrl = `${baseUrl}/verify/${tokenCode}`;
    
    // Encode data for QR code
    const qrPayload = JSON.stringify({
      url: verificationUrl,
      data: qrData
    });

    // In production, this would generate actual QR code:
    // const qr = require('qrcode');
    // return await qr.toDataURL(qrPayload);
    
    // For demo, return a placeholder data URL
    return this.generatePlaceholderQR(qrPayload);
  }

  // Generate a placeholder QR code (for demo purposes)
  private generatePlaceholderQR(data: string): string {
    // Create a simple SVG QR code placeholder
    const size = 200;
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;
    
    // Generate a pseudo-random pattern based on data
    const hash = this.simpleHash(data);
    let pattern = '';
    
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        const index = y * modules + x;
        // Create finder patterns (corners)
        if (this.isFinderPattern(x, y, modules)) {
          pattern += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        } else if ((hash + index) % 3 === 0) {
          pattern += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }

    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        ${pattern}
      </svg>
    `;

    // Convert SVG to base64 data URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  // Check if position is a finder pattern (QR code corners)
  private isFinderPattern(x: number, y: number, size: number): boolean {
    const patterns = [
      { x: 0, y: 0, size: 7 },           // Top-left
      { x: size - 7, y: 0, size: 7 },   // Top-right
      { x: 0, y: size - 7, size: 7 }    // Bottom-left
    ];

    return patterns.some(pattern => 
      x >= pattern.x && x < pattern.x + pattern.size &&
      y >= pattern.y && y < pattern.y + pattern.size
    );
  }

  // Simple hash function for demo purposes
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Validate QR code data
  validateQRCode(qrData: string): { valid: boolean; tokenCode?: string; error?: string } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(qrData);
      
      if (parsed.data && parsed.data.tokenCode) {
        return {
          valid: true,
          tokenCode: parsed.data.tokenCode
        };
      }
      
      // If not JSON, check if it's a direct URL
      if (qrData.includes('/verify/')) {
        const match = qrData.match(/\/verify\/(.+)$/);
        if (match) {
          return {
            valid: true,
            tokenCode: match[1]
          };
        }
      }
      
      // Check if it's a direct token code
      if (/^MIT-[A-Z0-9]+-[A-Z0-9]+$/.test(qrData)) {
        return {
          valid: true,
          tokenCode: qrData
        };
      }
      
      return {
        valid: false,
        error: 'Invalid QR code format'
      };
    } catch (error) {
      // If parsing fails, treat as direct token code or URL
      if (qrData.includes('/verify/')) {
        const match = qrData.match(/\/verify\/(.+)$/);
        if (match) {
          return {
            valid: true,
            tokenCode: match[1]
          };
        }
      }
      
      return {
        valid: false,
        error: 'Unable to parse QR code data'
      };
    }
  }

  // Generate QR code for display in emails/PDFs
  generateEmailQRCode(tokenCode: string): string {
    const baseUrl = process.env.BASE_URL || 'https://visitor.mitadt.edu.in';
    const verificationUrl = `${baseUrl}/verify/${tokenCode}`;
    
    // For email, we'll use a QR code API service (in production)
    // For demo, return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
  }

  // Create a comprehensive QR code with embedded data
  createSecureQRCode(token: any): string {
    const qrData = {
      v: 1, // Version
      t: token.tokenCode,
      n: token.visitor?.name,
      f: token.faculty?.name,
      d: token.faculty?.department?.name,
      e: new Date(token.expiresAt).getTime(),
      c: Date.now() // Creation timestamp
    };

    const baseUrl = process.env.BASE_URL || 'https://visitor.mitadt.edu.in';
    const verificationUrl = `${baseUrl}/verify/${token.tokenCode}`;
    
    // Embed both URL and data for redundancy
    const payload = {
      url: verificationUrl,
      data: qrData,
      sig: this.generateSignature(qrData) // Simple signature for validation
    };

    return JSON.stringify(payload);
  }

  // Generate a simple signature (in production, use proper crypto)
  private generateSignature(data: any): string {
    const str = JSON.stringify(data);
    const hash = this.simpleHash(str + 'SECRET_KEY_MIT_ADT');
    return hash.toString(16);
  }

  // Verify QR code signature
  verifySignature(data: any, signature: string): boolean {
    const expectedSig = this.generateSignature(data);
    return expectedSig === signature;
  }
}

export const qrService = new QRCodeService();
