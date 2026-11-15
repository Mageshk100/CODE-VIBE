import { apiClient } from './apiClient.js';
import { generateSessionTitle, generateStructuredExplanation } from './mockAI.js';

const GUEST_SESSIONS_STORAGE_KEY = 'codevibe_guest_sessions';
const ACTIVE_SESSION_KEY = 'codevibe_active_session_id';
const GUEST_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours guest expiry

const INITIAL_DEMO_SESSIONS = [
  {
    id: 'demo-1',
    title: 'Java – Binary Search',
    language: 'java',
    date: 'Nov 11, 2026',
    timestamp: Date.now() - 1000 * 60 * 30,
    code: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;

            if (arr[mid] == target) {
                return mid; // Target found
            }
            if (arr[mid] < target) {
                low = mid + 1; // Discard left half
            } else {
                high = mid - 1; // Discard right half
            }
        }
        return -1; // Target not found
    }

    public static void main(String[] args) {
        int[] numbers = { 2, 5, 8, 12, 16, 23, 38, 56 };
        int result = search(numbers, 23);
        System.out.println("Index: " + result);
    }
}`,
    explanation: generateStructuredExplanation('java', `public class BinarySearch { ... binary search logic ... }`),
    chatMessages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Why do we use low + (high - low) / 2 instead of (low + high) / 2?',
        timestamp: '10:15 AM'
      },
      {
        id: 'msg-2',
        sender: 'ai',
        text: '### Integer Overflow Prevention\nIn Java, `(low + high)` can exceed `Integer.MAX_VALUE` (2,147,483,647) when working with massive arrays, resulting in an integer overflow that wraps around to negative numbers. \n\nWriting `low + (high - low) / 2` calculates the exact same mathematical midpoint without risking an arithmetic overflow.',
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    id: 'demo-2',
    title: 'Python – Two Sum',
    language: 'python',
    date: 'Nov 10, 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test execution
result = two_sum([2, 7, 11, 15], 9)
print(f"Indices: {result}")`,
    explanation: generateStructuredExplanation('python', `def two_sum(nums, target): ...`),
    chatMessages: [
      {
        id: 'msg-3',
        sender: 'user',
        text: 'What is the time complexity of this solution?',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg-4',
        sender: 'ai',
        text: '### Time & Space Complexity\n- **Time Complexity**: **O(n)** because dictionary lookups and insertions happen in amortized O(1) time across a single pass.\n- **Space Complexity**: **O(n)** because in the worst-case scenario, we store nearly all elements in the `seen` hash table.',
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: 'demo-3',
    title: 'C++ – Reverse Linked List',
    language: 'cpp',
    date: 'Nov 09, 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    code: `#include <iostream>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr != nullptr) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
    explanation: generateStructuredExplanation('cpp', `ListNode* reverseList(ListNode* head) { ... }`),
    chatMessages: []
  }
];

// Helper: check guest session validity with expiry
function getGuestSessions() {
  try {
    const raw = localStorage.getItem(GUEST_SESSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GUEST_SESSIONS_STORAGE_KEY, JSON.stringify({
        createdAt: Date.now(),
        sessions: INITIAL_DEMO_SESSIONS
      }));
      return INITIAL_DEMO_SESSIONS;
    }
    const data = JSON.parse(raw);
    // Check expiry
    if (data.createdAt && (Date.now() - data.createdAt > GUEST_EXPIRY_MS)) {
      localStorage.removeItem(GUEST_SESSIONS_STORAGE_KEY);
      return INITIAL_DEMO_SESSIONS;
    }
    return Array.isArray(data.sessions) ? data.sessions : INITIAL_DEMO_SESSIONS;
  } catch {
    return INITIAL_DEMO_SESSIONS;
  }
}

function saveGuestSessions(sessions) {
  try {
    localStorage.setItem(GUEST_SESSIONS_STORAGE_KEY, JSON.stringify({
      createdAt: Date.now(),
      sessions
    }));
  } catch (err) {
    console.error('Failed to save guest sessions', err);
  }
}

export function getActiveSessionId() {
  return localStorage.getItem(ACTIVE_SESSION_KEY) || null;
}

export function setActiveSessionId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } else {
    localStorage.setItem(ACTIVE_SESSION_KEY, 'new');
  }
}

/**
 * Fetch sessions list.
 * For registered users, queries the backend API.
 * For guests, reads from temporary local storage.
 */
export async function fetchSessions(isLoggedIn = false) {
  if (!isLoggedIn) {
    return getGuestSessions();
  }

  try {
    const res = await apiClient.get('/sessions');
    if (res.success && res.data?.sessions) {
      return res.data.sessions;
    }
    return [];
  } catch (err) {
    console.warn('[Session Service] Backend session fetch notice:', err.message);
    return getGuestSessions();
  }
}

/**
 * Fetch full session details by ID
 */
export async function fetchSessionDetails(sessionId, isLoggedIn = false) {
  if (!isLoggedIn || sessionId.startsWith('demo-')) {
    const local = getGuestSessions();
    return local.find(s => s.id === sessionId) || null;
  }

  try {
    const res = await apiClient.get(`/sessions/${sessionId}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.warn('[Session Service] Failed to fetch session details from backend:', err.message);
    const local = getGuestSessions();
    return local.find(s => s.id === sessionId) || null;
  }
}

/**
 * Create a new coding session
 */
export async function createSessionRecord({ language, code, explanation, isLoggedIn = false }) {
  const title = generateSessionTitle(language, code);

  if (isLoggedIn) {
    try {
      const res = await apiClient.post('/sessions', {
        title,
        language,
        original_code: code,
        explanation
      });
      if (res.success && res.data) {
        setActiveSessionId(res.data.id);
        return res.data;
      }
    } catch (err) {
      console.warn('[Session Service] Failed to save session to backend, using local store:', err.message);
    }
  }

  // Guest flow or local fallback
  const guestSessions = getGuestSessions();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const newSession = {
    id: 'guest-session-' + Date.now(),
    title,
    language,
    date: dateFormatted,
    timestamp: Date.now(),
    code,
    explanation,
    chatMessages: []
  };

  const updated = [newSession, ...guestSessions];
  saveGuestSessions(updated);
  setActiveSessionId(newSession.id);
  return newSession;
}

/**
 * Append chat message to session
 */
export async function appendMessageToSession(sessionId, message, isLoggedIn = false) {
  if (isLoggedIn && !sessionId.startsWith('guest-') && !sessionId.startsWith('demo-')) {
    try {
      const role = message.sender === 'user' ? 'user' : 'assistant';
      const res = await apiClient.post(`/sessions/${sessionId}/messages`, {
        role,
        message: message.text || message.message
      });
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('[Session Service] Failed to persist message to backend:', err.message);
    }
  }

  // Guest or fallback flow
  const localSessions = getGuestSessions();
  const updated = localSessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        chatMessages: [...(s.chatMessages || []), message]
      };
    }
    return s;
  });
  saveGuestSessions(updated);
  return message;
}

// Backward-compatibility exports for existing components
export const getSavedSessions = getGuestSessions;
export const createNewSessionRecord = createSessionRecord;
export const addMessageToSession = appendMessageToSession;
