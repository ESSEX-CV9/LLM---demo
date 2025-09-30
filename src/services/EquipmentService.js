// services/EquipmentService.js - 装备管理服务
import itemsDB from '../data/Items.js';

class EquipmentService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('equipment:equip', this.equipItem.bind(this), 'game');
        this.eventBus.on('equipment:unequip', this.unequipItem.bind(this), 'game');
        this.eventBus.on('equipment:show', this.showEquipmentPanel.bind(this), 'game');
    }

    // 获取游戏状态服务
    getGameStateService() {
        return window.gameCore?.getService('gameStateService');
    }

    // 获取背包服务
    getInventoryService() {
        return window.gameCore?.getService('inventoryService');
    }

    // 装备物品
    equipItem(itemName, slot = null) {
        const gameStateService = this.getGameStateService();
        const inventoryService = this.getInventoryService();
        
        if (!gameStateService || !inventoryService) {
            return { success: false, message: '服务不可用' };
        }

        const gameState = gameStateService.getState();
        const player = gameState.player;

        // 检查背包中是否有该物品
        const inventoryItem = inventoryService.getItem(itemName);
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return { success: false, message: '背包中没有该物品' };
        }

        // 获取装备数据
        const equipmentData = itemsDB.getEquipment(itemName);
        if (!equipmentData) {
            return { success: false, message: '该物品不是装备' };
        }

        // 检查装备需求
        const requirementCheck = itemsDB.checkEquipmentRequirements(equipmentData, player);
        if (!requirementCheck.canEquip) {
            return { 
                success: false, 
                message: `无法装备：${requirementCheck.issues.join(', ')}` 
            };
        }

        // 确定装备槽位
        const targetSlot = slot || this.getEquipmentSlot(equipmentData);
        if (!targetSlot) {
            return { success: false, message: '无法确定装备槽位' };
        }

        // 检查是否已有装备在该槽位
        const currentEquipment = player.equipment[targetSlot];
        if (currentEquipment) {
            // 卸下当前装备
            const unequipResult = this.unequipItem(targetSlot, false);
            if (!unequipResult.success) {
                return { success: false, message: '无法卸下当前装备' };
            }
        }

        // 从背包移除物品
        inventoryService.removeItem(itemName, 1);

        // 装备新物品
        const newEquipment = { ...player.equipment };
        newEquipment[targetSlot] = {
            name: itemName,
            ...equipmentData
        };

        // 计算装备效果并更新玩家属性
        const statUpdates = this.calculateEquipmentEffects(newEquipment, player);
        statUpdates.equipment = newEquipment;

        gameStateService.updatePlayerStats(statUpdates);

        // 发送事件通知
        this.eventBus.emit('equipment:equipped', {
            item: itemName,
            slot: targetSlot,
            equipment: equipmentData
        }, 'game');

        this.eventBus.emit('ui:notification', {
            message: `装备了 ${equipmentData.name}`,
            type: 'success'
        }, 'game');

        return { 
            success: true, 
            message: `成功装备 ${equipmentData.name}`,
            slot: targetSlot
        };
    }

    // 卸下装备
    unequipItem(slot, returnToInventory = true) {
        const gameStateService = this.getGameStateService();
        const inventoryService = this.getInventoryService();
        
        if (!gameStateService || !inventoryService) {
            return { success: false, message: '服务不可用' };
        }

        const gameState = gameStateService.getState();
        const player = gameState.player;

        // 检查槽位是否有装备
        const currentEquipment = player.equipment[slot];
        if (!currentEquipment) {
            return { success: false, message: '该槽位没有装备' };
        }

        // 返回背包
        if (returnToInventory) {
            const addResult = inventoryService.addItem(currentEquipment.name, 1);
            if (!addResult) {
                return { success: false, message: '背包已满，无法卸下装备' };
            }
        }

        // 移除装备
        const newEquipment = { ...player.equipment };
        newEquipment[slot] = null;

        // 重新计算装备效果
        const statUpdates = this.calculateEquipmentEffects(newEquipment, player);
        statUpdates.equipment = newEquipment;

        gameStateService.updatePlayerStats(statUpdates);

        // 发送事件通知
        this.eventBus.emit('equipment:unequipped', {
            item: currentEquipment.name,
            slot: slot,
            equipment: currentEquipment
        }, 'game');

        if (returnToInventory) {
            this.eventBus.emit('ui:notification', {
                message: `卸下了 ${currentEquipment.name}`,
                type: 'info'
            }, 'game');
        }

        return { 
            success: true, 
            message: `成功卸下 ${currentEquipment.name}`,
            item: currentEquipment
        };
    }

    // 确定装备槽位
    getEquipmentSlot(equipmentData) {
        const typeSlotMap = {
            'weapon': 'weapon',
            'armor': this.getArmorSlot(equipmentData.subType),
            'accessory': this.getAccessorySlot(equipmentData.subType)
        };

        return typeSlotMap[equipmentData.type] || null;
    }

    // 获取防具槽位
    getArmorSlot(subType) {
        const armorSlotMap = {
            'helmet': 'helmet',
            'chest': 'chest',
            'legs': 'legs',
            'boots': 'boots'
        };
        return armorSlotMap[subType] || 'chest';
    }

    // 获取饰品槽位
    getAccessorySlot(subType) {
        const accessorySlotMap = {
            'ring': 'ring',
            'necklace': 'necklace',
            'amulet': 'amulet'
        };
        return accessorySlotMap[subType] || 'accessory';
    }

    // 计算装备效果
    calculateEquipmentEffects(equipment, player) {
        const baseStats = {
            hp: player.hp,
            maxHp: player.maxHp,
            mana: player.mana,
            maxMana: player.maxMana,
            stamina: player.stamina,
            maxStamina: player.maxStamina,
            stats: { ...player.stats }
        };

        // 重置装备加成，保留基础属性
        const newStats = {
            ...baseStats.stats,
            // 保留技能加成的基础属性
            baseAttack: baseStats.stats.baseAttack || 10,
            baseDefense: baseStats.stats.baseDefense || 5,
            speed: baseStats.stats.speed || 8,
            baseMagicPower: baseStats.stats.baseMagicPower || 5,
            basePhysicalPower: baseStats.stats.basePhysicalPower || 10
        };

        let totalAttackBonus = 0;
        let totalDefenseBonus = 0;
        let totalMagicPowerBonus = 0;
        let totalPhysicalPowerBonus = 0;
        let totalSpeedBonus = 0;
        let totalMaxHpBonus = 0;
        let totalMaxManaBonus = 0;
        let totalMaxStaminaBonus = 0;
        let totalCriticalChanceBonus = 0;

        // 遍历所有装备槽位
        for (const [slot, item] of Object.entries(equipment)) {
            if (item && item.stats) {
                const stats = item.stats;
                
                totalAttackBonus += stats.attack || 0;
                totalDefenseBonus += stats.defense || 0;
                totalMagicPowerBonus += stats.magicPower || 0;
                totalPhysicalPowerBonus += stats.physicalPower || 0;
                totalSpeedBonus += stats.speed || 0;
                totalMaxHpBonus += stats.maxHp || 0;
                totalMaxManaBonus += stats.maxMana || 0;
                totalMaxStaminaBonus += stats.maxStamina || 0;
                totalCriticalChanceBonus += stats.criticalChance || 0;
            }
        }

        // 应用装备加成
        newStats.equipmentAttackBonus = totalAttackBonus;
        newStats.equipmentDefenseBonus = totalDefenseBonus;
        newStats.equipmentMagicPowerBonus = totalMagicPowerBonus;
        newStats.equipmentPhysicalPowerBonus = totalPhysicalPowerBonus;
        newStats.equipmentSpeedBonus = totalSpeedBonus;
        newStats.equipmentCriticalChanceBonus = totalCriticalChanceBonus;

        // 计算新的最大值
        const newMaxHp = baseStats.maxHp + totalMaxHpBonus;
        const newMaxMana = baseStats.maxMana + totalMaxManaBonus;
        const newMaxStamina = baseStats.maxStamina + totalMaxStaminaBonus;

        // 确保当前值不超过新的最大值
        const currentHp = Math.min(baseStats.hp, newMaxHp);
        const currentMana = Math.min(baseStats.mana, newMaxMana);
        const currentStamina = Math.min(baseStats.stamina, newMaxStamina);

        return {
            stats: newStats,
            maxHp: newMaxHp,
            maxMana: newMaxMana,
            maxStamina: newMaxStamina,
            hp: currentHp,
            mana: currentMana,
            stamina: currentStamina
        };
    }

    // 获取装备对比信息
    getEquipmentComparison(itemName, slot) {
        const gameStateService = this.getGameStateService();
        if (!gameStateService) return null;

        const player = gameStateService.getState().player;
        const newEquipment = itemsDB.getEquipment(itemName);
        const currentEquipment = player.equipment[slot];

        if (!newEquipment) return null;

        const comparison = {
            newItem: newEquipment,
            currentItem: currentEquipment,
            statChanges: {}
        };

        if (currentEquipment && currentEquipment.stats && newEquipment.stats) {
            const newStats = newEquipment.stats;
            const currentStats = currentEquipment.stats;

            // 计算属性变化
            const statKeys = ['attack', 'defense', 'magicPower', 'physicalPower', 'speed', 'maxHp', 'maxMana', 'maxStamina', 'criticalChance'];
            
            for (const key of statKeys) {
                const newValue = newStats[key] || 0;
                const currentValue = currentStats[key] || 0;
                const change = newValue - currentValue;
                
                if (change !== 0) {
                    comparison.statChanges[key] = {
                        current: currentValue,
                        new: newValue,
                        change: change
                    };
                }
            }
        }

        return comparison;
    }

    // 显示装备面板
    showEquipmentPanel() {
        const gameStateService = this.getGameStateService();
        if (!gameStateService) return;

        const player = gameStateService.getState().player;
        
        this.eventBus.emit('ui:equipment:show', {
            player: player,
            equipment: player.equipment,
            availableSlots: this.getAvailableSlots()
        }, 'game');
    }

    // 获取可用装备槽位
    getAvailableSlots() {
        return {
            weapon: { name: '武器', icon: '⚔️' },
            helmet: { name: '头盔', icon: '⛑️' },
            chest: { name: '胸甲', icon: '🛡️' },
            legs: { name: '护腿', icon: '👖' },
            boots: { name: '靴子', icon: '👢' },
            ring: { name: '戒指', icon: '💍' },
            necklace: { name: '项链', icon: '📿' },
            amulet: { name: '护符', icon: '🔱' }
        };
    }

    // 获取装备总览
    getEquipmentSummary() {
        const gameStateService = this.getGameStateService();
        if (!gameStateService) return null;

        const player = gameStateService.getState().player;
        const equipment = player.equipment;
        
        let totalAttack = 0;
        let totalDefense = 0;
        let totalMagicPower = 0;
        let totalPhysicalPower = 0;
        let equippedCount = 0;

        for (const [slot, item] of Object.entries(equipment)) {
            if (item && item.stats) {
                totalAttack += item.stats.attack || 0;
                totalDefense += item.stats.defense || 0;
                totalMagicPower += item.stats.magicPower || 0;
                totalPhysicalPower += item.stats.physicalPower || 0;
                equippedCount++;
            }
        }

        return {
            equippedCount,
            totalSlots: Object.keys(this.getAvailableSlots()).length,
            totalAttack,
            totalDefense,
            totalMagicPower,
            totalPhysicalPower
        };
    }

    // 修理装备
    repairEquipment(slot, cost = null) {
        const gameStateService = this.getGameStateService();
        if (!gameStateService) return { success: false, message: '服务不可用' };

        const player = gameStateService.getState().player;
        const equipment = player.equipment[slot];

        if (!equipment) {
            return { success: false, message: '该槽位没有装备' };
        }

        if (!equipment.durability) {
            return { success: false, message: '该装备无需修理' };
        }

        if (equipment.durability.current >= equipment.durability.max) {
            return { success: false, message: '装备耐久度已满' };
        }

        // 计算修理费用（如果没有指定）
        if (cost === null) {
            const durabilityLoss = equipment.durability.max - equipment.durability.current;
            cost = Math.ceil(durabilityLoss * (equipment.value || 100) * 0.1);
        }

        // 这里可以添加货币检查逻辑
        // 暂时直接修理
        const newEquipment = { ...player.equipment };
        newEquipment[slot] = {
            ...equipment,
            durability: {
                ...equipment.durability,
                current: equipment.durability.max
            }
        };

        gameStateService.updatePlayerStats({ equipment: newEquipment });

        this.eventBus.emit('ui:notification', {
            message: `修理了 ${equipment.name}`,
            type: 'success'
        }, 'game');

        return { success: true, message: `成功修理 ${equipment.name}`, cost };
    }
}

export default EquipmentService;