import './style.css';
import { GameClient } from './signalr-client';
import { GameState } from './state/game-state';
import { WelcomeScreen } from './ui/welcome-screen';
import { LobbyScreen } from './ui/lobby-screen';
import { CountdownScreen } from './ui/countdown-screen';
import { GameScreen } from './ui/game-screen';
import { ResultsScreen } from './ui/results-screen';
import { LoadingScreen } from './ui/loading-screen';
import { MoodVideoManager } from './utils/video-manager';
import { RoomState } from './types';

// Configuration - UPDATE THIS WITH YOUR BACKEND URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/gamehub';

const app = document.querySelector<HTMLDivElement>('#app')!;
const videoContainer = document.querySelector<HTMLDivElement>('#video-background')!;

const client = new GameClient(BACKEND_URL);
const state = new GameState();
const videoManager = new MoodVideoManager(videoContainer);

const loadingScreen = new LoadingScreen();
const welcomeScreen = new WelcomeScreen();
const lobbyScreen = new LobbyScreen();
const countdownScreen = new CountdownScreen();
const gameScreen = new GameScreen();
const resultsScreen = new ResultsScreen();

let countdownInterval: number | null = null;
let timerInterval: number | null = null;

async function init() {
    try {
        console.log('🎬 Starting initialization...');
        
        // Show loading screen
        renderLoadingScreen();
        
        // Preload all videos
        console.log('📹 Preloading videos...');
        await videoManager.preloadAllVideos();
        console.log('✅ Videos preloaded');
        
        console.log(`🚀 Connecting to backend: ${BACKEND_URL}`);
        
        // Setup event handlers BEFORE starting connection
        setupEventHandlers();
        
        await client.start();
        console.log('✅ Connected to backend');
        
        const { roomId, joinCode } = await client.createRoom();
        state.roomId = roomId;
        state.joinCode = joinCode;
        
        console.log(`🎮 Room created - ID: ${roomId}, Code: ${joinCode}`);
        
        renderWelcomeScreen();
        
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        app.innerHTML = `
            <div class="error-screen">
                <h1>Connection Error</h1>
                <p>Failed to connect to game server</p>
                <p class="error-details">${error}</p>
                <p>Make sure the backend server is running at: ${BACKEND_URL}</p>
            </div>
        `;
    }
}

function renderLoadingScreen() {
    document.body.className = ''; // No background during loading
    // Update loading screen periodically
    const updateProgress = () => {
        const progress = videoManager.getLoadingProgress();
        app.innerHTML = loadingScreen.render(progress);
        
        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        }
    };
    
    updateProgress();
}

function setupEventHandlers() {
    client.on('RoomStateUpdated', (event: any) => {
        console.log('📢 RoomStateUpdated received:', event);
        console.log(`   State: ${event.state}, Connected: ${event.connectedCount}, Ready: ${event.readyCount}`);
        state.state = event.state;
        state.players = event.players;
        
        // Handle state transitions (state can be number or string)
        const stateValue = typeof event.state === 'number' ? event.state : event.state;
        
        // State: 0=Welcome, 1=Lobby, 2=Countdown, 3=InGame, 4=GameOver, 5=Results
        if (stateValue === 1 || stateValue === 'Lobby' || stateValue === RoomState.Lobby) {
            console.log('→ Rendering Lobby screen');
            renderLobbyScreen(event.players, event.connectedCount, event.readyCount);
        } else if (stateValue === 2 || stateValue === 'Countdown' || stateValue === RoomState.Countdown) {
            console.log('→ Countdown state detected, but countdown already started by CountdownStarted event');
            // Countdown screen is handled by CountdownStarted event
        }
    });
    
    client.on('CountdownStarted', (event: any) => {
        console.log('⏰ Countdown started!', event);
        const duration = event.durationSeconds;
        let remaining = duration;
        
        const updateCountdown = () => {
            renderCountdownScreen(remaining);
            remaining--;
            
            if (remaining < 0 && countdownInterval !== null) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        };
        
        updateCountdown();
        countdownInterval = window.setInterval(updateCountdown, 1000);
    });
    
    client.on('CountdownCancelled', () => {
        console.log('❌ Countdown cancelled');
        if (countdownInterval !== null) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        // Return to lobby
        if (state.players.length > 0) {
            const connectedPlayers = state.players.filter(p => p.isConnected);
            const readyPlayers = connectedPlayers.filter(p => p.isReady);
            renderLobbyScreen(state.players, connectedPlayers.length, readyPlayers.length);
        }
    });
    
    client.on('GameStarted', async () => {
        console.log('🎮 Game started!');
        // Clear countdown interval
        if (countdownInterval !== null) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        // Start with neutral mood video
        if (state.mood === null) {
            state.mood = 0; // Neutral
        }
        console.log('🎭 Starting neutral mood video for game start');
        // Force the mood video to play (we're coming from lobby/countdown)
        await videoManager.setMood(0, true);
    });
    
    client.on('OrderStarted', (event: any) => {
        state.updateOrder(event);
        
        // Start timer
        state.timeRemaining = event.durationSeconds;
        
        const updateTimer = () => {
            if (state.currentOrder && state.timeRemaining > 0) {
                state.timeRemaining--;
                renderGameScreen();
            }
        };
        
        if (timerInterval !== null) {
            clearInterval(timerInterval);
        }
        timerInterval = window.setInterval(updateTimer, 1000);
        
        renderGameScreen();
    });
    
    client.on('OrderTotalsUpdated', (event: any) => {
        console.log('📊 OrderTotalsUpdated:', event);
        state.updateTotals(event);
        renderGameScreen();
        
        // Play chewing animation on each hit
        const currentMood = state.mood !== null ? state.mood : 0;
        videoManager.playChewingOnly(currentMood);
    });
    
    client.on('OrderResolved', (event: any) => {
        const oldMood = state.mood !== null ? state.mood : 0; // Default to neutral if null
        state.resolveOrder(event);
        const newMood = event.newMood;
        
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Update game screen briefly to show result
        renderGameScreen();
        
        // Only transition to new mood (no chewing - that happens on hits)
        console.log(`🍽️ Order resolved: ${oldMood} → ${newMood}`);
        if (oldMood !== newMood) {
            videoManager.transitionToMood(oldMood, newMood, () => {
                console.log('✅ Transition complete');
            });
        }
    });
    
    client.on('MoodChanged', (event: any) => {
        state.mood = event.newMood;
        // Don't call setMood here - mood change is handled in playChewing flow
        console.log(`😊 Mood changed to: ${event.newMood}`);
    });
    
    client.on('GameOver', (event: any) => {
        console.log('💀 Game Over - Burnout');
        state.totalOrders = event.completedOrders;
        
        // Play defeat video
        videoManager.playGameOver(false);
        
        renderResultsScreen(true);
    });
    
    client.on('GameFinished', (event: any) => {
        console.log('🎉 Game Finished');
        state.totalOrders = event.totalOrders;
        state.successCount = event.successCount;
        state.failCount = event.failCount;
        state.mood = event.finalMood;
        
        // Play victory video if all 10 orders completed
        const isVictory = event.totalOrders >= 10;
        if (isVictory) {
            videoManager.playGameOver(true);
        }
        
        renderResultsScreen(false);
    });
}

async function renderWelcomeScreen() {
    document.body.className = 'lobby-background';
    app.innerHTML = welcomeScreen.render(state.joinCode, state.roomId);
    await videoManager.setLobbyWaiting();
}

async function renderLobbyScreen(players: any[], connectedCount: number, readyCount: number) {
    document.body.className = 'lobby-background';
    app.innerHTML = lobbyScreen.render(players, connectedCount, readyCount, state.joinCode);
    await videoManager.setLobbyWaiting();
}

function renderCountdownScreen(secondsRemaining: number) {
    document.body.className = 'game-background';
    app.innerHTML = countdownScreen.render(secondsRemaining);
}

function renderGameScreen() {
    if (!state.currentOrder || state.mood === null) return;
    
    document.body.className = 'game-background';
    app.innerHTML = gameScreen.render(
        state.orderNumber,
        state.currentOrder.required,
        state.currentSubmitted,
        state.mood,
        state.timeRemaining
    );
}

function renderResultsScreen(burnout: boolean) {
    if (state.mood === null) return;
    
    document.body.className = 'game-background';
    app.innerHTML = resultsScreen.render(
        state.totalOrders,
        state.successCount,
        state.failCount,
        state.mood,
        burnout
    );
}

init();
