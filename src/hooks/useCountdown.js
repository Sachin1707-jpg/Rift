import { useState, useEffect } from 'react';

export const useCountdown = (expiresAtStr, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAtStr) return;

    const calculateTimeLeft = () => {
      const expiresAt = new Date(expiresAtStr).getTime();
      const now = new Date().getTime();
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        if (onExpire) onExpire();
        return 0;
      }

      setTimeLeft(difference);
      return difference;
    };

    // Initial calculation
    const initialDiff = calculateTimeLeft();
    
    if (initialDiff <= 0) return;

    const timer = setInterval(() => {
      const diff = calculateTimeLeft();
      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAtStr]); // intentionally leaving onExpire out to avoid re-triggering unless wrapped in useCallback by parent

  // Format time (mm:ss)
  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, isExpired, formattedTime: formatTime(timeLeft) };
};
