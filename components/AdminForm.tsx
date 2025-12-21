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
                            <button type="button" onClick={() => { const url = prompt("URL:"); if(url) execCommand('createLink', url); }} className="px-3 h-8 text-blue-400 hover:bg-gray-700 rounded text-[10px] font-black uppercase">Link</button>
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
        games: { title: '', imageUrl: '', iconUrl: '', backgroundUrl: '', category: '', tags: [], description: '', downloadUrl: '#', gallery: [], platform: 'pc', downloadsCount: 1500, rating: 95, requirements: { os: 'Windows 10', ram: '8GB', storage: '20GB' } },
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

  const handleAddGalleryItem = () => {
    const url = prompt("Enter Image URL:");
    if (url) setField('gallery', [...(formData.gallery || []), url]);
  };

  const handleRemoveGalleryItem = (index: number) => {
    setField('gallery', formData.gallery.filter((_:any, i:number) => i !== index));
  };

  const renderBasicField = (name: string, label: string, placeholder: string = "", required = true, inputType = "text") => (
      <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">{label}</label>
          <input 
              type={inputType} 
              value={formData[name] === null ? '' : formData[name]} 
              onChange={(e) => setField(name, inputType === 'number' ? parseInt(e.target.value) : e.target.value)} 
              required={required}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none text-sm" 
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
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{item ? 'Edit Record' : 'Initialize New Entry'}</h2>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40">Commit to Database</button>
            </div>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 overflow-hidden">
          <div className="overflow-y-auto space-y-8 pr-4 custom-scrollbar">
            {type === 'games' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderBasicField('title', 'Game Identity')}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Classification</label>
                            <input list="cats" value={formData.category} onChange={e=>setField('category', e.target.value)} required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 outline-none text-sm" /><datalist id="cats">{categories.map(c=><option key={c} value={c}/>)}</datalist>
                        </div>
                    </div>

                    <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.2em] mb-4">Visual Assets</h4>
                        {renderBasicField('imageUrl', 'Grid Cover URL')}
                        {renderBasicField('iconUrl', 'Circle Icon Logo (Transparent PNG)')}
                        {renderBasicField('backgroundUrl', 'Immersive Background URL')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderBasicField('downloadsCount', 'Manual Players Count', 'e.g. 5000', true, 'number')}
                        {renderBasicField('rating', 'Manual Score (0-100)', '95', true, 'number')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderBasicField('videoUrl', 'YouTube / MP4 Trailer', 'https://...', false)}
                        {renderBasicField('downloadUrl', 'Download Target URL', 'https://...', true)}
                    </div>

                    {/* Requirements Manager */}
                    <div className="bg-gray-900/40 p-6 rounded-3xl border border-white/5">
                        <h4 className="text-[10px] font-black uppercase text-green-400 tracking-[0.2em] mb-4">System Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="OS" value={formData.requirements?.os} onChange={e=>setField('requirements', {...formData.requirements, os: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs" />
                            <input type="text" placeholder="RAM" value={formData.requirements?.ram} onChange={e=>setField('requirements', {...formData.requirements, ram: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs" />
                            <input type="text" placeholder="Storage" value={formData.requirements?.storage} onChange={e=>setField('requirements', {...formData.requirements, storage: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs" />
                        </div>
                    </div>

                    {/* Gallery Manager */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Visual Recon Gallery</label>
                            <button type="button" onClick={handleAddGalleryItem} className="text-[9px] font-black uppercase px-3 py-1 bg-blue-600 text-white rounded-md">Add Capture</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {formData.gallery?.map((url: string, i: number) => (
                                <div key={i} className="relative group aspect-video bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                    <button onClick={()=>handleRemoveGalleryItem(i)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-700 cursor-pointer" onClick={()=>setIsFeatured(!isFeatured)}>
                            <div className={`w-5 h-5 rounded-md border-2 transition-colors ${isFeatured?'bg-purple-500 border-purple-500':'border-gray-600'}`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">Mark as Featured</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-700 cursor-pointer" onClick={()=>setIsPinned(!isPinned)}>
                            <div className={`w-5 h-5 rounded-md border-2 transition-colors ${isPinned?'bg-blue-500 border-blue-500':'border-gray-600'}`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">Pin to Top</span>
                        </div>
                    </div>

                    <RichTextEditor id="desc" label="Briefing & Missions" value={formData.description} onChange={v=>setField('description', v)} />
                    <AIHelperPanel contextType="game" onApplyLongDescription={v=>setField('description', v)} />
                </>
            )}
            {/* ... Blogs, Products logic (remains similar) */}
            {type === 'blogs' && (
                <>
                    <input type="text" value={formData.title} onChange={handleTitleChange} className="text-3xl font-black bg-transparent border-b border-gray-700 w-full outline-none focus:border-purple-500 uppercase tracking-tighter" placeholder="Article Title..." />
                    {renderBasicField('imageUrl', 'Banner URL')}
                    <RichTextEditor id="cont" label="Article Content" value={formData.content} onChange={v=>setField('content', v)} />
                </>
            )}
            {type === 'products' && (
                <>
                    <input type="text" value={formData.name} onChange={handleTitleChange} className="text-3xl font-black bg-transparent border-b border-gray-700 w-full outline-none focus:border-purple-500 uppercase tracking-tighter" placeholder="Product Name..." />
                    <div className="grid grid-cols-2 gap-4">
                        {renderBasicField('price', 'Price ($)')}
                        {renderBasicField('category', 'Category')}
                    </div>
                    {renderBasicField('imageUrl', 'Main Image URL')}
                    <RichTextEditor id="pdesc" label="Product Details" value={formData.description} onChange={v=>setField('description', v)} />
                </>
            )}
          </div>
          <div className="hidden lg:block h-full"><AdminPreview data={formData} type={type} /></div>
        </div>
      </form>
    </div>
  );
}