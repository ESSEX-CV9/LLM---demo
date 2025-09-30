// services/InventoryService.js
class InventoryService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.inventory = new Map();
        this.maxSlots = 20;
        this.setupEventListeners();
        this.initializeDefaultItems();
    }

    setupEventListeners() {
        this.eventBus.on('inventory:add', this.addItem.bind(this), 'game');
        this.eventBus.on('inventory:remove', this.removeItem.bind(this), 'game');
        this.eventBus.on('inventory:use', this.useItem.bind(this), 'game');
        this.eventBus.on('inventory:show', this.showInventory.bind(this), 'game');
    }

    initializeDefaultItems() {
        // 给玩家一些初始物品
        this.addItem('治疗药水', 3);
        this.addItem('面包', 2);
    }

    addItem(itemName, quantity = 1) {
        const itemData = this.getItemData(itemName);
        if (!itemData) {
            console.warn(`未知物品: ${itemName}`);
            return false;
        }

        if (this.inventory.has(itemName)) {
            const existingItem = this.inventory.get(itemName);
            existingItem.quantity += quantity;
        } else {
            if (this.inventory.size >= this.maxSlots) {
                this.eventBus.emit('ui:notification', {
                    message: '背包已满！无法添加更多物品。',
                    type: 'warning'
                }, 'game');
                return false;
            }

            this.inventory.set(itemName, {
                ...itemData,
                quantity: quantity
            });
        }

        this.eventBus.emit('inventory:updated', {
            action: 'add',
            item: itemName,
            quantity: quantity
        }, 'game');

        this.eventBus.emit('ui:notification', {
            message: `获得了 ${itemName} x${quantity}`,
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

        switch (item.type) {
            case 'healing':
                if (playerState.hp >= playerState.maxHp) {
                    this.eventBus.emit('ui:notification', {
                        message: '生命值已满，无需使用治疗物品',
                        type: 'warning'
                    }, 'game');
                    return false;
                }

                const healAmount = item.effect.value;
                const newHp = Math.min(playerState.maxHp, playerState.hp + healAmount);
                const actualHeal = newHp - playerState.hp;

                gameStateService.updatePlayerStats({ hp: newHp });
                this.removeItem(itemName, 1);

                this.eventBus.emit('ui:notification', {
                    message: `使用${item.name}恢复了${actualHeal}点生命值`,
                    type: 'success'
                }, 'game');

                result = true;
                break;

            case 'food':
                if (playerState.hp >= playerState.maxHp) {
                    this.eventBus.emit('ui:notification', {
                        message: '生命值已满，无需进食',
                        type: 'warning'
                    }, 'game');
                    return false;
                }

                const foodHeal = item.effect.value;
                const newHpFood = Math.min(playerState.maxHp, playerState.hp + foodHeal);
                const actualFoodHeal = newHpFood - playerState.hp;

                gameStateService.updatePlayerStats({ hp: newHpFood });
                this.removeItem(itemName, 1);

                this.eventBus.emit('ui:notification', {
                    message: `食用${item.name}恢复了${actualFoodHeal}点生命值`,
                    type: 'success'
                }, 'game');

                result = true;
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
        const itemDatabase = {
            '治疗药水': {
                name: '治疗药水',
                type: 'healing',
                description: '恢复50点生命值的神奇药水',
                effect: { type: 'heal', value: 50 },
                rarity: 'common',
                icon: '🧪'
            },
            '高级治疗药水': {
                name: '高级治疗药水',
                type: 'healing',
                description: '恢复100点生命值的强效药水',
                effect: { type: 'heal', value: 100 },
                rarity: 'rare',
                icon: '🧪'
            },
            '面包': {
                name: '面包',
                type: 'food',
                description: '简单的食物，恢复少量生命值',
                effect: { type: 'heal', value: 20 },
                rarity: 'common',
                icon: '🍞'
            },
            '铜币': {
                name: '铜币',
                type: 'currency',
                description: '基础货币',
                effect: { type: 'none' },
                rarity: 'common',
                icon: '🪙'
            },
            '铁剑': {
                name: '铁剑',
                type: 'weapon',
                description: '普通的铁制剑，增加攻击力',
                effect: { type: 'attack', value: 10 },
                rarity: 'common',
                icon: '⚔️'
            },
            '皮甲': {
                name: '皮甲',
                type: 'armor',
                description: '简单的皮制护甲，增加防御力',
                effect: { type: 'defense', value: 5 },
                rarity: 'common',
                icon: '🛡️'
            },
            '魔法卷轴': {
                name: '魔法卷轴',
                type: 'consumable',
                description: '蕴含神秘力量的卷轴',
                effect: { type: 'magic', value: 30 },
                rarity: 'rare',
                icon: '📜'
            },
            '宝石': {
                name: '宝石',
                type: 'valuable',
                description: '闪闪发光的珍贵宝石',
                effect: { type: 'none' },
                rarity: 'epic',
                icon: '💎'
            }
        };

        return itemDatabase[itemName] || null;
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
}

export default InventoryService;