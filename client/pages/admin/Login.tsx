import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Settings, Lock, User, Key, Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    adminSecretKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
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

    if (!formData.username || !formData.password || !formData.adminSecretKey) {
      toast({
        title: "Validation Error",
        description: "All fields are required for admin access",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/faculty/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          adminSecretKey: formData.adminSecretKey
        })
      });

      const data = await response.json();

      if (data.success && data.user.role === 'admin') {
        // Store auth token and user info
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));

        toast({
          title: "✅ Admin Login Successful",
          description: `Welcome back, ${data.user.name}!`,
          duration: 3000
        });

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Admin Login Failed",
          description: data.message || "Invalid admin credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Header showBackButton />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
            Admin Portal
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administrator Access
          </h1>
          <p className="text-gray-600">
            Secure login for system administrators
          </p>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your admin credentials and secret key
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Admin Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Admin Secret Key */}
              <div className="space-y-2">
                <Label htmlFor="adminSecretKey" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Admin Secret Key
                </Label>
                <div className="relative">
                  <Input
                    id="adminSecretKey"
                    type={showSecretKey ? "text" : "password"}
                    placeholder="Enter admin secret key"
                    value={formData.adminSecretKey}
                    onChange={(e) => handleInputChange("adminSecretKey", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-yellow-900 mb-3">🔑 Demo Admin Credentials</h3>
            <div className="text-yellow-800 space-y-2 text-sm">
              <div><strong>Username:</strong> admin</div>
              <div><strong>Password:</strong> admin123</div>
              <div><strong>Secret Key:</strong> MIT_ADT_ADMIN_2024</div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-4 bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-red-900 mb-2">🔒 Security Notice</h3>
            <p className="text-red-800 text-sm">
              Admin access provides full system control. Only authorized personnel should use these credentials.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
