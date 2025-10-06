// services/InventoryService.js
import itemsDB from '../data/Items.js';

class InventoryService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.inventory = new Map();
        this.baseMaxSlots = 30; // 基础背包容量
        this.maxSlots = 30; // 当前背包容量
        this.setupEventListeners();
        this.initializeDefaultItems();
    }

    setupEventListeners() {
        this.eventBus.on('inventory:add', this.addItem.bind(this), 'game');
        this.eventBus.on('inventory:remove', this.removeItem.bind(this), 'game');
        this.eventBus.on('inventory:use', this.useItem.bind(this), 'game');
        this.eventBus.on('inventory:show', this.showInventory.bind(this), 'game');
        this.eventBus.on('inventory:equip', this.equipItem.bind(this), 'game');
        this.eventBus.on('equipment:equipped', this.handleEquipmentChange.bind(this), 'game');
        this.eventBus.on('equipment:unequipped', this.handleEquipmentChange.bind(this), 'game');
    }

    initializeDefaultItems() {
        // 1级可装备武器池
        const level1Weapons = [
            '生锈短剑',
            '生锈小刀',
            '简易短弓'
        ];
        
        // 基础消耗药剂池
        const basicPotions = [
            '小瓶治疗药水',
            '中瓶治疗药水',
            '小瓶法力药水',
            '中瓶法力药水',
            '小瓶耐力药水',
            '中瓶耐力药水'
        ];
        
        // 5级以内的随机装备池
        const level1to5Equipment = [
            // 2-5级武器
            '手斧', '铁剑', '木棒', '铁匕首', '猎弓',
            '锻铁剑', '锋利匕首', '铁斧', '橡木魔杖', '紫杉法杖',
            // 1级护甲
            '粗皮甲'
        ];
        
        // 1. 随机选择一把1级武器
        const randomWeapon = level1Weapons[Math.floor(Math.random() * level1Weapons.length)];
        this.addItem(randomWeapon, 1);
        
        // 2. 随机选择3-5瓶基础药剂
        const potionCount = 3 + Math.floor(Math.random() * 3); // 3-5瓶
        for (let i = 0; i < potionCount; i++) {
            const randomPotion = basicPotions[Math.floor(Math.random() * basicPotions.length)];
            this.addItem(randomPotion, 1);
        }
        
        // 3. 添加基础布衣
        this.addItem('布衣', 1);
        
        // 4. 随机选择一件5级以内的装备
        const randomEquipment = level1to5Equipment[Math.floor(Math.random() * level1to5Equipment.length)];
        this.addItem(randomEquipment, 1);
    }

    addItem(itemName, quantity = 1) {
        const itemData = this.getItemData(itemName);
        if (!itemData) {
            console.warn(`未知物品: ${itemName}`);
            return false;
        }

        // 检查是否是货币类物品
        if (itemData.type === 'currency') {
            // 货币类物品直接转换为玩家金币
            const currencyService = window.gameCore?.getService('currencyService');
            if (currencyService) {
                const copperValue = (itemData.value || 1) * quantity;
                currencyService.addCurrency(copperValue);
                return true;
            }
        }

        // 保存原始数量用于通知显示
        const originalQuantity = quantity;

        // 检查是否可堆叠
        const isStackable = itemData.stackable !== false; // 默认可堆叠
        
        if (isStackable && this.inventory.has(itemName)) {
            const existingItem = this.inventory.get(itemName);
            const maxStack = itemData.maxStack || 99;
            const canAdd = Math.min(quantity, maxStack - existingItem.quantity);
            
            if (canAdd > 0) {
                existingItem.quantity += canAdd;
                quantity -= canAdd;
            }
        }

        // 如果还有剩余数量，需要新建槽位
        while (quantity > 0) {
            if (this.inventory.size >= this.maxSlots) {
                this.eventBus.emit('ui:notification', {
                    message: '背包已满！无法添加更多物品。',
                    type: 'warning'
                }, 'game');
                return false;
            }

            const stackSize = isStackable ? Math.min(quantity, itemData.maxStack || 99) : 1;
            const uniqueKey = isStackable ? itemName : `${itemName}_${Date.now()}_${Math.random()}`;
            
            this.inventory.set(uniqueKey, {
                ...itemData,
                quantity: stackSize,
                originalName: itemName // 保存原始名称用于装备等操作
            });
            
            quantity -= stackSize;
        }

        this.eventBus.emit('inventory:updated', {
            action: 'add',
            item: itemName,
            quantity: originalQuantity
        }, 'game');

        this.eventBus.emit('ui:notification', {
            message: `获得了 ${itemName} x${originalQuantity}`,
            type: 'success'
        }, 'game');

        return true;
    }

    removeItem(itemName, quantity = 1) {
        if (!this.inventory.has(itemName)) {
            return false;
        }

        const item = this.inventory.get(itemName);
        if (item.quantity < quantity) {
            return false;
        }

        item.quantity -= quantity;
        if (item.quantity <= 0) {
            this.inventory.delete(itemName);
        }

        this.eventBus.emit('inventory:updated', {
            action: 'remove',
            item: itemName,
            quantity: quantity
        }, 'game');

        return true;
    }

    useItem(itemName) {
        const item = this.getItem(itemName);
        if (!item || item.quantity <= 0) {
            this.eventBus.emit('ui:notification', {
                message: '物品不存在或数量不足',
                type: 'error'
            }, 'game');
            return false;
        }

        let result = false;
        const gameStateService = window.gameCore?.getService('gameStateService');
        const playerState = gameStateService?.getState().player;

        if (!playerState) {
            this.eventBus.emit('ui:notification', {
                message: '无法获取玩家状态',
                type: 'error'
            }, 'game');
            return false;
        }

        // 检查是否是装备
        const equipmentData = itemsDB.getEquipment(item.originalName || itemName);
        if (equipmentData) {
            return this.equipItem(itemName);
        }

        // 处理消耗品
        switch (item.type) {
            case 'consumable':
                result = this.useConsumableItem(item, itemName, gameStateService, playerState);
                break;

            default:
                this.eventBus.emit('ui:notification', {
                    message: '该物品无法使用',
                    type: 'warning'
                }, 'game');
                break;
        }

        return result;
    }

    useConsumableItem(item, itemName, gameStateService, playerState) {
        const effect = item.effect;
        if (!effect) return false;

        let result = false;
        let message = '';

        switch (effect.type) {
            case 'heal':
                if (playerState.hp >= playerState.maxHp) {
                    this.eventBus.emit('ui:notification', {
                        message: '生命值已满，无需使用治疗物品',
                        type: 'warning'
                    }, 'game');
                    return false;
                }

                const healAmount = effect.value;
                const newHp = Math.min(playerState.maxHp, playerState.hp + healAmount);
                const actualHeal = newHp - playerState.hp;

                gameStateService.updatePlayerStats({ hp: newHp });
                this.removeItem(itemName, 1);

                message = `使用${item.name}恢复了${actualHeal}点生命值`;
                result = true;
                break;

            case 'restore_mana':
                if (playerState.mana >= playerState.maxMana) {
                    this.eventBus.emit('ui:notification', {
                        message: '法力值已满，无需使用法力药水',
                        type: 'warning'
                    }, 'game');
                    return false;
                }

                const manaAmount = effect.value;
                const newMana = Math.min(playerState.maxMana, playerState.mana + manaAmount);
                const actualMana = newMana - playerState.mana;

                gameStateService.updatePlayerStats({ mana: newMana });
                this.removeItem(itemName, 1);

                message = `使用${item.name}恢复了${actualMana}点法力值`;
                result = true;
                break;

            case 'restore_stamina':
                if (playerState.stamina >= playerState.maxStamina) {
                    this.eventBus.emit('ui:notification', {
                        message: '耐力值已满，无需使用耐力药水',
                        type: 'warning'
                    }, 'game');
                    return false;
                }

                const staminaAmount = effect.value;
                const newStamina = Math.min(playerState.maxStamina, playerState.stamina + staminaAmount);
                const actualStamina = newStamina - playerState.stamina;

                gameStateService.updatePlayerStats({ stamina: newStamina });
                this.removeItem(itemName, 1);

                message = `使用${item.name}恢复了${actualStamina}点耐力值`;
                result = true;
                break;

            case 'temp_buff':
                // 临时增益效果
                const buffData = {
                    name: item.name,
                    stats: effect.stats,
                    duration: effect.duration
                };
                
                const buffId = gameStateService.getState().addTempBuff(buffData);
                this.removeItem(itemName, 1);
                
                // 构建增益描述
                const buffDescription = Object.entries(effect.stats).map(([key, value]) => {
                    const statNames = {
                        attack: '攻击力',
                        defense: '防御力',
                        magicPower: '魔法强度',
                        physicalPower: '物理强度',
                        speed: '速度',
                        criticalChance: '暴击率'
                    };
                    return `${statNames[key] || key}+${value}`;
                }).join(', ');
                
                message = `使用${item.name}获得了临时增益：${buffDescription}（持续${effect.duration}回合）`;
                result = true;
                break;

            default:
                this.eventBus.emit('ui:notification', {
                    message: '未知的物品效果',
                    type: 'warning'
                }, 'game');
                return false;
        }

        if (result && message) {
            this.eventBus.emit('ui:notification', {
                message: message,
                type: 'success'
            }, 'game');
        }

        return result;
    }

    // 装备物品
    equipItem(itemName) {
        const equipmentService = window.gameCore?.getService('equipmentService');
        if (!equipmentService) {
            this.eventBus.emit('ui:notification', {
                message: '装备系统不可用',
                type: 'error'
            }, 'game');
            return false;
        }

        const result = equipmentService.equipItem(itemName);
        
        // 显示装备结果通知
        if (result.success) {
            this.eventBus.emit('ui:notification', {
                message: result.message,
                type: 'success'
            }, 'game');
        } else {
            this.eventBus.emit('ui:notification', {
                message: result.message,
                type: 'error'
            }, 'game');
        }
        
        return result.success;
    }

    getItem(itemName) {
        return this.inventory.get(itemName) || null;
    }

    getAllItems() {
        return Array.from(this.inventory.entries()).map(([name, data]) => ({
            name,
            ...data
        }));
    }

    getItemCount(itemName) {
        const item = this.inventory.get(itemName);
        return item ? item.quantity : 0;
    }

    showInventory() {
        this.eventBus.emit('ui:inventory:show', {
            items: this.getAllItems(),
            maxSlots: this.maxSlots,
            usedSlots: this.inventory.size
        }, 'game');
    }

    getItemData(itemName) {
        // 首先尝试从物品数据库获取
        let itemData = itemsDB.getItem(itemName);
        if (itemData) {
            return itemData;
        }

        // 然后尝试从装备数据库获取
        itemData = itemsDB.getEquipment(itemName);
        if (itemData) {
            return itemData;
        }

        // 如果都没找到，返回null
        return null;
    }

    // 获取物品的稀有度颜色
    getRarityColor(rarity) {
        const colors = {
            'common': '#ffffff',
            'uncommon': '#1eff00',
            'rare': '#0070dd',
            'epic': '#a335ee',
            'legendary': '#ff8000'
        };
        return colors[rarity] || colors.common;
    }

    // 清空背包
    clearInventory() {
        this.inventory.clear();
        this.eventBus.emit('inventory:updated', {
            action: 'clear'
        }, 'game');
    }

    // 获取背包统计信息
    getInventoryStats() {
        return {
            totalItems: Array.from(this.inventory.values()).reduce((sum, item) => sum + item.quantity, 0),
            uniqueItems: this.inventory.size,
            maxSlots: this.maxSlots,
            usedSlots: this.inventory.size,
            freeSlots: this.maxSlots - this.inventory.size
        };
    }

    // 获取装备类型的物品
    getEquipmentItems() {
        const equipmentItems = [];
        for (const [key, item] of this.inventory.entries()) {
            const equipmentData = itemsDB.getEquipment(item.originalName || item.name);
            if (equipmentData) {
                equipmentItems.push({
                    key,
                    name: item.originalName || item.name,
                    ...item,
                    equipmentData
                });
            }
        }
        return equipmentItems;
    }

    // 获取消耗品类型的物品
    getConsumableItems() {
        const consumableItems = [];
        for (const [key, item] of this.inventory.entries()) {
            if (item.type === 'consumable') {
                consumableItems.push({
                    key,
                    ...item
                });
            }
        }
        return consumableItems;
    }

    // 获取材料类型的物品
    getMaterialItems() {
        const materialItems = [];
        for (const [key, item] of this.inventory.entries()) {
            if (item.type === 'material' || item.type === 'currency') {
                materialItems.push({
                    key,
                    ...item
                });
            }
        }
        return materialItems;
    }

    // 处理装备变化事件
    handleEquipmentChange(data) {
        this.updateInventoryCapacity();
    }

    // 更新背包容量
    updateInventoryCapacity() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        if (!gameStateService) return;

        const player = gameStateService.getState().player;
        const equipment = player.equipment;

        // 计算背包装备提供的额外容量
        let extraSlots = 0;
        for (const [slot, item] of Object.entries(equipment)) {
            if (item && item.stats && item.stats.inventorySlots) {
                // 跳过双手武器的副槽位，避免重复计算
                if (item.isSecondarySlot) {
                    continue;
                }
                extraSlots += item.stats.inventorySlots;
            }
        }

        const newMaxSlots = this.baseMaxSlots + extraSlots;
        
        // 如果容量发生变化，更新并通知
        if (newMaxSlots !== this.maxSlots) {
            const oldMaxSlots = this.maxSlots;
            this.maxSlots = newMaxSlots;
            
            this.eventBus.emit('ui:notification', {
                message: `背包容量变化：${oldMaxSlots} → ${newMaxSlots} 格`,
                type: 'info'
            }, 'game');

            // 发送背包更新事件
            this.eventBus.emit('inventory:updated', {
                action: 'capacity_change',
                oldCapacity: oldMaxSlots,
                newCapacity: newMaxSlots
            }, 'game');
        }
    }

    // 获取当前背包容量信息
    getCapacityInfo() {
        return {
            baseCapacity: this.baseMaxSlots,
            currentCapacity: this.maxSlots,
            extraCapacity: this.maxSlots - this.baseMaxSlots,
            usedSlots: this.inventory.size,
            freeSlots: this.maxSlots - this.inventory.size
        };
    }
}

export default InventoryService;