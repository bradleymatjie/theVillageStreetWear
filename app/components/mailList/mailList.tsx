'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setMessage('');
    setError('');

    // Basic client-side validation
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Welcome to The Village! Check your inbox for confirmation.');
        toast.success(data.message);
        setEmail(''); // Reset the input
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-black text-white py-20 px-4 text-center font-sans">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-black uppercase tracking-wider mb-4">
          Join The Village
        </h2>
        <p className="text-lg opacity-90 mb-10 leading-relaxed">
          Exclusive drops, custom designs, and streetwear heat — straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto items-center justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="w-full sm:flex-1 min-w-0 px-6 py-5 text-base rounded-lg bg-white text-black shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-5 text-base font-bold uppercase tracking-wider bg-orange-600 text-white rounded-lg shadow-lg transition-all duration-300 hover:bg-orange-500 hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>

        {(message || error) && (
          <div className={`mt-8 text-sm font-medium ${message ? 'text-green-400' : 'text-orange-500'}`}>
            {message || error}
          </div>
        )}

        <p className="mt-12 text-xs opacity-60">
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </div>
    </section>
  );
}