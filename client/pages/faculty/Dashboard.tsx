import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  QrCode,
  FileText,
  LogOut,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Eye,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface FacultyInfo {
  id: string;
  name: string;
  email: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedTokens: number;
  rejectedRequests: number;
  tokensGenerated: number;
  tokensUsed: number;
  todayEntries: number;
}

interface TokenRequest {
  id: string;
  visitor: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    purpose: string;
  };
  visitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  responseMessage?: string;
}

export default function FacultyDashboard() {
  const [faculty, setFaculty] = useState<FacultyInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<TokenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");

    if (!token || !userInfo) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
        variant: "destructive"
      });
      navigate("/faculty/login");
      return;
    }

    const user = JSON.parse(userInfo);
    if (user.role !== 'faculty' && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Faculty access required",
        variant: "destructive"
      });
      navigate("/faculty/login");
      return;
    }

    loadDashboardData();
  }, [navigate, toast]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/faculty/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFaculty(data.faculty);
        setStats(data.stats);
        setRecentRequests(data.recentRequests);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load dashboard",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast({
        title: "Network Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/faculty/login");
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', message: string = '') => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/faculty/requests/${requestId}/${action}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: action === 'approve' ? "Request Approved" : "Request Rejected",
          description: data.message,
        });
        loadDashboardData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Request action error:", error);
      toast({
        title: "Network Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Failed to load faculty information</p>
            <Button onClick={() => navigate("/faculty/login")}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Faculty Dashboard</h1>
                <p className="text-sm text-gray-600">{faculty.name} - {faculty.department.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {faculty.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600 mt-2">
                Manage visitor requests and generate tokens for {faculty.department.name}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              {faculty.department.code}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="token-generation" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Token Generation
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">Awaiting review</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.approvedTokens}</div>
                    <p className="text-xs text-muted-foreground">Tokens issued</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
                    <QrCode className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.todayEntries}</div>
                    <p className="text-xs text-muted-foreground">Campus entries</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Pending Requests
                </CardTitle>
                <CardDescription>
                  Review and approve or reject visitor requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.visitor.name}</h4>
                              <p className="text-sm text-gray-600">{request.visitor.email}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={request.status === 'pending' ? 'default' : 
                                   request.status === 'approved' ? 'default' : 'destructive'}
                            className={request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                     request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {request.visitor.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.visitDate).toLocaleDateString()}
                          </div>
                          {request.visitor.company && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {request.visitor.company}
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Purpose:</p>
                          <p className="text-sm text-gray-600">{request.visitor.purpose}</p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleRequestAction(request.id, 'approve', 'Request approved')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt("Please provide a reason for rejection:");
                                if (reason) {
                                  handleRequestAction(request.id, 'reject', reason);
                                }
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Generation Tab */}
          <TabsContent value="token-generation">
            <Card>
              <CardHeader>
                <CardTitle>Direct Token Generation</CardTitle>
                <CardDescription>
                  Generate tokens directly without waiting for visitor requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Token generation form will be implemented here</p>
                  <Button className="mt-4" onClick={() => setActiveTab("dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  View detailed reports with filters and export options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Reports interface will be implemented here</p>
                  <Button className="mt-4" onClick={() => setActiveTab("dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
