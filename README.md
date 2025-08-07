# Aztro - Team Retrospective Tool

A modern, real-time retrospective application built for team collaboration. Aztro allows teams to conduct retrospectives using predefined templates, add sticky notes, and collaborate in real-time.

## Features

- **Real-time Collaboration**: See updates from team members instantly
- **Multiple Templates**: Choose from popular retrospective formats
  - What Went Well / To Improve / Action Items
  - Start / Stop / Continue
  - Mad / Sad / Glad
  - 4 Ls (Liked / Learned / Lacked / Longed For)
- **Simple Authentication**: Name-based login with persistent sessions
- **Collaborative Editing**: Add, edit, and delete sticky notes
- **Beautiful UI**: Modern design with dark/light theme support
- **Responsive Design**: Works seamlessly on desktop and mobile

## Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with Shadcn/ui components
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **WebSocket** integration for real-time features

### Backend
- **Node.js** with Express.js
- **WebSocket Server** for real-time communication
- **LowDB** for local JSON-based storage
- **Zod** for runtime validation

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone or download the project files
2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (Vite dev server) and backend (Express server) concurrently.

4. Open your browser and navigate to:
```
http://localhost:5173
```

The application will automatically proxy API requests to the backend server running on port 3001.

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm run server
```

## Project Structure

```
aztro/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── Login.tsx           # Login page
│   │   ├── RetrospectiveList.tsx
│   │   ├── RetrospectivePage.tsx
│   │   ├── Header.tsx
│   │   └── CreateRetrospectiveModal.tsx
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # User authentication
│   │   └── ThemeProvider.tsx   # Theme management
│   ├── hooks/                  # Custom React hooks
│   │   └── useWebSocket.ts     # WebSocket integration
│   ├── lib/                    # Utility functions
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # Auth utilities
│   │   └── utils.ts            # General utilities
│   ├── types/                  # TypeScript type definitions
│   │   └── api.ts              # Shared API types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── server/                      # Backend source code
│   ├── index.ts                # Main server file
│   ├── database.ts             # Database setup
│   ├── routes.ts               # API routes
│   └── websocket.ts            # WebSocket handlers
├── dist/                       # Built frontend files
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Usage

### Creating Your First Retrospective

1. **Login**: Enter your name to create a session
2. **Create**: Click "New Retrospective" and choose a template
3. **Collaborate**: Share the URL with team members
4. **Add Notes**: Click "Add note" in any column to contribute
5. **Real-time**: See updates from teammates instantly

### Features in Detail

#### Templates
- **What Went Well**: Focus on positives, improvements, and actionable items
- **Start/Stop/Continue**: Identify behaviors to change or maintain
- **Mad/Sad/Glad**: Express emotional responses to events
- **4 Ls**: Comprehensive reflection on experience

#### Note Management
- **Add**: Click "Add note" in any column
- **Edit**: Click on your own notes to edit inline
- **Delete**: Hover over your notes and click the trash icon
- **Real-time Sync**: All changes appear instantly for all participants

#### User Experience
- **Theme Toggle**: Switch between light and dark modes
- **Responsive**: Optimized for desktop, tablet, and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **User Colors**: Each user gets a unique, deterministic color

## Development

### Scripts
- `npm run dev` - Start development servers (frontend + backend)
- `npm run client` - Start only the frontend (Vite dev server)
- `npm run server` - Start only the backend (Express server)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Environment Variables
The application works out of the box with defaults. For production, you may want to set:
- `PORT` - Server port (default: 3001)

### Database
The application uses LowDB with a JSON file for storage. The database file is created automatically at `/tmp/db.json` and contains:
- Users
- Retrospectives
- Notes

### WebSocket Events
Real-time features use WebSocket with these event types:
- `retrospective-created`
- `note-created`
- `note-updated`
- `note-deleted`
- `user-joined`

## Customization

### Adding New Templates
Edit `src/types/api.ts` and add to `TEMPLATE_CONFIGS`:

```typescript
'custom-template': {
  name: 'Custom Template',
  description: 'Your template description',
  columns: ['Column 1', 'Column 2', 'Column 3'],
}
```

### Styling
The app uses Tailwind CSS with CSS custom properties for theming. Modify `src/index.css` to customize colors and styles.

### Components
UI components are built with Radix UI primitives and can be customized in `src/components/ui/`.

## Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## License
MIT License - see the code for details.

## Contributing
This is an example implementation. Feel free to fork and modify for your needs!

---

**Aztro** - Making retrospectives collaborative and engaging! 🚀
