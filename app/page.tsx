'use client';

import { useState, useEffect } from 'react';

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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center items-center text-black">
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
  // Updated to 20 days from Dec 04, 2025 → Dec 24, 2025
  const launchDate = new Date('2025-12-24T00:00:00');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to your API (e.g., /api/subscribe) or service like Supabase/Resend
    console.log('Subscribed with email:', email); // Placeholder for now
    setSubmitted(true);
    setEmail(''); // Reset form
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">THE VILLAGE</h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 space-y-16">
        <h1 className="text-[2em] m-0 font-extrabold tracking-wide">COMING SOON</h1>
        
        {/* Coming Soon Overlay on Timer */}
        <div className="relative w-full max-w-4xl mx-auto text-center">
          <CountdownTimer targetDate={launchDate} />

          <div className="absolute inset-0 flex items-center justify-center z-[-10]">
            <h2 className="text-5xl md:text-8xl lg:text-[150px] font-extrabold text-gray-200 leading-none text-center">
              COMING<br />SOON
            </h2>
          </div>
        </div>

        {/* Preview of what's coming */}
        <div className="max-w-md text-center space-y-4">
          <h3 className="text-xl font-bold">A new era of streetwear customization</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Design your own shirts in our online studio, order custom prints, explore new drops, and join a community built on style and creativity.
          </p>
        </div>

        {/* Email Sign-up */}
        <div className="w-full max-w-md">
          {!submitted ? (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="text-center text-green-600 font-semibold">
              You're on the list! 🎉
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500 border-t border-gray-200">
        © 2025 The Village StreetWear. All Rights Reserved.
      </footer>
    </div>
  );
};

export default ComingSoonPage;