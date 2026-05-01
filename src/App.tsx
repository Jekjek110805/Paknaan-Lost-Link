import { useState, useEffect, createContext, useContext, type FormEvent, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Search, PlusCircle, User, Settings, MapPin, Calendar, Clock, ShieldCheck, 
  Bell, Menu, X, LayoutDashboard, LogOut, ChevronRight, TrendingUp, 
  Award, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, 
  QrCode, FileText, Download, Share2, Filter, ArrowLeft, Home as HomeIcon,
  BarChart3, Users, Package, MessageSquare, Star, AlertTriangle, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from 'qrcode.react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== API ====================
const API_URL = '';
const logoUrl = new URL('./assets/lostlink-logo-cropped.png', import.meta.url).href;

async function apiCall(endpoint: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ==================== AUTH ====================
const AuthContext = createContext<any>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveSession = (token: string, nextUser: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const data = await apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession(data.token, data.user);
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    saveSession(data.token, data.user);
    return data;
  };

  const loginWithGoogle = (returnTo = '/dashboard') => {
    const params = new URLSearchParams({ returnTo });
    window.location.assign(`/api/auth/google?${params.toString()}`);
  };

  const completeGoogleLogin = (token: string, nextUser: any) => {
    saveSession(token, nextUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, completeGoogleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ==================== CONSTANTS ====================
const CATEGORIES = [
  'Electronics (Phone, Laptop, Tablet)',
  'Wallet / Money',
  'ID / Documents',
  'Keys',
  'Jewelry',
  'Clothing',
  'Footwear',
  'Bag / Backpack',
  'Vehicle (Bike, Motorcycle parts)',
  'Pet (Collar, Tag)',
  'Tools',
  'Others'
];

const ZONES = [
  'Agbate',
  'Ahos',
  'Batong',
  'Camanse',
  'Camote',
  'Carrots',
  'Gabi',
  'Kalbasa',
  'Kamunggay',
  'Larya',
  'Monggos',
  'Okra',
  'Paliy',
  'Patatas',
  'Petchay',
  'Repolyo',
  'Sayote',
  'Sibuyas',
  'Sikwa',
  'Sili',
  'Talong',
  'Tamatis',
  'Tanglong',
  'Ubi',
];

const STATUS_COLORS: any = {
  pending: 'border border-[#ffb84d]/30 bg-[#ffb84d]/15 text-[#ffd08a]',
  approved: 'border border-[#4f8cff]/30 bg-[#4f8cff]/15 text-[#9dc4ff]',
  posted: 'border border-[#19d7b7]/30 bg-[#19d7b7]/15 text-[#75f7df]',
  matched: 'border border-[#b84dff]/30 bg-[#b84dff]/15 text-[#d8a7ff]',
  claimed: 'border border-[#ff5c74]/30 bg-[#ff5c74]/15 text-[#ffa2ae]',
  returned: 'border border-[#19d7b7]/30 bg-[#19d7b7]/15 text-[#75f7df]',
  rejected: 'border border-[#ff5c74]/35 bg-[#ff5c74]/20 text-[#ff9aa8]',
  archived: 'border border-white/15 bg-white/10 text-slate-300',
};

const ADMIN_STAT_STYLES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#1b8cff]/15', text: 'text-[#82b9ff]' },
  amber: { bg: 'bg-[#ffb84d]/15', text: 'text-[#ffd08a]' },
  orange: { bg: 'bg-[#ff5c74]/15', text: 'text-[#ffa2ae]' },
  green: { bg: 'bg-[#19d7b7]/15', text: 'text-[#75f7df]' },
};

// ==================== COMPONENTS ====================

const Navbar = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Lost Items', path: '/items/lost' },
    { name: 'Found Items', path: '/items/found' },
    { name: 'Report Item', path: '/post' },
  ];

  return (
    <nav className="glass-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center">
            <img src={logoUrl} alt="LostLink Brgy Paknaan" className="h-10 w-auto max-w-[180px] object-contain sm:h-11 sm:max-w-[220px]" />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-white/10 hover:text-white",
                  location.pathname === link.path ? "bg-[#4f8cff]/15 text-[#9dc4ff]" : "text-slate-300"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-4">
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15" aria-label="Open dashboard">
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={onLogout} className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:bg-[#ff5c74]/10 hover:text-[#ffa2ae]">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary ml-2">
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-white/10 bg-[#070b1a] md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 hover:text-white",
                    location.pathname === link.path ? "bg-[#4f8cff]/15 text-[#9dc4ff]" : "text-slate-300"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                    Dashboard
                  </Link>
                  <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#ffa2ae] transition hover:bg-[#ff5c74]/10">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-lg bg-gradient-to-r from-[#1b8cff] via-[#5b5cff] to-[#b84dff] px-3 py-2 text-sm font-bold text-white">Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_COLORS[status] || 'border border-white/15 bg-white/10 text-slate-300')}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const ItemCard = ({ item, onClick }: { item: any, onClick?: () => void }) => (
  <motion.div whileHover={{ y: -3 }} className="glass-card group flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-[#1b8cff]/15" onClick={onClick}>
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#070b1a]">
      <div className="absolute left-0 top-8 h-3 w-1/2 bg-[#1b8cff]/70" />
      <div className="absolute bottom-10 right-0 h-3 w-2/3 bg-[#ff5c74]/70" />
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} className="relative h-full w-full object-cover" />
      ) : (
        <div className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 text-[#9dc4ff] ring-1 ring-white/15">
          <Package className="h-8 w-8 transition group-hover:text-white" />
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-semibold text-white">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="line-clamp-1 text-sm text-slate-400">{item.category}</p>
      <div className="mt-auto grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{item.location}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:justify-end">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const EmptyState = ({ icon: Icon, title, message, action }: { icon: any, title: string, message: string, action?: ReactNode }) => (
  <div className="mx-auto max-w-md py-12 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/10">
      <Icon className="h-7 w-7 text-[#9dc4ff]" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
    <p className="mb-5 text-sm text-slate-400">{message}</p>
    {action}
  </div>
);

// ==================== PAGES ====================

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const runSearch = () => {
    const query = search.trim();
    navigate(query ? `/items/lost?search=${encodeURIComponent(query)}` : '/items/lost');
  };
  const stats = [
    { label: 'Active Reports', value: '142', icon: Clock },
    { label: 'Items Returned', value: '89', icon: ShieldCheck },
    { label: 'Verified Claims', value: '56', icon: Award },
    { label: 'Residents Linked', value: '1.2k', icon: User },
  ];
  const workflow = [
    { title: 'Report', text: 'Lost and found posts start with clear item details.', icon: FileText },
    { title: 'Review', text: 'Barangay staff can verify and publish valid reports.', icon: ShieldCheck },
    { title: 'Return', text: 'Claims use QR verification when an item is ready.', icon: QrCode },
  ];

  return (
    <div className="bg-transparent">
      <main className="w-full text-slate-100">
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-12">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between">
            <div>
              <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mb-8 h-auto w-56 object-contain sm:w-64" />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#82b9ff]">Barangay Paknaan lost and found</p>
              <h1 className="editorial-heading max-w-2xl text-4xl leading-[1.02] text-white sm:text-6xl">
                A faster way to report, verify, and return belongings.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                LostLink keeps resident reports, found-item postings, barangay review, and claim verification in one focused workflow.
              </p>
            </div>

            <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/20">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#82b9ff]" />
                  <input
                    type="text"
                    placeholder="Search wallet, phone, keys..."
                    className="form-field pl-11"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  />
                </div>
                <button onClick={runSearch} className="btn-primary sm:w-28">
                  Search
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button onClick={() => navigate('/post')} className="btn-primary py-3">
                  <PlusCircle className="h-5 w-5" />
                  Report an Item
                </button>
                <button onClick={() => navigate('/items/found')} className="btn-secondary py-3">
                  Browse Found Items
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <aside className="rounded-lg border border-white/10 bg-[#070b1a] p-5 text-white shadow-xl shadow-black/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#82b9ff]">Today at the desk</p>
                <h2 className="mt-2 text-xl font-bold">Community report board</h2>
              </div>
              <span className="rounded-full bg-[#ff5c74] px-3 py-1 text-xs font-bold text-white">Live</span>
            </div>

            <div className="space-y-3">
              {[
                { item: 'Blue backpack', meta: 'Zone Agbate', status: 'Pending review' },
                { item: 'Black wallet', meta: 'Zone Petchay', status: 'Posted' },
                { item: 'House keys', meta: 'Zone Ubi', status: 'Claim submitted' },
              ].map((row) => (
                <div key={row.item} className="rounded-md bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{row.item}</p>
                      <p className="mt-1 text-xs text-slate-400">{row.meta}</p>
                    </div>
                    <span className="text-right text-xs font-semibold text-[#9dc4ff]">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-gradient-to-br from-[#1b8cff] via-[#5b5cff] to-[#b84dff] p-4 text-white">
                <QrCode className="mb-4 h-6 w-6" />
                <p className="text-sm font-bold">QR handover slips</p>
                <p className="mt-1 text-xs leading-5 text-blue-50">Verify approved claims at release.</p>
              </div>
              <div className="rounded-md border border-white/10 p-4">
                <p className="text-sm text-slate-300">Match confidence</p>
                <p className="mt-2 text-3xl font-black">95%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-[#ff5c74]" />
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="border-y border-white/10 bg-[#080d20]/70 px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/10 p-4">
                <stat.icon className="mb-4 h-5 w-5 text-[#82b9ff]" />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#82b9ff]">How it moves</p>
            <h2 className="editorial-heading text-3xl leading-tight text-white">A practical workflow for residents and staff.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The interface keeps the work simple: collect details, check reports, and document a verified return.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-white/10 bg-white/10 p-5">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-[#101a3a] text-[#9dc4ff]">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Step {index + 1}</p>
                <h3 className="mt-2 font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#070b1a]/80 px-5 py-10 text-white sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <Users className="mb-5 h-6 w-6 text-[#82b9ff]" />
            <h3 className="editorial-heading text-2xl leading-tight">For residents</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Submit a clear report, search recent posts, and track item claims without visiting multiple offices first.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <LayoutDashboard className="mb-5 h-6 w-6 text-[#ff8fa0]" />
            <h3 className="editorial-heading text-2xl leading-tight">For barangay staff</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Review reports, monitor claims, and release returned items with a consistent verification trail.</p>
          </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#82b9ff]">Recent community reports</p>
              <h2 className="editorial-heading text-3xl leading-tight text-white">Items needing follow-up.</h2>
            </div>
            <Link to="/items/lost" className="btn-secondary w-full sm:w-auto">View All</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ItemCard item={{ title: 'Black Wallet', category: 'Wallet / Money', location: 'Zone Petchay', status: 'posted', created_at: new Date().toISOString() }} onClick={() => navigate('/items/1')} />
            <ItemCard item={{ title: 'iPhone 14 Pro', category: 'Electronics', location: 'Zone Camote', status: 'matched', created_at: new Date().toISOString() }} onClick={() => navigate('/items/2')} />
            <ItemCard item={{ title: 'House Keys', category: 'Keys', location: 'Zone Ubi', status: 'posted', created_at: new Date().toISOString() }} onClick={() => navigate('/items/3')} />
          </div>
        </section>
      </main>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mx-auto mb-5 h-auto w-44 object-contain" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#ff5c74]/30 bg-[#ff5c74]/15 px-4 py-3 text-[#ffb3bd]">
            {error}
          </div>
        )}

        <button type="button" onClick={() => loginWithGoogle('/dashboard')} className="btn-secondary mb-5 w-full py-3">
          <Mail className="h-5 w-5" />
          Continue with Gmail
        </button>

        <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          Email login
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-field" placeholder="********" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Don't have an account? <Link to="/signup" className="font-semibold text-[#9dc4ff]">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mx-auto mb-5 h-auto w-44 object-contain" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join Paknaan LostLink</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#ff5c74]/30 bg-[#ff5c74]/15 px-4 py-3 text-[#ffb3bd]">
            {error}
          </div>
        )}

        <button type="button" onClick={() => loginWithGoogle('/dashboard')} className="btn-secondary mb-5 w-full py-3">
          <Mail className="h-5 w-5" />
          Continue with Gmail
        </button>

        <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          Email signup
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-field" placeholder="Juan Dela Cruz" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-field" placeholder="********" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-[#9dc4ff]">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

const GoogleCallback = () => {
  const [error, setError] = useState('');
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hash.get('token');
    const userPayload = hash.get('user');
    const returnTo = hash.get('returnTo') || '/dashboard';
    const googleError = hash.get('error');

    if (googleError) {
      setError(googleError);
      return;
    }

    if (!token || !userPayload) {
      setError('Google sign-in did not return a valid session.');
      return;
    }

    try {
      completeGoogleLogin(token, JSON.parse(userPayload));
      navigate(returnTo.startsWith('/') ? returnTo : '/dashboard', { replace: true });
    } catch {
      setError('Could not finish Google sign-in.');
    }
  }, [completeGoogleLogin, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md p-6 text-center sm:p-8">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#ff5c74]/30 bg-[#ff5c74]/15 text-[#ffb3bd]">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Gmail sign-in failed</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
            <button onClick={() => navigate('/login', { replace: true })} className="btn-primary mt-6 w-full">
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-lg bg-[#4f8cff]/20" />
            <h1 className="text-xl font-bold text-white">Connecting Gmail</h1>
            <p className="mt-3 text-sm text-slate-400">Finishing your secure sign-in.</p>
          </>
        )}
      </div>
    </div>
  );
};

const ItemsPage = ({ type }: { type: 'lost' | 'found' }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [zone, setZone] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadItems();
  }, [type, category, zone]);

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, status: 'posted' });
      if (category) params.append('category', category);
      if (zone) params.append('zone', zone);
      const res = await apiCall(`/api/items?${params}`);
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white">{type === 'lost' ? 'Lost' : 'Found'} Items</h1>
          <p className="mt-1 text-slate-400">Browse and search for {type} items in Barangay Paknaan</p>
        </div>
        <button onClick={() => navigate('/post', { state: { type } })} className="btn-primary w-full sm:w-auto">
          <PlusCircle className="w-5 h-5" />
          <span>Report {type === 'lost' ? 'Lost' : 'Found'}</span>
        </button>
      </div>

      <div className="glass-card mb-6 grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_160px]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#82b9ff]" />
          <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-field pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-field">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={zone} onChange={(e) => setZone(e.target.value)} className="form-field">
          <option value="">All Zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState icon={Package} title="No items found" message="There are no items to display yet." action={
          <button onClick={() => navigate('/post', { state: { type } })} className="btn-primary">
            Report an Item
          </button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id}>
              <ItemCard item={item} onClick={() => { void navigate(`/items/${item.id}`); }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItemDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      apiCall(`/api/items/${id}`).then(setItem).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><div className="glass-card h-96 animate-pulse" /></div>;
  if (!item) return <EmptyState icon={Package} title="Item not found" message="This item may have been removed." action={<button onClick={() => navigate('/')} className="btn-secondary">Go Home</button>} />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="glass-card overflow-hidden">
        <div className="flex aspect-[16/9] max-h-[360px] items-center justify-center bg-[#070b1a]">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-20 w-20 text-slate-500" />
          )}
        </div>
        
        <div className="p-5 sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className={cn("rounded-full border px-3 py-1 text-sm font-medium", item.type === 'lost' ? 'border-[#ffb84d]/30 bg-[#ffb84d]/15 text-[#ffd08a]' : 'border-[#19d7b7]/30 bg-[#19d7b7]/15 text-[#75f7df]')}>
                {item.type.toUpperCase()}
              </span>
              <h1 className="mt-3 break-words text-2xl font-bold text-white sm:text-3xl">{item.title}</h1>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-slate-400">Category</p>
              <p className="break-words font-medium text-white">{item.category}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-slate-400">Location</p>
              <p className="break-words font-medium text-white">{item.location}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-slate-400">Zone</p>
              <p className="font-medium text-white">{item.zone}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-slate-400">Date {item.type}</p>
              <p className="font-medium text-white">{item.date_lost || item.date_found || 'N/A'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-white">Description</h3>
            <p className="text-slate-300">{item.description}</p>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <User className="h-5 w-5 text-[#82b9ff]" />
              <span className="min-w-0 truncate text-slate-400">Reported by {item.reporter_name || 'Anonymous'}</span>
            </div>
            {user && (item.status === 'posted' || item.status === 'matched') && (
              <button onClick={() => navigate(`/claims/${item.id}/submit`)} className="btn-primary w-full sm:w-auto">
                Claim This Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PostItemPage = () => {
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', zone: '', date_lost: '', date_found: '', contact_preference: 'message', finder_name: '', finder_contact: '', turnover_to_barangay: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = window.history.state?.usr?.type;
    if (saved) setType(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall('/api/items', {
        method: 'POST',
        body: JSON.stringify({ ...form, type })
      });
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="glass-card p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4 text-2xl font-bold text-white">
          <AlertCircle className={type === 'lost' ? "text-[#ffb84d]" : "text-[#19d7b7]"} />
          <h2>Report {type === 'lost' ? 'Lost' : 'Found'} Item</h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-[#070b1a] p-1">
          <button onClick={() => setType('lost')} className={cn("rounded-md py-2.5 text-sm font-semibold transition-colors", type === 'lost' ? "bg-[#ffb84d] text-[#121018] shadow-sm" : "text-slate-300 hover:bg-white/10")}>Lost Item</button>
          <button onClick={() => setType('found')} className={cn("rounded-md py-2.5 text-sm font-semibold transition-colors", type === 'found' ? "bg-[#19d7b7] text-[#071417] shadow-sm" : "text-slate-300 hover:bg-white/10")}>Found Item</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Item Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="form-field" placeholder="e.g. Blue Nike Backpack" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Category *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="form-field" required>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Zone *</label>
              <select value={form.zone} onChange={(e) => setForm({...form, zone: e.target.value})} className="form-field" required>
                <option value="">Select Zone</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="form-field" rows={4} placeholder="Describe the item in detail..." required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Location *</label>
              <input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="form-field" placeholder="Where was it lost/found?" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Date {type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input type="date" value={type === 'lost' ? form.date_lost : form.date_found} onChange={(e) => setForm({...form, [type === 'lost' ? 'date_lost' : 'date_found']: e.target.value})} className="form-field" required />
            </div>
          </div>

          {type === 'found' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Your Name *</label>
                  <input type="text" value={form.finder_name} onChange={(e) => setForm({...form, finder_name: e.target.value})} className="form-field" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Contact Number *</label>
                  <input type="tel" value={form.finder_contact} onChange={(e) => setForm({...form, finder_contact: e.target.value})} className="form-field" placeholder="09xx xxx xxxx" required />
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                <input type="checkbox" id="turnover" checked={form.turnover_to_barangay} onChange={(e) => setForm({...form, turnover_to_barangay: e.target.checked})} className="mt-0.5 h-5 w-5 rounded border-white/20 bg-[#0a1022] text-[#4f8cff] focus:ring-[#4f8cff]" />
                <label htmlFor="turnover" className="text-slate-300">I will turn over the item to the barangay office</label>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ClaimSubmitPage = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState({ message: '', proof_type: 'photo' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (itemId) apiCall(`/api/items/${itemId}`).then(setItem).catch(() => {});
  }, [itemId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall('/api/claims', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, ...form })
      });
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit claim');
    }
    setLoading(false);
  };

  if (!item) return <div className="mx-auto max-w-2xl px-4 py-8"><div className="glass-card h-64 animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="glass-card p-5 sm:p-8">
        <h1 className="mb-6 break-words text-2xl font-bold text-white">Claim Item: {item.title}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Why are you the owner? *</label>
            <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="form-field" rows={4} placeholder="Describe how you lost this item and any identifying features..." required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Proof Type *</label>
            <select value={form.proof_type} onChange={(e) => setForm({...form, proof_type: e.target.value})} className="form-field">
              <option value="photo">Photo of Item</option>
              <option value="receipt">Receipt</option>
              <option value="id">ID Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        apiCall('/api/items?limit=10'),
        apiCall('/api/claims').catch(() => ({ claims: [] }))
      ]);
      setItems(itemsRes.items || []);
      setClaims(claimsRes.claims || []);
    } catch (err) {}
    setLoading(false);
  };

  const myItems = items.filter((i: any) => i.user_id === user?.id);
  const myClaims = claims.filter((c: any) => c.user_id === user?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="break-words text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
        <p className="text-slate-400">Here's your activity overview</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#1b8cff]/15 p-3">
              <Package className="h-6 w-6 text-[#82b9ff]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myItems.length}</p>
              <p className="text-sm text-slate-400">My Items</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#19d7b7]/15 p-3">
              <CheckCircle className="h-6 w-6 text-[#75f7df]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myItems.filter((i: any) => i.status === 'posted').length}</p>
              <p className="text-sm text-slate-400">Posted</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#ffb84d]/15 p-3">
              <MessageSquare className="h-6 w-6 text-[#ffd08a]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myClaims.length}</p>
              <p className="text-sm text-slate-400">My Claims</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#b84dff]/15 p-3">
              <ShieldCheck className="h-6 w-6 text-[#d8a7ff]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{user?.verified ? 'Verified' : 'Unverified'}</p>
              <p className="text-sm text-slate-400">Status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Items</h2>
            <button onClick={() => navigate('/post')} className="btn-secondary px-3 py-2">+ New</button>
          </div>
          {myItems.length === 0 ? (
            <p className="py-8 text-center text-slate-400">No items reported yet</p>
          ) : (
            <div className="space-y-3">
              {myItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.type} - {item.location}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Claims</h2>
          </div>
          {myClaims.length === 0 ? (
            <p className="py-8 text-center text-slate-400">No claims submitted yet</p>
          ) : (
            <div className="space-y-3">
              {myClaims.slice(0, 5).map((claim: any) => (
                <div key={claim.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{claim.item_title}</p>
                    <p className="text-sm text-slate-400">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/api/admin/dashboard').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><div className="glass-card h-96 animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-lg border border-white/10 bg-[#070b1a] p-6 text-white shadow-xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mb-5 h-auto w-56 object-contain" />
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#82b9ff]">Barangay operations</p>
            <h1 className="editorial-heading mt-2 text-4xl leading-tight">Admin Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">System overview, report queues, and claim activity.</p>
          </div>
          <button className="btn-primary w-full md:w-auto">
            <Download className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: Users, color: 'blue' },
          { label: 'Pending Approvals', value: data?.stats?.pendingApprovals || 0, icon: Clock, color: 'amber' },
          { label: 'Pending Claims', value: data?.stats?.pendingClaims || 0, icon: MessageSquare, color: 'orange' },
          { label: 'Items Returned', value: data?.stats?.itemsReturned || 0, icon: ShieldCheck, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className={cn(ADMIN_STAT_STYLES[stat.color].bg, "rounded-lg p-3")}>
                <stat.icon className={cn(ADMIN_STAT_STYLES[stat.color].text, "h-6 w-6")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Category Distribution</h2>
          <div className="space-y-3">
            {(data?.categoryStats || []).map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                <span className="min-w-0 break-words text-slate-300">{cat.category}</span>
                <span className="font-medium text-white">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
          <div className="space-y-3">
            {(data?.recentActivity || []).slice(0, 5).map((log: any, i: number) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-white">{log.action}</p>
                  <p className="text-sm text-slate-400">{log.user_name || 'System'}</p>
                </div>
                <span className="text-sm text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClaimQRPage = () => {
  const { id } = useParams();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiCall(`/api/claims/${id}/qr`).then(setQrData).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="mx-auto max-w-md px-4 py-8"><div className="glass-card h-80 animate-pulse" /></div>;
  if (!qrData) return <EmptyState icon={QrCode} title="No QR Code" message="QR code not available yet." />;

  const parsed = JSON.parse(qrData.qr_data);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="glass-card p-5 text-center sm:p-8">
        <QrCode className="mx-auto mb-4 h-16 w-16 text-[#82b9ff]" />
        <h1 className="mb-2 text-2xl font-bold text-white">Claim Verification</h1>
        <p className="mb-6 text-slate-400">Show this QR code at the barangay office</p>
        
        <div className="mb-6 inline-block rounded-lg border border-white/20 bg-white p-4">
          <QRCodeSVG value={qrData.qr_data} size={200} />
        </div>

        <div className="space-y-2 rounded-lg border border-white/10 bg-white/10 p-4 text-left">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Claim ID</span>
            <span className="font-medium text-white">#{parsed.claimId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Token</span>
            <span className="break-all font-mono text-sm font-medium text-white">{parsed.token.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Valid Until</span>
            <span className="font-medium text-white">{new Date(parsed.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button onClick={() => window.print()} className="btn-primary mt-6 w-full py-3">
          <Download className="w-5 h-5" />
          <span>Print Claim Slip</span>
        </button>
      </div>
    </div>
  );
};

// ==================== APP ====================

export default function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-[#050816]">
        <Navbar user={user} onLogout={logout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/items/lost" element={<ItemsPage type="lost" />} />
          <Route path="/items/found" element={<ItemsPage type="found" />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/post" element={<PostItemPage />} />
          <Route path="/claims/:itemId/submit" element={<ClaimSubmitPage />} />
          <Route path="/claims/:id/qr" element={<ClaimQRPage />} />
          <Route path="/dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// ==================== ROOT ====================

export function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
