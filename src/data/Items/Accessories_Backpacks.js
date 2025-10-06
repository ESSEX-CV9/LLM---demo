// 背包数据
export const Accessories_Backpacks = {
    '小布包': {
        id: 'small_cloth_bag',
        name: '小布包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'common',
        level: 1,
        description: '简单的小布包',
        icon: './assets/icons/MISC/backpack_small.png',
        stats: {
            inventorySlots: 5
        },
        requirements: { level: 1 },
        value: 40
    },
    
    '皮背包': {
        id: 'leather_backpack',
        name: '皮背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'common',
        level: 10,
        description: '实用的皮革背包',
        icon: './assets/icons/MISC/backpack_medium.png',
        stats: {
            inventorySlots: 8,
            agility: 1
        },
        requirements: { level: 10 },
        value: 250
    },
    
    '大皮包': {
        id: 'large_leather_bag',
        name: '大皮包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'uncommon',
        level: 20,
        description: '容量较大的皮包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 12,
            agility: 2,
            weight: -1
        },
        requirements: { level: 20 },
        value: 1000
    },
    
    '强化背包': {
        id: 'reinforced_backpack',
        name: '强化背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'rare',
        level: 30,
        description: '经过强化的耐用背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 16,
            agility: 3,
            weight: -2
        },
        requirements: { level: 30 },
        value: 3500
    },
    
    '秘银背包': {
        id: 'mithril_backpack',
        name: '秘银背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'rare',
        level: 40,
        description: '秘银编织的轻便背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 20,
            agility: 4,
            weight: -3,
            maxHp: 30
        },
        requirements: { level: 40 },
        value: 9000
    },
    
    '符文背包': {
        id: 'runic_backpack',
        name: '符文背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'epic',
        level: 50,
        description: '刻有扩容符文的魔法背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 25,
            agility: 5,
            weight: -4,
            attack: 8,
            physicalPower: 8,
            magicPower: 8
        },
        requirements: { level: 50 },
        value: 20000
    },
    
    '奥术背包': {
        id: 'arcane_backpack',
        name: '奥术背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'epic',
        level: 60,
        description: '蕴含奥术之力的背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 30,
            agility: 6,
            weight: -5,
            attack: 12,
            physicalPower: 12,
            magicPower: 12
        },
        requirements: { level: 60 },
        value: 38000
    },
    
    '虚空背包': {
        id: 'void_backpack',
        name: '虚空背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'rare',
        level: 70,
        description: '连接虚空空间的背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 35,
            agility: 7,
            weight: -6,
            attack: 15,
            physicalPower: 15,
            magicPower: 15
        },
        requirements: { level: 70 },
        value: 65000
    },
    
    '神铸背包': {
        id: 'divine_backpack',
        name: '神铸背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'epic',
        level: 80,
        description: '神匠打造的完美背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 45,
            agility: 9,
            weight: -8,
            attack: 22,
            physicalPower: 22,
            magicPower: 22
        },
        requirements: { level: 80 },
        value: 125000
    },
    
    '次元背包': {
        id: 'dimensional_backpack',
        name: '次元背包',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'epic',
        level: 90,
        description: '打开次元空间的神奇背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 55,
            agility: 11,
            weight: -10,
            attack: 30,
            physicalPower: 30,
            magicPower: 30
        },
        requirements: { level: 90 },
        value: 240000
    },
    
    '无尽之袋': {
        id: 'endless_bag',
        name: '无尽之袋',
        type: 'accessory',
        subType: 'backpack',
        rarity: 'legendary',
        level: 100,
        description: '拥有近乎无限空间的传说背包',
        icon: './assets/icons/MISC/backpack_large.png',
        stats: {
            inventorySlots: 100,
            agility: 15,
            weight: -15,
            attack: 50,
            physicalPower: 50,
            magicPower: 50
        },
        effects: [
            {
                type: 'item_weight_reduction',
                value: 0.5,
                description: '所有物品重量减半'
            }
        ],
        requirements: { level: 100 },
        value: 750000
    }
};