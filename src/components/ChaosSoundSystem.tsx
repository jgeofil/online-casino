import React, { useEffect, useCallback, useRef } from 'react';
import { HARMONIOUS_SOUNDS } from '../constants';
import { useCasino } from '../context/CasinoContext';

export const ChaosSoundSystem: React.FC = () => {
  const { state } = useCasino();
  const beatCount = useRef(0);

  const playHarmoniousSound = useCallback((index?: number, volume = 0.2, rate = 1.0) => {
    const url = index !== undefined 
      ? HARMONIOUS_SOUNDS[index % HARMONIOUS_SOUNDS.length]
      : HARMONIOUS_SOUNDS[Math.floor(Math.random() * HARMONIOUS_SOUNDS.length)];
    
    const audio = new Audio(url);
    audio.volume = volume;
    audio.playbackRate = rate;
    
    // Slight randomization of rate for "drifting" feel
    if (index === undefined) audio.playbackRate *= (0.95 + Math.random() * 0.1);

    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    // A more rhythmic, pulse-like system
    const interval = setInterval(() => {
      beatCount.current++;
      
      // Every 4th beat, play a deeper "anchor" chime
      if (beatCount.current % 4 === 0) {
        playHarmoniousSound(2, 0.25, 0.8); // Deep bell
      } 
      
      // Every beat, have a chance to play a light sparkle
      if (Math.random() > 0.4) {
        playHarmoniousSound(Math.random() > 0.5 ? 3 : 4, 0.1, 1.2 + Math.random() * 0.5);
      }

      // Occasional "dreamy sweep"
      if (beatCount.current % 16 === 0) {
        playHarmoniousSound(5, 0.15, 1.0);
      }

    }, 2000); // Steady 2-second pulse

    return () => clearInterval(interval);
  }, [playHarmoniousSound]);

  useEffect(() => {
    if (state.isNauseous) {
      const nauseaInterval = setInterval(() => {
        // Nausea adds a bit more complexity but still stays in the "harmonic" zone
        if (Math.random() > 0.5) {
          playHarmoniousSound(undefined, 0.1, 0.5 + Math.random());
        }
      }, 1500);
      return () => clearInterval(nauseaInterval);
    }
  }, [state.isNauseous, playHarmoniousSound]);

  return null;
};
