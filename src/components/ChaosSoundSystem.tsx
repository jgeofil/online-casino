import React, { useEffect, useCallback } from 'react';
import { CHAOTIC_SOUNDS } from '../constants';
import { useCasino } from '../context/CasinoContext';

export const ChaosSoundSystem: React.FC = () => {
  const { state } = useCasino();

  const playRandomSound = useCallback(() => {
    const randomUrl = CHAOTIC_SOUNDS[Math.floor(Math.random() * CHAOTIC_SOUNDS.length)];
    const audio = new Audio(randomUrl);
    
    // Vary the volume for extra disorientation
    audio.volume = Math.random() * 0.4 + 0.1;
    
    // Vary the playback rate for distortion
    audio.playbackRate = Math.random() * 2 + 0.5;

    // Randomly pan left/right if possible (using newer AudioContext if I wanted to be fancy, but simple Audio is fine)
    
    audio.play().catch(() => {
      // Ignore errors (often caused by user not having interacted yet)
    });
  }, []);

  const playCacophony = useCallback(() => {
    const numSounds = Math.floor(Math.random() * 2) + 3; // 3 or 4 sounds
    for (let i = 0; i < numSounds; i++) {
      // Stagger slightly to create a messy, overlapping "cacophony" feel
      setTimeout(playRandomSound, Math.random() * 400);
    }
  }, [playRandomSound]);

  useEffect(() => {
    // Background "disorienting" timer
    const interval = setInterval(() => {
      const r = Math.random();

      // NEW: Rare Cacophony event (5% chance)
      if (r > 0.95) {
        playCacophony();
      } 
      // Standard random sounds (35% chance)
      else if (r > 0.6) {
        playRandomSound();
        
        // Occasionally play a second sound shortly after
        if (Math.random() > 0.8) {
          setTimeout(playRandomSound, 250);
        }
      }
    }, 3500); // Slightly more frequent for more chaos

    return () => clearInterval(interval);
  }, [playRandomSound, playCacophony]);

  useEffect(() => {
    // If the user is being "nauseous", increase the sound chaos
    if (state.isNauseous) {
      const nauseaInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          playRandomSound();
        }
      }, 1000);
      return () => clearInterval(nauseaInterval);
    }
  }, [state.isNauseous, playRandomSound]);

  return null; // Invisible component
};
