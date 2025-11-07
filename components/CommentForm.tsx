import React, { useState, useEffect, useRef } from 'react';
import { Comment } from '../types';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface CommentFormProps {
  postId: number;
  onCommentAdded: (newComment: Comment) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const SITE_KEY = "6Lcm1QUsAAAAAP4bS9QiKH9jCpDXQ3ktJsgQwcO4";

  useEffect(() => {
    const renderRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => setRecaptchaToken(token),
          'expired-callback': () => setRecaptchaToken(null),
        });
      }
    };
    
    const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
            clearInterval(interval);
            renderRecaptcha();
        }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError("Veuillez compléter la vérification reCAPTCHA.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, author, text, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      
      setSuccess('Merci ! Votre commentaire est en attente de modération.');
      setAuthor('');
      setText('');
      setRecaptchaToken(null);
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      }
      onCommentAdded(data);
      
      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      setError((err as Error).message);
      if (window.grecaptcha && recaptchaWidgetId.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      }
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-xl font-bold text-white">Leave a Reply</h3>
      {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{error}</div>}
      {success && <div className="p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-md">{success}</div>}

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-1">Your Comment</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={5}
          className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div ref={recaptchaRef} className="flex justify-center"></div>
      
      <div className="text-right">
        <button
          type="submit"
          disabled={isLoading || !recaptchaToken}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
