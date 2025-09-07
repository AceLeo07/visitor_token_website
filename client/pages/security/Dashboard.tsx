import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, XCircle, Camera, List, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  success: boolean;
  security: { id: string; name: string; username: string };
  stats: {
    todayVerified: number;
    todayRejected: number;
    todayScanned: number;
    todayManual: number;
    totalVerifications: number;
    totalRejections: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    method: "qr" | "manual";
    notes: string;
    createdAt: string;
    token?: { tokenCode: string } | null;
  }>;
}

interface LogsResponse {
  success: boolean;
  logs: DashboardData["recentActivity"];
}

export default function SecurityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<LogsResponse["logs"]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const [dashRes, logsRes] = await Promise.all([
        fetch("/api/security/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/security/logs", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dash = (await dashRes.json()) as DashboardData;
      const logData = (await logsRes.json()) as LogsResponse;
      if (!dash.success) throw new Error("Failed to load dashboard");
      setData(dash);
      setLogs(logData.logs || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load security dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    if (!token || !userInfo) {
      navigate("/security/login");
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.role !== "security") {
      navigate("/security/login");
      return;
    }
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
    navigate("/security/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Security Dashboard</h1>
                <p className="text-sm text-gray-600">{data?.security?.name || "Loading..."}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Verified Today</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" /> {data?.stats.todayVerified ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Rejected Today</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-6 h-6" /> {data?.stats.todayRejected ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">QR Scans</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-bold text-orange-600 flex items-center gap-2">
              <Camera className="w-6 h-6" /> {data?.stats.todayScanned ?? 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Manual Checks</CardTitle></CardHeader>
            <CardContent className="pt-0 text-3xl font-bold text-blue-600 flex items-center gap-2">
              <List className="w-6 h-6" /> {data?.stats.todayManual ?? 0}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 10 verification events</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell className={log.action === 'verified' ? 'text-green-700' : 'text-red-700'}>
                      {log.action}
                    </TableCell>
                    <TableCell>{log.method}</TableCell>
                    <TableCell>{log.token?.tokenCode || '-'}</TableCell>
                    <TableCell>{log.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate('/security/scanner')} className="bg-orange-600 hover:bg-orange-700">
            <Shield className="w-4 h-4 mr-2" /> Open Scanner
          </Button>
          <Button variant="outline" onClick={fetchDashboard} disabled={loading}>
            Refresh
          </Button>
        </div>
      </main>
    </div>
  );
}
