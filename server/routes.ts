import express from 'express';
import type { Database } from './database.js';
import {
  CreateRetrospectiveRequestSchema,
  CreateNoteRequestSchema,
  UpdateNoteRequestSchema
} from '../src/types/api.js';
import { generateUserColor } from '../src/lib/auth.js';

interface WebSocketHandlers {
  broadcastToRoom: (retrospectiveId: string, message: any, sender?: any) => void;
  broadcastToAll: (message: any) => void;
}

export const setupRoutes = (app: express.Application, db: Database, wsHandlers: WebSocketHandlers) => {
  // Get current user from headers (simplified auth)
  const getCurrentUser = (req: express.Request) => {
    const userName = req.headers['x-user-name'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!userName || !userId) {
      return null;
    }

    let user = db.data.users.find(u => u.id === userId);
    if (!user) {
      // Check if user exists by name first
      user = db.data.users.find(u => u.name === userName);
      if (!user) {
        user = {
          id: userId,
          name: userName,
          color: generateUserColor(userName),
        };
        db.data.users.push(user);
        db.write();
      }
    }

    return user;
  };

  // User management routes
  app.post('/api/users/by-name', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const existingUser = db.data.users.find(u => u.name === name);
      if (existingUser) {
        res.json(existingUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to find user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { id, name, color } = req.body;
      if (!id || !name || !color) {
        return res.status(400).json({ error: 'ID, name, and color are required' });
      }

      // Check if user with this name already exists
      const existingUserByName = db.data.users.find(u => u.name === name);
      if (existingUserByName) {
        return res.json(existingUserByName);
      }

      // Check if user with this ID already exists
      const existingUserById = db.data.users.find(u => u.id === id);
      if (existingUserById) {
        return res.json(existingUserById);
      }

      const newUser = { id, name, color };
      db.data.users.push(newUser);
      await db.write();

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Retrospectives
  app.get('/api/retrospectives', async (_, res) => {
    try {
      const retrospectives = db.data.retrospectives
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      res.json(retrospectives);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch retrospectives' });
    }
  });

  app.get('/api/retrospectives/:id', async (req, res) => {
    try {
      const retrospective = db.data.retrospectives.find(r => r.id === req.params.id);
      if (!retrospective) {
        return res.status(404).json({ error: 'Retrospective not found' });
      }
      res.json(retrospective);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch retrospective' });
    }
  });

  app.post('/api/retrospectives', async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = CreateRetrospectiveRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      const now = new Date().toISOString();
      const retrospective = {
        id: crypto.randomUUID(),
        title: result.data.title,
        templateType: result.data.templateType,
        createdAt: now,
        updatedAt: now,
        participants: [user],
      };

      db.data.retrospectives.push(retrospective);
      await db.write();

      // Broadcast retrospective creation to all users
      wsHandlers.broadcastToAll({
        type: 'retrospective-created',
        data: retrospective,
      });

      res.status(201).json(retrospective);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create retrospective' });
    }
  });

  // Notes
  app.get('/api/retrospectives/:id/notes', async (req, res) => {
    try {
      const notes = db.data.notes.filter(n => n.retrospectiveId === req.params.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  });

  app.post('/api/retrospectives/:id/notes', async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = CreateNoteRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      const retrospective = db.data.retrospectives.find(r => r.id === req.params.id);
      if (!retrospective) {
        return res.status(404).json({ error: 'Retrospective not found' });
      }

      // Add user to participants if not already present
      if (!retrospective.participants.some(p => p.id === user.id)) {
        retrospective.participants.push(user);
        retrospective.updatedAt = new Date().toISOString();
      }

      const now = new Date().toISOString();
      const note = {
        id: crypto.randomUUID(),
        content: result.data.content,
        author: user,
        column: result.data.column,
        retrospectiveId: req.params.id,
        createdAt: now,
        updatedAt: now,
      };

      db.data.notes.push(note);
      await db.write();

      // Broadcast note creation to other users in the room
      wsHandlers.broadcastToRoom(req.params.id, {
        type: 'note-created',
        data: note,
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create note' });
    }
  });

  app.patch('/api/retrospectives/:id/notes/:noteId', async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = UpdateNoteRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      const note = db.data.notes.find(n => n.id === req.params.noteId);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.author.id !== user.id) {
        return res.status(403).json({ error: 'You can only edit your own notes' });
      }

      note.content = result.data.content;
      note.updatedAt = new Date().toISOString();

      // Update retrospective timestamp
      const retrospective = db.data.retrospectives.find(r => r.id === req.params.id);
      if (retrospective) {
        retrospective.updatedAt = new Date().toISOString();
      }

      await db.write();

      // Broadcast note update to other users in the room
      wsHandlers.broadcastToRoom(req.params.id, {
        type: 'note-updated',
        data: note,
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update note' });
    }
  });

  app.delete('/api/retrospectives/:id/notes/:noteId', async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const noteIndex = db.data.notes.findIndex(n => n.id === req.params.noteId);
      if (noteIndex === -1) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const note = db.data.notes[noteIndex];
      if (note.author.id !== user.id) {
        return res.status(403).json({ error: 'You can only delete your own notes' });
      }

      db.data.notes.splice(noteIndex, 1);

      // Update retrospective timestamp
      const retrospective = db.data.retrospectives.find(r => r.id === req.params.id);
      if (retrospective) {
        retrospective.updatedAt = new Date().toISOString();
      }

      await db.write();

      // Broadcast note deletion to other users in the room
      wsHandlers.broadcastToRoom(req.params.id, {
        type: 'note-deleted',
        data: {
          id: req.params.noteId,
          retrospectiveId: req.params.id,
        },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });
};
