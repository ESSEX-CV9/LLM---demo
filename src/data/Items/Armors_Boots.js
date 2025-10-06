// 靴子数据（布鞋、皮靴、镶钉皮靴、锁甲靴、板甲靴）
export const Armors_Boots = {
    // 布鞋（法师向）
    '布鞋': {
        id: 'cloth_shoes',
        name: '布鞋',
        type: 'armor',
        subType: 'boots',
        armorType: 'cloth',
        rarity: 'common',
        level: 1,
        description: '简单的布制鞋子',
        icon: './assets/icons/armors/boots_cloth_shoes.png',
        stats: {
            physicalResistance: 1,
            magicResistance: 2,
            maxHp: 3,
            weight: 1,
            agility: 2
        },
        requirements: { level: 1 },
        value: 5
    },
    
    '秘法之靴': {
        id: 'arcane_boots',
        name: '秘法之靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'cloth',
        rarity: 'epic',
        level: 56,
        description: '增强法力恢复的魔法靴',
        icon: './assets/icons/armors/boots_cloth_shoes.png',
        stats: {
            physicalResistance: 17,
            magicResistance: 25,
            maxHp: 185,
            weight: 2,
            agility: 6
        },
        effects: [
            {
                type: 'mana_regeneration',
                value: 4,
                description: '每回合+4MP'
            }
        ],
        requirements: { level: 56 },
        value: 16200
    },
    
    '神圣法靴': {
        id: 'divine_boots',
        name: '神圣法靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'cloth',
        rarity: 'legendary',
        level: 100,
        description: '神圣魔法的靴子',
        icon: './assets/icons/armors/boots_cloth_shoes.png',
        stats: {
            physicalResistance: 47,
            magicResistance: 99,
            maxHp: 720,
            maxMana: 252,
            weight: 1,
            agility: 14
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 252,
                description: '最大MP+252'
            },
            {
                type: 'mana_regeneration',
                value: 12,
                description: '每回合+12MP'
            }
        ],
        requirements: { level: 100 },
        value: 552000
    },
    
    // 皮靴
    '皮靴': {
        id: 'leather_boots',
        name: '皮靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'leather',
        rarity: 'uncommon',
        level: 6,
        description: '轻便的皮制靴子',
        icon: './assets/icons/armors/boots_leather.png',
        stats: {
            physicalResistance: 4,
            magicResistance: 3,
            maxHp: 11,
            weight: 3,
            agility: 2
        },
        requirements: { level: 6 },
        value: 55
    },
    
    '疾风之靴': {
        id: 'gale_boots',
        name: '疾风之靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'leather',
        rarity: 'epic',
        level: 50,
        description: '如风般迅捷的靴子',
        icon: './assets/icons/armors/boots_leather.png',
        stats: {
            physicalResistance: 22,
            magicResistance: 14,
            maxHp: 160,
            weight: 3,
            agility: 7
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 4,
                description: '敏捷+4'
            },
            {
                type: 'movement_speed',
                value: 0.12,
                description: '移动速度+12%'
            }
        ],
        requirements: { level: 50 },
        value: 13200
    },
    
    '暗影之靴': {
        id: 'shadow_boots',
        name: '暗影之靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'leather',
        rarity: 'epic',
        level: 64,
        description: '隐匿于暗影中的靴子',
        icon: './assets/icons/armors/boots_leather.png',
        stats: {
            physicalResistance: 34,
            magicResistance: 20,
            maxHp: 287,
            weight: 3,
            agility: 8
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 0.1,
                description: '闪避率+10%'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 5,
                description: '敏捷+5'
            }
        ],
        requirements: { level: 64 },
        value: 25500
    },
    
    '影舞之靴': {
        id: 'shadowdance_boots',
        name: '影舞之靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'leather',
        rarity: 'legendary',
        level: 100,
        description: '影舞者的传说之靴',
        icon: './assets/icons/armors/boots_leather.png',
        stats: {
            physicalResistance: 53,
            magicResistance: 59,
            maxHp: 810,
            weight: 2,
            agility: 18
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 16,
                description: '敏捷+16'
            },
            {
                type: 'evasion_bonus',
                value: 0.26,
                description: '闪避率+26%'
            },
            {
                type: 'movement_speed',
                value: 0.45,
                description: '移动速度+45%'
            }
        ],
        requirements: { level: 100 },
        value: 552000
    },
    
    // 镶钉皮靴
    '镶钉皮靴': {
        id: 'studded_boots',
        name: '镶钉皮靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'studded',
        rarity: 'uncommon',
        level: 24,
        description: '镶嵌金属钉的皮靴',
        icon: './assets/icons/armors/boots_studded.png',
        stats: {
            physicalResistance: 14,
            magicResistance: 5,
            maxHp: 53,
            weight: 6,
            agility: 1
        },
        requirements: { level: 24 },
        value: 1200
    },
    
    // 锁甲靴
    '强化锁甲靴': {
        id: 'reinforced_chainmail_boots',
        name: '强化锁甲靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'chainmail',
        rarity: 'rare',
        level: 30,
        description: '强化的锁甲战靴',
        icon: './assets/icons/armors/boots_chainmail.png',
        stats: {
            physicalResistance: 19,
            magicResistance: 6,
            maxHp: 68,
            weight: 8,
            agility: 0
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 3,
                description: '物理抗性+3%'
            }
        ],
        requirements: { level: 30 },
        value: 2900
    },
    
    // 板甲战靴
    '板甲战靴': {
        id: 'plate_boots',
        name: '板甲战靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'plate',
        rarity: 'common',
        level: 40,
        description: '厚重的金属战靴',
        icon: './assets/icons/armors/boots_plate.png',
        stats: {
            physicalResistance: 29,
            magicResistance: 8,
            maxHp: 123,
            weight: 11,
            agility: -2
        },
        requirements: { level: 40 },
        value: 5500
    },
    
    '精钢战靴': {
        id: 'refined_steel_boots',
        name: '精钢战靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'plate',
        rarity: 'rare',
        level: 48,
        description: '精钢制成的坚固战靴',
        icon: './assets/icons/armors/boots_plate.png',
        stats: {
            physicalResistance: 41,
            magicResistance: 13,
            maxHp: 181,
            weight: 12,
            agility: -2
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 5,
                description: '物理抗性+5%'
            }
        ],
        requirements: { level: 48 },
        value: 9900
    },
    
    '龙鳞战靴': {
        id: 'dragonscale_boots',
        name: '龙鳞战靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'plate',
        rarity: 'epic',
        level: 60,
        description: '龙鳞护甲的战靴',
        icon: './assets/icons/armors/boots_plate.png',
        stats: {
            physicalResistance: 65,
            magicResistance: 22,
            maxHp: 298,
            weight: 11,
            agility: -1
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.15,
                description: '火焰抗性+15%'
            }
        ],
        requirements: { level: 60 },
        value: 21000
    },
    
    '不朽战靴': {
        id: 'immortal_boots',
        name: '不朽战靴',
        type: 'armor',
        subType: 'boots',
        armorType: 'plate',
        rarity: 'legendary',
        level: 100,
        description: '永恒不朽的神之战靴',
        icon: './assets/icons/armors/boots_plate.png',
        stats: {
            physicalResistance: 150,
            magicResistance: 75,
            maxHp: 960,
            weight: 9,
            agility: 3
        },
        effects: [
            {
                type: 'all_resistance',
                value: 0.16,
                description: '全抗性+16%'
            },
            {
                type: 'movement_speed',
                value: 0.3,
                description: '移动速度+30%'
            }
        ],
        requirements: { level: 100 },
        value: 570000
    }
};