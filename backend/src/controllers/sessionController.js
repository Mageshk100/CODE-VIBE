import * as sessionService from '../services/sessionService.js';
import { successResponse } from '../utils/response.js';

export async function createSession(req, res) {
  const session = await sessionService.createSession(req.user.id, req.body);
  return successResponse(res, 'Coding session created successfully', session, 201);
}

export async function listSessions(req, res) {
  const result = await sessionService.getUserSessions(req.user.id, req.query);
  return successResponse(res, 'Coding sessions retrieved successfully', result);
}

export async function getSession(req, res) {
  const session = await sessionService.getSessionById(req.params.id, req.user.id);
  return successResponse(res, 'Session retrieved successfully', session);
}

export async function addMessage(req, res) {
  const message = await sessionService.addMessage(req.params.id, req.user.id, req.body);
  return successResponse(res, 'Message added to session successfully', message, 201);
}

export async function updateSession(req, res) {
  const session = await sessionService.updateSession(req.params.id, req.user.id, req.body);
  return successResponse(res, 'Session updated successfully', session);
}
