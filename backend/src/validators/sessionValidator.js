import { z } from 'zod';
import { errorResponse } from '../utils/response.js';

const ALLOWED_LANGUAGES = ['python', 'java', 'c', 'cpp', 'javascript'];

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title too long'),
  language: z.enum(ALLOWED_LANGUAGES, {
    errorMap: () => ({ message: `Language must be one of: ${ALLOWED_LANGUAGES.join(', ')}` }),
  }),
  original_code: z.string().min(1, 'Code cannot be empty'),
  explanation: z.union([z.string(), z.record(z.any())]).optional().nullable(),
});

export const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: "Role must be 'user' or 'assistant'" }),
  }),
  message: z.string().min(1, 'Message cannot be empty'),
});

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  explanation: z.union([z.string(), z.record(z.any())]).optional().nullable(),
});

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstIssue = err.issues[0]?.message || 'Validation error';
        return errorResponse(res, firstIssue, 400, err.issues);
      }
      return errorResponse(res, 'Invalid request payload', 400);
    }
  };
}
