import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Lock, User, Eye, EyeOff, Camera, Check, Hash, List, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/QRScanner";

interface LoginForm { username: string; password: string }
interface VerificationResult {
  success: boolean; valid: boolean; message: string; visitor?: { name: string; email: string; phone: string; purpose: string; facultyName: string; departmentName: string; visitDate: string };
}
interface DashboardData {
  success: boolean;
  security: { id: string; name: string; username: string };
  stats: { todayVerified: number; todayRejected: number; todayScanned: number; todayManual: number; totalVerifications: number; totalRejections: number };
  recentActivity: Array<{ id: string; action: string; method: "qr" | "manual"; notes: string; createdAt: string; token?: { tokenCode: string } | null }>;
}

export default function SecurityApp() {
  const [auth, setAuth] = useState<{ token: string; user: any } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });

  // Dashboard + Scanner state
  const [tab, setTab] = useState<"dashboard" | "scanner">("dashboard");
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<DashboardData["recentActivity"]>([]);
  const [tokenCode, setTokenCode] = useState("");
  const [verif, setVerif] = useState<VerificationResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Bootstrap auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    if (token && userInfo) {
      const user = JSON.parse(userInfo);
      setAuth({ token, user });
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const [d, l] = await Promise.all([
        fetch("/api/security/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/security/logs", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const djson = (await d.json()) as DashboardData;
      const ljson = (await l.json()) as { success: boolean; logs: DashboardData["recentActivity"] };
      if (!djson.success) throw new Error("Failed to load dashboard");
      setDash(djson);
      setLogs(ljson.logs || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (auth) fetchDashboard();
  }, [auth]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast({ title: "Validation Error", description: "Username and password are required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/security/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const raw = await res.clone().text();
      let data: any; try { data = JSON.parse(raw); } catch { data = { success: res.ok, message: raw }; }
      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        setAuth({ token: data.token, user: data.user });
        toast({ title: "✅ Login Successful", description: `Welcome back, ${data.user.name}!` });
      } else {
        toast({ title: "Login Failed", description: data.message || "Invalid credentials", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Network Error", description: "Unable to connect to server. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (code?: string, qrData?: string) => {
    try {
      setLoading(true);
      setVerif(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/security/verify", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...(code && { tokenCode: code }), ...(qrData && { qrData }) }) });
      const raw = await res.clone().text();
      let data: VerificationResult; try { data = JSON.parse(raw); } catch { data = { success: res.ok, valid: false, message: raw || "Unexpected response" }; }
      setVerif(data);
      if (data.valid) toast({ title: "✅ Access Granted", description: `Welcome ${data.visitor?.name}! Entry permitted.` });
      else toast({ title: "❌ Access Denied", description: data.message, variant: "destructive" });
      setTokenCode("");
      fetchDashboard();
    } catch (e) {
      console.error(e);
      toast({ title: "Network Error", description: "Failed to verify token", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    setAuth(null);
    setDash(null);
    setLogs([]);
    setVerif(null);
    setTokenCode("");
    setTab("dashboard");
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
    navigate("/security");
  };

  if (!auth) {
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
                  <h1 className="text-xl font-bold text-gray-900">Security Login</h1>
                  <p className="text-sm text-gray-600">Gate access control</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Security Login</CardTitle>
              <CardDescription>Enter your credentials to access the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={doLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Username
                  </Label>
                  <Input id="username" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} placeholder="Enter your username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Password
                  </Label>
                  <div className="relative">
                    <Input id="password" type={showPassword?"text":"password"} value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} placeholder="Enter your password" required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1" onClick={()=>setShowPassword(!showPassword)}>
                      {showPassword? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" disabled={loading}>
                  {loading ? <>Signing In...</> : <>Sign In</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-gray-900">Security Portal</h1>
                <p className="text-sm text-gray-600">{auth.user?.name} - Gate Access Control</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <Button variant={tab==='dashboard'? 'default':'outline'} onClick={()=>setTab('dashboard')}>Dashboard</Button>
          <Button variant={tab==='scanner'? 'default':'outline'} onClick={()=>setTab('scanner')}>Scanner</Button>
        </div>

        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Verified Today</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold text-green-600 flex items-center gap-2"><CheckCircle className="w-6 h-6" /> {dash?.stats.todayVerified ?? 0}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Rejected Today</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold text-red-600 flex items-center gap-2"><XCircle className="w-6 h-6" /> {dash?.stats.todayRejected ?? 0}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">QR Scans</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold text-orange-600 flex items-center gap-2"><Camera className="w-6 h-6" /> {dash?.stats.todayScanned ?? 0}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Manual Checks</CardTitle></CardHeader><CardContent className="pt-0 text-3xl font-bold text-blue-600 flex items-center gap-2"><List className="w-6 h-6" /> {dash?.stats.todayManual ?? 0}</CardContent></Card>
            </div>
            <Card className="mt-8"><CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Last 10 verification events</CardDescription></CardHeader><CardContent>
              <Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Method</TableHead><TableHead>Token</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader><TableBody>
                {logs.map((log)=> (
                  <TableRow key={log.id}><TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell><TableCell className={log.action==='verified'?'text-green-700':'text-red-700'}>{log.action}</TableCell><TableCell>{log.method}</TableCell><TableCell>{log.token?.tokenCode || '-'}</TableCell><TableCell>{log.notes}</TableCell></TableRow>
                ))}
              </TableBody></Table></CardContent></Card>
            <div className="mt-6"><Button variant="outline" onClick={fetchDashboard}>Refresh</Button></div>
          </>
        )}

        {tab === 'scanner' && (
          <div className="grid md:grid-cols-2 gap-8">
            <QRScanner isActive={scannerActive} onToggle={()=>setScannerActive(!scannerActive)} onQRCodeDetected={(qr)=>verifyToken(undefined, qr)} />
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Hash className="w-5 h-5" /> Manual Token Entry</CardTitle><CardDescription>Enter token code if QR scanning fails</CardDescription></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="tokenCode">Token Code</Label><Input id="tokenCode" value={tokenCode} onChange={(e)=>setTokenCode(e.target.value.toUpperCase())} placeholder="Enter token code (e.g., MIT-ABC-123)" className="font-mono" /></div>
              <Button onClick={()=>verifyToken(tokenCode)} disabled={loading || !tokenCode.trim()} className="w-full bg-orange-600 hover:bg-orange-700">{loading? 'Verifying...' : (<><Check className="w-4 h-4 mr-2" />Verify Token</>)}</Button>
              {verif && (
                <div className={`p-3 rounded-lg ${verif.valid? 'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
                  <p className={`font-medium ${verif.valid? 'text-green-800':'text-red-800'}`}>{verif.message}</p>
                </div>
              )}
            </CardContent></Card>
          </div>
        )}
      </main>
    </div>
  );
}
