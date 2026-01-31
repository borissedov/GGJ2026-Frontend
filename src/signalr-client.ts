import * as signalR from "@microsoft/signalr";
import type {
    RoomStateUpdatedEvent,
    CountdownStartedEvent,
    GameStartedEvent,
    OrderStartedEvent,
    OrderTotalsUpdatedEvent,
    OrderResolvedEvent,
    MoodChangedEvent,
    GameOverEvent,
    GameFinishedEvent
} from "./types";

export class GameClient {
    private connection: signalR.HubConnection;
    private eventHandlers: Map<string, Function[]> = new Map();
    
    constructor(hubUrl: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();
        
        this.setupEventHandlers();
    }
    
    private setupEventHandlers() {
        this.connection.on("RoomStateUpdated", (event: RoomStateUpdatedEvent) => {
            this.emit("RoomStateUpdated", event);
        });
        
        this.connection.on("CountdownStarted", (event: CountdownStartedEvent) => {
            this.emit("CountdownStarted", event);
        });
        
        this.connection.on("CountdownCancelled", () => {
            this.emit("CountdownCancelled");
        });
        
        this.connection.on("GameStarted", (event: GameStartedEvent) => {
            this.emit("GameStarted", event);
        });
        
        this.connection.on("OrderStarted", (event: OrderStartedEvent) => {
            this.emit("OrderStarted", event);
        });
        
        this.connection.on("OrderTotalsUpdated", (event: OrderTotalsUpdatedEvent) => {
            this.emit("OrderTotalsUpdated", event);
        });
        
        this.connection.on("OrderResolved", (event: OrderResolvedEvent) => {
            this.emit("OrderResolved", event);
        });
        
        this.connection.on("MoodChanged", (event: MoodChangedEvent) => {
            this.emit("MoodChanged", event);
        });
        
        this.connection.on("GameOver", (event: GameOverEvent) => {
            this.emit("GameOver", event);
        });
        
        this.connection.on("GameFinished", (event: GameFinishedEvent) => {
            this.emit("GameFinished", event);
        });
        
        this.connection.on("RoomClosed", () => {
            this.emit("RoomClosed");
        });
        
        this.connection.onreconnecting(() => {
            console.log("SignalR reconnecting...");
        });
        
        this.connection.onreconnected(() => {
            console.log("SignalR reconnected");
        });
        
        this.connection.onclose(() => {
            console.log("SignalR connection closed");
        });
    }
    
    async start(): Promise<void> {
        await this.connection.start();
        console.log("SignalR connected");
    }
    
    async createRoom(): Promise<{ roomId: string, joinCode: string }> {
        return await this.connection.invoke("CreateRoom");
    }
    
    on(event: string, handler: Function) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }
    
    private emit(event: string, ...args: any[]) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }
}
