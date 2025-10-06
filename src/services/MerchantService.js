// services/MerchantService.js - 巡游商人系统
import itemsDB from '../data/Items.js';

class MerchantService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentInventory = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('merchant:encounter', this.encounterMerchant.bind(this), 'game');
        this.eventBus.on('merchant:buy', this.buyItem.bind(this), 'game');
        this.eventBus.on('merchant:close', this.closeShop.bind(this), 'game');
    }

    /**
     * 遇到商人，生成商品列表并显示界面
     */
    encounterMerchant() {
        const gameStateService = window.gameCore?.getService('gameStateService');
        const player = gameStateService?.getState()?.player;
        
        if (!player) {
            console.error('[MerchantService] 无法获取玩家数据');
            return;
        }

        // 生成商品库存
        this.currentInventory = this.generateInventory(player.level);
        
        // 显示商人界面
        this.eventBus.emit('ui:merchant:show', {
            inventory: this.currentInventory,
            playerCurrency: player.currency || 0
        }, 'game');
    }

    /**
     * 生成商人商品库存
     * @param {number} playerLevel - 玩家等级
     * @returns {Array} 商品列表
     */
    generateInventory(playerLevel) {
        const inventory = [];

        // ============ 1. 基础消耗品（必有）============
        const basicPotionTypes = [
            { prefix: '治疗药水', types: ['小瓶治疗药水', '中瓶治疗药水'] },
            { prefix: '法力药水', types: ['小瓶法力药水', '中瓶法力药水'] },
            { prefix: '耐力药水', types: ['小瓶耐力药水', '中瓶耐力药水'] }
        ];

        for (const potionGroup of basicPotionTypes) {
            // 50%概率小瓶，50%概率中瓶
            const selectedType = potionGroup.types[Math.random() < 0.5 ? 0 : 1];
            const itemData = itemsDB.getItemByName(selectedType);
            
            if (itemData) {
                const quantity = Math.floor(Math.random() * 6) + 10; // 10-15瓶
                inventory.push({
                    name: itemData.name,
                    data: itemData,
                    quantity: quantity,
                    unitPrice: itemData.value || 10,
                    totalPrice: (itemData.value || 10) * quantity,
                    category: 'basic_consumable'
                });
            }
        }

        // ============ 2. 高级药水（3-7瓶随机）============
        const advancedPotionNames = [
            '大瓶治疗药水', '特大瓶治疗药水',
            '大瓶法力药水', '特大瓶法力药水',
            '大瓶耐力药水', '特大瓶耐力药水',
            '力量药水', '防御药水', '敏捷药水',
            '暴击药水', '物理强化药水', '魔法强化药水'
        ];

        const advancedCount = Math.floor(Math.random() * 5) + 3; // 3-7瓶
        const selectedAdvanced = [];
        
        // 随机选择不重复的高级药水
        while (selectedAdvanced.length < advancedCount && selectedAdvanced.length < advancedPotionNames.length) {
            const randomName = advancedPotionNames[Math.floor(Math.random() * advancedPotionNames.length)];
            if (!selectedAdvanced.includes(randomName)) {
                selectedAdvanced.push(randomName);
            }
        }

        for (const potionName of selectedAdvanced) {
            const itemData = itemsDB.getItemByName(potionName);
            if (itemData) {
                inventory.push({
                    name: itemData.name,
                    data: itemData,
                    quantity: 1,
                    unitPrice: itemData.value || 50,
                    totalPrice: itemData.value || 50,
                    category: 'advanced_consumable'
                });
            }
        }

        // ============ 3. 装备（0-5个）============
        const equipmentCount = Math.floor(Math.random() * 6); // 0-5
        const minLevel = Math.max(1, playerLevel - 5);
        const maxLevel = playerLevel + 5;

        for (let i = 0; i < equipmentCount; i++) {
            const equipment = this.getRandomEquipmentInLevelRange(minLevel, maxLevel);
            if (equipment) {
                const price = Math.floor((equipment.value || 100) * 1.5); // 商人售价为物品价值的1.5倍
                inventory.push({
                    name: equipment.name,
                    data: equipment,
                    quantity: 1,
                    unitPrice: price,
                    totalPrice: price,
                    category: 'equipment'
                });
            }
        }

        // ============ 4. 完全随机物品（50%概率，2个）============
        if (Math.random() < 0.5) {
            for (let i = 0; i < 2; i++) {
                const randomItem = this.getRandomItemExcludingTest();
                if (randomItem) {
                    const price = Math.floor((randomItem.value || 50) * 1.2);
                    inventory.push({
                        name: randomItem.name,
                        data: randomItem,
                        quantity: 1,
                        unitPrice: price,
                        totalPrice: price,
                        category: 'random'
                    });
                }
            }
        }

        return inventory;
    }

    /**
     * 获取指定等级范围内的随机装备
     */
    getRandomEquipmentInLevelRange(minLevel, maxLevel) {
        const allItems = itemsDB.getAllItems();
        const validEquipment = [];

        for (const [key, item] of Object.entries(allItems)) {
            // 只选择装备类型
            if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
                // 检查等级需求
                const itemLevel = item.requirements?.level || item.requirements?.minLevel || 1;
                if (itemLevel >= minLevel && itemLevel <= maxLevel) {
                    // 排除测试装备
                    if (!item.name.includes('[测试]')) {
                        validEquipment.push(item);
                    }
                }
            }
        }

        if (validEquipment.length === 0) return null;
        return validEquipment[Math.floor(Math.random() * validEquipment.length)];
    }

    /**
     * 获取完全随机的物品（排除测试物品）
     */
    getRandomItemExcludingTest() {
        const allItems = itemsDB.getAllItems();
        const validItems = [];

        for (const [key, item] of Object.entries(allItems)) {
            // 排除测试物品和货币
            if (!item.name.includes('[测试]') && item.type !== 'currency') {
                validItems.push(item);
            }
        }

        if (validItems.length === 0) return null;
        return validItems[Math.floor(Math.random() * validItems.length)];
    }

    /**
     * 购买物品
     * @param {string} itemName - 物品名称
     * @param {number} quantity - 购买数量
     */
    buyItem(itemName, quantity = 1) {
        if (!this.currentInventory) {
            this.eventBus.emit('ui:notification', {
                message: '商店未开启',
                type: 'error'
            }, 'game');
            return { success: false, message: '商店未开启' };
        }

        // 查找商品
        const merchantItem = this.currentInventory.find(item => item.name === itemName);
        if (!merchantItem) {
            return { success: false, message: '商品不存在' };
        }

        // 检查库存
        if (merchantItem.quantity < quantity) {
            this.eventBus.emit('ui:notification', {
                message: `库存不足！仅剩 ${merchantItem.quantity} 个`,
                type: 'warning'
            }, 'game');
            return { success: false, message: '库存不足' };
        }

        // 计算价格
        const totalPrice = merchantItem.unitPrice * quantity;

        // 检查玩家金币
        const currencyService = window.gameCore?.getService('currencyService');
        if (!currencyService || !currencyService.canAfford(totalPrice)) {
            this.eventBus.emit('ui:notification', {
                message: '💰 金币不足！',
                type: 'warning'
            }, 'game');
            return { success: false, message: '金币不足' };
        }

        // 检查背包空间
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (!inventoryService) {
            return { success: false, message: '背包系统不可用' };
        }

        const stats = inventoryService.getInventoryStats();
        if (stats.freeSlots <= 0 && !merchantItem.data.stackable) {
            this.eventBus.emit('ui:notification', {
                message: '背包已满！',
                type: 'warning'
            }, 'game');
            return { success: false, message: '背包已满' };
        }

        // 扣除金币
        if (!currencyService.removeCurrency(totalPrice)) {
            return { success: false, message: '支付失败' };
        }

        // 添加物品到背包
        const addResult = inventoryService.addItem(itemName, quantity);
        if (!addResult) {
            // 添加失败，退还金币
            currencyService.addCurrency(totalPrice);
            return { success: false, message: '添加物品失败' };
        }

        // 减少商人库存
        merchantItem.quantity -= quantity;
        if (merchantItem.quantity <= 0) {
            // 从库存中移除
            const index = this.currentInventory.indexOf(merchantItem);
            if (index > -1) {
                this.currentInventory.splice(index, 1);
            }
        }

        // 通知界面更新
        this.eventBus.emit('merchant:inventory:updated', {
            inventory: this.currentInventory
        }, 'game');

        return { 
            success: true, 
            message: `成功购买 ${itemName} x${quantity}`,
            remainingQuantity: merchantItem.quantity
        };
    }

    /**
     * 关闭商店
     */
    closeShop() {
        this.currentInventory = null;
        this.eventBus.emit('ui:merchant:hide', {}, 'game');
    }

    /**
     * 获取当前商品库存
     */
    getCurrentInventory() {
        return this.currentInventory;
    }
}

export default MerchantService;