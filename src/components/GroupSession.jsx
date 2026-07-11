import React, { useState } from 'react';

// Clean SVG Outlines matching the engraving design
const GroupIcon = () => (
  <svg className="w-4 h-4 text-app-mt mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const FeedIcon = () => (
  <svg className="w-3.5 h-3.5 text-app-mt mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M9 17h6m-6-4h6m-6-4h4" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5 text-app-ink mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h6m-6-4h6" />
  </svg>
);

const TaskPinIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const HashIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
  </svg>
);

const UsersEmptyIcon = () => (
  <svg className="w-8 h-8 text-app-br mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function GroupSession({ 
  roomId = 'letterpress-lab', 
  participants = [], 
  roomName = 'Letterpress Lab', 
  onInviteCopied,
  onRoomChange
}) {
  const [joinInput, setJoinInput] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleInviteClick = () => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin + window.location.pathname 
      : 'https://focustomato.app/';
    const inviteUrl = `${baseUrl}?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(inviteUrl);
    if (onInviteCopied) {
      onInviteCopied();
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const trimmed = joinInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && onRoomChange) {
      onRoomChange(trimmed);
      setJoinInput('');
      setShowJoinForm(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans text-app-ink justify-between overflow-hidden">
      
      {/* Header row */}
      <div className="flex items-center justify-between text-[10px] uppercase font-extrabold tracking-[2.5px] text-app-mt mb-3.5 select-none shrink-0">
        <span><GroupIcon /> Group Session</span>
        <div className="flex items-center gap-1.5">
          <span 
            className="text-[9px] font-black border border-app-br/30 px-2 py-0.5 rounded bg-app-bg truncate max-w-[100px]" 
            title={roomId}
          >
            {roomId}
          </span>
          <button 
            onClick={() => setShowJoinForm(prev => !prev)}
            className="text-[9px] font-black hover:text-tomato transition-colors cursor-pointer border border-app-br/30 px-1.5 py-0.5 rounded bg-app-card"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Join by Group ID form (toggled) */}
      {showJoinForm && (
        <form 
          onSubmit={handleJoinSubmit}
          className="flex gap-2 items-center mb-3 shrink-0 animate-picker-appear"
        >
          <div className="flex-1 flex items-center gap-1.5 border-2 border-app-br bg-app-bg rounded-lg px-2.5 py-2 focus-within:border-tomato transition-colors">
            <HashIcon />
            <input
              type="text"
              value={joinInput}
              onChange={e => setJoinInput(e.target.value)}
              placeholder="Enter room ID..."
              className="flex-1 bg-transparent text-xs font-extrabold outline-none placeholder-app-mt/50 text-app-ink"
              autoFocus
              maxLength={40}
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 border-[2.5px] border-app-br bg-tomato hover:bg-tomato-dark text-white text-[10px] font-black rounded-lg cursor-pointer shrink-0 transition-colors"
          >
            Join
          </button>
        </form>
      )}

      {/* Participant list — fills remaining space */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 mb-3">
        {participants.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-app-br/30 rounded-lg p-6 text-center select-none">
            <UsersEmptyIcon />
            <p className="text-[10px] font-bold text-app-mt leading-normal max-w-[180px]">
              No peers active yet. Share the invite link to sync with friends.
            </p>
          </div>
        ) : (
          participants.map((user) => {
            const isFocusing = user.status === 'Focusing';
            const isBreak = user.status === 'Break';
            const isPaused = user.status === 'Paused';
            
            let progressColor = 'bg-app-mt';
            if (isFocusing) progressColor = 'bg-tomato';
            else if (isBreak) progressColor = 'bg-short';
            else if (isPaused) progressColor = 'bg-amber-400';

            return (
              <div 
                key={user.id}
                className="p-3 border-2 border-app-br bg-app-card rounded-lg shadow-retro-sm"
              >
                {/* Name + Status badge */}
                <div className="flex justify-between items-center mb-1.5 gap-2">
                  <span className="text-xs font-black truncate flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{user.name}</span>
                    {user.vibe && (
                      <span className="text-[8px] bg-app-bg px-1.5 py-0.5 rounded border border-app-br/30 font-extrabold text-app-mt lowercase shrink-0">
                        {user.vibe}
                      </span>
                    )}
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border border-app-br/30 ${
                    isFocusing 
                      ? 'text-tomato bg-app-tl' 
                      : isBreak 
                        ? 'text-short bg-short/10' 
                        : isPaused
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-app-mt bg-app-bg'
                  }`}>
                    {user.status}
                  </span>
                </div>

                {/* Active task label */}
                <div className="flex items-center text-[10px] text-app-mt truncate mb-2 font-semibold min-h-[14px]">
                  {user.task ? (
                    <>
                      <TaskPinIcon />
                      <span className="truncate italic">{user.task}</span>
                    </>
                  ) : (
                    <span className="italic opacity-60">No active task</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 border border-app-br bg-app-bg overflow-hidden rounded-full">
                  <div 
                    className={`h-full border-r border-app-br transition-all duration-1000 ${progressColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, user.progress * 100))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Feed */}
      <div className="h-[90px] flex flex-col overflow-hidden border-t-2 border-app-br/30 pt-3 mb-3 shrink-0">
        <div className="flex items-center text-[9px] uppercase font-extrabold tracking-[2px] text-app-mt mb-2 select-none">
          <FeedIcon /> Activity Feed
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 font-semibold">
          {participants.length === 0 && (
            <div className="text-[10px] text-app-mt leading-normal">
              <span className="text-app-ink font-extrabold mr-1.5">[Waiting]</span>
              Room is empty — invite friends to get started.
            </div>
          )}
          {participants.map((p, idx) => (
            <div key={`p-${idx}`} className="text-[10px] text-app-mt leading-normal">
              <span className="text-app-ink font-extrabold mr-1.5">[Live]</span>
              <span className="font-black text-app-ink">{p.name}</span> is {p.status.toLowerCase()}
              {p.task ? <> — <span className="italic">{p.task}</span></> : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Button Row */}
      <div className="flex gap-2 shrink-0">
        <button 
          onClick={handleInviteClick}
          className="flex-1 py-2.5 rounded-lg border-[3px] border-app-br bg-app-card text-app-ink text-xs font-black shadow-retro-sm shadow-retro-hover cursor-pointer flex items-center justify-center"
        >
          <CopyIcon /> Copy Invite Link
        </button>
      </div>

    </div>
  );
}
