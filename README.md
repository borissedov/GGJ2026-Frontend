# Oh My Hungry God - Host Display

Vanilla TypeScript web app for the multiplayer AR game host display.

## Features

- **Real-time WebSocket Communication**: SignalR client for live updates
- **Multiple Screens**: Welcome, Lobby, Countdown, Game, Results
- **Mood Video System**: Video background changes based on god's mood
- **QR Code Generation**: Easy room joining for mobile players
- **Responsive Design**: Optimized for large displays (TV/projector)

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure backend URL:**

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:

```
VITE_BACKEND_URL=http://localhost:5000/gamehub
```

3. **Add mood videos:**

Place your mood videos in `public/assets/videos/`:
- `neutral.mp4` - Neutral mood
- `happy.mp4` - Happy mood
- `angry.mp4` - Angry mood
- `burned.mp4` - Burned/game over mood

## Running Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Deployment

### Option 1: Cloudflare Pages (Recommended) ⚡

Fastest, free, unlimited bandwidth!

See **[CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md)** for complete guide.

Quick start:
```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=oh-my-hungry-god
```

### Option 2: Azure Static Web Apps

1. Create Static Web App in Azure Portal
2. Connect your repository
3. Set build configuration:
   - App location: `/oh-my-hungry-god-display`
   - Output location: `dist`
4. Add environment variable: `VITE_BACKEND_URL`

### Option 3: Other Static Hosts

Build and deploy `dist/` folder to:
- Netlify
- Vercel
- GitHub Pages
- Azure Blob Storage + CDN

## Project Structure

```
src/
├── main.ts                  # Application entry point
├── signalr-client.ts        # SignalR connection wrapper
├── types.ts                 # TypeScript type definitions
├── ui/
│   ├── welcome-screen.ts    # QR code + join code display
│   ├── lobby-screen.ts      # Player list + ready states
│   ├── countdown-screen.ts  # 10s countdown animation
│   ├── game-screen.ts       # Order display + mood + totals
│   └── results-screen.ts    # Final stats
├── state/
│   └── game-state.ts        # Client-side state management
└── utils/
    ├── qr-generator.ts      # QR code generation
    └── video-manager.ts     # Mood video playback
```

## Usage

1. Open the display on a TV/projector
2. The app will automatically connect to the backend and create a room
3. Players scan the QR code or enter the join code on their phones
4. When all players are ready, countdown starts
5. Play through 10 orders
6. View results at the end

## Customization

### Styling

Edit `src/style.css` to customize colors, fonts, and animations.

### Video Paths

Update video paths in `src/utils/video-manager.ts` if you store videos elsewhere.

### Backend URL

For development: `http://localhost:5000/gamehub`
For production: `https://your-app.azurewebsites.net/gamehub`
