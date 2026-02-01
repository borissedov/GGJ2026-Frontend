import './style.css';
import { GameClient } from './signalr-client';
import { GameState } from './state/game-state';
import { WelcomeScreen } from './ui/welcome-screen';
import { LobbyScreen } from './ui/lobby-screen';
import { CountdownScreen } from './ui/countdown-screen';
import { GameScreen } from './ui/game-screen';
import { ResultsScreen } from './ui/results-screen';
import { MoodVideoManager } from './utils/video-manager';
import { RoomState } from './types';

// Configuration - UPDATE THIS WITH YOUR BACKEND URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/gamehub';

const app = document.querySelector<HTMLDivElement>('#app')!;
const videoContainer = document.querySelector<HTMLDivElement>('#video-background')!;

const client = new GameClient(BACKEND_URL);
const state = new GameState();
const videoManager = new MoodVideoManager(videoContainer);

const welcomeScreen = new WelcomeScreen();
const lobbyScreen = new LobbyScreen();
const countdownScreen = new CountdownScreen();
const gameScreen = new GameScreen();
const resultsScreen = new ResultsScreen();

let countdownInterval: number | null = null;
let timerInterval: number | null = null;

async function init() {
    try {
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
        if (countdownInterval !== null) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    });
    
    client.on('GameStarted', () => {
        console.log('Game started!');
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
        state.updateTotals(event);
        renderGameScreen();
    });
    
    client.on('OrderResolved', (event: any) => {
        state.resolveOrder(event);
        
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Update game screen briefly to show result
        renderGameScreen();
    });
    
    client.on('MoodChanged', (event: any) => {
        state.mood = event.newMood;
        videoManager.setMood(event.newMood);
    });
    
    client.on('GameOver', (event: any) => {
        state.totalOrders = event.completedOrders;
        renderResultsScreen(true);
    });
    
    client.on('GameFinished', (event: any) => {
        state.totalOrders = event.totalOrders;
        state.successCount = event.successCount;
        state.failCount = event.failCount;
        state.mood = event.finalMood;
        renderResultsScreen(false);
    });
}

function renderWelcomeScreen() {
    app.innerHTML = welcomeScreen.render(state.joinCode, state.roomId);
}

function renderLobbyScreen(players: any[], connectedCount: number, readyCount: number) {
    app.innerHTML = lobbyScreen.render(players, connectedCount, readyCount);
}

function renderCountdownScreen(secondsRemaining: number) {
    app.innerHTML = countdownScreen.render(secondsRemaining);
}

function renderGameScreen() {
    if (!state.currentOrder || state.mood === null) return;
    
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
    
    app.innerHTML = resultsScreen.render(
        state.totalOrders,
        state.successCount,
        state.failCount,
        state.mood,
        burnout
    );
}

init();
