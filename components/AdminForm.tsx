
import React, { useState, useEffect, useRef } from 'react';
import type { Game, BlogPost, Product, SocialLink } from '../types';
import AdminPreview from './AdminPreview'; 
import AIHelperPanel from './admin/AIHelperPanel';

type Item = Game | BlogPost | Product | SocialLink;
type ItemType = 'games' | 'blogs' | 'products' | 'social-links';

interface AdminFormProps {
  item: Item | null;
  type: ItemType;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

// --- Enhanced Rich Text Editor Component ---
const RichTextEditor: React.FC<{ 
    value: string; 
    onChange: (val: string) => void;
    label: string;
    id: string;
}> = ({ value, onChange, label, id }) => {
    const [mode, setMode] = useState<'visual' | 'html'>('visual');
    const editorRef = useRef<HTMLDivElement>(null);
    const skipUpdate = useRef(false);

    // Sync contentEditable with value when mode changes to visual or value changes externally
    useEffect(() => {
        if (mode === 'visual' && editorRef.current) {
            if (editorRef.current.innerHTML !== value && !skipUpdate.current) {
                editorRef.current.innerHTML = value || '';
            }
        }
        skipUpdate.current = false;
    }, [mode, value]);

    const handleInput = () => {
        if (editorRef.current) {
            skipUpdate.current = true;
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleInput();
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                    <button 
                        type="button"
                        onClick={() => setMode('visual')}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded transition-colors ${mode === 'visual' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Visual
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('html')}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded transition-colors ${mode === 'html' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        HTML
                    </button>
                </div>
            </div>

            <div className="relative rounded-xl border border-gray-600 overflow-hidden bg-gray-750">
                {mode === 'visual' ? (
                    <>
                        <div className="flex items-center gap-1 p-2 bg-gray-800 border-b border-gray-700 overflow-x-auto no-scrollbar">
                            <button type="button" onClick={() => execCommand('bold')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs font-bold" title="Bold">B</button>
                            <button type="button" onClick={() => execCommand('italic')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs italic" title="Italic">I</button>
                            <button type="button" onClick={() => execCommand('underline')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs underline" title="Underline">U</button>
                            <div className="w-px h-4 bg-gray-600 mx-1"></div>
                            <button type="button" onClick={() => execCommand('insertUnorderedList')} className="px-2 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-[10px] font-bold" title="Bullet List">LIST •</button>
                            <button type="button" onClick={() => execCommand('insertOrderedList')} className="px-2 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-[10px] font-bold" title="Numbered List">LIST 1.</button>
                            <div className="w-px h-4 bg-gray-600 mx-1"></div>
                            <button type="button" onClick={() => {
                                const url = prompt("Enter URL:");
                                if (url) execCommand('createLink', url);
                            }} className="px-2 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-[10px] font-bold text-blue-400" title="Link">LINK</button>
                            <button type="button" onClick={() => execCommand('unlink')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs" title="Unlink">⎌</button>
                            <div className="w-px h-4 bg-gray-600 mx-1"></div>
                            <button type="button" onClick={() => execCommand('removeFormat')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs" title="Clear Format">🗑</button>
                        </div>
                        <div 
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            className="w-full min-h-[250px] max-h-[500px] overflow-y-auto px-4 py-3 bg-gray-700 text-gray-200 outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500/30 prose prose-invert prose-sm max-w-none"
                            onBlur={handleInput}
                        />
                    </>
                ) : (
                    <textarea
                        id={id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full min-h-[250px] max-h-[500px] px-4 py-3 bg-gray-900 text-purple-300 font-mono text-xs outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500/30 resize-y"
                        spellCheck={false}
                    />
                )}
            </div>
            <p className="text-[10px] text-gray-500 italic">
                {mode === 'visual' ? "Render visual: L-HTML dyalk m-khdem nichan." : "Mode HTML Code: T-9dar t-zid labels, scripts, awla links sghar."}
            </p>
        </div>
    );
};

const PREVIEWABLE_TYPES: ItemType[] = ['games', 'blogs', 'products', 'social-links'];

export default function AdminForm({ item, type, onClose, onSubmit }: AdminFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  const canPreview = PREVIEWABLE_TYPES.includes(type);

  useEffect(() => {
    if (type === 'games') {
      fetch('/api/meta/categories').then(res => res.json()).then(setCategories);
      fetch('/api/meta/tags').then(res => res.json()).then(setTags);
    }
  }, [type]);

  useEffect(() => {
    if (item) {
      setFormData({ gallery: [], tags: [], ...item });
      // @ts-ignore
      setIsPinned(!!item.isPinned);
      if (type === 'games' && 'tags' in item && Array.isArray(item.tags)) {
        setIsFeatured(item.tags.includes('Featured'));
      }
    } else {
      const defaults = {
        games: { 
            title: '', imageUrl: '', iconUrl: '', backgroundUrl: '', category: '', tags: [], 
            description: '', downloadUrl: '#', downloadUrlIos: '#', gallery: [], platform: 'pc',
            requirements: { os: '', ram: '', storage: '', processor: '' }, rating: 95, downloadsCount: 1000
        },
        blogs: { title: '', summary: '', imageUrl: '', author: '', rating: 4.5, content: '', category: '' },
        products: { name: '', imageUrl: '', price: '', url: '#', description: '', category: '', gallery: [] },
        'social-links': { name: '', url: '', icon_svg: '' },
      };
      setFormData(defaults[type]);
      setIsFeatured(false);
      setIsPinned(false);
    }
  }, [item, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // @ts-ignore
    const isNumber = e.target.type === 'number';
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: isNumber ? parseFloat(value) : value 
    }));
  };

  const handleRequirementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev: any) => ({
          ...prev,
          requirements: {
              ...(prev.requirements || {}),
              [name]: value
          }
      }));
  };

  const setFieldValue = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentTag(e.target.value);
  }

  const addTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || currentTag).trim();
    if (tag && !(formData.tags || []).includes(tag)) {
      setFormData((prev: any) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
    }
    setCurrentTag('');
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove),
    }));
  };
  
  const addGalleryImage = () => {
    const url = galleryInput.trim();
    if (url && !(formData.gallery || []).includes(url)) {
        if(url.length > 5) { 
            setFormData((prev: any) => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
            setGalleryInput('');
        } else {
            alert("URL trop courte / invalide.");
        }
    }
  };

  const handleGalleryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGalleryImage();
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery: prev.gallery.filter((url: string) => url !== urlToRemove),
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    let finalData = { ...formData, isPinned }; 
    
    if (type === 'games') {
        let finalTags = finalData.tags || [];
        finalTags = finalTags.filter((t: string) => t !== 'Featured');
        if (isFeatured) {
            finalTags.push('Featured');
        }
        finalData.tags = finalTags;
    }
    
    if (type === 'products' && finalData.price && !finalData.price.includes('$') && !isNaN(parseFloat(finalData.price))) {
        finalData.price = `$${finalData.price}`;
    }

    onSubmit(finalData);
  };
  
  const renderField = (name: string, label: string, type: string = 'text', required: boolean = true) => {
      const isTextArea = type === 'textarea';
      const Component = isTextArea ? 'textarea' : 'input';

      return (
        <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <Component
                id={name}
                name={name}
                type={isTextArea ? undefined : type}
                value={formData[name] || ''}
                onChange={handleChange}
                required={required}
                rows={isTextArea ? 5 : undefined}
                className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>
      );
  }

  const renderPinOption = () => (
      <div key="is-pinned" className="bg-blue-900/30 p-3 rounded-md border border-blue-800/50 mb-4">
          <label className="flex items-center gap-2 text-sm font-bold text-blue-200 cursor-pointer">
              <input 
                  type="checkbox" 
                  checked={isPinned} 
                  onChange={(e) => setIsPinned(e.target.checked)} 
                  className="w-4 h-4 bg-gray-700 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              📌 Épingler en haut (Afficher en premier)
          </label>
      </div>
  );

  const renderGalleryManager = () => (
    <div key="gallery-manager">
        <label htmlFor="gallery" className="block text-sm font-medium text-gray-300 mb-1">Galerie d'images (URLs)</label>
        <div className="flex gap-2">
            <input id="gallery" name="gallery" type="text" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} onKeyDown={handleGalleryKeyDown} className="flex-grow px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Coller une URL (jpg, png, webp) et appuyez sur Entrée..."/>
            <button type="button" onClick={addGalleryImage} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold">Ajouter</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 p-2 bg-gray-900 rounded-md min-h-[6.5rem]">
            {(formData.gallery || []).map((url: string, index: number) => (
                <div key={index} className="relative group">
                    <img src={url} alt={`Galerie ${index + 1}`} className="w-24 h-24 object-cover rounded-md bg-black" />
                    <button type="button" onClick={() => removeGalleryImage(url)} className="absolute top-0 right-0 m-1 w-6 h-6 bg-red-600/80 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer l'image">&times;</button>
                </div>
            ))}
        </div>
    </div>
  );
  
  const renderGameFields = () => (
    <>
      {renderPinOption()}
      {renderField('title', 'Titre')}
      <div className="grid grid-cols-2 gap-4">
          <div key="rating-game">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">Score Rating (0-100)</label>
            <input id="rating" name="rating" type="number" min="0" max="100" value={formData.rating || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="ex: 95"/>
          </div>
          <div key="downloads-game">
            <label htmlFor="downloadsCount" className="block text-sm font-medium text-gray-300 mb-1">Nb. Téléchargements</label>
            <input id="downloadsCount" name="downloadsCount" type="number" value={formData.downloadsCount || ''} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="ex: 15000"/>
          </div>
      </div>
      <div key="platform-game">
        <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">Plateforme</label>
        <select id="platform" name="platform" value={formData.platform || 'pc'} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="pc">PC / Web</option>
            <option value="mobile">Mobile (Android/iOS)</option>
        </select>
      </div>
      {renderField('imageUrl', 'URL de l\'image principale (Cover)')}
      {renderField('iconUrl', 'URL de l\'icône du profil', 'url', false)}
      {renderField('backgroundUrl', 'URL de l\'image de fond', 'url', false)}
      <div key="category-game">
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
        <input id="category" name="category" list="category-list" value={formData.category || ''} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
        <datalist id="category-list">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
      </div>
      <div key="tags-game">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-700 rounded-md border border-gray-600">
            {(formData.tags || []).filter((t:string) => t !== 'Featured').map((tag: string) => (<span key={tag} className="flex items-center bg-purple-600 text-white text-sm font-medium px-2 py-1 rounded-full">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-2 text-purple-200 hover:text-white">&times;</button></span>))}
            <input id="tags" name="tags" type="text" list="tag-list" value={currentTag} onChange={handleTagChange} onKeyDown={handleTagKeyDown} onBlur={() => addTag()} className="flex-grow bg-transparent focus:outline-none" placeholder="Ajouter un tag..."/>
            <datalist id="tag-list">{tags.filter(t => !(formData.tags || [])?.includes(t)).map(tag => <option key={tag} value={tag} />)}</datalist>
        </div>
      </div>
      <div key="featured-game">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 bg-gray-700 rounded border-gray-600 text-purple-600 focus:ring-purple-500"/>Featured</label>
      </div>
      <RichTextEditor id="game-description" label="Description" value={formData.description || ''} onChange={(val) => setFieldValue('description', val)} />
      <div className="bg-gray-750 p-4 rounded-md border border-gray-600 mt-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Configuration Requise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-400 mb-1">OS</label><input name="os" value={formData.requirements?.os || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">RAM</label><input name="ram" value={formData.requirements?.ram || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Stockage</label><input name="storage" value={formData.requirements?.storage || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">CPU</label><input name="processor" value={formData.requirements?.processor || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" /></div>
          </div>
      </div>
      {formData.platform === 'mobile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-750 p-4 rounded border border-gray-600">
              {renderField('downloadUrl', 'Android URL', 'url')}
              {renderField('downloadUrlIos', 'iOS URL', 'url')}
          </div>
      ) : ( renderField('downloadUrl', 'Download URL', 'url') )}
      {renderField('videoUrl', 'Video URL', 'url', false)}
      {renderGalleryManager()}
      <AIHelperPanel contextType="game" onApplyTitle={(text) => setFieldValue('title', text)} onApplyShortDescription={(text) => setFieldValue('description', text)} onApplyLongDescription={(text) => setFieldValue('description', text)} />
    </>
  );

  const renderBlogFields = () => (
    <>
      {renderPinOption()}
      {renderField('title', 'Titre')}
      <RichTextEditor id="blog-summary" label="Résumé" value={formData.summary || ''} onChange={(val) => setFieldValue('summary', val)} />
      {renderField('imageUrl', 'URL de l\'image')}
      {renderField('author', 'Auteur')}
      {renderField('category', 'Catégorie')}
       <div key="rating-blog">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">Note (sur 5)</label>
        <input id="rating" name="rating" type="number" value={formData.rating || ''} onChange={handleChange} step="0.1" min="0" max="5" required className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
      </div>
      <RichTextEditor id="blog-content" label="Contenu Principal" value={formData.content || ''} onChange={(val) => setFieldValue('content', val)} />
      {renderField('affiliateUrl', 'Affiliate URL', 'url', false)}
      {renderField('publishDate', 'Date', 'date', false)}
      <AIHelperPanel contextType="blog" onApplyTitle={(text) => setFieldValue('title', text)} onApplyShortDescription={(text) => setFieldValue('summary', text)} onApplyLongDescription={(text) => setFieldValue('content', text)} />
    </>
  );

  const renderProductFields = () => (
    <>
      {renderPinOption()}
      {renderField('name', 'Nom')}
      <div key="price-product" className="relative">
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Prix</label>
        <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-400 sm:text-sm font-bold">$</span></div>
            <input id="price" name="price" type="text" value={formData.price || ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); setFormData({...formData, price: val}); }} required className="w-full pl-7 pr-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.00" />
        </div>
      </div>
      {renderField('imageUrl', 'URL de l\'image')}
      {renderField('url', 'URL du produit')}
      {renderField('category', 'Catégorie')}
      <RichTextEditor id="product-description" label="Description" value={formData.description || ''} onChange={(val) => setFieldValue('description', val)} />
      {renderGalleryManager()}
      <AIHelperPanel contextType="product" onApplyTitle={(text) => setFieldValue('name', text)} onApplyLongDescription={(text) => setFieldValue('description', text)} />
    </>
  );

  const renderSocialLinkFields = () => (
    <>
      {renderField('name', 'Nom')}
      {renderField('url', 'URL')}
      <div key="icon_svg-social">
        <label htmlFor="icon_svg" className="block text-sm font-medium text-gray-300 mb-1">SVG Icon Code</label>
        <textarea id="icon_svg" name="icon_svg" value={formData.icon_svg || ''} onChange={handleChange} required rows={5} className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs" />
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in">
      <form onSubmit={handleSubmitForm} className="bg-gray-800 rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-bold">{item ? 'Modifier' : 'Ajouter'} {type.replace('-', ' ').slice(0, -1)}</h2>
            <div className="flex items-center gap-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md">Sauvegarder</button>
            </div>
        </div>
        <div className={`flex-grow grid ${canPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 p-6 overflow-hidden`}>
          <div className="overflow-y-auto pr-2"><div className="p-2 space-y-6">{type === 'games' && renderGameFields()}{type === 'blogs' && renderBlogFields()}{type === 'products' && renderProductFields()}{type === 'social-links' && renderSocialLinkFields()}</div></div>
          {canPreview && <div className="hidden md:block h-full"><AdminPreview data={formData} type={type as 'games' | 'blogs' | 'products' | 'social-links'} /></div>}
        </div>
      </form>
    </div>
  );
}
