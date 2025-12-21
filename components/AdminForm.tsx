import React, { useState, useEffect, useRef } from 'react';
import type { Game, BlogPost, Product, SocialLink } from '../types';
import AdminPreview from './AdminPreview'; 
import AIHelperPanel from './admin/AIHelperPanel';
import { slugify } from '../lib/slugify';

type Item = Game | BlogPost | Product | SocialLink;
type ItemType = 'games' | 'blogs' | 'products' | 'social-links';

interface AdminFormProps {
  item: Item | null;
  type: ItemType;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const RichTextEditor: React.FC<{ 
    value: string; 
    onChange: (val: string) => void;
    label: string;
    id: string;
}> = ({ value, onChange, label, id }) => {
    const [mode, setMode] = useState<'visual' | 'html'>('visual');
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode === 'visual' && editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [mode]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, val: string | undefined = undefined) => {
        document.execCommand(command, false, val);
        handleInput();
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-black uppercase text-gray-400 tracking-widest">{label}</label>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-white/5">
                    {['visual', 'html'].map(m => (
                        <button key={m} type="button" onClick={() => setMode(m as any)} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${mode === m ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{m}</button>
                    ))}
                </div>
            </div>
            <div className="relative rounded-2xl border border-gray-700 overflow-hidden bg-gray-900/50 min-h-[300px] flex flex-col shadow-2xl">
                {mode === 'visual' ? (
                    <>
                        <div className="flex items-center gap-1 p-2 bg-gray-800 border-b border-white/5 overflow-x-auto no-scrollbar">
                            {['bold', 'italic', 'underline'].map(cmd => <button key={cmd} type="button" onClick={() => execCommand(cmd)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs uppercase font-black" title={cmd}>{cmd[0].toUpperCase()}</button>)}
                            <div className="w-px h-4 bg-gray-700 mx-1"></div>
                            <button type="button" onClick={() => execCommand('insertUnorderedList')} className="px-3 h-8 hover:bg-gray-700 rounded text-[10px] font-black uppercase">List •</button>
                            <button type="button" onClick={() => { const url = window.prompt("URL:"); if(url) execCommand('createLink', url); }} className="px-3 h-8 text-blue-400 hover:bg-gray-700 rounded text-[10px] font-black uppercase">Link</button>
                        </div>
                        <div ref={editorRef} contentEditable onInput={handleInput} className="flex-grow p-5 text-gray-200 outline-none prose prose-invert prose-sm max-w-none focus:bg-white/[0.02] transition-colors" />
                    </>
                ) : (
                    <textarea value={value} onChange={(e) => onChange(e.target.value)} className="flex-grow p-5 bg-gray-900 text-purple-300 font-mono text-xs outline-none focus:ring-2 focus:ring-purple-500/20 resize-none" spellCheck={false} />
                )}
            </div>
        </div>
    );
};

export default function AdminForm({ item, type, onClose, onSubmit }: AdminFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  
  // Gallery URL state for pro input
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    if (type === 'games') fetch('/api/meta/categories').then(res => res.json()).then(setCategories);
  }, [type]);

  useEffect(() => {
    if (item) {
      setFormData({ gallery: [], tags: [], requirements: { os: '', ram: '', storage: '' }, ...item });
      setIsPinned(!!(item as any).isPinned);
      if (type === 'games') setIsFeatured((item as Game).tags?.includes('Featured') || false);
    } else {
      const defaults = {
        games: { title: '', imageUrl: '', iconUrl: '', backgroundUrl: '', category: '', tags: [], description: '', downloadUrl: '#', gallery: [], platform: 'pc', downloadsCount: 1000, rating: 95, requirements: { os: 'Windows 10', ram: '8GB', storage: '20GB' } },
        blogs: { title: '', summary: '', imageUrl: '', author: 'Admin', content: '', category: '' },
        products: { name: '', imageUrl: '', videoUrl: '', price: '', url: '#', description: '', category: '', gallery: [] },
        'social-links': { name: '', url: '', icon_svg: '' },
      };
      setFormData(defaults[type]);
    }
  }, [item, type]);

  const setField = (name: string, val: any) => setFormData((prev: any) => ({ ...prev, [name]: val }));

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const name = type === 'products' ? 'name' : 'title';
      setFormData((prev: any) => ({ ...prev, [name]: val, slug: slugify(val) }));
  }

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGalleryUrl.trim()) {
      setField('gallery', [...(formData.gallery || []), newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    setField('gallery', formData.gallery.filter((_:any, i:number) => i !== index));
  };

  const renderBasicField = (name: string, label: string, placeholder: string = "", required = true, inputType = "text") => (
      <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">{label}</label>
          <input 
              type={inputType} 
              value={formData[name] === null || formData[name] === undefined ? '' : formData[name]} 
              onChange={(e) => setField(name, inputType === 'number' ? (e.target.value === '' ? 0 : parseInt(e.target.value)) : e.target.value)} 
              required={required}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none text-sm text-white" 
          />
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, isPinned, tags: isFeatured ? [...(formData.tags?.filter((t:any)=>t!=='Featured')||[]), 'Featured'] : formData.tags?.filter((t:any)=>t!=='Featured') }); }} className="bg-gray-800 rounded-[2.5rem] border border-white/10 shadow-2xl w-full h-full max-w-[1400px] flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{item ? 'Update Core Data' : 'Initialize New Entry'}</h2>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Discard</button>
              <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40">Sync Database</button>
            </div>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 overflow-hidden">
          <div className="overflow-y-auto space-y-8 pr-4 custom-scrollbar">
            {type === 'games' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderBasicField('title', 'Game Identity', 'e.g. Call of Duty')}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Category</label>
                            <input list="cats" value={formData.category} onChange={e=>setField('category', e.target.value)} required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 outline-none text-sm text-white" /><datalist id="cats">{categories.map(c=><option key={c} value={c}/>)}</datalist>
                        </div>
                    </div>

                    <div className="bg-gray-900/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                             <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em]">Visual & Static Controls</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderBasicField('downloadsCount', 'Manual Player Count', 'e.g. 5000', true, 'number')}
                            {renderBasicField('rating', 'Dynamic Rating (0-100)', '95', true, 'number')}
                        </div>
                        {renderBasicField('imageUrl', 'Grid Cover URL (Main Display)')}
                        {renderBasicField('iconUrl', 'Developer Icon (Circular Logo)')}
                        {renderBasicField('backgroundUrl', 'Page Background (High Res)')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderBasicField('videoUrl', 'YouTube / MP4 Assets', 'https://...')}
                        {renderBasicField('downloadUrl', 'Target Deployment URL', 'https://...')}
                    </div>

                    <div className="bg-gray-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                             <h4 className="text-[10px] font-black uppercase text-green-400 tracking-[0.2em]">System Requirements</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="OS" value={formData.requirements?.os} onChange={e=>setField('requirements', {...formData.requirements, os: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500" />
                            <input type="text" placeholder="RAM" value={formData.requirements?.ram} onChange={e=>setField('requirements', {...formData.requirements, ram: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500" />
                            <input type="text" placeholder="Storage" value={formData.requirements?.storage} onChange={e=>setField('requirements', {...formData.requirements, storage: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-green-500" />
                        </div>
                    </div>

                    {/* Pro Gallery Manager */}
                    <div className="bg-gray-900/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Visual Recon Gallery</h4>
                            </div>
                            <span className="text-[9px] text-gray-500 font-bold uppercase">{formData.gallery?.length || 0} Captures</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newGalleryUrl} 
                                onChange={(e) => setNewGalleryUrl(e.target.value)}
                                placeholder="Paste Image URL here..."
                                className="flex-grow px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-blue-500 outline-none text-xs text-white transition-all" 
                            />
                            <button 
                                type="button" 
                                onClick={handleAddGalleryItem}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                            >
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {formData.gallery?.map((url: string, i: number) => (
                                <div key={i} className="relative group aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                    <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                    <button 
                                        type="button"
                                        onClick={()=>handleRemoveGalleryItem(i)} 
                                        className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all transform group-hover:backdrop-blur-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-900 p-5 rounded-2xl border border-gray-700 cursor-pointer hover:border-purple-500/50 transition-all group" onClick={()=>setIsFeatured(!isFeatured)}>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isFeatured?'bg-purple-600 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]':'border-gray-600 group-hover:border-gray-500'}`}>
                                {isFeatured && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-200">Featured Placement</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900 p-5 rounded-2xl border border-gray-700 cursor-pointer hover:border-blue-500/50 transition-all group" onClick={()=>setIsPinned(!isPinned)}>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPinned?'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]':'border-gray-600 group-hover:border-gray-500'}`}>
                                {isPinned && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-200">Global Pin</span>
                        </div>
                    </div>

                    <RichTextEditor id="desc" label="Mission Briefing & Description" value={formData.description} onChange={v=>setField('description', v)} />
                    <AIHelperPanel contextType="game" onApplyLongDescription={v=>setField('description', v)} />
                </>
            )}
            {type === 'blogs' && (
                <>
                    <input type="text" value={formData.title} onChange={handleTitleChange} className="text-4xl font-black bg-transparent border-b-2 border-gray-700 w-full outline-none focus:border-purple-500 uppercase tracking-tighter text-white py-4" placeholder="Article Title..." />
                    {renderBasicField('imageUrl', 'Banner Visual Asset URL')}
                    <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
                        {renderBasicField('author', 'Journalist Identity')}
                        {renderBasicField('category', 'Journal Category')}
                    </div>
                    <RichTextEditor id="cont" label="Article Intelligence Content" value={formData.content} onChange={v=>setField('content', v)} />
                </>
            )}
            {type === 'products' && (
                <>
                    <input type="text" value={formData.name} onChange={handleTitleChange} className="text-4xl font-black bg-transparent border-b-2 border-gray-700 w-full outline-none focus:border-green-500 uppercase tracking-tighter text-white py-4" placeholder="Gear Identity Name..." />
                    <div className="grid grid-cols-2 gap-4">
                        {renderBasicField('price', 'Store Price ($)')}
                        {renderBasicField('category', 'Inventory Class')}
                    </div>
                    {renderBasicField('imageUrl', 'Master Product Image URL')}
                    <RichTextEditor id="pdesc" label="Technical Specifications" value={formData.description} onChange={v=>setField('description', v)} />
                </>
            )}
          </div>
          <div className="hidden lg:block h-full border-l border-white/5 pl-8"><AdminPreview data={formData} type={type} /></div>
        </div>
      </form>
    </div>
  );
}