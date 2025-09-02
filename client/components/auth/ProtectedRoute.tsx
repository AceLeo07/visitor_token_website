import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'faculty' | 'admin' | 'security';
  redirectTo?: string;
}

interface AuthUser {
  id: string;
  name: string;
  role: 'faculty' | 'admin' | 'security';
  username: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo 
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("auth_token");
      const userInfo = localStorage.getItem("user_info");

      if (!token || !userInfo) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userInfo) as AuthUser;
        
        // Check if user role matches required role
        if (parsedUser.role !== requiredRole) {
          setIsAuthenticated(false);
          return;
        }

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user info:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [requiredRole]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>Verifying Access</CardTitle>
            <CardDescription>Checking your authentication...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const loginPath = `/${requiredRole}/login`;
    const redirectUrl = redirectTo || loginPath;
    
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  // Show unauthorized message if wrong role
  if (user && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this area. Your role: {user.role}, Required: {requiredRole}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Please contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for easy use
export const withAuth = (
  Component: React.ComponentType, 
  requiredRole: 'faculty' | 'admin' | 'security'
) => {
  return function AuthenticatedComponent(props: any) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};
