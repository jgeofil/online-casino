
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROMOTIONS } from '../constants';
import { useCasino } from '../context/CasinoContext';
import { TriangleAlert, MousePointer2, Zap, X, ShieldAlert, PhoneCall } from 'lucide-react';
import { ManagerCall } from './ManagerCall';
import { ChaosSoundSystem } from './ChaosSoundSystem';

export const ChaosLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useCasino();
  const [showAdmin, setShowAdmin] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div className={`min-h-screen w-full relative overflow-hidden flex flex-col ${state.isNauseous ? 'animate-shake' : ''}`}>
      {/* Top Banner */}
      <div className="bg-yellow-400 h-10 flex items-center overflow-hidden border-b-4 border-black z-50">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-10 font-chaotic text-xs text-black font-bold uppercase flex-1"
        >
          {PROMOTIONS.map((p, i) => <span key={i} className="flex items-center gap-2 animate-rainbow"><Zap size={14}/> {p} <TriangleAlert size={14}/></span>)}
          {PROMOTIONS.map((p, i) => <span key={i + 'repeat'} className="flex items-center gap-2 animate-rainbow"><Zap size={14}/> {p} <TriangleAlert size={14}/></span>)}
        </motion.div>
        
        <button 
          onClick={() => setIsCalling(true)}
          className="bg-red-600 text-white font-shout px-4 h-full border-l-4 border-black animate-blink hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap z-50"
        >
          <PhoneCall size={16} /> TALK TO BOSS
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Left Ticker (Vertical) */}
        <div className="w-12 bg-red-600 border-r-4 border-black flex flex-col items-center py-4 overflow-hidden hidden md:flex">
          <motion.div
            animate={{ y: [0, -500] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="flex flex-col gap-20"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="transform rotate-90 whitespace-nowrap font-shout text-white text-2xl tracking-tighter">
                MEGA SALE 99% OFF MEGA SALE 99% OFF
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Game Area */}
        <main className="flex-1 bg-[#222] relative chaotic-border m-2 overflow-auto custom-scrollbar flex flex-col animate-chaos-bg shadow-inner main-viewport-scale">
           {children}
        </main>

        {/* Right Sidebar - More Ads */}
        <div className="w-48 bg-blue-600 border-l-4 border-black p-2 hidden lg:block overflow-y-auto">
          <div className="animate-blink text-white font-chaotic text-[10px] text-center mb-4">LUCKY WINNERS:</div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white p-2 mb-2 border-2 border-black rotate-1 hover:rotate-0 transition-transform cursor-pointer">
              <div className="text-[10px] font-bold">User_{Math.floor(Math.random() * 9999)} won:</div>
              <div className="text-green-600 font-chaotic text-xs animate-rainbow">${Math.floor(Math.random() * 1000000)}</div>
            </div>
          ))}
          <div className="mt-10 bg-yellow-400 p-2 border-2 border-black animate-pulse">
            <ShieldAlert className="mx-auto mb-2" />
            <div className="text-[10px] font-black uppercase text-center">Your privacy is NOT our concern.</div>
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="bg-green-500 h-8 flex items-center overflow-hidden border-t-4 border-black z-50">
        <motion.div 
          animate={{ x: [-1000, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-20 font-friendly text-white font-bold"
        >
          {PROMOTIONS.reverse().map((p, i) => <span key={i}> {p} ——— </span>)}
        </motion.div>
      </div>

      <div className="fixed bottom-10 right-2 opacity-50 hover:opacity-100 z-[200]">
         <button 
           onClick={() => setShowAdmin(!showAdmin)}
           className="bg-gray-800 text-[8px] p-1 border border-white text-white rotate-45"
         >
           DEV
         </button>
      </div>
      
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      
      <ChaosSoundSystem />

      <AnimatePresence>
        {isCalling && <ManagerCall onClose={() => setIsCalling(false)} />}
      </AnimatePresence>
    </div>
  );
};

const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, adjustRatio, resetBalance, toggleNausea } = useCasino();
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4">
      <div className="bg-gray-100 border-4 border-gray-600 w-full max-w-md p-6 font-mono text-sm shadow-[20px_20px_0px_0px_rgba(255,0,255,1)]">
        <div className="flex justify-between items-center mb-4 bg-gray-600 text-white p-2">
          <span>DEBUG SYSTEM v1.0.4 - ENHANCE THE DOPAMINE</span>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label>Win/Loss Ratio: {(state.winRatio * 100).toFixed(0)}%</label>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={state.winRatio} 
              onChange={(e) => adjustRatio(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px]">
              <span>SCAM MODE (0%)</span>
              <span>JACKPOT CITY (100%)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={resetBalance} className="bg-gray-300 border-2 border-black p-2 hover:bg-gray-400">RESET MONEY</button>
            <button onClick={toggleNausea} className={`border-2 border-black p-2 ${state.isNauseous ? 'bg-red-400' : 'bg-gray-300'}`}>NAUSEA MODE</button>
          </div>
          <div className="text-center italic opacity-70">"You have the power of a god, use it to deceive."</div>
        </div>
      </div>
    </div>
  );
}
