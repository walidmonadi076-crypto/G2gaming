
import React, { useState } from 'react';

interface AIHelperPanelProps {
  contextType: 'game' | 'blog' | 'product';
  onApplyTitle?: (value: string) => void;
  onApplyShortDescription?: (value: string) => void;
  onApplyLongDescription?: (value: string) => void;
  onApplySeoTitle?: (value: string) => void;
  onApplySeoDescription?: (value: string) => void;
}

const AIHelperPanel: React.FC<AIHelperPanelProps> = ({
  contextType,
  onApplyTitle,
  onApplyShortDescription,
  onApplyLongDescription,
  onApplySeoTitle,
  onApplySeoDescription,
}) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to get cookie for CSRF
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setResult('');

    try {
      const csrfToken = getCookie('csrf_token');
      const res = await fetch('/api/admin/ai/generate-text', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ 
            prompt: `Context: Writing for a ${contextType}. Request: ${prompt}` 
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await res.json();
      setResult(data.text);
    } catch (err) {
      setError('Error generating text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="text-xs bg-gray-700 hover:bg-purple-600 text-white py-1.5 px-3 rounded-md transition-colors border border-gray-600 hover:border-purple-500"
    >
      {label}
    </button>
  );

  return (
    <div className="mt-8 bg-gray-900 border border-purple-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Assistant IA</h3>
      </div>

      <div className="space-y-3">
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Votre demande</label>
            <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ex: Write a catchy description for this ${contextType}...`}
            className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 p-3 h-24 resize-none transition-all placeholder-gray-500"
            />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Génération en cours...
            </span>
          ) : (
            'Générer'
          )}
        </button>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {result && (
          <div className="mt-4 bg-gray-800 rounded-lg p-3 border border-gray-700 animate-fade-in">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Résultat</label>
            <div className="text-sm text-gray-300 max-h-40 overflow-y-auto mb-3 whitespace-pre-wrap leading-relaxed p-2 bg-gray-900/50 rounded">
              {result}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-500 flex items-center mr-1">Appliquer :</span>
              {onApplyTitle && <ActionButton label="Titre / Nom" onClick={() => onApplyTitle(result)} />}
              {onApplyShortDescription && <ActionButton label="Résumé / Desc. Courte" onClick={() => onApplyShortDescription(result)} />}
              {onApplyLongDescription && <ActionButton label="Contenu / Desc. Longue" onClick={() => onApplyLongDescription(result)} />}
              {onApplySeoTitle && <ActionButton label="Titre SEO" onClick={() => onApplySeoTitle(result)} />}
              {onApplySeoDescription && <ActionButton label="Desc. SEO" onClick={() => onApplySeoDescription(result)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHelperPanel;
