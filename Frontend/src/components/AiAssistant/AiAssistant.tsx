import React, { useState } from 'react';
import './AiAssistant.css';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; message: string }[]>([]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setChatLog([...chatLog, { sender: 'user', message: input }]);

    try {
      const response = await fetch('/api/booking/InterpretBookingRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userInput: input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setChatLog(prev => [...prev, { sender: 'ai', message: data }]);
      setInput('');
    } catch (error) {
      setChatLog(prev => [...prev, { sender: 'ai', message: 'Något gick fel. Försök igen senare.' }]);
      console.error('Fetch error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-assistant-container">
      <div
        className="ai-assistant-icon"
        onClick={toggleOpen}
        title="AI-assistent"
      >
        🤖
      </div>

      {isOpen && (
        <div className="ai-assistant-chatbox">
          <div className="ai-assistant-chatlog">
            {chatLog.length === 0 && (
              <p className="ai-assistant-placeholder">
                Hej! <br></br>
                Jag är din AI-Assistent som gärna hjälper dig att boka resurser åt dig! Skriv bara vad och när du vill boka!
              </p>
            )}

            {chatLog.map((chat, i) => (
              <div
                key={i}
                className={`ai-assistant-message ${chat.sender === 'user' ? 'user' : 'ai'}`}
              >
                <span>{chat.message}</span>
              </div>
            ))}
          </div>

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ditt meddelande..."
            className="ai-assistant-input"
          />
          <button
            onClick={sendMessage}
            className="ai-assistant-send-button"
          >
            Skicka
          </button>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;