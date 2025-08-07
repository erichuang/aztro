import { z } from 'zod'

// Base schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
})

export const TemplateTypeSchema = z.enum([
  'what-went-well',
  'start-stop-continue', 
  'mad-sad-glad',
  '4ls'
])

export const RetrospectiveSchema = z.object({
  id: z.string(),
  title: z.string(),
  templateType: TemplateTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  participants: z.array(UserSchema),
})

export const NoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: UserSchema,
  column: z.string(),
  retrospectiveId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// API Request schemas
export const CreateRetrospectiveRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  templateType: TemplateTypeSchema,
})

export const CreateNoteRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  column: z.string(),
})

export const UpdateNoteRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
})

export const LoginRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

// WebSocket event schemas
export const WebSocketEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('retrospective-created'),
    data: RetrospectiveSchema,
  }),
  z.object({
    type: z.literal('note-created'),
    data: NoteSchema,
  }),
  z.object({
    type: z.literal('note-updated'),
    data: NoteSchema,
  }),
  z.object({
    type: z.literal('note-deleted'),
    data: z.object({
      id: z.string(),
      retrospectiveId: z.string(),
    }),
  }),
  z.object({
    type: z.literal('user-joined'),
    data: z.object({
      retrospectiveId: z.string(),
      user: UserSchema,
    }),
  }),
])

// Type exports
export type User = z.infer<typeof UserSchema>
export type TemplateType = z.infer<typeof TemplateTypeSchema>
export type Retrospective = z.infer<typeof RetrospectiveSchema>
export type Note = z.infer<typeof NoteSchema>
export type CreateRetrospectiveRequest = z.infer<typeof CreateRetrospectiveRequestSchema>
export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>
export type UpdateNoteRequest = z.infer<typeof UpdateNoteRequestSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>

// Template configurations
export const TEMPLATE_CONFIGS: Record<TemplateType, { 
  name: string; 
  description: string; 
  columns: string[]; 
}> = {
  'what-went-well': {
    name: 'What Went Well',
    description: 'Reflect on positives, improvements, and action items',
    columns: ['What Went Well', 'To Improve', 'Action Items'],
  },
  'start-stop-continue': {
    name: 'Start, Stop, Continue',
    description: 'Identify what to start, stop, and continue doing',
    columns: ['Start', 'Stop', 'Continue'],
  },
  'mad-sad-glad': {
    name: 'Mad, Sad, Glad',
    description: 'Express feelings about the project or sprint',
    columns: ['Mad', 'Sad', 'Glad'],
  },
  '4ls': {
    name: '4 Ls',
    description: 'Liked, Learned, Lacked, Longed for',
    columns: ['Liked', 'Learned', 'Lacked', 'Longed For'],
  },
}
