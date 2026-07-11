import React, { useState } from 'react';

// Custom clean line SVGs for sound board triggers
const RainIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13a4 4 0 01-4 4H8a5 5 0 01-2-9.6A5 5 0 0115.5 8 4 4 0 0119 13z" />
    <path strokeLinecap="round" d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
  </svg>
);

const CafeIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h12v5a5 5 0 01-5 5h-2a5 5 0 01-5-5v-5zM18 10h1a2 2 0 012 2v2a2 2 0 01-2 2h-1M9 3v3M12 3v3M15 3v3" />
  </svg>
);

const ForestIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L5 12h4v6h6v-6h4L12 2zM12 18v3" />
  </svg>
);

const WavesIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10c3 1.5 5-1.5 8 0s5-1.5 8 0M3 15c3 1.5 5-1.5 8 0s5-1.5 8 0" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SpaceIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const WindIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h12M3 8h15M3 16h8" />
  </svg>
);

const HeadphoneIcon = () => (
  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h1a3 3 0 003-3v-3a3 3 0 00-3-3H3m18 9a3 3 0 01-3 3h-1a3 3 0 01-3-3v-3a3 3 0 013-3h3" />
  </svg>
);

const MusicIcon = () => (
  <svg className="w-4 h-4 text-app-mt mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 10l12-3M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
  </svg>
);

const soundButtons = [
  { id: 'rain', name: 'Rain', component: <RainIcon /> },
  { id: 'cafe', name: 'Café', component: <CafeIcon /> },
  { id: 'forest', name: 'Forest', component: <ForestIcon /> },
  { id: 'waves', name: 'Waves', component: <WavesIcon /> },
  { id: 'fire', name: 'Fire', component: <FireIcon /> },
  { id: 'space', name: 'Space', component: <SpaceIcon /> },
  { id: 'white', name: 'White', component: <WindIcon /> },
];

export default function AmbientSounds({ startAmbient, stopAmbient, setVolume }) {
  const [activeSounds, setActiveSounds] = useState({});
  const [volValue, setVolValue] = useState(40);

  const handleToggleSound = (id) => {
    const isPlaying = activeSounds[id];
    if (isPlaying) {
      stopAmbient(id);
      setActiveSounds((prev) => ({ ...prev, [id]: false }));
    } else {
      startAmbient(id);
      setActiveSounds((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolValue(val);
    setVolume(val);
  };

  const handleSpotifyClick = () => {
    window.open('https://open.spotify.com/genre/0JQ5DAqbMKFC57JLOePGEs', '_blank');
  };

  return (
    <div id="ambient" className="h-full flex flex-col justify-between p-4 rounded-2xl border-[3px] border-app-br bg-app-card shadow-retro font-sans text-app-ink">
      <div>
        {/* Header row with inline volume controls */}
        <div className="flex items-center justify-between text-[10px] uppercase font-extrabold tracking-[2.5px] text-app-mt mb-3 select-none">
          <div className="flex items-center">
            <MusicIcon /> Ambient Sounds
          </div>
          
          <div className="flex items-center gap-1.5 select-none lowercase tracking-normal font-sans font-bold text-[10px]">
            <label htmlFor="volSlider" className="text-app-mt">
              vol:
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volValue} 
              id="volSlider" 
              onChange={handleVolumeChange}
              className="w-16 md:w-20 accent-tomato h-0.5 bg-app-br rounded-lg cursor-pointer"
              aria-label="Volume slider"
            />
            <span className="text-app-mt min-w-[20px] text-right font-black">
              {volValue}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {soundButtons.map((snd) => {
            const isPlaying = activeSounds[snd.id];
            return (
              <button 
                key={snd.id}
                onClick={() => handleToggleSound(snd.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg border-2 border-app-br cursor-pointer transition-all ${
                  isPlaying 
                    ? 'bg-tomato text-white border-tomato shadow-retro-sm translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-app-card text-app-mt hover:border-tomato hover:text-tomato hover:bg-app-tl/10'
                }`}
                aria-label={snd.name}
              >
                <div className={isPlaying ? 'text-white' : 'text-app-ink hover:inherit'}>
                  {snd.component}
                </div>
                <span className={`text-[10px] font-black ${isPlaying ? 'text-white' : 'text-app-mt hover:inherit'}`}>
                  {snd.name}
                </span>
              </button>
            );
          })}

          {/* Spotify button */}
          <button 
            onClick={handleSpotifyClick}
            className="flex flex-col items-center justify-center py-2 rounded-lg border-2 border-app-br bg-app-card text-app-ink hover:border-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/10 cursor-pointer transition-all"
            aria-label="Spotify Focus"
          >
            <HeadphoneIcon />
            <span className="text-[10px] font-black text-app-mt hover:inherit">
              Spotify
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
