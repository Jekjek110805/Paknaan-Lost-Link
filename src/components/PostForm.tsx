import { useState } from 'react';
import { Camera, MapPin, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface PostFormProps {
  type: 'lost' | 'found';
  onSubmit: (data: any) => void;
}

export const PostForm = ({ type, onSubmit }: PostFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    image: null as File | null
  });

  const categories = ['Electronics', 'Personal Effects', 'Documents', 'Pets', 'Wallets/Bags', 'Others'];

  return (
    <div className="glass-card mx-auto max-w-2xl space-y-6 p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-2xl font-bold text-white">
        <AlertTriangle className={type === 'lost' ? "text-[#ffb84d]" : "text-[#19d7b7]"} />
        <h2 className="editorial-heading">Report {type === 'lost' ? 'Lost' : 'Found'} Item</h2>
      </div>

      <div className="grid gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Item Name / Title</label>
          <input 
            type="text" 
            placeholder="e.g. Blue Nike Backpack"
            className="form-field"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
            <select 
              className="form-field"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date {type === 'lost' ? 'Lost' : 'Found'}</label>
            <input 
              type="date"
              className="form-field"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Specific Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#82b9ff]" />
            <input 
              type="text" 
              placeholder="e.g. Near Basketball Court, Phase 2"
              className="form-field pl-10"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Detailed Description</label>
          <textarea 
            rows={4}
            placeholder="Please include identifying features, color, brand, or any unique marks..."
            className="form-field"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Upload Photos</label>
          <div className="cursor-pointer space-y-4 rounded-lg border-2 border-dashed border-white/15 bg-white/10 p-8 text-center transition-colors hover:border-[#4f8cff]/70">
            <Camera className="mx-auto h-10 w-10 text-[#82b9ff]" />
            <div className="font-medium text-slate-300">Click to upload or drag and drop</div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <button 
          onClick={() => onSubmit(formData)}
          className="btn-primary w-full py-4"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
};
