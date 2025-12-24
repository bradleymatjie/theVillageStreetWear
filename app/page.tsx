'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CountdownProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = targetDate.getTime() - new Date().getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center items-center text-white">
      <div className="flex space-x-6">
        {Object.entries(timeLeft).map(([label, value]) => (
          <div key={label} className="text-center">
            <div className="text-5xl md:text-7xl font-bold">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm uppercase">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComingSoonPage: React.FC = () => {
  // Dec 24, 2025 + 7 hours
  const launchDate = new Date(
    new Date('2025-12-24T00:00:00').getTime() + 12 * 60 * 60 * 1000
  );

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("You're on the list! Check your inbox for updates. 🎉");
        setEmail('');
      } else {
        toast.error(`Oops: ${data.error}`);
      }
    } catch (error) {
      toast.error('Something went wrong—try again!');
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          THE VILLAGE
        </h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 space-y-16">
        <h1 className="text-[2em] m-0 font-extrabold tracking-wide">
          COMING SOON
        </h1>

        {/* Countdown */}
        <div className="relative w-full max-w-4xl mx-auto text-center">
          <CountdownTimer targetDate={launchDate} />

          <div className="absolute inset-0 flex items-center justify-center z-[-10]">
            <h2 className="text-5xl md:text-8xl lg:text-[150px] font-extrabold text-gray-800 leading-none text-center">
              COMING
              <br />
              SOON
            </h2>
          </div>
        </div>

        {/* Preview */}
        <div className="max-w-md text-center space-y-4">
          <h3 className="text-xl font-bold">
            A new era of streetwear customization
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Design your own shirts in our online studio, order custom prints,
            explore new drops, and join a community built on style and creativity.
          </p>
        </div>

        {/* Email Sign-up */}
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubscribe}
            className="flex gap-3 flex-wrap justify-center"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400 text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Notify Me'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-red-400">{message}</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-400 border-t border-gray-800">
        © 2025 The Village StreetWear. All Rights Reserved.
      </footer>
    </div>
  );
};

export default ComingSoonPage;
