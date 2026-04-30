
import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useCasino } from '../context/CasinoContext';
import { Coins, Zap, Trophy, Bomb, Ghost, Heart, Rocket } from 'lucide-react';
import { WIN_SOUND_URL, LOSE_SOUND_URL, CHAOTIC_SOUNDS } from '../constants';

const SYMBOLS = ['💎', '🍋', '🍒', '🔔', '7️⃣', '💰', '🔥', '💩', '🤑'];

export const DopamineSlots: React.FC = () => {
  const { state, spin, addCurrency } = useCasino();
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState("INSERT COIN TO ASCEND");
  const [showConfirm, setShowConfirm] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const controls = useAnimation();

  const BASE_BET = 50;
  const currentBet = BASE_BET * multiplier;

  const playSound = (url: string, volume = 0.3, rate = 1) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.playbackRate = rate;
    audio.play().catch(() => {}); 
  };

  const handleSpin = async () => {
    if (isSpinning || state.balance < currentBet) return;
    setShowConfirm(true);
  };

  const executeSpin = async () => {
    setShowConfirm(false);
    setIsSpinning(true);
    setMessage("PURCHASING DOPAMINE...");
    playSound(CHAOTIC_SOUNDS[Math.floor(Math.random() * CHAOTIC_SOUNDS.length)], 0.2, 2);

    // Start reel animation
    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ]);
      if (Math.random() > 0.95) {
        playSound(CHAOTIC_SOUNDS[5], 0.1, 3); // Sparkle while spinning
      }
    }, 50);

    // Actual result logic
    const wasWin = spin(currentBet);
    const isNearMiss = !wasWin && Math.random() < 0.4; // 40% of losses are near misses

    setTimeout(() => {
      clearInterval(spinInterval);
      
      if (wasWin) {
        setIsSpinning(false);
        const finalSym = Math.floor(Math.random() * SYMBOLS.length);
        setReels([finalSym, finalSym, finalSym]);
        setMessage("YOU ARE A RADIANT GOD OF WEALTH!");
        playSound(WIN_SOUND_URL);
        controls.start({
          scale: [1, 1.5, 1],
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.5 }
        });
      } else if (isNearMiss) {
        const matchSym = Math.floor(Math.random() * SYMBOLS.length);
        const failSym = (matchSym + 1) % SYMBOLS.length;
        
        // Step 1: Show first two matches
        setReels([matchSym, matchSym, Math.floor(Math.random() * SYMBOLS.length)]);
        setMessage("OMG!!! SO CLOSE!!!!");
        playSound(CHAOTIC_SOUNDS[1], 0.5, 0.5); // Slow alert
        
        // Step 2: Dramatic pause for the third reel
        setTimeout(() => {
          setIsSpinning(false);
          setReels([matchSym, matchSym, failSym]);
          setMessage("ALMOST A BILLIONAIRE! TRY AGAIN!!");
          playSound(LOSE_SOUND_URL);
          playSound(CHAOTIC_SOUNDS[6], 0.3, 1.5); // Wrong answer sound
          controls.start({
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.2 }
          });
        }, 1000);
      } else {
        setIsSpinning(false);
        const r1 = Math.floor(Math.random() * SYMBOLS.length);
        const r2 = (r1 + 1) % SYMBOLS.length;
        const r3 = (r1 + 2) % SYMBOLS.length;
        setReels([r1, r2, r3]);
        setMessage("LOSS IS JUST A LESSON IN DISGUISE.");
        playSound(LOSE_SOUND_URL);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 select-none">
      {/* Jackpot Display */}
      <div className="bg-black border-4 border-yellow-400 p-4 w-full max-w-md shadow-[0_0_20px_rgba(255,255,0,0.5)]">
        <div className="text-center text-yellow-400 font-chaotic text-sm mb-2 animate-pulse">CURRENT JACKPOT:</div>
        <div className="text-center text-white font-shout text-5xl animate-rainbow">
          ${(state.balance * 1337).toLocaleString()}
        </div>
      </div>

      {/* Slots Machine */}
      <motion.div 
        animate={controls}
        className="bg-purple-900 border-8 border-yellow-500 rounded-3xl p-8 shadow-[0_20px_0_0_rgba(184,134,11,1)] relative overflow-hidden"
      >
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 z-[200] bg-red-600/90 flex flex-col items-center justify-center p-4 border-8 border-yellow-400"
            >
              <div className="bg-white p-4 border-4 border-black text-center space-y-4 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                <h3 className="font-shout text-xl text-black">DOPAMINE RELEASE AGREEMENT</h3>
                <p className="text-[10px] font-friendly leading-tight">
                  By clicking "YES", you agree to surrender {currentBet} credits in exchange for a 
                  potention burst of neuro-chemicals. The house holds no responsibility 
                  for joy, sadness, or total digital bankruptcy.
                </p>
                <div className="flex flex-col gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    onClick={executeSpin}
                    className="bg-green-500 text-white font-shout py-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none"
                  >
                    YES! CHARGE ME {currentBet}!
                  </motion.button>
                  <button 
                    onClick={() => {
                        setShowConfirm(false);
                        playSound(CHAOTIC_SOUNDS[4], 0.5, 2);
                    }}
                    className="text-[8px] uppercase font-bold text-gray-400 hover:text-black"
                  >
                    No, I prefer being bored and stable.
                  </button>
                </div>
              </div>
              {/* Fake fake buttons */}
              <div className="absolute top-2 left-2 temu-badge">AD: FREE MONEY?</div>
              <div className="absolute bottom-2 right-2 temu-badge">TRUSTED BY 0 PEOPLE</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Lights */}
        <div className="absolute top-0 left-0 w-full flex justify-around p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full animate-blink ${i % 2 === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
        </div>

        <div className="flex gap-4 bg-white border-8 border-black p-4 rounded-xl shadow-inner relative">
          <AnimatePresence>
            {message === "OMG!!! SO CLOSE!!!!" && (
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.2, rotate: 10 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-red-600 text-white font-shout text-4xl p-4 border-4 border-black animate-strobe shadow-[10px_10px_0px_rgba(0,0,0,1)]">
                  NEAR MISS!!!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {reels.map((symbolIdx, i) => (
            <div key={i} className="w-24 h-32 flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded overflow-hidden">
               <motion.div 
                 key={symbolIdx}
                 initial={{ y: -50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-6xl"
               >
                 {SYMBOLS[symbolIdx]}
               </motion.div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          {/* Multiplier Selector */}
          <div className="flex bg-black border-2 border-yellow-400 p-1 gap-1">
            {[1, 2, 5, 10, 100].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMultiplier(m);
                  if (m === 100) playSound(CHAOTIC_SOUNDS[3], 0.3, 0.5); // Horn for max bet
                  else playSound(CHAOTIC_SOUNDS[5], 0.2, 1.5);
                }}
                className={`
                  px-3 py-1 font-chaotic text-[10px] border-2 border-transparent transition-all
                  ${multiplier === m ? 'bg-yellow-400 text-black border-black animate-blink' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'}
                `}
              >
                {m}x
              </button>
            ))}
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || state.balance < currentBet}
            className={`
              relative px-12 py-6 bg-red-600 border-4 border-black font-shout text-4xl text-white
              shadow-[0_10px_0_0_rgba(100,0,0,1)] active:shadow-none active:translate-y-[10px]
              transition-all disabled:grayscale disabled:cursor-not-allowed
              ${isSpinning ? 'animate-pulse' : 'hover:scale-110'}
            `}
          >
            SPIN!!!
            <div className="absolute -top-4 -right-4 temu-badge">BET: {currentBet}</div>
          </button>
        </div>
      </motion.div>

      {/* Message and Stats */}
      <div className="text-center space-y-2">
        <div className="bg-black/50 text-white p-2 font-chaotic text-xs animate-blink">
          {message}
        </div>
        <div className="flex gap-4 text-white font-mono text-xs">
          <div className="bg-blue-900 border border-blue-400 p-2 flex items-center gap-2">
            <Coins size={14} className="text-yellow-400" />
            BALANCE: <span className="text-yellow-400 font-bold">${state.balance}</span>
          </div>
          <div className="bg-purple-900 border border-purple-400 p-2 flex items-center gap-2">
             <Zap size={14} className="text-cyan-400" />
             SPINS: <span className="text-cyan-400 font-bold">{state.totalSpins}</span>
          </div>
        </div>
      </div>

      {/* Chaotic Ticker underneath */}
      <div className="w-full bg-white h-6 flex items-center border-2 border-black overflow-hidden italic text-[10px] font-bold text-black">
         <motion.div 
           animate={{ x: [1000, -1000] }}
           transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
           className="whitespace-nowrap"
         >
           LAST WINNER: "BigLobbyist" WON $50 AND A VIRTUAL POTATO! — DON'T FORGET TO DRINK WATER (SOLD SEPARATELY) — THE RATIO IS IN YOUR FAVOR* — *terms and conditions apply to your soul.
         </motion.div>
      </div>
    </div>
  );
};
