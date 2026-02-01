// Types matching backend models

export const RoomState = {
    Welcome: 'Welcome',
    Lobby: 'Lobby',
    Countdown: 'Countdown',
    InGame: 'InGame',
    GameOver: 'GameOver',
    Results: 'Results',
    Closed: 'Closed'
} as const;
export type RoomState = typeof RoomState[keyof typeof RoomState];

export const GodMood = {
    Burned: -2,
    Angry: -1,
    Neutral: 0,
    Happy: 1
} as const;
export type GodMood = typeof GodMood[keyof typeof GodMood];

export const FruitType = {
    Banana: 'Banana',
    Peach: 'Peach',
    Coconut: 'Coconut',
    Watermelon: 'Watermelon'
} as const;
export type FruitType = typeof FruitType[keyof typeof FruitType];

export const OrderStatus = {
    Active: 'Active',
    SuccessExact: 'SuccessExact',
    FailOver: 'FailOver',
    FailTimeout: 'FailTimeout'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface Player {
    playerId: string;
    name: string;
    connectionId: string;
    isConnected: boolean;
    isReady: boolean;
    hitCount: number;
    connectedAt: string;
    lastPingAt?: string;
}

export interface Order {
    orderId: string;
    required: Record<FruitType, number>;
    submitted: Record<FruitType, number>;
    startsAt: string;
    endsAt: string;
    status: OrderStatus;
}

export interface RoomStateUpdatedEvent {
    roomId: string;
    state: RoomState;
    players: Player[];
    connectedCount: number;
    readyCount: number;
}

export interface CountdownStartedEvent {
    roomId: string;
    startsAt: string;
    durationSeconds: number;
}

export interface GameStartedEvent {
    roomId: string;
    startedAt: string;
}

export interface OrderStartedEvent {
    orderId: string;
    orderNumber: number;
    required: Record<FruitType, number>;
    endsAt: string;
    durationSeconds: number;
}

export interface OrderTotalsUpdatedEvent {
    orderId: string;
    submitted: Record<FruitType, number>;
    timestamp: string;
}

export interface OrderResolvedEvent {
    orderId: string;
    result: OrderStatus;
    required: Record<FruitType, number>;
    submitted: Record<FruitType, number>;
    newMood: GodMood;
}

export interface MoodChangedEvent {
    roomId: string;
    oldMood: GodMood;
    newMood: GodMood;
}

export interface GameOverEvent {
    roomId: string;
    reason: string;
    completedOrders: number;
    successCount: number;
    failCount: number;
}

export interface PlayerStats {
    name: string;
    hitCount: number;
    contributionPercentage: number;
}

export interface GameFinishedEvent {
    roomId: string;
    totalOrders: number;
    successCount: number;
    failCount: number;
    finalMood: GodMood;
    playerStats: PlayerStats[];
}
