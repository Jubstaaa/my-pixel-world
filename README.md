# My Pixel World

Real-time collaborative pixel art editor built with Next.js, Socket.IO, and TypeScript.

## Project Structure

This project is split into two parts:

- **`client/`**: Next.js frontend application (deployed on Vercel)
- **`server/`**: Node.js + Socket.IO backend (deployed on Render.com)

## Quick Start

### Development

1. **Start the server:**

```bash
cd server
npm install
cp env.example .env
npm run dev
```

2. **Start the client:**

```bash
cd client
npm install
cp env.local.example .env.local
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

#### Server (Render.com)

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - `CORS_ORIGIN=https://your-vercel-app.vercel.app`

#### Client (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SERVER_URL`: Your Render.com server URL
   - `NEXT_PUBLIC_APP_NAME`: Pixel Art Editor

## Features

- 🎨 Real-time collaborative pixel drawing
- 🖌️ Multiple drawing tools (pen, eraser, hand)
- 🎨 Color picker with custom colors
- 🗺️ Large navigable canvas
- 👥 Multi-user collaboration
- 📱 Responsive design
- ⚡ TypeScript support
- 🚀 Optimized for production

## Technologies

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Socket.IO Client
- HTML5 Canvas
- Material Design Icons
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Socket.IO
- Express.js
- CORS

## Environment Variables

### Server (.env)

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)

```
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Pixel Art Editor
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License
