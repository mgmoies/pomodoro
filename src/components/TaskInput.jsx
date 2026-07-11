import React, { useState } from 'react';

// Clean line SVGs for checklist interactions
const CheckIcon = () => (
  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} text-app-mt hover:text-tomato transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4 text-app-mt mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const TomatoSmallIcon = () => (
  <svg className="w-3.5 h-3.5 text-tomato inline-block mr-0.5 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0c-3 0-5.5 1.5-6.5 4-1 2.5-.5 5.5 1.5 7.5s5 2.5 7.5 1.5c2.5-1 4-3.5 4-6.5s-1.5-5.5-4-6.5c-.7-.3-1.6-.5-2.5-.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c.5-1.5 1.5-2.5 3-2.5M12 6c-.5-1.5-1.5-2.5-3-2.5" />
  </svg>
);

export default function TaskInput({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  activeTaskId, 
  onSetActiveTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask
}) {
  const [inputText, setInputText] = useState('');
  const [subInput, setSubInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddTask(inputText.trim());
      setInputText('');
    }
  };

  const handleSubSubmit = (e, taskId) => {
    e.preventDefault();
    if (subInput.trim() && onAddSubtask) {
      onAddSubtask(taskId, subInput.trim());
      setSubInput('');
    }
  };

  return (
    <div id="tasks" className="h-full flex flex-col font-sans text-app-ink">
      <div className="flex items-center text-[10px] uppercase font-extrabold tracking-[2.5px] text-app-mt mb-4 select-none">
        <ListIcon /> Tasks
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input 
          className="flex-1 px-4 py-3 rounded-lg border-[3px] border-app-br bg-app-card text-sm text-app-ink placeholder-app-mt/60 outline-none focus:border-tomato transition-colors"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What are you working on?"
          maxLength={60}
          aria-label="Task input"
        />
        <button 
          type="submit"
          className="px-5 py-3 rounded-lg border-[3px] border-app-br bg-tomato hover:bg-tomato-dark text-white text-xs font-extrabold whitespace-nowrap shadow-retro-sm shadow-retro-hover cursor-pointer"
        >
          + Add
        </button>
      </form>

      {/* Task list container - scrollable and flex-1 */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 pb-4">
        {tasks.map((task) => {
          const isActive = task.id === activeTaskId;
          return (
            <div 
              key={task.id}
              onClick={() => onSetActiveTask(task.id)}
              className={`group flex flex-col px-4 py-3.5 rounded-lg border-[3px] border-app-br cursor-pointer transition-all ${
                isActive 
                  ? 'bg-app-tl shadow-retro border-tomato' 
                  : task.completed
                    ? 'opacity-55 bg-app-card/50 shadow-none translate-y-[2px]'
                    : 'bg-app-card shadow-retro-sm hover:border-tomato/70'
              }`}
            >
              {/* Task Row */}
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  className={`w-5 h-5 rounded-full border-2 border-app-br flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-tomato border-transparent' 
                      : 'bg-white hover:border-tomato'
                  }`}
                >
                  {task.completed && <CheckIcon />}
                </button>

                {/* Task Name & Metadata (Creator, completed Pomodoros) */}
                <div className="flex-1 flex items-center justify-between min-w-0 pr-2 select-none">
                  <span className={`text-sm font-extrabold truncate ${
                    task.completed ? 'line-through text-app-mt font-bold' : 'text-app-ink'
                  }`}>
                    {task.name}
                  </span>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Creator label tag */}
                    <span className="text-[9px] italic text-app-mt font-bold">
                      by {task.createdBy}
                    </span>

                    {/* Focus Cycle count */}
                    {task.pomosCompleted > 0 && (
                      <span 
                        className="flex items-center text-[10px] font-black text-tomato border border-tomato/30 px-1.5 py-0.5 rounded bg-tomato/5" 
                        title={`${task.pomosCompleted} focus cycles completed`}
                      >
                        <TomatoSmallIcon /> {task.pomosCompleted}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 cursor-pointer"
                  title="Delete task"
                >
                  <TrashIcon />
                </button>
              </div>

              {/* Nested Subtasks area */}
              {((task.subtasks && task.subtasks.length > 0) || isActive) && (
                <div 
                  className="ml-6 pl-4 border-l-2 border-app-br/30 mt-2.5 flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Subtasks list */}
                  {task.subtasks && task.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 group/sub py-0.5">
                      <button 
                        type="button"
                        onClick={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
                        className={`w-4 h-4 rounded-full border-2 border-app-br flex items-center justify-center transition-all ${
                          sub.completed 
                            ? 'bg-tomato border-transparent' 
                            : 'bg-white hover:border-tomato'
                        }`}
                      >
                        {sub.completed && <CheckIcon />}
                      </button>

                      <span className={`flex-1 text-[11px] font-extrabold truncate ${
                        sub.completed ? 'line-through text-app-mt' : 'text-app-ink'
                      }`}>
                        {sub.name}
                      </span>

                      <button 
                        type="button"
                        onClick={() => onDeleteSubtask && onDeleteSubtask(task.id, sub.id)}
                        className="opacity-0 group-hover/sub:opacity-100 focus:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        title="Delete subtask"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Subtask Form */}
                  {isActive && (
                    <form 
                      onSubmit={(e) => handleSubSubmit(e, task.id)}
                      className="flex gap-2 items-center mt-1"
                    >
                      <input 
                        type="text"
                        value={subInput}
                        onChange={(e) => setSubInput(e.target.value)}
                        placeholder="Add sub-task..."
                        className="flex-1 bg-transparent border-b-2 border-app-br text-[11px] py-0.5 outline-none placeholder-app-mt/50 text-app-ink font-bold focus:border-tomato"
                        maxLength={40}
                      />
                      <button 
                        type="submit" 
                        className="text-xs font-black text-tomato px-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                      >
                        +
                      </button>
                    </form>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
