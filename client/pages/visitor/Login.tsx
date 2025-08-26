import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LogIn, User, Mail, Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function VisitorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    tokenCode: ""
  });
  const [showTokenCode, setShowTokenCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.tokenCode) {
      toast({
        title: "Validation Error",
        description: "Email and token code are required",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // For visitor login, we'll verify their token directly
      const response = await fetch("/api/security/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tokenCode: formData.tokenCode
        })
      });

      const data = await response.json();

      if (data.success && data.valid) {
        // Check if the email matches the token's visitor email
        if (data.visitor?.email?.toLowerCase() === formData.email.toLowerCase()) {
          toast({
            title: "✅ Login Successful",
            description: `Welcome ${data.visitor.name}! Your token is valid.`,
            duration: 5000
          });

          // Store visitor info
          localStorage.setItem("visitor_info", JSON.stringify({
            ...data.visitor,
            tokenCode: formData.tokenCode
          }));

          // Redirect to visitor dashboard (we'll create this)
          navigate("/visitor/dashboard");
        } else {
          toast({
            title: "Email Mismatch",
            description: "The email address doesn't match the token's registered email",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid Token",
          description: data.message || "Token not found or already used",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Network Error",
        description: "Unable to verify token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header showBackButton />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Visitor Portal
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Enter your email and token code to view your access details
          </p>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Visitor Login</CardTitle>
            <CardDescription>
              Access your token information and visit details
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Token Code */}
              <div className="space-y-2">
                <Label htmlFor="tokenCode" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Token Code
                </Label>
                <div className="relative">
                  <Input
                    id="tokenCode"
                    type={showTokenCode ? "text" : "password"}
                    placeholder="Enter your token code"
                    value={formData.tokenCode}
                    onChange={(e) => handleInputChange("tokenCode", e.target.value.toUpperCase())}
                    className="font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowTokenCode(!showTokenCode)}
                  >
                    {showTokenCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter the token code from your approval email
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Verify & Login
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a token yet?{" "}
                <Link
                  to="/visitor/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Request Access
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-3">📧 Need Help?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Check your email for the token code after approval</li>
              <li>• Use the same email address you registered with</li>
              <li>• Token codes are case-sensitive</li>
              <li>• Contact the faculty member if you need assistance</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
