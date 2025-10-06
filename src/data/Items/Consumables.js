// 消耗品数据
export const Consumables = {
    // 治疗药水系列
    '小瓶治疗药水': {
        id: 'healing_potion_small',
        name: '小瓶治疗药水',
        type: 'consumable',
        subType: 'healing',
        description: '恢复30点生命值的小瓶药水',
        effect: { type: 'heal', value: 30 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_healing_small.png',
        stackable: true,
        maxStack: 99,
        value: 15
    },
    '中瓶治疗药水': {
        id: 'healing_potion_medium',
        name: '中瓶治疗药水',
        type: 'consumable',
        subType: 'healing',
        description: '恢复60点生命值的中瓶药水',
        effect: { type: 'heal', value: 60 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_healing_medium.png',
        stackable: true,
        maxStack: 99,
        value: 30
    },
    '大瓶治疗药水': {
        id: 'healing_potion_large',
        name: '大瓶治疗药水',
        type: 'consumable',
        subType: 'healing',
        description: '恢复100点生命值的大瓶药水',
        effect: { type: 'heal', value: 100 },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_healing_large.png',
        stackable: true,
        maxStack: 99,
        value: 60
    },
    '特大瓶治疗药水': {
        id: 'healing_potion_extra_large',
        name: '特大瓶治疗药水',
        type: 'consumable',
        subType: 'healing',
        description: '恢复200点生命值的特大瓶药水',
        effect: { type: 'heal', value: 200 },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_healing_extra_large.png',
        stackable: true,
        maxStack: 50,
        value: 120
    },

    // 法力药水系列
    '小瓶法力药水': {
        id: 'mana_potion_small',
        name: '小瓶法力药水',
        type: 'consumable',
        subType: 'mana',
        description: '恢复20点法力值的小瓶蓝色药水',
        effect: { type: 'restore_mana', value: 20 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_mana_small.png',
        stackable: true,
        maxStack: 99,
        value: 12
    },
    '中瓶法力药水': {
        id: 'mana_potion_medium',
        name: '中瓶法力药水',
        type: 'consumable',
        subType: 'mana',
        description: '恢复40点法力值的中瓶蓝色药水',
        effect: { type: 'restore_mana', value: 40 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_mana_medium.png',
        stackable: true,
        maxStack: 99,
        value: 25
    },
    '大瓶法力药水': {
        id: 'mana_potion_large',
        name: '大瓶法力药水',
        type: 'consumable',
        subType: 'mana',
        description: '恢复80点法力值的大瓶蓝色药水',
        effect: { type: 'restore_mana', value: 80 },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_mana_large.png',
        stackable: true,
        maxStack: 99,
        value: 50
    },
    '特大瓶法力药水': {
        id: 'mana_potion_extra_large',
        name: '特大瓶法力药水',
        type: 'consumable',
        subType: 'mana',
        description: '恢复150点法力值的特大瓶蓝色药水',
        effect: { type: 'restore_mana', value: 150 },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_mana_extra_large.png',
        stackable: true,
        maxStack: 50,
        value: 100
    },

    // 耐力药水系列
    '小瓶耐力药水': {
        id: 'stamina_potion_small',
        name: '小瓶耐力药水',
        type: 'consumable',
        subType: 'stamina',
        description: '恢复15点耐力值的小瓶绿色药水',
        effect: { type: 'restore_stamina', value: 15 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_stamina_small.png',
        stackable: true,
        maxStack: 99,
        value: 10
    },
    '中瓶耐力药水': {
        id: 'stamina_potion_medium',
        name: '中瓶耐力药水',
        type: 'consumable',
        subType: 'stamina',
        description: '恢复30点耐力值的中瓶绿色药水',
        effect: { type: 'restore_stamina', value: 30 },
        rarity: 'common',
        icon: './assets/icons/potion/potion_stamina_medium.png',
        stackable: true,
        maxStack: 99,
        value: 20
    },
    '大瓶耐力药水': {
        id: 'stamina_potion_large',
        name: '大瓶耐力药水',
        type: 'consumable',
        subType: 'stamina',
        description: '恢复60点耐力值的大瓶绿色药水',
        effect: { type: 'restore_stamina', value: 60 },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_stamina_large.png',
        stackable: true,
        maxStack: 99,
        value: 40
    },
    '特大瓶耐力药水': {
        id: 'stamina_potion_extra_large',
        name: '特大瓶耐力药水',
        type: 'consumable',
        subType: 'stamina',
        description: '恢复120点耐力值的特大瓶绿色药水',
        effect: { type: 'restore_stamina', value: 120 },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_stamina_extra_large.png',
        stackable: true,
        maxStack: 50,
        value: 80
    },

    // 增益药水
    '力量药水': {
        id: 'strength_potion',
        name: '力量药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加12点攻击力，持续5回合',
        effect: { 
            type: 'temp_buff', 
            stats: { attack: 12 },
            duration: 5 
        },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_strength.png',
        stackable: true,
        maxStack: 20,
        value: 60
    },
    '防御药水': {
        id: 'defense_potion',
        name: '防御药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加8%物理抗性和5%魔法抗性，持续5回合',
        effect: {
            type: 'temp_buff',
            stats: { physicalResistance: 8, magicResistance: 5 },
            duration: 5
        },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_defense.png',
        stackable: true,
        maxStack: 20,
        value: 55
    },
    '敏捷药水': {
        id: 'agility_potion',
        name: '敏捷药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加5点敏捷，持续8回合',
        effect: {
            type: 'temp_buff',
            stats: { agility: 5 },
            duration: 8
        },
        rarity: 'uncommon',
        icon: './assets/icons/potion/potion_speed.png',
        stackable: true,
        maxStack: 20,
        value: 45
    },
    '暴击药水': {
        id: 'critical_potion',
        name: '暴击药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加15%暴击率，持续6回合',
        effect: { 
            type: 'temp_buff', 
            stats: { criticalChance: 15 },
            duration: 6 
        },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_critical.png',
        stackable: true,
        maxStack: 15,
        value: 80
    },
    '物理强化药水': {
        id: 'physical_boost_potion',
        name: '物理强化药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加15点物理强度，持续4回合',
        effect: { 
            type: 'temp_buff', 
            stats: { physicalPower: 15 },
            duration: 4 
        },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_physical_boost.png',
        stackable: true,
        maxStack: 15,
        value: 90
    },
    '魔法强化药水': {
        id: 'magic_boost_potion',
        name: '魔法强化药水',
        type: 'consumable',
        subType: 'buff',
        description: '临时增加18点魔法强度，持续4回合',
        effect: { 
            type: 'temp_buff', 
            stats: { magicPower: 18 },
            duration: 4 
        },
        rarity: 'rare',
        icon: './assets/icons/potion/potion_magic_boost.png',
        stackable: true,
        maxStack: 15,
        value: 95
    },

    // 材料
    '铁矿石': {
        id: 'iron_ore',
        name: '铁矿石',
        type: 'material',
        subType: 'ore',
        description: '用于锻造武器和防具的基础材料',
        rarity: 'common',
        icon: '⛏️',
        stackable: true,
        maxStack: 99,
        value: 8
    },
    '皮革': {
        id: 'leather',
        name: '皮革',
        type: 'material',
        subType: 'hide',
        description: '制作轻甲的基础材料',
        rarity: 'common',
        icon: '🦌',
        stackable: true,
        maxStack: 99,
        value: 12
    },
    '魔法水晶': {
        id: 'magic_crystal',
        name: '魔法水晶',
        type: 'material',
        subType: 'crystal',
        description: '蕴含魔法能量的珍贵水晶',
        rarity: 'rare',
        icon: '💎',
        stackable: true,
        maxStack: 50,
        value: 100
    },

    // 货币
    '铜币': {
        id: 'copper_coin',
        name: '铜币',
        type: 'currency',
        subType: 'coin',
        description: '基础货币',
        rarity: 'common',
        icon: '🪙',
        stackable: true,
        maxStack: 9999,
        value: 1
    },
    '银币': {
        id: 'silver_coin',
        name: '银币',
        type: 'currency',
        subType: 'coin',
        description: '中级货币，价值100铜币',
        rarity: 'uncommon',
        icon: '🥈',
        stackable: true,
        maxStack: 999,
        value: 100
    },
    '金币': {
        id: 'gold_coin',
        name: '金币',
        type: 'currency',
        subType: 'coin',
        description: '高级货币，价值100银币',
        rarity: 'rare',
        icon: '🥇',
        stackable: true,
        maxStack: 999,
        value: 10000
    }
};