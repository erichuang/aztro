# Overview

Aztro is a real-time retrospective tool built as a single-page application focused on team collaboration. The application allows teams to conduct retrospectives using predefined templates like "What Went Well/To Improve/Action Items", "Start/Stop/Continue", "Mad/Sad/Glad", and "4Ls". Users can create retrospectives, add sticky notes to different columns, and collaborate in real-time with other team members.

# User Journey

The first time a user opens the webapp, it will prompt them to enter their name to log in.

Once logged in, the user can see a list of existing retrospectives or create a new one. The list of existing retrospectives is displayed in a card format, showing the title, template type, last updated timestamp, and a list of participants' user icons. And the list is sorted by the last updated timestamp, with the most recent retrospectives at the top.

The user can create a new retrospective by clicking a button, which will open a modal to enter the title and select the template type from a list of options in card format. After the new retrospective is created, it is saved to the list of existing retrospectives, and the user is redirected to the retrospective page.

On the retrospective page, the user can see the title, template type, and a list of participants. The user can add sticky notes to different columns based on the selected template. Each sticky note has a title, content and the owner (the user who created the note). Users can edit their own notes. They can also delete their own notes by hovering over them and clicking the trash icon. There is a link to return to the list of retrospectives.

When a user adds a new note, updates a note or removes a note, the other users in the same retrospective room should see their page updated in near real time.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for global state (theme, user authentication)
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Real-time Updates**: WebSocket integration for live collaboration features

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Data Layer**: Use lowdb for local JSON-based storage
- **Development**: Hot module replacement and development middleware through Vite integration

## Authentication System
- **Simple Name-based Authentication**: Users enter their name to create a session
- **Session Persistence**: Browser localStorage for user session management
- **No Password Required**: Streamlined user experience focused on quick team collaboration
- **Logout**: Users should be able to log out, clearing their session data
- **Theme Color Generation**: Deterministic HSL color generation based on username hash. The theme color should be used for user identification in the UI, as well as for background color of sticky notes. The color should look visually distinct but accessible as a background color for black text.

## Real-time Collaboration
- **WebSocket Server**: Built on top of HTTP server for bidirectional communication
- **Event Types**: Support for respective creation, note creation, updates, deletion, and user presence
- **Room-based Communication**: Users join retrospective-specific rooms for isolated collaboration
- **Auto-save**: Debounced note updates with 500ms delay to reduce server load

## Data Models
- **User Schema**: ID, name, and generated theme color. The user name should be unique, and if the user logs in with the same name, they should regain the identity of the previous identity.
- **Retrospective Schema**: ID, title, template type, creation timestamp, last update timestamp, and participants
- **Note Schema**: ID, content, author, column assignment, and retrospective association
- **Template System**: Predefined column configurations for different retrospective formats

## UI/UX Design Decisions
- **Component Architecture**: Modular Shadcn/ui components with custom styling
- **Theme Support**: Dark/light mode toggle with CSS custom properties
- **Responsive Design**: Mobile-first approach using Tailwind's responsive utilities
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Visual Feedback**: Toast notifications and loading states for user actions
- **Branding**: Generate a logo that is modern, and reflects the collaborative nature of retrospectives. The logo should be visually appealing and suitable for both light and dark themes.

# External Dependencies

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **Shadcn/ui**: Pre-built component library with consistent design tokens
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Backend Services
- **Express.js**: Web server framework
- **WebSocket (ws)**: Real-time bidirectional communication
- **lowdb**: Local JSON database

## Data Validation
- **Zod**: Runtime type validation for API requests and form data
- **React Hook Form**: Form state management with validation integration

## State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Context**: Client-side global state for user and theme data

## Development Environment
- **TSX**: TypeScript execution for development server

## Deployment
- **Docker**: Use node:22 base image to run in production
