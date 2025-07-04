# My Pixel World Client

Real-time collaborative pixel art editor built with Next.js, TypeScript, and Socket.IO.

## Features

- Real-time collaborative drawing
- Multiple drawing tools (pen, eraser, hand)
- Color picker
- Large navigable canvas
- Room-based collaboration system
- Dynamic room navigation
- Material Design Icons
- TypeScript support
- Loading screen with connection status
- Responsive design

## Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp env.local.example .env.local
```

3. Start development server:

```bash
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_SERVER_URL`: Socket.IO server URL (default: http://localhost:3001)
- `NEXT_PUBLIC_APP_NAME`: Application name (default: My Pixel World)

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SERVER_URL`: Your Render.com server URL
   - `NEXT_PUBLIC_APP_NAME`: My Pixel World

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── utils/              # Utility functions
└── config/             # Configuration files
```

## Tools

- **Pen Tool**: Draw pixels on the canvas
- **Eraser Tool**: Remove pixels from the canvas
- **Hand Tool**: Navigate around the canvas
- **Color Picker**: Select drawing colors
- **Clear Canvas**: Clear all pixels

## Room System

- **Dynamic Rooms**: Create and join rooms with custom names
- **Room Navigation**: Quick access to popular rooms
- **User Count**: See how many users are in each room
- **URL-based**: Each room has its own URL (e.g., `/art`, `/pixel`)
- **Slug Normalization**: Room names are automatically converted to URL-friendly slugs

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Socket.IO Client
- HTML5 Canvas
- Material Design Icons
- Tailwind CSS
