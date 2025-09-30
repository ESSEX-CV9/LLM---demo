// models/GameState.js
class GameState {
    constructor() {
        this.player = {
            name: '冒险者',
            level: 1,
            hp: 100,
            maxHp: 100,
            experience: 0,
            inventory: []
        };
        
        this.world = {
            currentLocation: '地牢入口',
            timeOfDay: '下午',
            weather: '晴朗'
        };
        
        this.conversation = {
            history: [],
            context: ''
        };
        
        this.gameFlags = new Map();
    }

    updatePlayer(updates) {
        Object.assign(this.player, updates);
    }

    updateWorld(updates) {
        Object.assign(this.world, updates);
    }

    addToHistory(message) {
        this.conversation.history.push({
            timestamp: Date.now(),
            ...message
        });
        
        // 保持历史记录在合理范围内
        if (this.conversation.history.length > 20) {
            this.conversation.history = this.conversation.history.slice(-15);
        }
    }

    getContextualState() {
        return {
            player: this.player,
            world: this.world,
            recentHistory: this.conversation.history.slice(-5)
        };
    }
}

export default GameState;