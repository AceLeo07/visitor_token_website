import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  TrendingUp,
  Eye,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportFilter {
  period: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ReportStats {
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
  responseDate?: string;
  responseMessage?: string;
}

interface Token {
  id: string;
  tokenCode: string;
  visitor: {
    name: string;
    email: string;
    purpose: string;
  };
  isUsed: boolean;
  usedAt?: string;
  expiresAt: string;
  generatedBy: 'faculty' | 'approval';
  createdAt: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("requests");
  const [filters, setFilters] = useState<ReportFilter>({
    period: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [requests, setRequests] = useState<TokenRequest[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/faculty/reports?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRequests(data.requests);
        setTokens(data.tokens);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load reports",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Load reports error:", error);
      toast({
        title: "Network Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof ReportFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    loadReports();
  };

  const clearFilters = () => {
    setFilters({
      period: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    // Reload with cleared filters
    setTimeout(() => {
      loadReports();
    }, 100);
  };

  const exportReport = () => {
    const reportData = {
      filters,
      stats,
      requests,
      tokens,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Report data has been downloaded as JSON file",
    });
  };

  // Filter data based on search query
  const filteredRequests = requests.filter(request =>
    request.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.visitor.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTokens = tokens.filter(token =>
    token.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.tokenCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedTokens}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRequests > 0 ? Math.round((stats.approvedTokens / stats.totalRequests) * 100) : 0}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Generated</CardTitle>
              <QrCode className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.tokensGenerated}</div>
              <p className="text-xs text-muted-foreground">Including direct generation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campus Entries</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.tokensUsed}</div>
              <p className="text-xs text-muted-foreground">Successful token usage</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Filter your data by time period and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Button onClick={applyFilters} size="sm" disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Apply"}
                </Button>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by visitor name, email, or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Visitor Requests ({filteredRequests.length})
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Generated Tokens ({filteredTokens.length})
          </TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Requests</CardTitle>
              <CardDescription>
                All visitor requests and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No requests found</p>
                  {searchQuery && (
                    <p className="text-sm">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.visitor.name}</h4>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Phone:</span> {request.visitor.phone}
                        </div>
                        <div>
                          <span className="font-medium">Visit Date:</span> {new Date(request.visitDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span> {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        {request.responseDate && (
                          <div>
                            <span className="font-medium">Responded:</span> {new Date(request.responseDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Purpose:</p>
                        <p className="text-sm text-gray-600">{request.visitor.purpose}</p>
                      </div>

                      {request.responseMessage && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-700">Response:</p>
                          <p className="text-sm text-gray-600">{request.responseMessage}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Tokens</CardTitle>
              <CardDescription>
                All tokens generated by you, including direct generation and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tokens found</p>
                  {searchQuery && (
                    <p className="text-sm">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTokens.map((token) => (
                    <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{token.visitor.name}</h4>
                          <p className="text-sm text-gray-600">{token.visitor.email}</p>
                          <p className="font-mono text-sm text-blue-600 font-medium">{token.tokenCode}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={token.isUsed ? 'default' : 'outline'}
                            className={token.isUsed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                          >
                            {token.isUsed ? 'Used' : 'Active'}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {token.generatedBy === 'faculty' ? 'Direct' : 'Approval'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Generated:</span> {new Date(token.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {new Date(token.expiresAt).toLocaleDateString()}
                        </div>
                        {token.usedAt && (
                          <div>
                            <span className="font-medium">Used:</span> {new Date(token.usedAt).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 ${token.isUsed ? 'text-blue-600' : 'text-green-600'}`}>
                            {token.isUsed ? 'Entry Completed' : 'Awaiting Use'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Purpose:</p>
                        <p className="text-sm text-gray-600">{token.visitor.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
