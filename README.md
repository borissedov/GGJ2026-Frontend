# Oh My Hungry God - Host Display

Vanilla TypeScript web app for the multiplayer AR game host display.

## Features

- **Real-time WebSocket Communication**: SignalR client for live updates
- **Multiple Screens**: Welcome, Lobby, Countdown, Game, Results
- **Enhanced Visuals**: Logo branding, particle effects, emoji highlights
- **Circular Arc Timer**: Visual countdown ring for each order
- **Mood Video System**: Dynamic transitions between mood states with chewing animations
- **Player Names**: Displays player names instead of IDs
- **Per-Player Statistics**: Individual contribution tracking
- **Team Rating**: Star-based rating (0-3) based on final mood
- **QR Code Generation**: Easy room joining for mobile players
- **Restart Functionality**: Play again button on results screen
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

3. **Add required assets:**

Place assets in `public/assets/`:

**Images:**
- `images/logo-small.png` - Small logo for loading screen (100-150px)
- `images/logo-large.png` - Large logo for welcome screen (300-400px)
- `images/background-lobby.jpg` - Lobby background (already included)

**Videos:**
All videos in `videos/` directory (already included):
- `moods/` - Mood loops (neutral, happy, angry)
- `animations/` - Chewing animations
- `transitions/` - Mood transition videos
- `endings/` - Victory, defeat, neutral_ending, angry_ending
- `lobby/` - Waiting video

## Running Locally

```bash
npm install  # First time only
npm run dev
```

Open http://localhost:5173 in your browser.

**Note**: Make sure you have a `.env` file with your backend URL (copy from `.env.example`).

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
wrangler pages deploy dist
```

Configuration is already in `wrangler.toml`!

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
│   ├── loading-screen.ts    # Loading state display
│   ├── countdown-screen.ts  # 6s countdown animation
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
3. Logo and QR code displayed on welcome screen
4. Players scan the QR code or enter the join code with their names
5. When all players are ready, 6-second countdown starts
6. Play through 10 orders with visual feedback:
   - Circular arc timer depletes for each order
   - Particle effects on successful hits
   - Emoji highlights when requirements update
   - Mood videos transition smoothly
7. View results with team stars and per-player statistics
8. Click "Play Again" to restart with a new room

## Customization

### Styling

Edit `src/style.css` to customize colors, fonts, and animations.

### Video Paths

Update video paths in `src/utils/video-manager.ts` if you store videos elsewhere.

### Backend URL

For development: `http://localhost:5000/gamehub`
For production: `https://your-app.azurewebsites.net/gamehub`
