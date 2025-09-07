// components/ServerStatus.js
import { useState, useEffect } from 'react';

export default function ServerStatus() {
  const [isServerOnline, setIsServerOnline] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setIsChecking(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/health`, {          method: 'GET',
          timeout: 5000,
        });
        
        if (response.ok) {
          setIsServerOnline(true);
        } else {
          setIsServerOnline(false);
        }
      } catch (error) {
        setIsServerOnline(false);
      } finally {
        setIsChecking(false); 
      }
    };

    checkServerStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        Checking server...
      </div>
    );
  }

  if (isServerOnline === false) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        Server offline
      </div>
    );
  }

  return (
    <></>
  );
}