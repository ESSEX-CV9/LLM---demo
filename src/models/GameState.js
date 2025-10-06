// models/GameState.js
class GameState {
    constructor() {
        this.player = {
            name: '冒险者',
            level: 1,
            hp: 100,
            maxHp: 100,
            // 调整资源：提高初始法力与耐力
            mana: 80,
            maxMana: 80,
            stamina: 80,
            maxStamina: 80,
            // 货币系统（以铜币为单位存储）
            currency: 1000, // 初始给予1000铜币（10银币）
            // 成长与技能
            experience: 0,
            skillPoints: 4,
            skills: [],
            inventory: [],
            equipment: {
                weapon1: null,  // 修正装备槽位名称
                weapon2: null,
                helmet: null,
                chest: null,
                legs: null,
                boots: null,
                ring: null,
                amulet: null,
                backpack: null
            },
            stats: {
                baseAttack: 12,        // 基础攻击力
                agility: 8,            // 敏捷（原speed）
                weight: 10,            // 基础重量
                physicalResistance: 0, // 物理抗性% (0-100)
                magicResistance: 0,    // 魔法抗性% (0-100)
                // 统一强度系统：物理和魔法强度作为伤害的核心
                baseMagicPower: 8,     // 基础魔法强度
                basePhysicalPower: 12, // 基础物理强度
                // 装备加成属性
                equipmentAttackBonus: 0,
                equipmentAgilityBonus: 0,
                equipmentWeightBonus: 0,
                equipmentPhysicalResistanceBonus: 0,
                equipmentMagicResistanceBonus: 0,
                equipmentMagicPowerBonus: 0,
                equipmentPhysicalPowerBonus: 0,
                equipmentCriticalChanceBonus: 0
            },
            // 临时增益系统
            tempBuffs: []
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
            context: '',
            summaries: []  // 存储历史总结
        };
        
        this.battle = {
            isInBattle: false,
            currentBattle: null,
            battleHistory: []
        };
        
        this.gameFlags = new Map();
        
        // 休息系统标志
        this.restCount = 0; // 记录休息次数
        this.actionsSinceLastRest = 4; // 记录自上次休息后的行动次数（用于休息CD），初始设为4允许开局休息
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

    // 计算玩家实际攻击力（基础攻击力 + 等级加成 + 装备加成 + 临时增益）
    getPlayerAttack() {
        const baseAttack = this.player.stats.baseAttack;
        const levelBonus = (this.player.level - 1) * 3; // 降低等级加成：每级增加3点攻击力
        const equipmentBonus = this.player.stats.equipmentAttackBonus || 0;
        const tempBonus = this.getTempStatBonus('attack');
        return baseAttack + levelBonus + equipmentBonus + tempBonus;
    }

    // 计算玩家物理抗性（基础 + 装备加成 + 临时增益），上限75%
    getPlayerPhysicalResistance() {
        const base = this.player.stats.physicalResistance || 0;
        const equipmentBonus = this.player.stats.equipmentPhysicalResistanceBonus || 0;
        const tempBonus = this.getTempStatBonus('physicalResistance');
        return Math.min(75, Math.max(0, base + equipmentBonus + tempBonus));
    }

    // 计算玩家魔法抗性（基础 + 装备加成 + 临时增益），上限75%
    getPlayerMagicResistance() {
        const base = this.player.stats.magicResistance || 0;
        const equipmentBonus = this.player.stats.equipmentMagicResistanceBonus || 0;
        const tempBonus = this.getTempStatBonus('magicResistance');
        return Math.min(75, Math.max(0, base + equipmentBonus + tempBonus));
    }

    // 计算玩家魔法强度（基础 + 等级 + 装备 + 临时增益）
    getPlayerMagicPower() {
        const base = this.player.stats.baseMagicPower || 0;
        const levelBonus = (this.player.level - 1) * 2; // 降低等级加成：每级+2魔强
        const equipmentBonus = this.player.stats.equipmentMagicPowerBonus || 0;
        const tempBonus = this.getTempStatBonus('magicPower');
        return base + levelBonus + equipmentBonus + tempBonus;
    }

    // 计算玩家物理强度（基础 + 等级 + 装备 + 临时增益）
    getPlayerPhysicalPower() {
        const base = this.player.stats.basePhysicalPower || 0;
        const levelBonus = (this.player.level - 1) * 3; // 降低等级加成：每级+3物强
        const equipmentBonus = this.player.stats.equipmentPhysicalPowerBonus || 0;
        const tempBonus = this.getTempStatBonus('physicalPower');
        return base + levelBonus + equipmentBonus + tempBonus;
    }

    // 计算玩家敏捷（基础 + 装备加成 + 临时增益）
    getPlayerAgility() {
        const baseAgility = this.player.stats.agility || 8;
        const equipmentBonus = this.player.stats.equipmentAgilityBonus || 0;
        const tempBonus = this.getTempStatBonus('agility');
        return baseAgility + equipmentBonus + tempBonus;
    }

    // 计算玩家重量（基础 + 装备加成）
    getPlayerWeight() {
        const baseWeight = this.player.stats.weight || 10;
        const equipmentBonus = this.player.stats.equipmentWeightBonus || 0;
        return Math.max(0, baseWeight + equipmentBonus);
    }

    // 获取基础属性值（不包含临时增益）
    getBasePlayerAttack() {
        const baseAttack = this.player.stats.baseAttack;
        const levelBonus = (this.player.level - 1) * 3; // 与上面保持一致
        const equipmentBonus = this.player.stats.equipmentAttackBonus || 0;
        return baseAttack + levelBonus + equipmentBonus;
    }

    getBasePlayerPhysicalResistance() {
        const base = this.player.stats.physicalResistance || 0;
        const equipmentBonus = this.player.stats.equipmentPhysicalResistanceBonus || 0;
        return Math.min(75, Math.max(0, base + equipmentBonus));
    }

    getBasePlayerMagicResistance() {
        const base = this.player.stats.magicResistance || 0;
        const equipmentBonus = this.player.stats.equipmentMagicResistanceBonus || 0;
        return Math.min(75, Math.max(0, base + equipmentBonus));
    }

    getBasePlayerMagicPower() {
        const base = this.player.stats.baseMagicPower || 0;
        const levelBonus = (this.player.level - 1) * 2; // 与上面保持一致
        const equipmentBonus = this.player.stats.equipmentMagicPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    getBasePlayerPhysicalPower() {
        const base = this.player.stats.basePhysicalPower || 0;
        const levelBonus = (this.player.level - 1) * 3; // 与上面保持一致
        const equipmentBonus = this.player.stats.equipmentPhysicalPowerBonus || 0;
        return base + levelBonus + equipmentBonus;
    }

    getBasePlayerAgility() {
        const baseAgility = this.player.stats.agility || 8;
        const equipmentBonus = this.player.stats.equipmentAgilityBonus || 0;
        return baseAgility + equipmentBonus;
    }

    getBasePlayerWeight() {
        const baseWeight = this.player.stats.weight || 10;
        const equipmentBonus = this.player.stats.equipmentWeightBonus || 0;
        return Math.max(0, baseWeight + equipmentBonus);
    }

    getBasePlayerCriticalChance() {
        const equipmentBonus = this.player.stats.equipmentCriticalChanceBonus || 0;
        return equipmentBonus;
    }

    // 计算玩家暴击率（装备加成 + 临时增益）
    getPlayerCriticalChance() {
        const equipmentBonus = this.player.stats.equipmentCriticalChanceBonus || 0;
        const tempBonus = this.getTempStatBonus('criticalChance');
        return equipmentBonus + tempBonus;
    }

    // 添加临时增益
    addTempBuff(buff) {
        // 确保 tempBuffs 数组存在
        if (!this.player.tempBuffs || !Array.isArray(this.player.tempBuffs)) {
            this.player.tempBuffs = [];
        }
        
        const tempBuff = {
            id: Date.now() + Math.random(), // 唯一ID
            name: buff.name,
            stats: buff.stats || {},
            duration: buff.duration || 1,
            remainingTurns: buff.duration || 1,
            timestamp: Date.now()
        };
        this.player.tempBuffs.push(tempBuff);
        return tempBuff.id;
    }

    // 移除临时增益
    removeTempBuff(buffId) {
        if (!this.player.tempBuffs || !Array.isArray(this.player.tempBuffs)) {
            return false;
        }
        
        const index = this.player.tempBuffs.findIndex(buff => buff.id === buffId);
        if (index !== -1) {
            this.player.tempBuffs.splice(index, 1);
            return true;
        }
        return false;
    }

    // 减少临时增益持续时间
    decreaseTempBuffDuration() {
        if (!this.player.tempBuffs || !Array.isArray(this.player.tempBuffs)) {
            return 0;
        }
        
        const expiredBuffs = [];
        this.player.tempBuffs.forEach(buff => {
            buff.remainingTurns--;
            if (buff.remainingTurns <= 0) {
                expiredBuffs.push(buff.id);
            }
        });
        
        // 移除过期的增益
        expiredBuffs.forEach(buffId => this.removeTempBuff(buffId));
        return expiredBuffs.length;
    }

    // 获取指定属性的临时增益总和
    getTempStatBonus(statName) {
        if (!this.player.tempBuffs || !Array.isArray(this.player.tempBuffs)) {
            return 0;
        }
        return this.player.tempBuffs.reduce((total, buff) => {
            return total + (buff.stats[statName] || 0);
        }, 0);
    }

    // 获取所有临时增益
    getAllTempBuffs() {
        if (!this.player.tempBuffs || !Array.isArray(this.player.tempBuffs)) {
            return [];
        }
        return [...this.player.tempBuffs];
    }

    // 清除所有临时增益
    clearAllTempBuffs() {
        this.player.tempBuffs = [];
    }

    // 获取玩家完整属性（包含计算后的攻防与魔法/物理强度）
    getPlayerStats() {
        return {
            ...this.player,
            attack: this.getPlayerAttack(),
            physicalResistance: this.getPlayerPhysicalResistance(),
            magicResistance: this.getPlayerMagicResistance(),
            magicPower: this.getPlayerMagicPower(),
            physicalPower: this.getPlayerPhysicalPower(),
            agility: this.getPlayerAgility(),
            weight: this.getPlayerWeight(),
            criticalChance: this.getPlayerCriticalChance(),
            // 添加临时增益信息
            tempBuffs: this.getAllTempBuffs(),
            hasTempBuffs: (this.player.tempBuffs && Array.isArray(this.player.tempBuffs)) ? this.player.tempBuffs.length > 0 : false
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
                physicalResistance: this.player.stats.equipmentPhysicalResistanceBonus || 0,
                magicResistance: this.player.stats.equipmentMagicResistanceBonus || 0,
                magicPower: this.player.stats.equipmentMagicPowerBonus || 0,
                physicalPower: this.player.stats.equipmentPhysicalPowerBonus || 0,
                agility: this.player.stats.equipmentAgilityBonus || 0,
                weight: this.player.stats.equipmentWeightBonus || 0,
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