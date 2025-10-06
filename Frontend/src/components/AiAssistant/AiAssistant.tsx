import React, { useState } from 'react';
import './AiAssistant.css';
import { BASE_URL } from "../../config";

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; message: string }[]>([]);
  const [pendingBooking, setPendingBooking] = useState<any | null>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  function extractJsonFromText(text: string): any | null {
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) return null;
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("❌ JSON parse error:", error);
      return null;
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    setChatLog([...chatLog, { sender: 'user', message: input }]);

    try {
      const response = await fetch(`${BASE_URL}booking/InterpretBookingRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      setChatLog(prev => [...prev, { sender: 'ai', message: text }]);

      const json = extractJsonFromText(text);
      if (json) {
        setPendingBooking(json);
      }

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

  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const resourceId = getResourceIdFromType(pendingBooking.resourceType); // Du måste mappa detta
    const bookingType = getBookingTypeFromResource(pendingBooking.resourceType);

    const dto = {
      userId,
      resourceId,
      bookingType,
      startTime: pendingBooking.startTime,
      endTime: pendingBooking.endTime
    };

    try {
      const res = await fetch(`${BASE_URL}booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dto)
      });

      if (!res.ok) {
        throw new Error("Kunde inte skapa bokningen.");
      }

      setChatLog(prev => [...prev, { sender: 'ai', message: "✅ Bokningen är nu bekräftad!" }]);
      setPendingBooking(null);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [...prev, { sender: 'ai', message: "❌ Bokningen misslyckades." }]);
    }
  };

  const getResourceIdFromType = (type: string): number => {
    switch (type.toLowerCase()) {
      case 'mötesrum': return 1;
      case 'skrivbord': return 2;
      case 'vr-headset': return 3;
      case 'ai-server': return 4;
      default: return 0;
    }
  };

  const getBookingTypeFromResource = (type: string): number => {
    switch (type.toLowerCase()) {
      case 'mötesrum': return 0;
      case 'skrivbord': return 1;
      case 'vr-headset': return 2;
      case 'ai-server': return 3;
      default: return 0;
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
                Hej! <br />
                Jag är din AI-Assistent som gärna hjälper dig att boka resurser. Skriv bara vad och när!
              </p>
            )}

            {chatLog.map((chat, i) => (
              <div key={i} className={`ai-assistant-message ${chat.sender}`}>
                <span>{chat.message}</span>
              </div>
            ))}

            {pendingBooking && (
              <div className="ai-assistant-confirmation">
                <p>💡 Vill du boka <strong>{pendingBooking.resourceType}</strong> den <strong>{pendingBooking.date}</strong> mellan <strong>{pendingBooking.startTime.slice(11, 16)}</strong> och <strong>{pendingBooking.endTime.slice(11, 16)}</strong>?</p>
                <button onClick={handleConfirmBooking}>✅ Bekräfta</button>
                <button onClick={() => setPendingBooking(null)}>❌ Avbryt</button>
              </div>
            )}
          </div>

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ditt meddelande..."
            className="ai-assistant-input"
          />
          <button onClick={sendMessage} className="ai-assistant-send-button">
            Skicka
          </button>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;