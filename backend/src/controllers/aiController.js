import { generateExplanation, generateTitle, generateChatResponse } from '../services/geminiService.js';
import * as sessionService from '../services/sessionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * POST /api/ai/explain
 * Body: { language, code }
 * Auth: required (Firebase token)
 *
 * Calls Gemini to generate a structured 5-part explanation,
 * saves a new coding session to MySQL, returns session + explanation.
 */
export async function explainCode(req, res) {
  const { language, code } = req.body;

  if (!language || typeof language !== 'string') {
    return errorResponse(res, 'language is required', 400);
  }
  if (!code || typeof code !== 'string' || code.trim().length < 5) {
    return errorResponse(res, 'code must be a non-empty string (minimum 5 characters)', 400);
  }
  if (code.length > 10000) {
    return errorResponse(res, 'code exceeds maximum allowed length of 10,000 characters', 400);
  }

  // Generate explanation and title in parallel
  const [explanation, title] = await Promise.all([
    generateExplanation(language, code),
    generateTitle(language, code),
  ]);

  // Persist to MySQL as a new coding session
  const session = await sessionService.createSession(req.user.id, {
    title,
    language,
    original_code: code,
    explanation,
  });

  return successResponse(res, 'Code explanation generated successfully', {
    session,
    explanation,
  }, 201);
}

/**
 * POST /api/ai/chat/:sessionId
 * Body: { message }
 * Auth: required (Firebase token)
 *
 * Generates a contextual follow-up AI response for a chat question,
 * saves both user message and AI response to MySQL chat_messages.
 */
export async function chatFollowUp(req, res) {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return errorResponse(res, 'message is required', 400);
  }
  if (message.length > 2000) {
    return errorResponse(res, 'message exceeds maximum length of 2,000 characters', 400);
  }

  // Verify session ownership and fetch context
  const session = await sessionService.getSessionById(sessionId, req.user.id);

  // Get recent chat history for context
  const history = session.chatMessages || [];

  // Generate AI response from Gemini
  const aiText = await generateChatResponse(
    message,
    session.code || session.original_code || '',
    session.language,
    history,
  );

  // Persist user message to MySQL
  await sessionService.addMessage(sessionId, req.user.id, {
    role: 'user',
    message: message.trim(),
  });

  // Persist AI response to MySQL
  const aiMessage = await sessionService.addMessage(sessionId, req.user.id, {
    role: 'assistant',
    message: aiText,
  });

  return successResponse(res, 'Chat response generated', {
    userMessage: {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      sender: 'user',
      text: message.trim(),
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    aiMessage: {
      ...aiMessage,
      text: aiText,
      message: aiText,
    },
  });
}
