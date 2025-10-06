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

        // 处理双手武器装备逻辑
        if (equipmentData.type === 'weapon' && equipmentData.weaponType === 'two-handed') {
            return this.equipTwoHandedWeapon(itemName, equipmentData, player, inventoryService, gameStateService);
        }

        // 确定装备槽位
        const targetSlot = slot || this.getEquipmentSlot(equipmentData);
        if (!targetSlot) {
            return { success: false, message: '无法确定装备槽位' };
        }

        // 检查是否已有装备在该槽位
        const currentEquipment = player.equipment[targetSlot];
        if (currentEquipment) {
            // 先尝试将当前装备放回背包
            const unequipResult = this.unequipItem(targetSlot, true);
            if (!unequipResult.success) {
                // 如果背包满了，给用户明确提示
                return {
                    success: false,
                    message: `无法装备：${unequipResult.message}。请先清理背包空间。`
                };
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

        // 已取消装备通知
        // this.eventBus.emit('ui:notification', {
        //     message: `装备了 ${equipmentData.name}`,
        //     type: 'success'
        // }, 'game');

        return {
            success: true,
            message: `成功装备 ${equipmentData.name}`,
            slot: targetSlot
        };
    }

    // 装备双手武器
    equipTwoHandedWeapon(itemName, equipmentData, player, inventoryService, gameStateService) {
        const newEquipment = { ...player.equipment };
        
        // 检查两个武器槽位是否都可用
        const weapon1 = newEquipment.weapon1;
        const weapon2 = newEquipment.weapon2;
        
        // 如果有任何武器槽位被占用，需要先卸下
        const itemsToUnequip = [];
        if (weapon1) itemsToUnequip.push({ slot: 'weapon1', item: weapon1 });
        if (weapon2) itemsToUnequip.push({ slot: 'weapon2', item: weapon2 });
        
        // 检查背包是否有足够空间
        if (itemsToUnequip.length > 0) {
            const inventoryStats = inventoryService.getInventoryStats();
            const availableSlots = inventoryStats.freeSlots;
            
            if (availableSlots < itemsToUnequip.length) {
                return {
                    success: false,
                    message: `无法装备双手武器：背包空间不足。需要 ${itemsToUnequip.length} 个空位来存放当前武器。`
                };
            }
            
            // 卸下现有武器
            for (const { slot, item } of itemsToUnequip) {
                inventoryService.addItem(item.name, 1);
                newEquipment[slot] = null;
            }
        }
        
        // 从背包移除双手武器
        inventoryService.removeItem(itemName, 1);
        
        // 装备双手武器到两个槽位
        const weaponItem = {
            name: itemName,
            ...equipmentData
        };
        newEquipment.weapon1 = weaponItem;
        newEquipment.weapon2 = { ...weaponItem, isSecondarySlot: true }; // 标记为副槽位
        
        // 计算装备效果并更新玩家属性
        const statUpdates = this.calculateEquipmentEffects(newEquipment, player);
        statUpdates.equipment = newEquipment;
        
        gameStateService.updatePlayerStats(statUpdates);
        
        // 发送事件通知
        this.eventBus.emit('equipment:equipped', {
            item: itemName,
            slot: 'weapon1',
            equipment: equipmentData,
            isTwoHanded: true
        }, 'game');
        
        // 已取消装备通知
        // this.eventBus.emit('ui:notification', {
        //     message: `装备了双手武器 ${equipmentData.name}`,
        //     type: 'success'
        // }, 'game');
        
        return {
            success: true,
            message: `成功装备双手武器 ${equipmentData.name}`,
            slot: 'weapon1',
            isTwoHanded: true
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

        // 检查是否是双手武器
        const isTwoHandedWeapon = currentEquipment.weaponType === 'two-handed';
        const isSecondarySlot = currentEquipment.isSecondarySlot;

        // 如果是双手武器的副槽位，不允许单独卸下
        if (isSecondarySlot) {
            return { success: false, message: '请从主武器槽位卸下双手武器' };
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

        // 如果是双手武器，同时移除另一个槽位
        if (isTwoHandedWeapon) {
            if (slot === 'weapon1') {
                newEquipment.weapon2 = null;
            } else if (slot === 'weapon2') {
                newEquipment.weapon1 = null;
            }
        }

        // 重新计算装备效果
        const statUpdates = this.calculateEquipmentEffects(newEquipment, player);
        statUpdates.equipment = newEquipment;

        gameStateService.updatePlayerStats(statUpdates);

        // 发送事件通知
        this.eventBus.emit('equipment:unequipped', {
            item: currentEquipment.name,
            slot: slot,
            equipment: currentEquipment,
            isTwoHanded: isTwoHandedWeapon
        }, 'game');

        // 已取消卸下装备通知
        // if (returnToInventory) {
        //     this.eventBus.emit('ui:notification', {
        //         message: `卸下了 ${isTwoHandedWeapon ? '双手武器 ' : ''}${currentEquipment.name}`,
        //         type: 'info'
        //     }, 'game');
        // }

        return {
            success: true,
            message: `成功卸下 ${currentEquipment.name}`,
            item: currentEquipment
        };
    }

    // 确定装备槽位
    getEquipmentSlot(equipmentData) {
        const typeSlotMap = {
            'weapon': this.getWeaponSlot(equipmentData),
            'armor': this.getArmorSlot(equipmentData.subType),
            'accessory': this.getAccessorySlot(equipmentData.subType)
        };

        return typeSlotMap[equipmentData.type] || null;
    }

    // 获取武器槽位
    getWeaponSlot(equipmentData) {
        // 检查是否为双手武器
        if (equipmentData.weaponType === 'two-handed') {
            return 'weapon1'; // 双手武器默认占用第一个槽位，但会占用两个槽位
        }
        
        // 单手武器，寻找可用的槽位
        const gameStateService = this.getGameStateService();
        if (gameStateService) {
            const player = gameStateService.getState().player;
            const equipment = player.equipment;
            
            // 优先使用第一个武器槽
            if (!equipment.weapon1) {
                return 'weapon1';
            }
            // 如果第一个槽位被占用，使用第二个槽位
            if (!equipment.weapon2) {
                return 'weapon2';
            }
        }
        
        return 'weapon1'; // 默认返回第一个槽位
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
            'amulet': 'amulet',
            'backpack': 'backpack'
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

        // 首先计算旧装备提供的资源加成（需要从当前值中减去）
        let oldMaxHpBonus = 0;
        let oldMaxManaBonus = 0;
        let oldMaxStaminaBonus = 0;

        // 遍历玩家当前装备，计算旧的资源加成
        for (const [slot, item] of Object.entries(player.equipment)) {
            if (item && item.stats) {
                if (item.isSecondarySlot) continue;
                oldMaxHpBonus += item.stats.maxHp || 0;
                oldMaxManaBonus += item.stats.maxMana || 0;
                oldMaxStaminaBonus += item.stats.maxStamina || 0;
            }
            if (item && item.effects) {
                if (item.isSecondarySlot) continue;
                for (const effect of item.effects) {
                    if (effect.type === 'stat_bonus') {
                        if (effect.stat === 'maxHp') oldMaxHpBonus += effect.value || 0;
                        if (effect.stat === 'maxMana') oldMaxManaBonus += effect.value || 0;
                        if (effect.stat === 'maxStamina') oldMaxStaminaBonus += effect.value || 0;
                    }
                }
            }
        }

        // 计算基础资源值（不包含装备加成）
        const baseMaxHp = Math.max(1, baseStats.maxHp - oldMaxHpBonus);
        const baseMaxMana = Math.max(0, baseStats.maxMana - oldMaxManaBonus);
        const baseMaxStamina = Math.max(0, baseStats.maxStamina - oldMaxStaminaBonus);

        // 计算当前资源的百分比（基于旧的最大值）
        const hpPercent = baseStats.maxHp > 0 ? baseStats.hp / baseStats.maxHp : 1;
        const manaPercent = baseStats.maxMana > 0 ? baseStats.mana / baseStats.maxMana : 1;
        const staminaPercent = baseStats.maxStamina > 0 ? baseStats.stamina / baseStats.maxStamina : 1;

        // 重置装备加成，保留基础属性
        const newStats = {
            ...baseStats.stats,
            // 保留技能加成的基础属性
            baseAttack: baseStats.stats.baseAttack || 12,
            agility: baseStats.stats.agility || 8,
            weight: baseStats.stats.weight || 10,
            physicalResistance: baseStats.stats.physicalResistance || 0,
            magicResistance: baseStats.stats.magicResistance || 0,
            baseMagicPower: baseStats.stats.baseMagicPower || 8,
            basePhysicalPower: baseStats.stats.basePhysicalPower || 12
        };

        let totalAttackBonus = 0;
        let totalAgilityBonus = 0;
        let totalWeightBonus = 0;
        let totalPhysicalResistanceBonus = 0;
        let totalMagicResistanceBonus = 0;
        let totalMagicPowerBonus = 0;
        let totalPhysicalPowerBonus = 0;
        let totalMaxHpBonus = 0;
        let totalMaxManaBonus = 0;
        let totalMaxStaminaBonus = 0;
        let totalCriticalChanceBonus = 0;

        // 遍历所有装备槽位
        for (const [slot, item] of Object.entries(equipment)) {
            if (item && item.stats) {
                // 跳过双手武器的副槽位，避免重复计算
                if (item.isSecondarySlot) {
                    continue;
                }
                
                const stats = item.stats;
                
                totalAttackBonus += stats.attack || 0;
                totalAgilityBonus += stats.agility || 0;
                totalWeightBonus += stats.weight || 0;
                totalPhysicalResistanceBonus += stats.physicalResistance || 0;
                totalMagicResistanceBonus += stats.magicResistance || 0;
                totalMagicPowerBonus += stats.magicPower || 0;
                totalPhysicalPowerBonus += stats.physicalPower || 0;
                totalMaxHpBonus += stats.maxHp || 0;
                totalMaxManaBonus += stats.maxMana || 0;
                totalMaxStaminaBonus += stats.maxStamina || 0;
                totalCriticalChanceBonus += stats.criticalChance || 0;
                
                // 背包装备增加背包容量
                if (stats.inventorySlots) {
                    // 这里可以通知背包服务增加容量
                    // 暂时先记录，后续可以实现动态背包容量
                }
            }
            
            // 处理装备特殊效果
            if (item && item.effects) {
                // 跳过双手武器的副槽位，避免重复计算
                if (item.isSecondarySlot) {
                    continue;
                }
                
                for (const effect of item.effects) {
                    switch (effect.type) {
                        case 'all_resistance':
                            // 全抗性：同时增加物理和魔法抗性
                            const allResistBonus = effect.value || 0; // effect.value已经是百分比数值(如25代表25%)
                            totalPhysicalResistanceBonus += allResistBonus;
                            totalMagicResistanceBonus += allResistBonus;
                            break;
                            
                        case 'stat_bonus':
                            // 属性加成
                            if (effect.stat && effect.value) {
                                const statName = effect.stat;
                                switch (statName) {
                                    case 'attack':
                                        totalAttackBonus += effect.value;
                                        break;
                                    case 'physicalPower':
                                        totalPhysicalPowerBonus += effect.value;
                                        break;
                                    case 'magicPower':
                                        totalMagicPowerBonus += effect.value;
                                        break;
                                    case 'agility':
                                        totalAgilityBonus += effect.value;
                                        break;
                                    case 'weight':
                                        totalWeightBonus += effect.value;
                                        break;
                                    case 'physicalResistance':
                                        totalPhysicalResistanceBonus += effect.value;
                                        break;
                                    case 'magicResistance':
                                        totalMagicResistanceBonus += effect.value;
                                        break;
                                    case 'criticalChance':
                                        totalCriticalChanceBonus += effect.value;
                                        break;
                                    case 'maxHp':
                                        totalMaxHpBonus += effect.value;
                                        break;
                                    case 'maxMana':
                                        totalMaxManaBonus += effect.value;
                                        break;
                                    case 'maxStamina':
                                        totalMaxStaminaBonus += effect.value;
                                        break;
                                }
                            }
                            break;
                    }
                }
            }
        }

        // 应用装备加成
        newStats.equipmentAttackBonus = totalAttackBonus;
        newStats.equipmentAgilityBonus = totalAgilityBonus;
        newStats.equipmentWeightBonus = totalWeightBonus;
        newStats.equipmentPhysicalResistanceBonus = Math.min(75, totalPhysicalResistanceBonus); // 上限75%
        newStats.equipmentMagicResistanceBonus = Math.min(75, totalMagicResistanceBonus); // 上限75%
        newStats.equipmentMagicPowerBonus = totalMagicPowerBonus;
        newStats.equipmentPhysicalPowerBonus = totalPhysicalPowerBonus;
        newStats.equipmentCriticalChanceBonus = totalCriticalChanceBonus;

        // 计算新的最大值（使用基础值+新装备加成）
        const newMaxHp = baseMaxHp + totalMaxHpBonus;
        const newMaxMana = baseMaxMana + totalMaxManaBonus;
        const newMaxStamina = baseMaxStamina + totalMaxStaminaBonus;

        // ✅ 修复：按比例调整当前值，保持百分比不变
        // 例如：装备前 HP = 80/100 (80%)
        // - 装备+50 maxHp: 应该变成 120/150 (80%)
        // - 卸下装备: 应该变成 80/100 (80%)
        let currentHp = Math.floor(newMaxHp * hpPercent);
        let currentMana = Math.floor(newMaxMana * manaPercent);
        let currentStamina = Math.floor(newMaxStamina * staminaPercent);

        // 确保至少为1（如果最大值>0）或为0（如果最大值=0）
        currentHp = newMaxHp > 0 ? Math.max(1, Math.min(currentHp, newMaxHp)) : 0;
        currentMana = newMaxMana > 0 ? Math.max(0, Math.min(currentMana, newMaxMana)) : 0;
        currentStamina = newMaxStamina > 0 ? Math.max(0, Math.min(currentStamina, newMaxStamina)) : 0;

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
            const statKeys = ['attack', 'agility', 'weight', 'physicalResistance', 'magicResistance', 'magicPower', 'physicalPower', 'maxHp', 'maxMana', 'maxStamina', 'criticalChance'];
            
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
            weapon1: { name: '武器槽1', icon: '⚔️' },
            weapon2: { name: '武器槽2', icon: '🗡️' },
            helmet: { name: '头盔', icon: '⛑️' },
            chest: { name: '胸甲', icon: '🛡️' },
            legs: { name: '护腿', icon: '👖' },
            boots: { name: '靴子', icon: '👢' },
            ring: { name: '戒指', icon: '💍' },
            amulet: { name: '护符', icon: '🔱' },
            backpack: { name: '背包', icon: '🎒' }
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
                // 跳过双手武器的副槽位
                if (item.isSecondarySlot) continue;
                
                totalAttack += item.stats.attack || 0;
                totalDefense += (item.stats.physicalResistance || 0) + (item.stats.magicResistance || 0);
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