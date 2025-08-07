import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Plus, Trash2, Edit3, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getRetrospective, getNotes, createNote, updateNote, deleteNote } from '@/lib/api';
import { getUserInitials } from '@/lib/auth';
import { TEMPLATE_CONFIGS } from '@/types/api';
import type { Note, WebSocketEvent } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Header from './Header';

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onUpdate, onDelete, isEditable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isHovered, setIsHovered] = useState(false);

  const handleEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editContent.trim() !== note.content) {
      onUpdate(note.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className="transition-all duration-200 hover:shadow-md cursor-pointer"
        style={{ backgroundColor: note.author.color }}
        onClick={handleEdit}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback
                  className="text-xs font-medium text-black bg-transparent"
                >
                  {getUserInitials(note.author.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-black opacity-75">
                {note.author.name}
              </span>
            </div>
            {isEditable && isHovered && !isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-black/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isEditing ? (
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-sm bg-white/20 border-none text-black placeholder-black/50"
              autoFocus
            />
          ) : (
            <p className="text-sm text-black leading-relaxed">
              {note.content}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface AddNoteCardProps {
  onAdd: (content: string) => void;
}

const AddNoteCard: React.FC<AddNoteCardProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content.trim());
      setContent('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setContent('');
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <Input
            placeholder="Add your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-dashed border-2 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => setIsAdding(true)}
    >
      <CardContent className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add note</span>
        </div>
      </CardContent>
    </Card>
  );
};

const RetrospectivePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { joinRoom, leaveRoom, addListener } = useWebSocket();
  const queryClient = useQueryClient();

  const { data: retrospective } = useQuery({
    queryKey: ['retrospective', id],
    queryFn: () => getRetrospective(id!),
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => getNotes(id!),
    enabled: !!id,
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ column, content }: { column: string; content: string }) =>
      createNote(id!, { column, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      updateNote(id!, noteId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(id!, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
    },
  });

  useEffect(() => {
    if (id && user) {
      joinRoom(id, user.id, user.name, user.color);

      const removeListener = addListener((event: WebSocketEvent) => {
        if (event.type === 'note-created' || event.type === 'note-updated' || event.type === 'note-deleted') {
          queryClient.invalidateQueries({ queryKey: ['notes', id] });
        }
      });

      return () => {
        leaveRoom(id);
        removeListener();
      };
    }
  }, [id, user, joinRoom, leaveRoom, addListener, queryClient]);

  if (!retrospective || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const templateConfig = TEMPLATE_CONFIGS[retrospective.templateType];
  const notesByColumn = notes.reduce((acc, note) => {
    if (!acc[note.column]) {
      acc[note.column] = [];
    }
    acc[note.column].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const handleAddNote = (column: string, content: string) => {
    createNoteMutation.mutate({ column, content });
  };

  const handleUpdateNote = (noteId: string, content: string) => {
    updateNoteMutation.mutate({ noteId, content });
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 p-0 h-auto text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Retrospectives
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{retrospective.title}</h1>
          <p className="text-muted-foreground mb-4">{templateConfig.name}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Participants:</span>
              <div className="flex -space-x-2">
                {retrospective.participants.map((participant) => (
                  <Avatar
                    key={participant.id}
                    className="w-8 h-8 border-2 border-background"
                    title={participant.name}
                  >
                    <AvatarFallback
                      style={{ backgroundColor: participant.color }}
                      className="text-xs font-medium text-black"
                    >
                      {getUserInitials(participant.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templateConfig.columns.map((column) => (
            <div key={column} className="space-y-4">
              <h2 className="text-lg font-semibold text-center p-3 bg-muted rounded-lg">
                {column}
              </h2>
              <div className="space-y-3">
                {notesByColumn[column]?.map((note) => (
                  <StickyNote
                    key={note.id}
                    note={note}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    isEditable={note.author.id === user.id}
                  />
                ))}
                <AddNoteCard onAdd={(content) => handleAddNote(column, content)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetrospectivePage;
