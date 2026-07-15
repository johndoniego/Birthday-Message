import React, { useState, useEffect } from 'react';
import CreatorMode from './components/CreatorMode';
import ReceiverMode from './components/ReceiverMode';
import { decodeData } from './utils';

function decodeCardData(encoded) {
  const parsed = decodeData(encoded);
  if (parsed) {
    return parsed;
  }

  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

function App() {
  const [receiverData, setReceiverData] = useState(null);
  const [isReceiver, setIsReceiver] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#card=')) {
        const encoded = hash.substring(6);
        const data = decodeCardData(encoded);
        if (data) {
          setReceiverData(data);
          setIsReceiver(true);
          return;
        }
      }
      // If no valid card hash, default to Creator Mode
      setReceiverData(null);
      setIsReceiver(false);
    };

    // Run on mount
    handleHashChange();

    // Listen for hash modifications
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isReceiver && receiverData) {
    return <ReceiverMode data={receiverData} />;
  }

  return <CreatorMode />;
}

export default App;
