// models/GameState.js
class GameState {
    constructor() {
        this.player = {
            name: '冒险者',
            level: 1,
            hp: 100,
            maxHp: 100,
            // 新增资源：法力与耐力
            mana: 50,
            maxMana: 50,
            stamina: 50,
            maxStamina: 50,
            // 成长与技能
            experience: 0,
            skillPoints: 4,
            skills: [],
            inventory: [],
            equipment: {
                weapon: null,
                helmet: null,
                chest: null,
                legs: null,
                boots: null,
                ring: null,
                necklace: null,
                amulet: null
            },
            stats: {
                baseAttack: 10,
                baseDefense: 5,
                speed: 8,
                // 新增派生基础：魔法/物理强度
                baseMagicPower: 5,
                basePhysicalPower: 10,
                // 装备加成属性
                equipmentAttackBonus: 0,
                equipmentDefenseBonus: 0,
                equipmentMagicPowerBonus: 0,
                equipmentPhysicalPowerBonus: 0,
                equipmentSpeedBonus: 0,
                equipmentCriticalChanceBonus: 0
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
        const equipmentBonus = this.player.stats.equipmentAttackBonus || 0;
        return baseAttack + levelBonus + equipmentBonus;
    }

    // 计算玩家实际防御力（基础防御力 + 等级加成 + 装备加成）
    getPlayerDefense() {
        const baseDefense = this.player.stats.baseDefense;
        const levelBonus = (this.player.level - 1) * 3; // 每级增加3点防御力
        const equipmentBonus = this.player.stats.equipmentDefenseBonus || 0;
        return baseDefense + levelBonus + equipmentBonus;
    }

    // 计算玩家魔法强度（基础 + 等级 + 装备）
    getPlayerMagicPower() {
        const base = this.player.stats.baseMagicPower || 0;
        const levelBonus = (this.player.level - 1) * 3; // 每级+3魔强
        const equipmentBonus = this.player.stats.equipmentMagicPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    // 计算玩家物理强度（基础 + 等级 + 装备）
    getPlayerPhysicalPower() {
        const base = this.player.stats.basePhysicalPower || 0;
        const levelBonus = (this.player.level - 1) * 4; // 每级+4物强
        const equipmentBonus = this.player.stats.equipmentPhysicalPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    // 计算玩家速度（基础 + 装备加成）
    getPlayerSpeed() {
        const baseSpeed = this.player.stats.speed || 8;
        const equipmentBonus = this.player.stats.equipmentSpeedBonus || 0;
        return baseSpeed + equipmentBonus;
    }

    // 计算玩家暴击率（装备加成）
    getPlayerCriticalChance() {
        const equipmentBonus = this.player.stats.equipmentCriticalChanceBonus || 0;
        return equipmentBonus;
    }

    // 获取玩家完整属性（包含计算后的攻防与魔法/物理强度）
    getPlayerStats() {
        return {
            ...this.player,
            attack: this.getPlayerAttack(),
            defense: this.getPlayerDefense(),
            magicPower: this.getPlayerMagicPower(),
            physicalPower: this.getPlayerPhysicalPower(),
            speed: this.getPlayerSpeed(),
            criticalChance: this.getPlayerCriticalChance()
        };
    }

    // 获取装备总览信息
    getEquipmentSummary() {
        const equipment = this.player.equipment;
        let equippedCount = 0;
        let totalValue = 0;

        for (const [slot, item] of Object.entries(equipment)) {
            if (item) {
                equippedCount++;
                totalValue += item.value || 0;
            }
        }

        return {
            equippedCount,
            totalSlots: Object.keys(equipment).length,
            totalValue,
            equipmentBonuses: {
                attack: this.player.stats.equipmentAttackBonus || 0,
                defense: this.player.stats.equipmentDefenseBonus || 0,
                magicPower: this.player.stats.equipmentMagicPowerBonus || 0,
                physicalPower: this.player.stats.equipmentPhysicalPowerBonus || 0,
                speed: this.player.stats.equipmentSpeedBonus || 0,
                criticalChance: this.player.stats.equipmentCriticalChanceBonus || 0
            }
        };
    }

    // 检查装备槽位是否为空
    isEquipmentSlotEmpty(slot) {
        return !this.player.equipment[slot];
    }

    // 获取指定槽位的装备
    getEquippedItem(slot) {
        return this.player.equipment[slot] || null;
    }

    // 获取所有已装备的物品
    getAllEquippedItems() {
        const equipped = [];
        for (const [slot, item] of Object.entries(this.player.equipment)) {
            if (item) {
                equipped.push({ slot, ...item });
            }
        }
        return equipped;
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