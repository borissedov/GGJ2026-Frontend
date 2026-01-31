import type {
    RoomState,
    GodMood,
    Player,
    OrderStartedEvent,
    OrderTotalsUpdatedEvent,
    OrderResolvedEvent
} from "../types";
import { FruitType } from "../types";

export class GameState {
    roomId: string = '';
    joinCode: string = '';
    state: RoomState | null = null;
    mood: GodMood | null = null;
    players: Player[] = [];
    
    currentOrder: OrderStartedEvent | null = null;
    currentSubmitted: Record<FruitType, number> = {
        [FruitType.Banana]: 0,
        [FruitType.Peach]: 0,
        [FruitType.Coconut]: 0,
        [FruitType.Watermelon]: 0
    };
    
    orderNumber: number = 0;
    timeRemaining: number = 0;
    
    successCount: number = 0;
    failCount: number = 0;
    totalOrders: number = 0;
    
    updateOrder(event: OrderStartedEvent) {
        this.currentOrder = event;
        this.orderNumber = event.orderNumber;
        this.timeRemaining = event.durationSeconds;
        
        // Reset submitted
        this.currentSubmitted = {
            [FruitType.Banana]: 0,
            [FruitType.Peach]: 0,
            [FruitType.Coconut]: 0,
            [FruitType.Watermelon]: 0
        };
    }
    
    updateTotals(event: OrderTotalsUpdatedEvent) {
        this.currentSubmitted = event.submitted;
    }
    
    resolveOrder(event: OrderResolvedEvent) {
        if (event.result === 'SuccessExact') {
            this.successCount++;
        } else {
            this.failCount++;
        }
        this.mood = event.newMood;
    }
}
