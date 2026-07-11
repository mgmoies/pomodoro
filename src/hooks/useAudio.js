import { useRef, useCallback, useEffect } from 'react';

export default function useAudio() {
  const audioCtxRef = useRef(null);
  const mainGainRef = useRef(null);
  const activeSourcesRef = useRef({});
  const soundVolumeRefs = useRef({});

  // Initialize audio context
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      mainGainRef.current = audioCtxRef.current.createGain();
      mainGainRef.current.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
      mainGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Helper: Create Noise Buffers
  const getNoiseBuffer = (type) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Pink noise filter approximation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // normalise
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // normalise
      }
    }
    return buffer;
  };

  // Play a completed focus or break chime (arpeggio synthesized procedurally)
  const playChime = useCallback(() => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Tone sequence: C5, E5, G5, C6 (classic ascending arpeggio)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      const durations = [0.15, 0.15, 0.15, 0.5];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Triangle wave offers a pleasant, soft, bell-like tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + durations[idx]);

        osc.connect(gain);
        gain.connect(mainGainRef.current);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + durations[idx]);
      });
    } catch (e) {
      console.error('Failed to play chime:', e);
    }
  }, []);

  // Stop a specific ambient sound
  const stopAmbient = useCallback((soundId) => {
    const srcObj = activeSourcesRef.current[soundId];
    if (srcObj) {
      try {
        const ctx = audioCtxRef.current;
        const now = ctx?.currentTime || 0;
        
        // Fade out before stopping to avoid pops
        srcObj.gainNode.gain.setValueAtTime(srcObj.gainNode.gain.value, now);
        srcObj.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        setTimeout(() => {
          srcObj.sources.forEach(src => {
            try { src.stop(); } catch (err) {}
          });
          if (srcObj.timerId) clearInterval(srcObj.timerId);
        }, 500);
      } catch (e) {
        console.error(`Error stopping sound: ${soundId}`, e);
      }
      delete activeSourcesRef.current[soundId];
    }
  }, []);

  // Start a specific ambient sound
  const startAmbient = useCallback((soundId) => {
    initAudio();
    stopAmbient(soundId);

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const sources = [];
    let timerId = null;

    // Separate gain node for this specific sound channel
    const channelGain = ctx.createGain();
    channelGain.gain.setValueAtTime(0.0001, now);
    channelGain.connect(mainGainRef.current);
    channelGain.gain.linearRampToValueAtTime(soundVolumeRefs.current[soundId] || 0.8, now + 0.5);

    try {
      if (soundId === 'white') {
        const src = ctx.createBufferSource();
        src.buffer = getNoiseBuffer('white');
        src.loop = true;
        src.connect(channelGain);
        src.start(now);
        sources.push(src);

      } else if (soundId === 'rain') {
        // Continuous rumbling pink noise lowpassed
        const pinkSrc = ctx.createBufferSource();
        pinkSrc.buffer = getNoiseBuffer('pink');
        pinkSrc.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        
        pinkSrc.connect(filter);
        filter.connect(channelGain);
        pinkSrc.start(now);
        sources.push(pinkSrc);

        // Scattered raindrop crackles
        timerId = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          const dropCtx = audioCtxRef.current;
          const dropTime = dropCtx.currentTime;
          
          // Generate a rapid burst click
          const osc = dropCtx.createOscillator();
          const oscGain = dropCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1500 + Math.random() * 1000, dropTime);
          
          oscGain.gain.setValueAtTime(0, dropTime);
          oscGain.gain.linearRampToValueAtTime(0.015, dropTime + 0.002);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.02 + Math.random() * 0.03);
          
          osc.connect(oscGain);
          oscGain.connect(channelGain);
          
          osc.start(dropTime);
          osc.stop(dropTime + 0.1);
        }, 150);

      } else if (soundId === 'waves') {
        // Ocean waves using brown noise and lowpass swept by an LFO
        const brownSrc = ctx.createBufferSource();
        brownSrc.buffer = getNoiseBuffer('brown');
        brownSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        
        // Modulate volume slowly to simulate waves (LFO)
        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.3, now);

        brownSrc.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(channelGain);
        brownSrc.start(now);
        sources.push(brownSrc);

        // LFO simulation via JS interval (sweeps lowpass frequency and volume)
        let phase = 0;
        timerId = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          const t = audioCtxRef.current.currentTime;
          phase += 0.05;
          const factor = (Math.sin(phase) + 1) / 2; // 0 to 1
          
          // Sweep filter from 120Hz to 450Hz
          filter.frequency.linearRampToValueAtTime(120 + factor * 330, t + 0.25);
          // Sweep volume
          waveGain.gain.linearRampToValueAtTime(0.1 + factor * 0.6, t + 0.25);
        }, 200);

      } else if (soundId === 'cafe') {
        // Gentle brown noise for hum, plus random chatter & cup clinks
        const humSrc = ctx.createBufferSource();
        humSrc.buffer = getNoiseBuffer('brown');
        humSrc.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);
        
        humSrc.connect(filter);
        filter.connect(channelGain);
        humSrc.start(now);
        sources.push(humSrc);

        // Occasional coffee cup clinks
        timerId = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          if (Math.random() > 0.4) return;
          const t = audioCtxRef.current.currentTime;
          
          const clink = audioCtxRef.current.createOscillator();
          const clinkGain = audioCtxRef.current.createGain();
          
          clink.type = 'sine';
          clink.frequency.setValueAtTime(2000 + Math.random() * 1500, t);
          
          clinkGain.gain.setValueAtTime(0, t);
          clinkGain.gain.linearRampToValueAtTime(0.012, t + 0.002);
          clinkGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.1);
          
          clink.connect(clinkGain);
          clinkGain.connect(channelGain);
          clink.start(t);
          clink.stop(t + 0.3);
        }, 800);

      } else if (soundId === 'forest') {
        // Pink noise (leaves/wind) + randomized soft bird whistles
        const windSrc = ctx.createBufferSource();
        windSrc.buffer = getNoiseBuffer('pink');
        windSrc.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(400, now);
        
        windSrc.connect(windFilter);
        windFilter.connect(channelGain);
        windSrc.start(now);
        sources.push(windSrc);

        // Randomized bird whistles
        timerId = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          if (Math.random() > 0.3) return; // 30% chance each interval
          const t = audioCtxRef.current.currentTime;
          
          const bird = audioCtxRef.current.createOscillator();
          const birdGain = audioCtxRef.current.createGain();
          
          bird.type = 'sine';
          const baseFreq = 1800 + Math.random() * 1200;
          bird.frequency.setValueAtTime(baseFreq, t);
          
          // Bird sweep frequency (chirp effect)
          bird.frequency.exponentialRampToValueAtTime(baseFreq + 500, t + 0.15);
          
          birdGain.gain.setValueAtTime(0, t);
          birdGain.gain.linearRampToValueAtTime(0.015, t + 0.02);
          birdGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          
          bird.connect(birdGain);
          birdGain.connect(channelGain);
          bird.start(t);
          bird.stop(t + 0.3);
        }, 1200);

      } else if (soundId === 'fire') {
        // Deep brown noise (base roar) + fast random highpass crackles
        const roarSrc = ctx.createBufferSource();
        roarSrc.buffer = getNoiseBuffer('brown');
        roarSrc.loop = true;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(180, now);
        
        roarSrc.connect(lowpass);
        lowpass.connect(channelGain);
        roarSrc.start(now);
        sources.push(roarSrc);

        // Crackling sparks (high pass filtered clicks)
        timerId = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
          const count = Math.floor(Math.random() * 3) + 1;
          for (let k = 0; k < count; k++) {
            const t = audioCtxRef.current.currentTime + Math.random() * 0.05;
            const click = audioCtxRef.current.createOscillator();
            const clickGain = audioCtxRef.current.createGain();
            const clickFilter = audioCtxRef.current.createBiquadFilter();
            
            click.type = 'triangle';
            click.frequency.setValueAtTime(100 + Math.random() * 1500, t);
            
            clickFilter.type = 'highpass';
            clickFilter.frequency.setValueAtTime(2000, t);
            
            clickGain.gain.setValueAtTime(0, t);
            clickGain.gain.linearRampToValueAtTime(0.02, t + 0.001);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.01 + Math.random() * 0.02);
            
            click.connect(clickFilter);
            clickFilter.connect(clickGain);
            clickGain.connect(channelGain);
            
            click.start(t);
            click.stop(t + 0.1);
          }
        }, 80);

      } else if (soundId === 'space') {
        // Soft drone: brown noise + 3 lowfrequency detuned sine pads
        const spaceSrc = ctx.createBufferSource();
        spaceSrc.buffer = getNoiseBuffer('brown');
        spaceSrc.loop = true;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(100, now);
        
        spaceSrc.connect(lowpass);
        lowpass.connect(channelGain);
        spaceSrc.start(now);
        sources.push(spaceSrc);

        // Synthesizer pads
        const freqs = [73.42, 110.0, 146.83]; // D2, A2, D3 chord
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          
          oscGain.gain.setValueAtTime(0.05, now);
          
          osc.connect(oscGain);
          oscGain.connect(channelGain);
          osc.start(now);
          sources.push(osc);
        });
      }

      activeSourcesRef.current[soundId] = { sources, gainNode: channelGain, timerId };

    } catch (e) {
      console.error(`Failed to start ambient sound: ${soundId}`, e);
    }
  }, [stopAmbient]);

  // Adjust master volume
  const setVolume = useCallback((val) => {
    initAudio();
    if (mainGainRef.current) {
      mainGainRef.current.gain.setValueAtTime(val / 100, audioCtxRef.current.currentTime);
    }
  }, []);

  // Clean up all sounds on unmount
  useEffect(() => {
    return () => {
      Object.keys(activeSourcesRef.current).forEach((key) => {
        stopAmbient(key);
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAmbient]);

  return {
    initAudio,
    playChime,
    startAmbient,
    stopAmbient,
    setVolume
  };
}
