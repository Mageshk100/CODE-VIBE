import db from '../config/database.js';

export async function createSession(userId, { title, language, original_code, explanation }) {
  const serializedExplanation = typeof explanation === 'object' && explanation !== null
    ? JSON.stringify(explanation)
    : explanation;

  const result = await db.query(
    'INSERT INTO coding_sessions (user_id, title, language, original_code, explanation) VALUES (?, ?, ?, ?, ?)',
    [userId, title, language, original_code, serializedExplanation || null]
  );

  const sessionId = result.insertId;
  const sessions = await db.query('SELECT * FROM coding_sessions WHERE id = ?', [sessionId]);
  const session = sessions[0];

  return formatSession(session, []);
}

export async function getUserSessions(userId, { page = 1, limit = 50 } = {}) {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (p - 1) * l;

  const rows = await db.query(
    'SELECT id, title, language, created_at, updated_at FROM coding_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, l, offset]
  );

  const countRows = await db.query(
    'SELECT COUNT(*) as total FROM coding_sessions WHERE user_id = ?',
    [userId]
  );

  const total = countRows[0]?.total || 0;

  return {
    sessions: rows.map(r => ({
      id: String(r.id),
      title: r.title,
      language: r.language,
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      timestamp: new Date(r.created_at).getTime(),
      created_at: r.created_at,
      updated_at: r.updated_at,
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    },
  };
}

export async function getSessionById(sessionId, userId) {
  const sId = parseInt(sessionId, 10);
  if (isNaN(sId)) {
    const err = new Error('Invalid session ID format');
    err.statusCode = 400;
    throw err;
  }

  const sessions = await db.query('SELECT * FROM coding_sessions WHERE id = ?', [sId]);
  const session = sessions[0];

  if (!session) {
    const err = new Error('Coding session not found');
    err.statusCode = 404;
    throw err;
  }

  // Strict ownership check
  if (session.user_id !== userId) {
    const err = new Error('Access denied: You do not own this coding session');
    err.statusCode = 403;
    throw err;
  }

  // Fetch messages
  const messages = await db.query(
    'SELECT id, role, message, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
    [sId]
  );

  return formatSession(session, messages);
}

export async function addMessage(sessionId, userId, { role, message }) {
  const sId = parseInt(sessionId, 10);
  const sessions = await db.query('SELECT * FROM coding_sessions WHERE id = ?', [sId]);
  const session = sessions[0];

  if (!session) {
    const err = new Error('Coding session not found');
    err.statusCode = 404;
    throw err;
  }

  if (session.user_id !== userId) {
    const err = new Error('Access denied: You do not own this coding session');
    err.statusCode = 403;
    throw err;
  }

  const result = await db.query(
    'INSERT INTO chat_messages (session_id, role, message) VALUES (?, ?, ?)',
    [sId, role, message]
  );

  // Update session updated_at
  await db.query('UPDATE coding_sessions SET updated_at = NOW() WHERE id = ?', [sId]);

  return {
    id: `msg-${result.insertId}`,
    role,
    sender: role === 'user' ? 'user' : 'ai',
    message,
    text: message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    created_at: new Date(),
  };
}

export async function updateSession(sessionId, userId, { title, explanation }) {
  const sId = parseInt(sessionId, 10);
  const sessions = await db.query('SELECT * FROM coding_sessions WHERE id = ?', [sId]);
  const session = sessions[0];

  if (!session) {
    const err = new Error('Coding session not found');
    err.statusCode = 404;
    throw err;
  }

  if (session.user_id !== userId) {
    const err = new Error('Access denied: You do not own this coding session');
    err.statusCode = 403;
    throw err;
  }

  const serializedExplanation = typeof explanation === 'object' && explanation !== null
    ? JSON.stringify(explanation)
    : explanation;

  if (title && serializedExplanation) {
    await db.query(
      'UPDATE coding_sessions SET title = ?, explanation = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [title, serializedExplanation, sId, userId]
    );
  } else if (title) {
    await db.query(
      'UPDATE coding_sessions SET title = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [title, sId, userId]
    );
  } else if (serializedExplanation) {
    await db.query(
      'UPDATE coding_sessions SET explanation = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [serializedExplanation, sId, userId]
    );
  }

  const updated = await db.query('SELECT * FROM coding_sessions WHERE id = ?', [sId]);
  return formatSession(updated[0], []);
}

function formatSession(session, rawMessages = []) {
  let parsedExplanation = session.explanation;
  if (typeof session.explanation === 'string') {
    try {
      parsedExplanation = JSON.parse(session.explanation);
    } catch {
      parsedExplanation = session.explanation;
    }
  }

  const formattedMessages = rawMessages.map(m => ({
    id: `msg-${m.id}`,
    role: m.role,
    sender: m.role === 'user' ? 'user' : 'ai',
    message: m.message,
    text: m.message,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    created_at: m.created_at,
  }));

  return {
    id: String(session.id),
    title: session.title,
    language: session.language,
    code: session.original_code,
    original_code: session.original_code,
    explanation: parsedExplanation,
    chatMessages: formattedMessages,
    date: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    timestamp: new Date(session.created_at).getTime(),
    created_at: session.created_at,
    updated_at: session.updated_at,
  };
}
