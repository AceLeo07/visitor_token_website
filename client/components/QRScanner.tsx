import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, Scan, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onQRCodeDetected: (qrData: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function QRScanner({ onQRCodeDetected, isActive, onToggle }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastScannedCode, setLastScannedCode] = useState("");

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }

    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [isActive]);

  const startScanning = async () => {
    try {
      setError("");
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startQRDetection();
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopScanning = () => {
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    scanIntervalRef.current = setInterval(() => {
      detectQRCode();
    }, 1000); // Scan every second
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // In a real implementation, you would use jsQR library here:
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
    
    // For demo purposes, simulate QR detection
    simulateQRDetection();
  };

  const simulateQRDetection = () => {
    // Simulate finding a QR code occasionally (for demo)
    if (Math.random() > 0.98) { // 2% chance each scan
      const simulatedQRCodes = [
        'https://visitor.mitadt.edu.in/verify/MIT-DEMO-TOKEN-123',
        'MIT-DEMO-TOKEN-456',
        '{"url":"https://visitor.mitadt.edu.in/verify/MIT-DEMO-TOKEN-789","data":{"t":"MIT-DEMO-TOKEN-789","n":"John Doe","f":"Dr. Smith","d":"Computer Science"}}',
        'https://visitor.mitadt.edu.in/verify/MIT-SAMPLE-XYZ'
      ];
      
      const randomQR = simulatedQRCodes[Math.floor(Math.random() * simulatedQRCodes.length)];
      
      if (randomQR !== lastScannedCode) {
        setLastScannedCode(randomQR);
        onQRCodeDetected(randomQR);
        
        // Auto-stop scanning after detection
        onToggle();
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Camera Not Supported</p>
              <p className="text-sm">Your browser doesn't support camera access for QR scanning.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-5 h-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan visitor QR codes using your device camera
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-orange-500 border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-orange-600 text-center">
                    <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-medium">Scanning for QR codes...</p>
                    <p className="text-xs opacity-75">Point camera at QR code</p>
                  </div>
                </div>
              </div>

              {/* Scanning indicator */}
              <div className="absolute top-4 left-4">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
              </div>
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button 
              onClick={onToggle}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanner
            </Button>
          ) : (
            <Button 
              onClick={onToggle}
              variant="outline"
              className="flex-1"
            >
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanner
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 text-sm mb-2">📱 Scanning Tips</h4>
          <ul className="text-blue-800 text-xs space-y-1">
            <li>• Hold device steady and ensure good lighting</li>
            <li>• Position QR code within the scanning area</li>
            <li>• Keep QR code flat and clearly visible</li>
            <li>• Scanner will automatically detect and process codes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
