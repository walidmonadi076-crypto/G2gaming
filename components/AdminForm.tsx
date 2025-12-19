
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
    const lastValue = useRef(value);

    useEffect(() => {
        if (mode === 'visual' && editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [mode]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            lastValue.current = html;
            onChange(html);
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
                            <button type="button" onClick={() => execCommand('removeFormat')} className="w-8 h-8 flex items-center justify-center hover:bg-red-900/30 text-red-500 rounded" title="Clear">🗑</button>
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
      setFormData({ gallery: [], tags: [], ...item });
      setIsPinned(!!(item as any).isPinned);
      if (type === 'games') setIsFeatured((item as Game).tags?.includes('Featured') || false);
    } else {
      const defaults = {
        games: { title: '', imageUrl: '', iconUrl: '', category: '', tags: [], description: '', downloadUrl: '#', gallery: [], platform: 'pc', requirements: { os: '', ram: '', storage: '' } },
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

  const renderBasicField = (name: string, label: string, placeholder: string = "", required = true) => (
      <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">{label}</label>
          <input 
              type="text" 
              value={formData[name] || ''} 
              onChange={(e) => setField(name, e.target.value)} 
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
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{item ? 'Update' : 'Create'} {type.replace('-', ' ')}</h2>
                <div className="text-[10px] font-mono text-purple-400 mt-1 uppercase tracking-widest">
                    URL: /{(type==='products'?'shop':type==='blogs'?'blog':type)}/{formData.slug || '...'}
                </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
              <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40">Authorize Save</button>
            </div>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 overflow-hidden">
          <div className="overflow-y-auto space-y-8 pr-4 custom-scrollbar">
            {type === 'games' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Title</label>
                            <input type="text" value={formData.title} onChange={handleTitleChange} required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 outline-none text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Category</label>
                            <input list="cats" value={formData.category} onChange={e=>setField('category', e.target.value)} required className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-purple-500 outline-none text-sm" /><datalist id="cats">{categories.map(c=><option key={c} value={c}/>)}</datalist>
                        </div>
                    </div>
                    {renderBasicField('imageUrl', 'Cover Image URL')}
                    {renderBasicField('videoUrl', 'YouTube/Video URL', 'https://youtube.com/watch?v=...', false)}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-700 cursor-pointer" onClick={()=>setIsFeatured(!isFeatured)}>
                            <div className={`w-5 h-5 rounded-md border-2 transition-colors ${isFeatured?'bg-purple-500 border-purple-500':'border-gray-600'}`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">Featured</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-700 cursor-pointer" onClick={()=>setIsPinned(!isPinned)}>
                            <div className={`w-5 h-5 rounded-md border-2 transition-colors ${isPinned?'bg-blue-500 border-blue-500':'border-gray-600'}`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">Pin Top</span>
                        </div>
                        {renderBasicField('rating', 'Rating (0-100)')}
                    </div>
                    <RichTextEditor id="desc" label="Game Description" value={formData.description} onChange={v=>setField('description', v)} />
                    <div className="p-6 bg-gray-900/80 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-xs font-black uppercase text-gray-500 border-b border-white/5 pb-2">System Specs</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="OS" value={formData.requirements?.os} onChange={e=>setField('requirements', {...formData.requirements, os:e.target.value})} className="bg-transparent border-b border-gray-700 text-sm py-1 outline-none focus:border-purple-500" />
                            <input placeholder="RAM" value={formData.requirements?.ram} onChange={e=>setField('requirements', {...formData.requirements, ram:e.target.value})} className="bg-transparent border-b border-gray-700 text-sm py-1 outline-none focus:border-purple-500" />
                            <input placeholder="Disk" value={formData.requirements?.storage} onChange={e=>setField('requirements', {...formData.requirements, storage:e.target.value})} className="bg-transparent border-b border-gray-700 text-sm py-1 outline-none focus:border-purple-500 col-span-2" />
                        </div>
                    </div>
                    <AIHelperPanel contextType="game" onApplyLongDescription={v=>setField('description', v)} />
                </>
            )}
            {type === 'blogs' && (
                <>
                    <input type="text" value={formData.title} onChange={handleTitleChange} className="text-3xl font-black bg-transparent border-b border-gray-700 w-full outline-none focus:border-purple-500 uppercase tracking-tighter" placeholder="Article Title..." />
                    {renderBasicField('imageUrl', 'Banner URL')}
                    {renderBasicField('videoUrl', 'Video URL (Optional)', '', false)}
                    <RichTextEditor id="cont" label="Article Content" value={formData.content} onChange={v=>setField('content', v)} />
                    <AIHelperPanel contextType="blog" onApplyLongDescription={v=>setField('content', v)} />
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
                    {renderBasicField('videoUrl', 'YouTube/Video URL (Optional)', '', false)}
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
