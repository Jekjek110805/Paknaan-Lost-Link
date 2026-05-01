import { Award, CheckCircle2, Clock, Download, FileText, MessageSquare, QrCode, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';

const logoUrl = new URL('../assets/lostlink-logo-cropped.png', import.meta.url).href;

export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Reports', value: '456', change: '+12%', icon: FileText, tone: 'bg-[#1b8cff]/15 text-[#82b9ff]' },
    { label: 'Pending Approval', value: '23', change: '-5', icon: Clock, tone: 'bg-[#ffb84d]/15 text-[#ffd08a]' },
    { label: 'Returned Items', value: '189', change: '+18%', icon: CheckCircle2, tone: 'bg-[#19d7b7]/15 text-[#75f7df]' },
    { label: 'Active Users', value: '1,240', change: '+45', icon: Users, tone: 'bg-[#b84dff]/15 text-[#d8a7ff]' },
  ];

  const recentActivities = [
    { id: 1, user: 'Maria Santos', action: 'reported a found', item: 'Nike Wallet', time: '10 mins ago', status: 'pending' },
    { id: 2, user: 'Admin', action: 'approved claim for', item: 'iPhone 13', time: '1 hour ago', status: 'approved' },
    { id: 3, user: 'Official Ben', action: 'rejected report for', item: 'Scrap Metal', time: '2 hours ago', status: 'rejected' },
  ];

  return (
    <div className="min-h-screen bg-transparent py-8 text-slate-100">
        <section className="border-b border-white/10 bg-[#070b1a]/80 px-6 py-8 text-white sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <img src={logoUrl} alt="LostLink Brgy Paknaan" className="mb-5 h-auto w-56 object-contain" />
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#82b9ff]">Barangay operations</p>
              <h1 className="editorial-heading mt-2 text-4xl leading-tight">Admin Analytics</h1>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">System status, report queues, and return activity for Paknaan LostLink.</p>
            </div>
            <button className="btn-primary w-full md:w-auto">
              <Download className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${stat.tone}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="mb-1 flex items-center gap-1 text-xs font-bold text-[#75f7df]">
                    <TrendingUp className="h-3 w-3" /> {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-8 sm:px-8 lg:grid-cols-3">
          <div className="glass-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-bold text-white">Recent Activity Log</h2>
              <span className="rounded-full bg-[#ff5c74] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
            </div>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex flex-col gap-3 rounded-md bg-white/10 p-3 ring-1 ring-white/10 transition hover:ring-[#4f8cff]/60 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#070b1a] font-bold text-[#82b9ff]">
                      {act.user[0]}
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-bold text-white">{act.user}</span>
                        <span className="text-slate-400"> {act.action} </span>
                        <span className="font-semibold text-[#9dc4ff]">"{act.item}"</span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">{act.time}</div>
                    </div>
                  </div>
                  <div className={`w-fit rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    act.status === 'approved' ? 'border border-[#19d7b7]/30 bg-[#19d7b7]/15 text-[#75f7df]' :
                    act.status === 'rejected' ? 'border border-[#ff5c74]/35 bg-[#ff5c74]/20 text-[#ff9aa8]' : 'border border-[#ffb84d]/30 bg-[#ffb84d]/15 text-[#ffd08a]'
                  }`}>
                    {act.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-[#070b1a] p-6 text-white">
            <div className="mb-8">
              <h2 className="editorial-heading text-2xl leading-tight">Community Honesty Badges</h2>
              <p className="mt-2 text-xs leading-6 text-slate-400">Top contributing residents of Paknaan.</p>
            </div>
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-2xl font-black italic text-white/20">0{i}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Resident Name {i}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">8 Items Returned</div>
                  </div>
                  <div className="rounded-md bg-gradient-to-br from-[#1b8cff] via-[#5b5cff] to-[#b84dff] p-1.5 text-white">
                    {i === 1 ? <Award className="h-4 w-4" /> : i === 2 ? <QrCode className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full rounded-md border border-white/10 bg-white/10 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/15">
              View Leaderboard
            </button>
          </div>
        </section>
    </div>
  );
};
