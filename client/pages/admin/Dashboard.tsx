import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedTokens: number;
  rejectedRequests: number;
  tokensGenerated: number;
  tokensUsed: number;
  todayEntries: number;
}

interface DepartmentStats {
  department: {
    id: string;
    name: string;
    code: string;
  };
  totalRequests: number;
  pendingRequests: number;
  approvedTokens: number;
  rejectedRequests: number;
  tokensGenerated: number;
  tokensUsed: number;
}

interface FacultyStats {
  faculty: {
    id: string;
    name: string;
    email: string;
    department: {
      name: string;
      code: string;
    };
  };
  totalRequests: number;
  pendingRequests: number;
  approvedTokens: number;
  rejectedRequests: number;
  tokensGenerated: number;
  tokensUsed: number;
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
  faculty: {
    name: string;
    email: string;
  };
  department: {
    name: string;
    code: string;
  };
  visitDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  responseMessage?: string;
}

interface FilterState {
  period: string;
  startDate: string;
  endDate: string;
  facultyId: string;
  departmentId: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [facultyStats, setFacultyStats] = useState<FacultyStats[]>([]);
  const [requests, setRequests] = useState<TokenRequest[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<FilterState>({
    period: '',
    startDate: '',
    endDate: '',
    facultyId: '',
    departmentId: '',
    status: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in as admin
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");

    if (!token || !userInfo) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard",
        variant: "destructive"
      });
      navigate("/admin/login");
      return;
    }

    const user = JSON.parse(userInfo);
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive"
      });
      navigate("/admin/login");
      return;
    }

    loadDashboardData();
    loadFacultyAndDepartments();
  }, [navigate, toast]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setDepartmentStats(data.departmentStats);
        setFacultyStats(data.facultyStats);
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

  const loadFacultyAndDepartments = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/admin/faculty-departments", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDepartments(data.departments);
        setFaculty(data.faculty);
      }
    } catch (error) {
      console.error("Load faculty/departments error:", error);
    }
  };

  const loadFilteredRequests = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/requests?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
      } else {
        toast({
          title: "Error",
          description: "Failed to load requests",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Load requests error:", error);
      toast({
        title: "Network Error",
        description: "Failed to load requests",
        variant: "destructive"
      });
    }
  };

  const generateReport = async (format: 'json' | 'pdf' = 'pdf') => {
    try {
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      if (format === 'pdf') {
        queryParams.append('format', 'pdf');
      }

      const response = await fetch(`/api/admin/report?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin_report_${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Report Generated",
          description: "Admin report has been downloaded",
        });
      } else {
        const data = await response.json();
        if (data.success) {
          // Handle JSON data
          console.log("Report data:", data);
        }
      }
    } catch (error) {
      console.error("Generate report error:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    loadFilteredRequests();
  };

  const clearFilters = () => {
    setFilters({
      period: '',
      startDate: '',
      endDate: '',
      facultyId: '',
      departmentId: '',
      status: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">MIT ADT University - System Administrator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={loadDashboardData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                System Overview 📊
              </h2>
              <p className="text-gray-600 mt-2">
                Monitor and manage the entire visitor token system
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              Administrator
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Faculty
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">System wide</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">Awaiting faculty action</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                    <QrCode className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.tokensGenerated - stats.tokensUsed}</div>
                    <p className="text-xs text-muted-foreground">Unused tokens</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
                    <Activity className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.todayEntries}</div>
                    <p className="text-xs text-muted-foreground">Campus access today</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => generateReport('pdf')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Detailed Reports
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={loadDashboardData}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>
                  Token request and approval statistics by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept) => (
                    <div key={dept.department.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{dept.department.name}</h3>
                          <p className="text-sm text-gray-600">{dept.department.code}</p>
                        </div>
                        <Badge>{dept.totalRequests} total requests</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-yellow-600 font-medium">{dept.pendingRequests}</p>
                          <p className="text-gray-500">Pending</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">{dept.approvedTokens}</p>
                          <p className="text-gray-500">Approved</p>
                        </div>
                        <div>
                          <p className="text-red-600 font-medium">{dept.rejectedRequests}</p>
                          <p className="text-gray-500">Rejected</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">{dept.tokensUsed}</p>
                          <p className="text-gray-500">Entries</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Performance</CardTitle>
                <CardDescription>
                  Individual faculty member statistics and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facultyStats.slice(0, 10).map((fac) => (
                    <div key={fac.faculty.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{fac.faculty.name}</h3>
                          <p className="text-sm text-gray-600">{fac.faculty.department.name}</p>
                          <p className="text-xs text-gray-500">{fac.faculty.email}</p>
                        </div>
                        <Badge>{fac.totalRequests} requests</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-yellow-600 font-medium">{fac.pendingRequests}</p>
                          <p className="text-gray-500">Pending</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">{fac.approvedTokens}</p>
                          <p className="text-gray-500">Approved</p>
                        </div>
                        <div>
                          <p className="text-red-600 font-medium">{fac.rejectedRequests}</p>
                          <p className="text-gray-500">Rejected</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">{fac.tokensUsed}</p>
                          <p className="text-gray-500">Entries</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Report Filters
                </CardTitle>
                <CardDescription>
                  Filter data by time period, department, faculty, or status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={filters.departmentId} onValueChange={(value) => handleFilterChange('departmentId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex gap-2">
                      <Button onClick={applyFilters} size="sm">
                        Apply
                      </Button>
                      <Button onClick={clearFilters} variant="outline" size="sm">
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={() => generateReport('pdf')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF Report
                  </Button>
                  <Button onClick={applyFilters} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtered Results */}
            {requests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Filtered Results</CardTitle>
                  <CardDescription>
                    {requests.length} requests found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.slice(0, 10).map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{request.visitor.name}</h4>
                            <p className="text-sm text-gray-600">{request.visitor.email}</p>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>Faculty: {request.faculty.name}</div>
                          <div>Department: {request.department.name}</div>
                          <div>Visit: {new Date(request.visitDate).toLocaleDateString()}</div>
                          <div>Requested: {new Date(request.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
