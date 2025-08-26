import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Lock, User, Key, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function FacultyLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    adminSecretKey: "",
    isAdmin: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }

    if (formData.isAdmin && !formData.adminSecretKey) {
      toast({
        title: "Admin Secret Key Required",
        description: "Please enter the admin secret key for admin access",
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
          ...(formData.isAdmin && { adminSecretKey: formData.adminSecretKey })
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store auth token and user info
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        
        toast({
          title: "✅ Login Successful",
          description: `Welcome back, ${data.user.name}!`,
          duration: 3000
        });

        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/faculty/dashboard");
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header showBackButton />

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
            {formData.isAdmin ? "Admin Portal" : "Faculty Portal"}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to access your {formData.isAdmin ? "admin" : "faculty"} dashboard
          </p>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">
              {formData.isAdmin ? "Admin Login" : "Faculty Login"}
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
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

              {/* Admin Access Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) => handleInputChange("isAdmin", checked as boolean)}
                />
                <Label htmlFor="isAdmin" className="text-sm">
                  Login as Administrator
                </Label>
              </div>

              {/* Admin Secret Key */}
              {formData.isAdmin && (
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
                      required={formData.isAdmin}
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
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-yellow-900 mb-3">🔑 Demo Credentials</h3>
            <div className="text-yellow-800 space-y-2 text-sm">
              <div><strong>Faculty:</strong> rajesh.kumar / password123</div>
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Admin Secret:</strong> MIT_ADT_ADMIN_2024</div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
