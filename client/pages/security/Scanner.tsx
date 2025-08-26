import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Scan, 
  Camera, 
  CameraOff, 
  Check, 
  X, 
  User, 
  Building, 
  Calendar, 
  AlertCircle,
  LogOut,
  Shield,
  Hash
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SecurityInfo {
  id: string;
  name: string;
  username: string;
}

interface VerificationResult {
  success: boolean;
  valid: boolean;
  message: string;
  visitor?: {
    name: string;
    email: string;
    phone: string;
    purpose: string;
    facultyName: string;
    departmentName: string;
    visitDate: string;
  };
}

export default function SecurityScanner() {
  const [security, setSecurity] = useState<SecurityInfo | null>(null);
  const [tokenCode, setTokenCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");

    if (!token || !userInfo) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the scanner",
        variant: "destructive"
      });
      navigate("/security/login");
      return;
    }

    const user = JSON.parse(userInfo);
    if (user.role !== 'security') {
      toast({
        title: "Access Denied",
        description: "Security access required",
        variant: "destructive"
      });
      navigate("/security/login");
      return;
    }

    setSecurity(user);
  }, [navigate, toast]);

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setIsScanning(true);
        
        // Start scanning for QR codes
        startQRDetection();
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access camera. Please ensure camera permissions are granted and try again.",
        variant: "destructive"
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Simulate QR code detection (In production, use a proper QR code library like jsQR)
  const startQRDetection = () => {
    const interval = setInterval(() => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        clearInterval(interval);
        return;
      }

      // In a real implementation, you would:
      // 1. Draw video frame to canvas
      // 2. Get image data from canvas
      // 3. Use jsQR library to detect QR codes
      // 4. Extract the QR code data
      
      // For demo purposes, we'll simulate QR detection
      // This would be replaced with actual QR scanning logic
      detectQRCode();
    }, 1000);

    // Cleanup interval when component unmounts or scanning stops
    return () => clearInterval(interval);
  };

  // Simulate QR code detection (replace with actual QR library)
  const detectQRCode = () => {
    // This is a simulation - in reality, you'd use jsQR or similar library
    // For demo, we'll just check if there's a predefined QR pattern
    
    // Simulate finding a QR code occasionally (for demo)
    if (Math.random() > 0.95) { // 5% chance each second
      const simulatedQRData = "https://visitor.mitadt.edu.in/verify/MIT-DEMO-TOKEN-123";
      if (simulatedQRData !== lastScannedCode) {
        setLastScannedCode(simulatedQRData);
        handleQRCodeDetected(simulatedQRData);
      }
    }
  };

  // Handle detected QR code
  const handleQRCodeDetected = (qrData: string) => {
    stopCamera();
    verifyToken(undefined, qrData);
    toast({
      title: "QR Code Detected",
      description: "Processing token verification...",
    });
  };

  // Manual token verification
  const handleManualVerification = () => {
    if (!tokenCode.trim()) {
      toast({
        title: "Token Code Required",
        description: "Please enter a token code",
        variant: "destructive"
      });
      return;
    }
    verifyToken(tokenCode.trim());
  };

  // Verify token via API
  const verifyToken = async (code?: string, qrData?: string) => {
    try {
      setLoading(true);
      setVerificationResult(null);
      
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/security/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...(code && { tokenCode: code }),
          ...(qrData && { qrData })
        })
      });

      const data = await response.json();
      setVerificationResult(data);

      if (data.valid) {
        toast({
          title: "✅ Access Granted",
          description: `Welcome ${data.visitor?.name}! Entry permitted.`,
          duration: 5000
        });
      } else {
        toast({
          title: "❌ Access Denied",
          description: data.message,
          variant: "destructive"
        });
      }
      
      // Clear token code after verification
      setTokenCode("");
      
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Network Error",
        description: "Failed to verify token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/security/login");
  };

  const clearResult = () => {
    setVerificationResult(null);
  };

  if (!security) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Security Scanner</h1>
                <p className="text-sm text-gray-600">{security.name} - Gate Access Control</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scanner Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Use camera to scan visitor QR codes for quick verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-orange-500 border-dashed rounded-lg flex items-center justify-center">
                          <div className="text-orange-600 text-center">
                            <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                            <p className="text-sm">Scanning for QR codes...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Camera not active</p>
                      <p className="text-sm">Click start to begin scanning</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                {!isCameraActive ? (
                  <Button 
                    onClick={startCamera}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Manual Token Entry
              </CardTitle>
              <CardDescription>
                Enter token code manually if QR scanning fails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenCode">Token Code</Label>
                <Input
                  id="tokenCode"
                  type="text"
                  placeholder="Enter token code (e.g., MIT-ABC-123)"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              
              <Button 
                onClick={handleManualVerification}
                disabled={loading || !tokenCode.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verify Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <Card className={`mt-8 ${verificationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                {verificationResult.valid ? (
                  <>
                    <Check className="w-5 h-5" />
                    Access Granted ✅
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Access Denied ❌
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`${verificationResult.valid ? 'text-green-700' : 'text-red-700'} mb-4`}>
                <p className="font-medium">{verificationResult.message}</p>
              </div>

              {verificationResult.visitor && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{verificationResult.visitor.name}</p>
                        <p className="text-sm text-gray-600">{verificationResult.visitor.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{verificationResult.visitor.facultyName}</p>
                        <p className="text-sm text-gray-600">{verificationResult.visitor.departmentName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Visit Date</p>
                        <p className="text-sm text-gray-600">{verificationResult.visitor.visitDate}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700">Purpose</p>
                      <p className="text-sm text-gray-600">{verificationResult.visitor.purpose}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button onClick={clearResult} variant="outline">
                  Clear Result
                </Button>
                {!isCameraActive && (
                  <Button onClick={startCamera} className="bg-orange-600 hover:bg-orange-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Scanner Instructions</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Use the QR scanner for fastest verification</li>
              <li>• If QR code is damaged or unreadable, use manual token entry</li>
              <li>• Approved tokens grant one-time entry only</li>
              <li>• Expired or used tokens will be automatically rejected</li>
              <li>• Contact faculty member if visitor has issues with their token</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
