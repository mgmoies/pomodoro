import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, remove, onDisconnect } from 'firebase/database';

// 1. Read configuration values from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};

const hasFirebase = !!(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);

let db = null;

if (hasFirebase) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    console.log('GroupSync: Connected to remote Firebase Realtime Database.');
  } catch (error) {
    console.error('GroupSync: Firebase initialization failed, falling back to Local Tab Sync:', error);
  }
} else {
  console.log('GroupSync: No Firebase credentials found. Using local BroadcastChannel tab sync.');
}

// 2. Local Tab Sync simulation using BroadcastChannel when Firebase is not configured
let localRoomState = {
  participants: {},
  tasks: {}
};

let broadcastChannel = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  broadcastChannel = new BroadcastChannel('focustomato_group_room');
}

// Global list of listener callbacks for the BroadcastChannel simulation
const localListeners = new Set();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { type, payload, senderId } = event.data;

    // Avoid self-message loops if they occur
    if (typeof window !== 'undefined' && window.__tomatoClientId === senderId) return;

    console.log(`GroupSync [LocalChannel]: Received event "${type}" from tab "${senderId}"`, payload);

    if (type === 'REQUEST_SYNC') {
      // If we have state, reply with it
      broadcastChannel.postMessage({
        type: 'SYNC_RESPONSE',
        payload: localRoomState,
        senderId: typeof window !== 'undefined' ? window.__tomatoClientId : 'sys'
      });
    } else if (type === 'SYNC_RESPONSE') {
      localRoomState = payload;
      triggerLocalListeners();
    } else if (type === 'PARTICIPANT_UPDATE') {
      const { userId, participantState } = payload;
      if (participantState === null) {
        delete localRoomState.participants[userId];
      } else {
        localRoomState.participants[userId] = participantState;
      }
      triggerLocalListeners();
    } else if (type === 'TASK_UPDATE') {
      const { taskId, taskState } = payload;
      if (taskState === null) {
        delete localRoomState.tasks[taskId];
      } else {
        localRoomState.tasks[taskId] = taskState;
      }
      triggerLocalListeners();
    }
  };
}

function triggerLocalListeners() {
  localListeners.forEach(cb => cb(JSON.parse(JSON.stringify(localRoomState))));
}

// Generate unique client tab ID if not set
if (typeof window !== 'undefined' && !window.__tomatoClientId) {
  window.__tomatoClientId = Math.random().toString(36).substring(2, 11);
  console.log(`GroupSync: Tab initialized with ClientID "${window.__tomatoClientId}"`);
}

// 3. Exported Group Sync API
export const publishParticipantState = async (roomId, userId, participantState) => {
  if (db) {
    const participantRef = ref(db, `rooms/${roomId}/participants/${userId}`);
    await set(participantRef, participantState);
    
    // Register Firebase Presence: if the client crashes or closes, the server automatically removes them
    try {
      onDisconnect(participantRef).remove();
    } catch (e) {
      console.warn('GroupSync: Could not register onDisconnect handler.', e);
    }
  } else if (broadcastChannel) {
    if (participantState === null) {
      delete localRoomState.participants[userId];
    } else {
      localRoomState.participants[userId] = participantState;
    }
    broadcastChannel.postMessage({
      type: 'PARTICIPANT_UPDATE',
      payload: { userId, participantState },
      senderId: window.__tomatoClientId
    });
    triggerLocalListeners();
  }
};

export const removeParticipantState = async (roomId, userId) => {
  if (db) {
    const participantRef = ref(db, `rooms/${roomId}/participants/${userId}`);
    // Cancel the pending disconnect listener first
    try {
      onDisconnect(participantRef).cancel();
    } catch (e) {}
    await remove(participantRef);
  } else if (broadcastChannel) {
    delete localRoomState.participants[userId];
    broadcastChannel.postMessage({
      type: 'PARTICIPANT_UPDATE',
      payload: { userId, participantState: null },
      senderId: window.__tomatoClientId
    });
    triggerLocalListeners();
  }
};

export const publishTaskState = async (roomId, taskId, taskState) => {
  if (db) {
    const taskRef = ref(db, `rooms/${roomId}/tasks/${taskId}`);
    await set(taskRef, taskState);
  } else if (broadcastChannel) {
    if (taskState === null) {
      delete localRoomState.tasks[taskId];
    } else {
      localRoomState.tasks[taskId] = taskState;
    }
    broadcastChannel.postMessage({
      type: 'TASK_UPDATE',
      payload: { taskId, taskState },
      senderId: window.__tomatoClientId
    });
    triggerLocalListeners();
  }
};

export const removeTaskState = async (roomId, taskId) => {
  if (db) {
    const taskRef = ref(db, `rooms/${roomId}/tasks/${taskId}`);
    await remove(taskRef);
  } else if (broadcastChannel) {
    delete localRoomState.tasks[taskId];
    broadcastChannel.postMessage({
      type: 'TASK_UPDATE',
      payload: { taskId, taskState: null },
      senderId: window.__tomatoClientId
    });
    triggerLocalListeners();
  }
};

export const subscribeToRoom = (roomId, onUpdate) => {
  if (db) {
    const roomRef = ref(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
      const val = snapshot.val() || { participants: {}, tasks: {} };
      if (!val.participants) val.participants = {};
      if (!val.tasks) val.tasks = {};
      onUpdate(val);
    });
  } else {
    localListeners.add(onUpdate);
    // Request sync from existing tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'REQUEST_SYNC',
        senderId: window.__tomatoClientId
      });
    }
    // Instantly invoke with current state
    onUpdate(JSON.parse(JSON.stringify(localRoomState)));

    return () => {
      localListeners.delete(onUpdate);
    };
  }
};
