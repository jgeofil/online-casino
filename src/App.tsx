/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CasinoProvider } from './context/CasinoContext';
import { ChaosLayout } from './components/ChaosLayout';
import { DopamineSlots } from './components/DopamineSlots';
import { CursorTrail } from './components/CursorTrail';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Sparkles, MousePointer2, BadgeDollarSign } from 'lucide-react';

const FloatingButton = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const move = () => {
      setPos({
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100)
      });
    };
    const interval = setInterval(move, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      onClick={() => setVisible(false)}
      className="fixed z-[300] bg-yellow-400 border-4 border-black p-2 font-chaotic text-[10px] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-125 transition-transform"
    >
      <BadgeDollarSign className="inline-block mr-1" size={12} />
      CLAIM $0.05!!!
    </motion.button>
  );
};

export default function App() {
  return (
    <CasinoProvider>
      <div className="fixed inset-0 z-[-1] animate-chaos-bg opacity-30 pointer-events-none" />
      <CursorTrail />
      <ChaosLayout>
        <div className="flex flex-col items-center justify-start min-h-full py-10 relative">
          
          {/* Header Chaos */}
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start opacity-40">
             <div className="animate-spin duration-[10s]"><Sparkles size={100} className="text-yellow-300" /></div>
             <div className="animate-bounce"><MousePointer2 size={64} className="text-white rotate-180" /></div>
          </div>

          <div className="z-10 text-center mb-10">
            <h1 className="font-shout text-6xl md:text-8xl text-white drop-shadow-[5px_5px_0px_rgba(255,0,255,1)] animate-pulse">
              DOPAMINE<br/>OVERFLOW
            </h1>
            <div className="mt-2 inline-block bg-white text-black font-chaotic px-4 py-1 text-[10px] transform -rotate-1 skew-x-12 border-2 border-black">
              VERSION 2.0.0.1: PRE-ALPHA-SCAM-EDITION
            </div>
          </div>

          <DopamineSlots />

          {/* Random floating junk */}
          {[...Array(5)].map((_, i) => <FloatingButton key={i} />)}

          {/* Additional nonsensical info */}
          <div className="mt-20 max-w-2xl px-4 text-center">
             <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
                <h2 className="font-chaotic text-cyan-400 text-sm mb-4">WHY CHOOSE US?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { t: "100% ORGANIC", d: "Our code is free-range and gluten-free." },
                    { t: "INSTANT LOSS", d: "No waiting around to lose your virtual cash." },
                    { t: "WE CARE*", d: "*Terms 'Care' does not mean concern." }
                  ].map((f, i) => (
                    <div key={i} className="border-2 border-dashed border-white/30 p-2">
                      <div className="font-bold text-yellow-400 text-xs mb-1 uppercase">{f.t}</div>
                      <div className="text-[10px] text-gray-400">{f.d}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="h-40" /> {/* Spacer */}
        </div>
      </ChaosLayout>
    </CasinoProvider>
  );
}
