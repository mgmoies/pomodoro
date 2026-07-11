import { useEffect, useState, useRef } from 'react';
import { 
  subscribeToRoom, 
  publishParticipantState, 
  removeParticipantState, 
  publishTaskState,
  removeTaskState
} from '../firebase';

export default function useGroupSync({
  enabled = true,
  roomId,
  userId,
  userName,
  activeTaskId,
  timerState
}) {
  const [participants, setParticipants] = useState([]);
  const [roomName, setRoomName] = useState('Letterpress Lab');
  const [roomTasks, setRoomTasks] = useState([]);
  
  const roomTasksRef = useRef([]);
  roomTasksRef.current = roomTasks;

  const timerStateRef = useRef(timerState);
  timerStateRef.current = timerState;

  // 1. Subscribe to Real-time Room Database updates
  useEffect(() => {
    if (!enabled) return;

    console.log(`GroupSync: Connecting hook to room "${roomId}" as user "${userId}" (${userName}).`);

    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      if (!roomData) return;

      // Extract participants (excluding self)
      const rawParticipants = roomData.participants || {};
      const peerList = Object.entries(rawParticipants)
        .filter(([id]) => id !== userId)
        .map(([id, data]) => ({
          id,
          name: data.name || 'Tomato Member',
          task: data.activeTask || '',
          status: data.status || 'Idle',
          progress: data.progress || 0,
          lastHeartbeat: data.lastHeartbeat || 0
        }));

      // Filter out stale participants (inactive for > 40s)
      const now = Date.now();
      const activePeers = peerList.filter(p => now - p.lastHeartbeat < 40000);
      
      console.log(`GroupSync: Synchronized peers in "${roomId}". Active count: ${activePeers.length}`);
      setParticipants(activePeers);

      if (roomData.roomName) {
        setRoomName(roomData.roomName);
      }

      // Sync tasks list
      const rawTasks = roomData.tasks || {};
      const taskList = Object.values(rawTasks).map(t => ({
        id: t.id,
        name: t.name || '',
        completed: !!t.completed,
        createdBy: t.createdBy || 'Unknown',
        pomosCompleted: t.pomosCompleted || 0,
        subtasks: t.subtasks || []
      }));

      // Sort tasks by creation timestamp (id is timestamp string)
      taskList.sort((a, b) => a.id.localeCompare(b.id));

      console.log(`GroupSync: Synchronized shared tasks in "${roomId}". Task count: ${taskList.length}`);
      setRoomTasks(taskList);
    });

    return () => {
      console.log(`GroupSync: Disconnecting hook from room "${roomId}".`);
      unsubscribe();
      // Clean up our participant card on exit
      removeParticipantState(roomId, userId);
    };
  }, [roomId, userId, enabled]);

  // 2. Periodic loop to update participant progress and heartbeat
  useEffect(() => {
    if (!enabled) return;

    const updateParticipant = () => {
      const localTimer = timerStateRef.current;
      
      // Calculate timer progress percentage
      let progress = 0;
      if (localTimer.status === 'running' || localTimer.status === 'paused') {
        const elapsed = localTimer.duration - localTimer.timeLeft;
        progress = Math.min(1, Math.max(0, elapsed / localTimer.duration));
      }

      // Map timer state to participant status string
      let statusString = 'Idle';
      if (localTimer.status === 'running') {
        statusString = localTimer.mode === 'pomo' ? 'Focusing' : 'Break';
      } else if (localTimer.status === 'paused') {
        statusString = 'Paused';
      }

      // Look up active task name from the current room tasks state
      const activeTask = roomTasksRef.current.find(t => t.id === activeTaskId);
      const activeTaskName = activeTask && !activeTask.completed ? activeTask.name : '';

      publishParticipantState(roomId, userId, {
        name: userName,
        activeTask: activeTaskName,
        status: statusString,
        progress,
        lastHeartbeat: Date.now()
      });
    };

    // Update immediately
    updateParticipant();

    // Heartbeat every 10 seconds
    const interval = setInterval(updateParticipant, 10000);

    return () => clearInterval(interval);
  }, [roomId, userId, userName, activeTaskId, timerState.status, timerState.mode, timerState.duration, enabled]);

  // 3. Shared Tasks modifier actions
  const getTaskById = (taskId) => {
    return roomTasksRef.current.find(t => t.id === taskId);
  };

  const addTask = async (name, creator) => {
    const id = Date.now().toString();
    const newTask = {
      id,
      name,
      completed: false,
      createdBy: creator,
      pomosCompleted: 0,
      subtasks: []
    };
    await publishTaskState(roomId, id, newTask);
  };

  const toggleTask = async (taskId) => {
    const task = getTaskById(taskId);
    if (!task) return;
    const updated = {
      ...task,
      completed: !task.completed
    };
    await publishTaskState(roomId, taskId, updated);
  };

  const deleteTask = async (taskId) => {
    await removeTaskState(roomId, taskId);
  };

  const addSubtask = async (taskId, subName) => {
    const task = getTaskById(taskId);
    if (!task) return;
    const nextSubtasks = [...(task.subtasks || []), {
      id: Date.now().toString() + Math.random().toString(),
      name: subName,
      completed: false
    }];
    await publishTaskState(roomId, taskId, {
      ...task,
      subtasks: nextSubtasks
    });
  };

  const toggleSubtask = async (taskId, subId) => {
    const task = getTaskById(taskId);
    if (!task) return;
    const nextSub = (task.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    await publishTaskState(roomId, taskId, {
      ...task,
      subtasks: nextSub
    });
  };

  const deleteSubtask = async (taskId, subId) => {
    const task = getTaskById(taskId);
    if (!task) return;
    const nextSub = (task.subtasks || []).filter(s => s.id !== subId);
    await publishTaskState(roomId, taskId, {
      ...task,
      subtasks: nextSub
    });
  };

  const incrementTaskPomos = async (taskId) => {
    const task = getTaskById(taskId);
    if (!task) return;
    const updated = {
      ...task,
      pomosCompleted: (task.pomosCompleted || 0) + 1
    };
    await publishTaskState(roomId, taskId, updated);
  };

  return {
    participants,
    roomName,
    roomTasks,
    addTask,
    toggleTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    incrementTaskPomos
  };
}
