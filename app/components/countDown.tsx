"use client"
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownBanner() {
  "use client";

  const targetDate = new Date("2025-12-27T00:00:00");

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 py-3 text-center font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-500 ${
        isExpired ? "bg-green-500 text-green-950" : "bg-yellow-400 text-yellow-950"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>
        Early Access Testing Mode —{" "}
        {isExpired
          ? "Full Launch Live! 🎉"
          : `Full Launch in ${
              timeLeft.days > 0 ? `${timeLeft.days}days ` : ""
            }${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(
              timeLeft.seconds
            )}`}
      </span>
    </div>
  );
};