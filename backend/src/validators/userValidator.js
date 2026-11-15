import { z } from 'zod';
import { errorResponse } from '../utils/response.js';

export const updateUserSchema = z.object({
  display_name: z.string().min(1, 'Display name cannot be empty').max(255),
});

export function validateUser(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse(res, err.issues[0]?.message || 'Validation error', 400);
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
}
