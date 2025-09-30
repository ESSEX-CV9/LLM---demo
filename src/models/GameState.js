// models/GameState.js
class GameState {
    constructor() {
        this.player = {
            name: '冒险者',
            level: 1,
            hp: 100,
            maxHp: 100,
            experience: 0,
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            stats: {
                baseAttack: 10,
                baseDefense: 5,
                speed: 8
            }
        };
        
        this.world = {
            currentLocation: '地牢入口',
            timeOfDay: '下午',
            weather: '晴朗',
            discoveredLocations: ['地牢入口'],
            availableItems: []
        };
        
        this.conversation = {
            history: [],
            context: ''
        };
        
        this.battle = {
            isInBattle: false,
            currentBattle: null,
            battleHistory: []
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

    updateBattleState(battleData) {
        Object.assign(this.battle, battleData);
    }

    addDiscoveredLocation(location) {
        if (!this.world.discoveredLocations.includes(location)) {
            this.world.discoveredLocations.push(location);
        }
    }

    addAvailableItem(item) {
        this.world.availableItems.push({
            ...item,
            id: Date.now() + Math.random(),
            discovered: false
        });
    }

    removeAvailableItem(itemId) {
        this.world.availableItems = this.world.availableItems.filter(item => item.id !== itemId);
    }

    // 计算玩家实际攻击力（基础攻击力 + 等级加成 + 装备加成）
    getPlayerAttack() {
        const baseAttack = this.player.stats.baseAttack;
        const levelBonus = (this.player.level - 1) * 5; // 每级增加5点攻击力
        const weaponBonus = this.player.equipment.weapon ? (this.player.equipment.weapon.attack || 0) : 0;
        return baseAttack + levelBonus + weaponBonus;
    }

    // 计算玩家实际防御力（基础防御力 + 等级加成 + 装备加成）
    getPlayerDefense() {
        const baseDefense = this.player.stats.baseDefense;
        const levelBonus = (this.player.level - 1) * 3; // 每级增加3点防御力
        const armorBonus = this.player.equipment.armor ? (this.player.equipment.armor.defense || 0) : 0;
        return baseDefense + levelBonus + armorBonus;
    }

    // 获取玩家完整属性（包含计算后的攻防）
    getPlayerStats() {
        return {
            ...this.player,
            attack: this.getPlayerAttack(),
            defense: this.getPlayerDefense(),
            speed: this.player.stats.speed
        };
    }

    getContextualState() {
        return {
            player: this.getPlayerStats(), // 使用计算后的属性
            world: this.world,
            battle: this.battle,
            recentHistory: this.conversation.history.slice(-5)
        };
    }
}

export default GameState;