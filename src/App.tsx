import { useState, useEffect, useRef, createContext, useContext, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { 
  Search, PlusCircle, User, Settings, MapPin, Calendar, Clock, ShieldCheck, 
  Bell, Menu, X, LayoutDashboard, LogOut, ChevronLeft, ChevronRight, TrendingUp, 
  Award, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, 
  EyeOff, QrCode, FileText, Download, Share2, Filter, ArrowLeft, Home as HomeIcon,
  BarChart3, Users, Package, MessageSquare, Star, AlertTriangle, ImagePlus, Database, History, Camera, ScanSearch
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
const brgyLoginBgUrl = new URL('./assets/barangay-hall-login-bg.png', import.meta.url).href;
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const GoogleIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-.9 2.4-2 3.1l3.2 2.5c1.9-1.7 3-4.2 3-7.1 0-.8-.1-1.6-.2-2.4H12z" />
    <path fill="#34A853" d="M6.4 14.3l-.7.5-2.6 2c1.7 3.3 5 5.4 8.9 5.4 2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 1-3.5 1-2.6 0-4.8-1.7-5.6-4z" />
    <path fill="#FBBC05" d="M3.1 6.8C2.4 8.3 2 10.1 2 12s.4 3.7 1.1 5.2l3.3-2.6c-.2-.8-.4-1.7-.4-2.6s.1-1.8.4-2.6L3.1 6.8z" />
    <path fill="#4285F4" d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.8 14.7 1.8 12 1.8c-3.9 0-7.2 2.2-8.9 5.4l3.3 2.6c.8-2.3 3-4 5.6-4z" />
  </svg>
);

async function parseApiResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!text) return {};
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { error: 'Server returned an invalid JSON response.' };
    }
  }
  return { error: text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Server returned an unexpected response.' };
}

async function apiCall(endpoint: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || data.message || data.details || `Request failed (${res.status})`);
  return data;
}

async function apiFormCall(endpoint: string, body: FormData, options: any = {}) {
  const token = localStorage.getItem('token');
  const headers: any = options.headers ? { ...options.headers } : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, method: options.method || 'POST', headers, body });
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || data.message || data.details || `Request failed (${res.status})`);
  return data;
}

async function compressImage(file: File, maxWidth = 1280, quality = 0.72) {
  if (!file.type.startsWith('image/') || file.size < 700 * 1024) return file;

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = objectUrl;
    });

    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadImageToBackend(file: File) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error || data.message || data.details || `Image upload failed (${res.status})`);
  return data.url as string;
}

async function uploadImage(file: File) {
  const compressedFile = await compressImage(file);
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    return uploadImageToBackend(compressedFile);
  }

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', cloudinaryUploadPreset);
  formData.append('folder', 'paknaan-lostlink/items');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await parseApiResponse(res);
  if (!res.ok) throw new Error(data.error?.message || data.error || `Cloudinary upload failed (${res.status})`);
  if (!data.secure_url) throw new Error('Cloudinary upload did not return an image URL.');
  return data.secure_url as string;
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

  const login = async (email: string, password: string) => {
    const data = await apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession(data.token, data.user);
    return data;
  };

  const register = async (userData: any) => {
    const data = await apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    saveSession(data.token, data.user);
    return data;
  };

  const saveSession = (token: string, nextUser: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
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
    <AuthContext.Provider value={{ user, login, register, completeGoogleLogin, logout, loading }}>
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
  'Outside Barangay Paknaan',
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

const Sidebar = ({
  user,
  onLogout,
  collapsed,
  onCollapsedChange,
}: {
  user: any,
  onLogout: () => void,
  collapsed: boolean,
  onCollapsedChange: (collapsed: boolean) => void,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Lost Items', path: '/items/lost', icon: Search },
    { name: 'Found Items', path: '/items/found', icon: Package },
    { name: 'Report Item', path: '/post', icon: PlusCircle },
    { name: 'Image Match', path: '/image-match', icon: ScanSearch },
  ];

  const adminLinks = [
    { name: 'Reports Queue', path: '/admin/reports', icon: FileText },
    { name: 'Claims', path: '/admin/claims', icon: MessageSquare },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  const NavItem = ({ link }: { link: any }) => (
    <Link
      to={link.path}
      title={collapsed ? link.name : undefined}
      onClick={() => setIsOpen(false)}
      className={cn(
        "flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
        collapsed ? "justify-center gap-0" : "gap-3",
        location.pathname === link.path 
          ? "bg-[#4f8cff]/15 text-[#9dc4ff] shadow-sm" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <link.icon className={cn("h-5 w-5", location.pathname === link.path ? "text-[#9dc4ff]" : "text-slate-500")} />
      <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "sr-only")}>{link.name}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#070b1a] px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-md bg-white p-0.5">
            <img src={logoUrl} alt="" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-black text-white">LostLink</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed bottom-0 left-0 top-16 z-50 flex flex-col border-r border-white/10 bg-[#070b1a] transition-all duration-300 ease-in-out md:inset-y-0 md:top-0 md:translate-x-0",
        collapsed ? "w-64 md:w-20" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className={cn("flex h-20 items-center justify-between", collapsed ? "px-4" : "px-6")}>
          <Link to="/" className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white">
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
            </div>
            <div className={cn("min-w-0 leading-tight", collapsed && "hidden")}>
              <span className="block text-lg font-black tracking-tight text-white whitespace-nowrap">Paknaan</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#82b9ff] whitespace-nowrap">LostLink System</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "hidden h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white md:flex",
              collapsed && "mx-auto"
            )}
            title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto px-3 py-4 no-scrollbar", collapsed ? "space-y-4" : "space-y-8")}>
          <div className="space-y-1">
            <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500", collapsed && "sr-only")}>Main Menu</p>
            {navLinks.map((link) => (
              <div key={link.name}>
                <NavItem link={link} />
              </div>
            ))}
          </div>

          {user && (
            <div className="space-y-1">
              <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500", collapsed && "sr-only")}>My Account</p>
              <NavItem link={{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }} />
              <NavItem link={{ name: 'Notifications', path: '/notifications', icon: Bell }} />
              <NavItem link={{ name: 'My Profile', path: '/profile', icon: User }} />
            </div>
          )}

          {(user?.role === 'admin' || user?.role === 'official') && (
            <div className="space-y-1">
              <p className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500", collapsed && "sr-only")}>Management</p>
              {adminLinks.map((link) => (
                <div key={link.name}>
                  <NavItem link={link} />
                </div>
              ))}
              {user?.role === 'admin' && (
                <NavItem link={{ name: 'System Database', path: '/admin/database', icon: Database }} />
              )}
            </div>
          )}
        </div>

        <div className={cn("border-t border-white/10", collapsed ? "p-3" : "p-4")}>
          {user ? (
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-white/10">
                {user.photo_url ? (
                  <img src={user.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#82b9ff]">
                    {user.name[0]}
                  </div>
                )}
              </div>
              <div className={cn("min-w-0 flex-1", collapsed && "hidden")}>
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#ffa2ae] transition hover:text-[#ffb3bd]"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              title={collapsed ? 'Sign In' : undefined}
              className={cn("btn-primary justify-center py-2.5", collapsed ? "w-full px-0" : "w-full")}
            >
              {collapsed ? <User className="h-5 w-5" /> : 'Sign In'}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_COLORS[status] || 'border border-white/15 bg-white/10 text-slate-300')}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const ItemImage = ({ item, className, fallbackClassName = 'relative flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 text-[#9dc4ff] ring-1 ring-white/15', iconClassName = 'h-8 w-8 transition group-hover:text-white' }: { item: any; className?: string; fallbackClassName?: string; iconClassName?: string }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = item?.image_url;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  if (!imageUrl || failed) {
    return (
      <div className={fallbackClassName}>
        <Package className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={item.title}
      className={className || 'relative h-full w-full object-cover'}
      onError={() => setFailed(true)}
    />
  );
};

const ItemCard = ({ item, onClick }: { item: any, onClick?: () => void }) => (
  <motion.div whileHover={{ y: -3 }} className="glass-card group flex h-full cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-[#1b8cff]/15" onClick={onClick}>
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#070b1a]">
      <div className="absolute left-0 top-8 h-3 w-1/2 bg-[#1b8cff]/70" />
      <div className="absolute bottom-10 right-0 h-3 w-2/3 bg-[#ff5c74]/70" />
      <ItemImage item={item} />
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

const NavigateReplacement = ({ to, state }: { to: string, state?: any }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true, state });
  }, [navigate, state, to]);
  return null;
};

const Unauthorized = () => (
  <EmptyState
    icon={ShieldCheck}
    title="Unauthorized"
    message="You do not have access to this page."
    action={<Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>}
  />
);

const ProtectedRoute = ({ children, roles }: { children: ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><div className="glass-card h-64 animate-pulse" /></div>;
  if (!user) return <NavigateReplacement to="/login" state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Unauthorized />;
  return <>{children}</>;
};

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

      </main>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (!rememberedEmail) return;
    setEmail(rememberedEmail);
    setRememberMe(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45 saturate-90"
        style={{ backgroundImage: `url("${brgyLoginBgUrl}")` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#050816]/58" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,140,255,0.10),transparent_46%),linear-gradient(180deg,rgba(5,8,22,0.22),#050816_98%)]" aria-hidden="true" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mx-auto mb-5 h-auto w-44 object-contain" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 rounded-lg border border-[#ff5c74]/30 bg-[#ff5c74]/15 px-4 py-3 text-[#ffb3bd]">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-field" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-field pr-12"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0a1022] text-[#4f8cff] focus:ring-[#4f8cff]"
            />
            <span>Remember me</span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="mt-6 text-center text-slate-400">Don't have an account? <Link to="/signup" className="font-semibold text-[#9dc4ff]">Sign up</Link></p>
      </motion.div>
    </div>
  );
};

const SignUp = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', contact_number: '', zone: '', facebook_url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mx-auto mb-4 h-auto w-44 object-contain" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join Barangay Paknaan LostLink</p>
        </div>
        {error && <div className="mb-4 rounded-lg border border-[#ff5c74]/30 bg-[#ff5c74]/15 px-4 py-3 text-[#ffb3bd]">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-field" required />
          <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-field" required />
          <div className="space-y-4">
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="form-field" required />
            <input type="password" placeholder="Confirm" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="form-field" required />
          </div>
          <input type="tel" placeholder="Contact Number (09xx...)" value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} className="form-field" required />
          <select value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} className="form-field" required>
            <option value="">Select Zone / Purok</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <input type="url" placeholder="Facebook Link (Optional)" value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} className="form-field" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-[#9dc4ff]">Sign in</Link></p>
      </motion.div>
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
      const params = new URLSearchParams({ type });
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
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      apiCall(`/api/items/${id}`).then(setItem).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><div className="glass-card h-96 animate-pulse" /></div>;
  if (!item) return <EmptyState icon={Package} title="Item not found" message="This item may have been removed." action={<button onClick={() => navigate('/')} className="btn-secondary">Go Home</button>} />;

  const canDeleteItem = user && (user.role === 'admin' || item.user_id === user.id);
  const handleDeleteItem = async () => {
    if (!canDeleteItem || deleting) return;
    const confirmed = window.confirm(`Delete this ${item.type} item permanently? This action cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiCall(`/api/items/${item.id}`, { method: 'DELETE' });
      navigate(`/items/${item.type}`);
    } catch (err: any) {
      alert(err.message || 'Could not delete item');
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="glass-card overflow-hidden">
        <div className="flex aspect-[16/9] max-h-[360px] items-center justify-center bg-[#070b1a]">
          <ItemImage
            item={item}
            className="h-full w-full object-cover"
            fallbackClassName="flex h-full w-full items-center justify-center text-slate-500"
            iconClassName="h-20 w-20"
          />
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
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {user?.role === 'admin' && (
                <button onClick={handleDeleteItem} disabled={deleting} className="btn-secondary w-full border-[#ff5c74]/40 bg-[#ff5c74]/10 text-[#ffa2ae] hover:bg-[#ff5c74]/20 sm:w-auto">
                  <Trash2 className="h-5 w-5" />
                  <span>{deleting ? 'Deleting...' : 'Delete Item'}</span>
                </button>
              )}
              {user && user.role === 'resident' && (item.status === 'posted' || item.status === 'matched') && (
                <button onClick={() => navigate(`/claims/${item.id}/submit`)} className="btn-primary w-full sm:w-auto">
                  Claim This Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostItemPage = () => {
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', zone: '', date_lost: '', date_found: '', contact_preference: 'message', finder_name: '', finder_contact: '', turnover_to_barangay: false, facebook_url: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = window.history.state?.usr?.type;
    if (saved) setType(saved);
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview('');
      return;
    }

    const nextPreview = URL.createObjectURL(selectedImage);
    setImagePreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [selectedImage]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      e.target.value = '';
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedImage && (!cloudinaryCloudName || !cloudinaryUploadPreset)) {
        const formData = new FormData();
        Object.entries({ ...form, type }).forEach(([key, value]) => {
          formData.append(key, String(value ?? ''));
        });
        formData.append('image', await compressImage(selectedImage));
        await apiFormCall('/api/items', formData);
        navigate('/dashboard');
        return;
      }

      const imageUrl = selectedImage ? await uploadImage(selectedImage) : undefined;
      await apiCall('/api/items', {
        method: 'POST',
        body: JSON.stringify({ ...form, type, image_url: imageUrl })
      });
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
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
            <label className="mb-1 block text-sm font-medium text-slate-300">Facebook Link</label>
            <input type="url" value={form.facebook_url} onChange={(e) => setForm({...form, facebook_url: e.target.value})} className="form-field" placeholder="https://facebook.com/username" />
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Item Photo</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-[#0a1022]/90 px-4 py-6 text-center transition hover:border-[#4f8cff]/70 hover:bg-[#0d1730]">
              <ImagePlus className="mb-3 h-8 w-8 text-[#82b9ff]" />
              <span className="text-sm font-semibold text-white">Upload a photo</span>
              <span className="mt-1 text-xs text-slate-400">JPG, PNG, or WebP up to 5MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
            </label>
            {imagePreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-[#070b1a]">
                <img src={imagePreview} alt="Selected item preview" className="h-56 w-full object-cover" />
                <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-slate-300">
                  <span className="min-w-0 truncate">{selectedImage?.name}</span>
                  <button type="button" onClick={() => setSelectedImage(null)} className="rounded-md px-2 py-1 font-semibold text-[#ffa2ae] transition hover:bg-[#ff5c74]/10">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (itemId) apiCall(`/api/items/${itemId}`).then(setItem).catch(() => {});
  }, [itemId]);

  useEffect(() => {
    if (!proofFile || !proofFile.type.startsWith('image/')) {
      setProofPreview('');
      return;
    }
    const nextPreview = URL.createObjectURL(proofFile);
    setProofPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [proofFile]);

  const handleProofChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setProofFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image proof file.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Proof image must be 5MB or smaller.');
      e.target.value = '';
      return;
    }
    setProofFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (proofFile && (!cloudinaryCloudName || !cloudinaryUploadPreset)) {
        const formData = new FormData();
        Object.entries({ item_id: itemId || '', ...form }).forEach(([key, value]) => {
          formData.append(key, String(value ?? ''));
        });
        formData.append('proof', await compressImage(proofFile));
        await apiFormCall('/api/claims', formData);
        navigate('/dashboard');
        return;
      }

      const proofUrl = proofFile ? await uploadImage(proofFile) : undefined;
      await apiCall('/api/claims', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, ...form, proof_url: proofUrl })
      });
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Proof Photo *</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-[#0a1022]/90 px-4 py-6 text-center transition hover:border-[#4f8cff]/70">
              <ImagePlus className="mb-3 h-8 w-8 text-[#82b9ff]" />
              <span className="text-sm font-semibold text-white">Upload proof</span>
              <span className="mt-1 text-xs text-slate-400">Receipt, item photo, or identifying mark</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProofChange} className="sr-only" required />
            </label>
            {proofPreview && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-[#070b1a]">
                <img src={proofPreview} alt="Proof preview" className="h-48 w-full object-cover" />
              </div>
            )}
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
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes, matchesRes] = await Promise.all([
        apiCall('/api/items?limit=10'),
        apiCall('/api/claims').catch(() => ({ claims: [] })),
        apiCall('/api/ai/matches/my').catch(() => [])
      ]);
      setItems(itemsRes.items || []);
      setClaims(claimsRes.claims || []);
      setMatches(matchesRes || []);
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

        <div className="glass-card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-[#b84dff]" />
            <h2 className="text-lg font-semibold text-white">Suggested Matches</h2>
          </div>
          {matches.length === 0 ? (
            <p className="py-8 text-center text-slate-400 italic">No AI suggestions at the moment. We'll notify you when a match is found!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match: any) => (
                <div key={match.id} className="flex flex-col justify-between gap-4 rounded-lg border border-[#b84dff]/30 bg-[#b84dff]/5 p-4 transition hover:bg-[#b84dff]/10">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#d8a7ff]">Potential Match ({match.confidence_score}%)</p>
                    <p className="mt-2 text-sm text-slate-200">
                      Your <span className="font-bold text-white">"{user.id === match.lost_user_id ? match.lost_title : match.found_title}"</span> might match 
                      the <span className="font-bold text-white">"{user.id === match.lost_user_id ? match.found_title : match.lost_title}"</span> reported in the system.
                    </p>
                  </div>
                  <Link to={`/items/${user.id === match.lost_user_id ? match.found_item_id : match.lost_item_id}`} className="btn-secondary w-full text-xs py-2">View Item Details</Link>
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
  const navigate = useNavigate();

  useEffect(() => {
    apiCall('/api/admin/dashboard').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleVerifyQR = async () => {
    const claimId = window.prompt("Enter Claim ID (e.g. 1):");
    if (!claimId) return;
    const token = window.prompt("Enter QR Token:");
    if (!token) return;
    
    try {
      const res = await apiCall(`/api/claims/${claimId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ token })
      });
      alert(res.message || "Item released successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Verification failed");
    }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><div className="glass-card h-96 animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-lg border border-white/10 bg-[#070b1a] p-6 text-white shadow-xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mb-5 h-auto w-56 object-contain" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#82b9ff]">Barangay operations</p>
            <h1 className="editorial-heading mt-3 text-3xl sm:text-4xl leading-tight">Admin Dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">Real-time system overview, active report queues, and verified claim activity for Barangay Paknaan.</p>
          </div>
          <Link to="/reports" className="btn-primary w-full md:w-auto">
            <Download className="h-4 w-4" />
            Generate Report
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Lost vs Found Items Pie Chart */}
        <div className="glass-card p-5 sm:p-6 xl:col-span-1">
          <h2 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#ffb84d]" />
            Lost vs Found Items
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="relative h-36 w-36 shrink-0">
              {(() => {
                const lostCount = data?.typeStats?.find((s: any) => s.type === 'lost')?.count || 0;
                const foundCount = data?.typeStats?.find((s: any) => s.type === 'found')?.count || 0;
                const total = lostCount + foundCount;
                const lostPercentage = total > 0 ? (lostCount / total) * 100 : 0;
                const foundPercentage = total > 0 ? (foundCount / total) * 100 : 0;

                return (
                  <div 
                    className="h-full w-full rounded-full" 
                    style={{ 
                      background: `conic-gradient(#ffb84d 0% ${lostPercentage}%, #19d7b7 ${lostPercentage}% 100%)` 
                    }}
                  />
                );
              })()}
            </div>
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#ffb84d]" />
                  <span className="text-sm text-slate-300">Lost Items</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">({data?.typeStats?.find((s: any) => s.type === 'lost')?.count || 0})</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#19d7b7]" />
                  <span className="text-sm text-slate-300">Found Items</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">({data?.typeStats?.find((s: any) => s.type === 'found')?.count || 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories Bar Graph */}
        <div className="glass-card p-5 sm:p-6 xl:col-span-1">
          <h2 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#82b9ff]" />
            Top Categories
          </h2>
          <div className="space-y-5">
            {(data?.categoryStats || []).slice(0, 5).map((cat: any, i: number) => {
              const max = Math.max(...data.categoryStats.map((c: any) => c.count), 1);
              const percentage = (cat.count / max) * 100;
              return (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300 truncate pr-2">{cat.category}</span>
                    <span className="font-mono text-white shrink-0">{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#1b8cff] to-[#82b9ff]" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="glass-card p-5 sm:p-6 xl:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-white">Reports by Zone (Purok)</h2>
          <div className="space-y-4">
            {(data?.zoneStats || []).slice(0, 6).map((zone: any, i: number) => {
              const total = data.stats.totalLost + data.stats.totalFound;
              const percentage = total > 0 ? (zone.count / total) * 100 : 0;
              return (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">{zone.zone || 'Unknown'}</span>
                    <span className="font-mono text-white">{zone.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div 
                      className="h-full rounded-full bg-[#19d7b7]" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Trend Chart */}
        <div className="glass-card p-5 sm:p-6 lg:col-span-2 xl:col-span-3">
          <h2 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#82b9ff]" />
            Weekly Report Volume
          </h2>
          <div className="flex h-48 items-end justify-between gap-2 px-2 pb-8 pt-4 overflow-x-auto">
            {(data?.reportsTrend || []).map((day: any, i: number) => {
              const max = Math.max(...data.reportsTrend.map((d: any) => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center min-w-[40px]">
                  <div 
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-[#1b8cff]/40 to-[#1b8cff] transition-all group-hover:to-[#9dc4ff]" 
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-white px-2 py-1 text-[10px] font-bold text-[#050816] opacity-0 group-hover:opacity-100">
                      {day.count}
                    </div>
                  </div>
                  <span className="absolute -bottom-7 text-[10px] font-bold uppercase tracking-tighter text-slate-500">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminReportsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      const res = await apiCall(`/api/items?${params.toString()}`);
      setItems(res.items || []);
    } catch (err: any) {
      alert(err.message || 'Could not load reports');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [status]);

  const updateStatus = async (item: any, nextStatus: string) => {
    const admin_remarks = nextStatus === 'rejected' ? window.prompt('Reason for rejection?') : '';
    if (nextStatus === 'rejected' && !admin_remarks) return;
    await apiCall(`/api/items/${item.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus, admin_remarks })
    });
    await loadReports();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#82b9ff]">Admin</p>
          <h1 className="text-3xl font-bold text-white">Manage Reports</h1>
          <p className="mt-1 text-slate-400">Approve, reject, archive, and review lost/found submissions.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-field sm:w-56">
          <option value="pending">Pending</option>
          <option value="posted">Posted</option>
          <option value="matched">Matched</option>
          <option value="claimed">Claimed</option>
          <option value="returned">Returned</option>
          <option value="rejected">Rejected</option>
          <option value="all">All Active</option>
        </select>
      </div>

      {loading ? (
        <div className="glass-card h-72 animate-pulse" />
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No reports found" message="There are no reports in this queue." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card grid gap-4 p-4 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[#070b1a]">
                <ItemImage
                  item={item}
                  className="h-full w-full object-cover"
                  fallbackClassName="flex h-full w-full items-center justify-center text-slate-500"
                  iconClassName="h-8 w-8"
                />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold uppercase", item.type === 'lost' ? 'border-[#ffb84d]/30 bg-[#ffb84d]/15 text-[#ffd08a]' : 'border-[#19d7b7]/30 bg-[#19d7b7]/15 text-[#75f7df]')}>{item.type}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h2 className="break-words text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.description}</p>
                <p className="mt-2 text-xs text-slate-500">{item.category} • {item.zone || item.purok} • {item.location}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link to={`/items/${item.id}`} className="btn-secondary px-3 py-2"><Eye className="h-4 w-4" />View</Link>
                {item.status === 'pending' && <button onClick={() => updateStatus(item, 'posted')} className="btn-primary px-3 py-2"><CheckCircle className="h-4 w-4" />Approve</button>}
                {item.status === 'pending' && <button onClick={() => updateStatus(item, 'rejected')} className="btn-secondary px-3 py-2 text-[#ffa2ae]"><XCircle className="h-4 w-4" />Reject</button>}
                {item.status !== 'archived' && <button onClick={() => updateStatus(item, 'archived')} className="btn-secondary px-3 py-2">Archive</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ClaimReviewPage = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/claims');
      setClaims(res.claims || []);
    } catch (err: any) {
      alert(err.message || 'Could not load claims');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const decideClaim = async (claim: any, action: 'approve' | 'reject') => {
    const remarks = action === 'reject' ? window.prompt('Reason for rejection?') : '';
    if (action === 'reject' && !remarks) return;
    await apiCall(`/api/claims/${claim.id}/${action}`, {
      method: 'PUT',
      body: JSON.stringify({ remarks })
    });
    await loadClaims();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#82b9ff]">Official workflow</p>
        <h1 className="text-3xl font-bold text-white">Manage Claims</h1>
        <p className="mt-1 text-slate-400">Review proof, approve valid claims, and generate QR slips.</p>
      </div>
      {loading ? (
        <div className="glass-card h-72 animate-pulse" />
      ) : claims.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No claims found" message="Submitted claims will appear here." />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="glass-card grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={claim.status} />
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">{claim.item_type}</span>
                </div>
                <h2 className="break-words text-lg font-bold text-white">{claim.item_title}</h2>
                <p className="mt-1 text-sm text-slate-400">Claimant: {claim.claimant_name || 'Unknown'}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{claim.message}</p>
                {claim.proof_url && <a href={claim.proof_url} target="_blank" className="mt-2 inline-flex text-sm font-semibold text-[#9dc4ff]">View proof</a>}
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {(claim.status === 'pending' || claim.status === 'under_review') && <button onClick={() => decideClaim(claim, 'approve')} className="btn-primary px-3 py-2">Approve</button>}
                {(claim.status === 'pending' || claim.status === 'under_review') && <button onClick={() => decideClaim(claim, 'reject')} className="btn-secondary px-3 py-2 text-[#ffa2ae]">Reject</button>}
                {claim.status === 'approved' && <Link to={`/claims/${claim.id}/qr`} className="btn-secondary px-3 py-2"><QrCode className="h-4 w-4" />QR</Link>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await apiCall('/api/admin/users'));
    } catch (err: any) {
      alert(err.message || 'Could not load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id: number, role: string) => {
    await apiCall(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
    await loadUsers();
  };

  const toggleStatus = async (user: any) => {
    const action = user.status === 'suspended' ? 'reactivate' : 'suspend';
    await apiCall(`/api/admin/users/${user.id}/${action}`, { method: 'PUT', body: JSON.stringify({}) });
    await loadUsers();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#82b9ff]">Admin</p>
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
      </div>
      {loading ? <div className="glass-card h-72 animate-pulse" /> : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-white/10">
            {users.map((person) => (
              <div key={person.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-center">
                <div className="min-w-0">
                  <p className="font-bold text-white">{person.name}</p>
                  <p className="break-all text-sm text-slate-400">{person.email}</p>
                </div>
                <select value={person.role} onChange={(e) => updateRole(person.id, e.target.value)} className="form-field">
                  <option value="resident">Resident</option>
                  <option value="official">Official</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => toggleStatus(person)} className="btn-secondary px-3 py-2">
                  {person.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      setNotifications(await apiCall('/api/notifications'));
    } catch (err: any) {
      alert(err.message || 'Could not load notifications');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await apiCall('/api/notifications/read-all', { method: 'PUT', body: JSON.stringify({}) });
    await loadNotifications();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-slate-400">Report, claim, and system updates.</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary px-3 py-2">Mark all read</button>
      </div>
      {loading ? <div className="glass-card h-72 animate-pulse" /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="Updates will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={cn("rounded-lg border p-4", notification.is_read ? "border-white/10 bg-white/5" : "border-[#4f8cff]/30 bg-[#4f8cff]/10")}>
              <p className="font-bold text-white">{notification.title}</p>
              <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportsPage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<any>(null);

  const loadReport = async () => {
    setReport(await apiCall(`/api/reports/monthly?month=${encodeURIComponent(month)}`));
  };

  useEffect(() => {
    loadReport().catch(() => {});
  }, [month]);

  const downloadCsv = () => {
    if (!report) return;
    const rows = Object.entries(report).map(([key, value]) => `${key},${value}`).join('\n');
    const url = URL.createObjectURL(new Blob([`Metric,Value\n${rows}`], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `paknaan-lostlink-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#82b9ff]">Reports</p>
          <h1 className="text-3xl font-bold text-white">Monthly Summary</h1>
        </div>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="form-field" />
          <button onClick={downloadCsv} className="btn-primary px-3 py-2"><Download className="h-4 w-4" />CSV</button>
        </div>
      </div>
      {report && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(report).map(([key, value]) => (
            <div key={key} className="glass-card p-5">
              <p className="text-sm capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-2 text-3xl font-bold text-white">{String(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDatabasePage = () => {
  const [tab, setTab] = useState('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'users') {
        res = await apiCall(`/api/admin/users?search=${encodeURIComponent(search)}`);
        setData(res || []);
      } else if (tab === 'items') {
        res = await apiCall(`/api/items?search=${encodeURIComponent(search)}&status=all`);
        setData(res.items || []);
      } else if (tab === 'claims') {
        res = await apiCall('/api/claims');
        setData(res.claims || []);
      } else if (tab === 'logs') {
        res = await apiCall('/api/admin/logs');
        setData(res || []);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [tab]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-[#82b9ff]" />
          <h1 className="text-3xl font-bold text-white">System Database</h1>
        </div>
        <p className="mt-1 text-slate-400">Master record management and activity history for Barangay Paknaan.</p>
      </div>

      <div className="glass-card mb-6 p-1">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'items', label: 'Reports', icon: Package },
            { id: 'claims', label: 'Claims', icon: MessageSquare },
            { id: 'logs', label: 'Activity Logs', icon: History },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }} className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all", tab === t.id ? "bg-[#4f8cff] text-white" : "text-slate-300 hover:bg-white/10")}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mb-6 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadData()} className="form-field pl-10" />
          </div>
          <button onClick={loadData} className="btn-secondary px-6">Refresh</button>
        </div>
      </div>

      {loading ? <div className="glass-card h-64 animate-pulse" /> : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">ID</th>
                {tab === 'users' && <><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th></>}
                {tab === 'items' && <><th className="px-6 py-4">Title</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Status</th></>}
                {tab === 'claims' && <><th className="px-6 py-4">Claimant</th><th className="px-6 py-4">Item</th><th className="px-6 py-4">Status</th></>}
                {tab === 'logs' && <><th className="px-6 py-4">User</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Details</th></>}
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {data.map(item => (
                <tr key={item.id} className="text-slate-300 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">#{item.id}</td>
                  {tab === 'users' && <><td className="px-6 py-4 text-white font-bold">{item.name}</td><td className="px-6 py-4">{item.email}</td><td className="px-6 py-4"><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase font-bold">{item.role}</span></td></>}
                  {tab === 'items' && <><td className="px-6 py-4 text-white font-bold">{item.title}</td><td className="px-6 py-4 capitalize">{item.type}</td><td className="px-6 py-4"><StatusBadge status={item.status} /></td></>}
                  {tab === 'claims' && <><td className="px-6 py-4 text-white font-bold">{item.claimant_name}</td><td className="px-6 py-4">{item.item_title}</td><td className="px-6 py-4"><StatusBadge status={item.status} /></td></>}
                  {tab === 'logs' && <><td className="px-6 py-4 text-white font-bold">{item.user_name || 'System'}</td><td className="px-6 py-4 capitalize">{item.action.replace('_', ' ')}</td><td className="px-6 py-4 italic text-xs">{item.details || '-'}</td></>}
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <div className="py-20 text-center text-slate-500 font-medium">No records found matching your criteria.</div>}
        </div>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user, completeGoogleLogin } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', contact_number: '', address: '', zone: user?.zone || '', photo_url: user?.photo_url || '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiCall('/api/auth/me').then((data) => {
      setForm({
        name: data.name || '',
        contact_number: data.contact_number || '',
        address: data.address || '',
        zone: data.zone || data.purok || '',
        photo_url: data.photo_url || '',
      });
    }).catch(() => {});
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await apiCall('/api/auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      const token = localStorage.getItem('token');
      if (token) completeGoogleLogin(token, { ...user, ...updated.user });
      alert('Profile updated');
    } catch (err: any) {
      alert(err.message || 'Could not update profile');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass-card p-5 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-field" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Contact Number</label>
              <input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} className="form-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Zone</label>
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="form-field">
                <option value="">Select Zone</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="form-field" rows={3} />
          </div>
          <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Saving...' : 'Save Profile'}</button>
        </form>
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

const ImageMatchPage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [queryDescription, setQueryDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '' });

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!capturedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(capturedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [capturedFile]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setCameraActive(true);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) return;
    setCapturedFile(new File([blob], `found-item-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      e.target.value = '';
      return;
    }
    setCapturedFile(file);
  };

  const searchMatches = async () => {
    if (!capturedFile) return alert('Capture or upload a photo first.');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', await compressImage(capturedFile));
      const data = await apiFormCall('/api/search-item', formData);
      setMatches(data.matches || []);
      setQueryDescription(data.query_description || '');
    } catch (err: any) {
      alert(err.message || 'Image search failed');
    } finally {
      setLoading(false);
    }
  };

  const uploadFoundItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!capturedFile) return alert('Capture or upload a photo first.');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', await compressImage(capturedFile));
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      await apiFormCall('/api/upload-item', formData);
      setForm({ title: '', description: '', location: '' });
      await searchMatches();
      alert('Found item saved for image matching.');
    } catch (err: any) {
      alert(err.message || 'Could not save found item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#82b9ff]">Image Match</p>
          <h1 className="text-3xl font-bold text-white">Camera Item Matching</h1>
          <p className="mt-1 text-slate-400">Capture an item photo and compare it with found-item storage.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={cameraActive ? stopCamera : startCamera} className="btn-secondary px-4 py-2">
            <Camera className="h-4 w-4" />
            <span>{cameraActive ? 'Stop' : 'Camera'}</span>
          </button>
          <label className="btn-secondary cursor-pointer px-4 py-2">
            <ImagePlus className="h-4 w-4" />
            <span>Upload</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="sr-only" />
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="glass-card overflow-hidden">
          <div className="relative flex aspect-[4/3] items-center justify-center bg-[#070b1a]">
            {previewUrl ? (
              <img src={previewUrl} alt="Captured item" className="h-full w-full object-cover" />
            ) : (
              <video ref={videoRef} playsInline muted className={cn("h-full w-full object-cover", !cameraActive && "hidden")} />
            )}
            {!previewUrl && !cameraActive && <Package className="h-16 w-16 text-slate-500" />}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-white/10 p-4">
            <button type="button" onClick={capturePhoto} disabled={!cameraActive || loading} className="btn-primary px-4 py-2">
              <Camera className="h-4 w-4" />
              <span>Capture</span>
            </button>
            <button type="button" onClick={() => { setCapturedFile(null); setMatches([]); setQueryDescription(''); }} disabled={loading} className="btn-secondary px-4 py-2">Clear</button>
            <button type="button" onClick={searchMatches} disabled={!capturedFile || loading} className="btn-primary ml-auto px-4 py-2">
              <ScanSearch className="h-4 w-4" />
              <span>{loading ? 'Matching...' : 'Find Matches'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={uploadFoundItem} className="glass-card space-y-4 p-5">
          <h2 className="text-xl font-bold text-white">Save Found Item</h2>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-field" placeholder="Title" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-field" rows={4} placeholder="Description" required />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="form-field" placeholder="Location" required />
          <button disabled={!capturedFile || loading} className="btn-primary w-full py-3">Save and Index</button>
        </form>
      </div>

      {queryDescription && (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <span className="font-semibold text-white">Detected: </span>{queryDescription}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-bold text-white">Closest Matches</h2>
        {matches.length === 0 ? (
          <EmptyState icon={ScanSearch} title="No matches yet" message="Capture a photo and run image matching." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((item) => (
              <Link key={item.id} to={`/items/${item.id}`} className="glass-card overflow-hidden transition hover:shadow-xl hover:shadow-[#1b8cff]/15">
                <div className="aspect-[4/3] bg-[#070b1a]">
                  <ItemImage item={item} className="h-full w-full object-cover" fallbackClassName="flex h-full w-full items-center justify-center text-slate-500" iconClassName="h-10 w-10" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate font-semibold text-white">{item.title}</h3>
                    <span className="rounded-full border border-[#19d7b7]/30 bg-[#19d7b7]/15 px-2 py-1 text-xs font-bold text-[#75f7df]">
                      {Math.round((item.similarity_score || 0) * 100)}%
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-400">{item.description}</p>
                  <p className="text-xs text-slate-500">{item.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== APP ====================

export default function App() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816]">
      <Sidebar
        user={user}
        onLogout={logout}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main className={cn("min-w-0 transition-[padding] duration-300", sidebarCollapsed ? "md:pl-20" : "md:pl-64")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/items/lost" element={<ItemsPage type="lost" />} />
          <Route path="/items/found" element={<ItemsPage type="found" />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/post" element={<ProtectedRoute><PostItemPage /></ProtectedRoute>} />
          <Route path="/image-match" element={<ProtectedRoute><ImageMatchPage /></ProtectedRoute>} />
          <Route path="/claims/:itemId/submit" element={<ProtectedRoute><ClaimSubmitPage /></ProtectedRoute>} />
          <Route path="/claims/:id/qr" element={<ProtectedRoute><ClaimQRPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute>{user?.role === 'resident' ? <Dashboard /> : <AdminDashboard />}</ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin', 'official']}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/claims" element={<ProtectedRoute roles={['admin', 'official']}><ClaimReviewPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/database" element={<ProtectedRoute roles={['admin']}><AdminDatabasePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={['admin', 'official']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </main>
    </div>
  );
}

// ==================== ROOT ====================

export function Root() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
