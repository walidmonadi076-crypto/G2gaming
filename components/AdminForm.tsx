
import React, { useState, useEffect, Fragment } from 'react';
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

const PREVIEWABLE_TYPES: ItemType[] = ['games', 'blogs', 'products', 'social-links'];

export default function AdminForm({ item, type, onClose, onSubmit }: AdminFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [isFeatured, setIsFeatured] = useState(false);
  
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
      if (type === 'games' && 'tags' in item && Array.isArray(item.tags)) {
        setIsFeatured(item.tags.includes('Featured'));
      }
    } else {
      const defaults = {
        games: { 
            title: '', 
            imageUrl: '', 
            category: '', 
            tags: [], 
            description: '', 
            downloadUrl: '#', 
            downloadUrlIos: '#',
            gallery: [], 
            platform: 'pc',
            requirements: { os: '', ram: '', storage: '', processor: '' }
        },
        blogs: { title: '', summary: '', imageUrl: '', author: '', rating: 4.5, content: '', category: '' },
        products: { name: '', imageUrl: '', price: '', url: '#', description: '', category: '', gallery: [] },
        'social-links': { name: '', url: '', icon_svg: '' },
      };
      setFormData(defaults[type]);
      setIsFeatured(false);
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
    let finalData = { ...formData };
    if (type === 'games') {
        let finalTags = finalData.tags || [];
        finalTags = finalTags.filter((t: string) => t !== 'Featured');
        if (isFeatured) {
            finalTags.push('Featured');
        }
        finalData.tags = finalTags;
    }
    
    // Ensure product price has symbol if missing (optional cleaning)
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
      {renderField('title', 'Titre')}
      
      {/* Platform Selection */}
      <div key="platform-game">
        <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">Plateforme</label>
        <select
            id="platform"
            name="platform"
            value={formData.platform || 'pc'}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
            <option value="pc">PC / Web</option>
            <option value="mobile">Mobile (Android/iOS)</option>
        </select>
      </div>

      {renderField('imageUrl', 'URL de l\'image principale (Vignette)')}
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
      {renderField('description', 'Description', 'textarea')}
      
      {/* System Requirements Section */}
      <div className="bg-gray-750 p-4 rounded-md border border-gray-600 mt-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Configuration Requise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs text-gray-400 mb-1">Système d'exploitation (OS)</label>
                  <input name="os" value={formData.requirements?.os || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" placeholder="ex: Windows 10 / Android 12" />
              </div>
              <div>
                  <label className="block text-xs text-gray-400 mb-1">Mémoire (RAM)</label>
                  <input name="ram" value={formData.requirements?.ram || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" placeholder="ex: 8GB / 4GB" />
              </div>
              <div>
                  <label className="block text-xs text-gray-400 mb-1">Stockage</label>
                  <input name="storage" value={formData.requirements?.storage || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" placeholder="ex: 50GB Free Space" />
              </div>
              <div>
                  <label className="block text-xs text-gray-400 mb-1">Processeur (CPU)</label>
                  <input name="processor" value={formData.requirements?.processor || ''} onChange={handleRequirementChange} className="w-full px-3 py-1.5 bg-gray-700 rounded border border-gray-600 text-sm" placeholder="Optionnel" />
              </div>
          </div>
      </div>

      {/* Dynamic Download Links based on Platform */}
      {formData.platform === 'mobile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-750 p-4 rounded border border-gray-600">
              {renderField('downloadUrl', 'Lien Android (APK / Play Store)', 'url')}
              {renderField('downloadUrlIos', 'Lien iOS (IPA / App Store)', 'url')}
          </div>
      ) : (
          renderField('downloadUrl', 'URL de Téléchargement', 'url')
      )}

      {renderField('videoUrl', 'URL Vidéo (MP4 ou YouTube/Vimeo)', 'url', false)}
      {renderGalleryManager()}
      
      <AIHelperPanel
        contextType="game"
        onApplyTitle={(text) => setFieldValue('title', text)}
        onApplyShortDescription={(text) => setFieldValue('description', text)}
        onApplyLongDescription={(text) => setFieldValue('description', text)}
      />
    </>
  );

  const renderBlogFields = () => (
    <>
      {renderField('title', 'Titre')}
      {renderField('summary', 'Résumé', 'textarea')}
      {renderField('imageUrl', 'URL de l\'image')}
      {renderField('author', 'Auteur')}
      {renderField('category', 'Catégorie')}
       <div key="rating-blog">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">Note (sur 5)</label>
        <input id="rating" name="rating" type="number" value={formData.rating || ''} onChange={handleChange} step="0.1" min="0" max="5" required className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
      </div>
      {renderField('content', 'Contenu', 'textarea')}
      {renderField('affiliateUrl', 'URL d\'affiliation', 'url', false)}
      {renderField('publishDate', 'Date de publication', 'date', false)}

      <AIHelperPanel
        contextType="blog"
        onApplyTitle={(text) => setFieldValue('title', text)}
        onApplyShortDescription={(text) => setFieldValue('summary', text)}
        onApplyLongDescription={(text) => setFieldValue('content', text)}
      />
    </>
  );

  const renderProductFields = () => (
    <>
      {renderField('name', 'Nom')}
      
      {/* Price Field with Icon */}
      <div key="price-product" className="relative">
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Prix</label>
        <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-400 sm:text-sm font-bold">$</span>
            </div>
            <input
                id="price"
                name="price"
                type="text"
                value={formData.price || ''}
                onChange={(e) => {
                    // Strip non-numeric chars except dot to allow cleaner typing
                    const val = e.target.value.replace(/[^0-9.]/g, ''); 
                    setFormData({...formData, price: val});
                }}
                required
                className="w-full pl-7 pr-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
            />
        </div>
      </div>

      {renderField('imageUrl', 'URL de l\'image principale')}
      {renderField('url', 'URL du produit')}
      {renderField('category', 'Catégorie')}
      {renderField('description', 'Description', 'textarea')}
      {renderGalleryManager()}

      <AIHelperPanel
        contextType="product"
        onApplyTitle={(text) => setFieldValue('name', text)}
        onApplyLongDescription={(text) => setFieldValue('description', text)}
      />
    </>
  );

  const renderSocialLinkFields = () => (
    <>
      {renderField('name', 'Nom du réseau')}
      {renderField('url', 'URL (lien complet)')}
      <div key="icon-svg-social">
        <label htmlFor="icon_svg" className="block text-sm font-medium text-gray-300 mb-1">Icône (code SVG)</label>
        <textarea id="icon_svg" name="icon_svg" value={formData.icon_svg || ''} onChange={handleChange} required rows={5} className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder='<svg width="24" height="24" ...>...</svg>'/>
        <p className="text-xs text-gray-400 mt-1">Collez le code SVG complet de l'icône ici.</p>
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
          <div className="overflow-y-auto pr-2">
            <div className="p-6 space-y-4">
              {type === 'games' && renderGameFields()}
              {type === 'blogs' && renderBlogFields()}
              {type === 'products' && renderProductFields()}
              {type === 'social-links' && renderSocialLinkFields()}
            </div>
          </div>
          {canPreview && (
            <div className="hidden md:block h-full">
              <AdminPreview data={formData} type={type as 'games' | 'blogs' | 'products' | 'social-links'} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
