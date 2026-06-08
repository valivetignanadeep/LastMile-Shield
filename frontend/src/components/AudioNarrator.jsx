import React, { useState, useEffect } from 'react';

export default function AudioNarrator({ text, lang = 'en' }) {
  const [speaking, setSpeaking] = useState(false);

  // Stop speaking if text changes or component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const speak = (e) => {
    e.stopPropagation();
    
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Use Indian voice profiles if possible
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button 
      type="button"
      className="audio-narrator-btn" 
      onClick={speak}
      title="Voice read-out accessibility"
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ marginRight: '3px' }}
      >
        {speaking ? (
          <>
            <line x1="18" y1="2" x2="6" y2="22"></line>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </>
        )}
      </svg>
      {speaking ? (
        lang === 'hi' ? 'आवाज़ बंद करें' : 'Stop Listening'
      ) : (
        lang === 'hi' ? 'विवरण सुनें' : 'Listen Details'
      )}
    </button>
  );
}
