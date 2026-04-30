import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, User, Mic, Volume2, X, Send } from 'lucide-react';
import { chatWithManager } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ManagerCall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [status, setStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'calling') {
      const timer = setTimeout(() => {
        setStatus('connected');
        setMessages([{ role: 'model', text: "Yeah? What? I'm busy. Make it quick." }]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithManager(userMsg, history);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
  };

  const endCall = () => {
    setStatus('ended');
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1100] p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-xs bg-[#1a1a1a] border-4 border-gray-700 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,1)] relative"
        style={{ aspectRatio: '9/19' }}
      >
        {/* Speaker Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl z-20"></div>

        {/* Screen */}
        <div className="absolute inset-4 top-10 bg-[#0a0a0a] rounded-[2rem] overflow-hidden flex flex-col border-2 border-gray-800">
           
           {status === 'calling' && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
                  <User size={48} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-white font-bold text-xl uppercase tracking-widest">Big Tony</h2>
                  <p className="text-green-500 font-mono text-xs animate-blink">CALLING...</p>
                </div>
                <button onClick={endCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <PhoneOff className="text-white" />
                </button>
             </div>
           )}

           {status === 'connected' && (
             <>
               {/* Call Header */}
               <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">BIG TONY (Casino Boss)</h3>
                    <p className="text-[10px] text-green-500">00:{Math.floor(Math.random() * 60).toString().padStart(2, '0')} - ON THE LINE</p>
                  </div>
               </div>

               {/* Chat Body */}
               <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-friendly ${
                        m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 p-2 rounded-2xl animate-pulse text-[10px] text-gray-400 font-mono">
                        Tony is chewing his sandwich...
                      </div>
                    </div>
                  )}
               </div>

               {/* Input */}
               <div className="p-2 bg-gray-900 border-t border-gray-800 flex gap-2">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Type your complaint..."
                   className="flex-1 bg-black border border-gray-700 rounded-full px-4 py-2 text-white text-xs focus:outline-none focus:border-red-600"
                 />
                 <button onClick={handleSend} className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700">
                    <Send size={16} />
                 </button>
               </div>

               {/* Call Actions */}
               <div className="p-4 flex justify-around bg-black/50">
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <button className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white"><Mic size={18}/></button>
                    <span className="text-[8px] text-gray-500 uppercase">Mute</span>
                  </div>
                  <button onClick={endCall} className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                    <PhoneOff className="text-white" />
                  </button>
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <button className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-white"><Volume2 size={18}/></button>
                    <span className="text-[8px] text-gray-500 uppercase">Speaker</span>
                  </div>
               </div>
             </>
           )}

           {status === 'ended' && (
             <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <p className="text-red-500 font-shout text-2xl">CALL ENDED</p>
                <p className="text-gray-500 text-[10px]">Tony hung up. Rude.</p>
             </div>
           )}
        </div>

        {/* Home Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-800 rounded-full"></div>
      </motion.div>
    </div>
  );
};
