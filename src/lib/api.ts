import type { 
  Retrospective, 
  Note, 
  CreateRetrospectiveRequest, 
  CreateNoteRequest, 
  UpdateNoteRequest 
} from '@/types/api';

const API_BASE = '/api';

// Get user from localStorage for API calls
const getUserHeaders = () => {
  const savedUser = localStorage.getItem('aztro-user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      return {
        'X-User-Name': user.name,
        'X-User-Id': user.id,
      };
    } catch (error) {
      console.error('Failed to parse saved user:', error);
    }
  }
  return {};
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getUserHeaders(),
      ...options.headers,
    },
  });
};

// Retrospectives
export const getRetrospectives = async (): Promise<Retrospective[]> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives`);
  if (!response.ok) {
    throw new Error('Failed to fetch retrospectives');
  }
  return response.json();
};

export const getRetrospective = async (id: string): Promise<Retrospective> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch retrospective');
  }
  return response.json();
};

export const createRetrospective = async (data: CreateRetrospectiveRequest): Promise<Retrospective> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create retrospective');
  }
  return response.json();
};

// Notes
export const getNotes = async (retrospectiveId: string): Promise<Note[]> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives/${retrospectiveId}/notes`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const createNote = async (retrospectiveId: string, data: CreateNoteRequest): Promise<Note> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives/${retrospectiveId}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
};

export const updateNote = async (retrospectiveId: string, noteId: string, data: UpdateNoteRequest): Promise<Note> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives/${retrospectiveId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
  return response.json();
};

export const deleteNote = async (retrospectiveId: string, noteId: string): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE}/retrospectives/${retrospectiveId}/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
};
