import React from 'react';

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

// Mock room details
const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Sarah (You)', task: 'Coding React dashboard', status: 'Focusing', progress: 0.65, color: 'bg-tomato' },
  { id: '2', name: 'Alex K.', task: 'Refactoring CSS variables', status: 'Focusing', progress: 0.45, color: 'bg-tomato' },
  { id: '3', name: 'Jordan P.', task: 'Designing SVG icons', status: 'Break', progress: 0.85, color: 'bg-short' },
  { id: '4', name: 'Taylor M.', task: 'Reviewing pull request', status: 'Idle', progress: 0, color: 'bg-app-mt' }
];

const MOCK_FEED = [
  { time: '21:35', text: 'Alex K. completed a focus session!' },
  { time: '21:30', text: 'Taylor M. joined the session room.' },
  { time: '21:28', text: 'Jordan P. started a short break.' },
  { time: '21:20', text: 'Active Session: Letterpress Lab was created.' }
];

export default function GroupSession({ onInviteCopied }) {
  
  const handleInviteClick = () => {
    const inviteUrl = 'https://focustomato.app/room/letterpress-lab';
    navigator.clipboard.writeText(inviteUrl);
    if (onInviteCopied) {
      onInviteCopied();
    }
  };

  return (
    <div className="h-full flex flex-col font-sans text-app-ink justify-between overflow-hidden">
      
      {/* Upper Half: Participants list */}
      <div className="flex-1 flex flex-col overflow-hidden mb-4">
        {/* Header */}
        <div className="flex items-center justify-between text-[10px] uppercase font-extrabold tracking-[2.5px] text-app-mt mb-3.5 select-none">
          <span><GroupIcon /> Group Session</span>
          <span className="text-[9px] font-black border border-app-br/30 px-2 py-0.5 rounded bg-app-card">
            Room: #104
          </span>
        </div>

        {/* Participant list */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
          {MOCK_PARTICIPANTS.map((user) => {
            const isFocusing = user.status === 'Focusing';
            const isBreak = user.status === 'Break';
            
            return (
              <div 
                key={user.id}
                className="p-3 border-2 border-app-br bg-app-card rounded-lg shadow-retro-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black truncate max-w-[150px]">
                    {user.name}
                  </span>
                  
                  {/* Status label */}
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border border-app-br/30 ${
                    isFocusing 
                      ? 'text-tomato bg-app-tl' 
                      : isBreak 
                        ? 'text-short bg-short/10' 
                        : 'text-app-mt bg-app-bg'
                  }`}>
                    {user.status}
                  </span>
                </div>

                {/* Subtask / Focus details */}
                <div className="text-[10px] italic text-app-mt truncate mb-2 font-semibold">
                  Working on: {user.task}
                </div>

                {/* Progress bar line */}
                {user.progress > 0 && (
                  <div className="w-full h-2 border border-app-br bg-app-bg overflow-hidden rounded-full">
                    <div 
                      className={`h-full border-r border-app-br ${user.color}`} 
                      style={{ width: `${user.progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Half: Activity Feed & Log */}
      <div className="h-[120px] flex flex-col overflow-hidden border-t-2 border-app-br/30 pt-3 mb-3">
        <div className="flex items-center text-[9px] uppercase font-extrabold tracking-[2px] text-app-mt mb-2 select-none">
          <FeedIcon /> Activity Feed
        </div>
        
        {/* Feed scroll container */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 font-semibold">
          {MOCK_FEED.map((feed, idx) => (
            <div key={idx} className="text-[10px] text-app-mt leading-normal">
              <span className="text-app-ink font-extrabold mr-1.5">[{feed.time}]</span>
              {feed.text}
            </div>
          ))}
        </div>
      </div>

      {/* Button Row: Invite Friends */}
      <button 
        onClick={handleInviteClick}
        className="w-full py-2.5 rounded-lg border-[3px] border-app-br bg-app-card text-app-ink text-xs font-black shadow-retro-sm shadow-retro-hover cursor-pointer flex items-center justify-center"
      >
        <CopyIcon /> Invite Friends
      </button>

    </div>
  );
}
