import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Send,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Check,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenGenerationData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  visitDate: string;
  expiryDate: string;
  visitorImage?: string; // Base64 encoded image
}

interface GeneratedToken {
  id: string;
  tokenCode: string;
  qrCodeData: string;
  visitorName: string;
  facultyName: string;
  departmentName: string;
  purpose: string;
  visitDate: string;
  expiresAt: string;
}

export default function TokenGeneration() {
  const [formData, setFormData] = useState<TokenGenerationData>({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    purpose: "",
    visitDate: "",
    expiryDate: ""
  });
  const [generatedToken, setGeneratedToken] = useState<GeneratedToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [visitorProfile, setVisitorProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TokenGenerationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          visitorImage: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      visitorImage: undefined
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.visitorName.trim()) errors.push("Visitor name is required");
    if (!formData.visitorEmail.trim()) errors.push("Email is required");
    if (!formData.visitorPhone.trim()) errors.push("Phone number is required");
    if (!formData.purpose.trim()) errors.push("Purpose is required");
    if (!formData.visitDate) errors.push("Visit date is required");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.visitorEmail && !emailRegex.test(formData.visitorEmail)) {
      errors.push("Please enter a valid email address");
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.visitorPhone && !phoneRegex.test(formData.visitorPhone.replace(/\D/g, ''))) {
      errors.push("Phone number must be 10 digits");
    }
    
    // Date validation
    const visitDate = new Date(formData.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);
    
    if (visitDate < today) {
      errors.push("Visit date cannot be in the past");
    }
    
    // Expiry date validation
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= visitDate) {
        errors.push("Expiry date must be after visit date");
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/faculty/token/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedToken(data.token);
        toast({
          title: "✅ Token Generated Successfully!",
          description: `Token sent to ${formData.visitorEmail}`,
          duration: 5000
        });
        
        // Reset form
        setFormData({
          visitorName: "",
          visitorEmail: "",
          visitorPhone: "",
          purpose: "",
          visitDate: "",
          expiryDate: ""
        });
        removeImage();
      } else {
        toast({
          title: "Generation Failed",
          description: data.message || "Failed to generate token",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Token generation error:", error);
      toast({
        title: "Network Error",
        description: "Unable to generate token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTokenPDF = async () => {
    if (!generatedToken) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/faculty/token/${generatedToken.id}/pdf`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Token_${generatedToken.tokenCode}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "PDF Downloaded",
          description: "Token PDF has been downloaded successfully",
        });
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Download Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearGeneratedToken = () => {
    setGeneratedToken(null);
  };

  // Set minimum dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minExpiryDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Generated Token Display */}
      {generatedToken && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check className="w-5 h-5" />
              Token Generated Successfully
            </CardTitle>
            <CardDescription className="text-green-700">
              Token has been sent to the visitor's email and is ready for use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-green-800">Visitor</Label>
                  <p className="font-medium">{generatedToken.visitorName}</p>
                </div>
                <div>
                  <Label className="text-green-800">Token Code</Label>
                  <p className="font-mono text-lg font-bold text-green-600">
                    {generatedToken.tokenCode}
                  </p>
                </div>
                <div>
                  <Label className="text-green-800">Valid Until</Label>
                  <p className="font-medium">
                    {new Date(generatedToken.expiresAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-green-800">Purpose</Label>
                  <p className="text-sm">{generatedToken.purpose}</p>
                </div>
                <div>
                  <Label className="text-green-800">Visit Date</Label>
                  <p className="font-medium">
                    {new Date(generatedToken.visitDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={downloadTokenPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={clearGeneratedToken} variant="ghost">
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate Direct Token
          </CardTitle>
          <CardDescription>
            Create a visitor token without waiting for a request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visitor Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="visitorName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Visitor Name *
                </Label>
                <Input
                  id="visitorName"
                  type="text"
                  placeholder="Enter visitor's full name"
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange("visitorName", e.target.value)}
                  required
                />
              </div>

              {/* Visitor Photo Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Visitor Photo (Optional)
                </Label>

                {imagePreview ? (
                  <div className="relative">
                    <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Visitor preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload photo</p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitorEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="visitorEmail"
                  type="email"
                  placeholder="visitor@example.com"
                  value={formData.visitorEmail}
                  onChange={(e) => handleInputChange("visitorEmail", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitorPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="visitorPhone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.visitorPhone}
                  onChange={(e) => handleInputChange("visitorPhone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Visit Date *
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  min={today}
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange("visitDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Token Expiry Date (Optional)
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  min={minExpiryDate}
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  If not specified, token will expire 1 day after visit date
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Purpose of Visit *
              </Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of visit (meeting, interview, research, etc.)"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Token...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Generate & Send Token
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Token Generation Guidelines
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Generated tokens are sent immediately to the visitor's email</li>
            <li>• Tokens can be downloaded as PDF for physical distribution</li>
            <li>• Upload visitor photos for enhanced security verification</li>
            <li>• Default expiry is 1 day after visit date unless specified</li>
            <li>• Visitor will receive a professional token with QR code</li>
            <li>• All generated tokens are logged for security and reporting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
