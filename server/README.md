# Pixel Art Server

Real-time collaborative pixel art server built with Node.js, TypeScript, and Socket.IO.

## Features

- Real-time drawing synchronization
- Canvas history management
- TypeScript support
- Environment configuration
- Health check endpoints

## Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp env.example .env
```

3. Start development server:

```bash
npm run dev
```

## Production Build

1. Build the project:

```bash
npm run build
```

2. Start production server:

```bash
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: CORS origin (default: \*)
- `CLIENT_URL`: Client application URL

## Deployment on Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - `CORS_ORIGIN=https://your-vercel-app.vercel.app`

## API Endpoints

- `GET /`: Server info
- `GET /health`: Health check

## Socket.IO Events

### Client to Server

- `draw`: Send drawing data
- `clear-canvas`: Clear canvas

### Server to Client

- `drawing-history`: Send canvas history
- `draw`: Broadcast drawing data
- `clear-canvas`: Broadcast canvas clear
