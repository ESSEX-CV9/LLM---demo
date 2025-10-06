// 护腿数据（布裤、皮护腿、镶钉皮护腿、锁甲护腿、板甲护腿）
export const Armors_Legs = {
    // 布裤（法师向）
    '布裤': {
        id: 'cloth_pants',
        name: '布裤',
        type: 'armor',
        subType: 'legs',
        armorType: 'cloth',
        rarity: 'common',
        level: 1,
        description: '简单的布制裤子',
        icon: './assets/icons/armors/legs_cloth_pants.png',
        stats: {
            physicalResistance: 1,
            magicResistance: 2,
            maxHp: 5,
            weight: 1,
            agility: 1
        },
        requirements: { level: 1 },
        value: 8
    },
    
    '奥术长裤': {
        id: 'arcane_pants',
        name: '奥术长裤',
        type: 'armor',
        subType: 'legs',
        armorType: 'cloth',
        rarity: 'epic',
        level: 60,
        description: '蕴含奥术力量的长裤',
        icon: './assets/icons/armors/legs_cloth_pants.png',
        stats: {
            physicalResistance: 21,
            magicResistance: 32,
            maxHp: 239,
            maxMana: 75,
            weight: 2,
            agility: 5
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 75,
                description: '最大MP+75'
            }
        ],
        requirements: { level: 60 },
        value: 21000
    },
    
    '神圣长裤': {
        id: 'divine_pants',
        name: '神圣长裤',
        type: 'armor',
        subType: 'legs',
        armorType: 'cloth',
        rarity: 'legendary',
        level: 100,
        description: '神圣魔法的护腿',
        icon: './assets/icons/armors/legs_cloth_pants.png',
        stats: {
            physicalResistance: 47,
            magicResistance: 99,
            maxHp: 720,
            maxMana: 252,
            weight: 1,
            agility: 12
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 252,
                description: '最大MP+252'
            },
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 22,
                description: '魔法抗性+22%'
            }
        ],
        requirements: { level: 100 },
        value: 552000
    },
    
    // 皮护腿
    '硬皮护腿': {
        id: 'hardened_leather_legs',
        name: '硬皮护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'leather',
        rarity: 'uncommon',
        level: 8,
        description: '硬化处理的皮革护腿',
        icon: './assets/icons/armors/legs_leather_pants.png',
        stats: {
            physicalResistance: 5,
            magicResistance: 2,
            maxHp: 17,
            weight: 4,
            agility: 1
        },
        requirements: { level: 8 },
        value: 100
    },
    
    '刺客护腿': {
        id: 'assassin_legs',
        name: '刺客护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'leather',
        rarity: 'epic',
        level: 68,
        description: '刺客专用的敏捷护腿',
        icon: './assets/icons/armors/legs_leather_pants.png',
        stats: {
            physicalResistance: 34,
            magicResistance: 20,
            maxHp: 287,
            weight: 3,
            agility: 6
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 0.11,
                description: '闪避率+11%'
            }
        ],
        requirements: { level: 68 },
        value: 30500
    },
    
    '暗影战裤': {
        id: 'shadow_warrior_pants',
        name: '暗影战裤',
        type: 'armor',
        subType: 'legs',
        armorType: 'leather',
        rarity: 'legendary',
        level: 100,
        description: '暗影战士的传说护腿',
        icon: './assets/icons/armors/legs_leather_pants.png',
        stats: {
            physicalResistance: 53,
            magicResistance: 59,
            maxHp: 810,
            weight: 2,
            agility: 15
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 14,
                description: '敏捷+14'
            },
            {
                type: 'evasion_bonus',
                value: 0.24,
                description: '闪避率+24%'
            }
        ],
        requirements: { level: 100 },
        value: 552000
    },
    
    // 锁甲护腿
    '精制锁子护腿': {
        id: 'refined_chainmail_legs',
        name: '精制锁子护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'chainmail',
        rarity: 'rare',
        level: 32,
        description: '精工制作的锁甲护腿',
        icon: './assets/icons/armors/legs_chainmail_pants.png',
        stats: {
            physicalResistance: 24,
            magicResistance: 8,
            maxHp: 89,
            weight: 8,
            agility: -1
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 4,
                description: '物理抗性+4%'
            }
        ],
        requirements: { level: 32 },
        value: 3000
    },
    
    // 板甲护腿
    '板甲护腿': {
        id: 'plate_legs',
        name: '板甲护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'plate',
        rarity: 'common',
        level: 40,
        description: '厚重的板甲护腿',
        icon: './assets/icons/armors/legs_plate_pants.png',
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
    
    '精钢护腿': {
        id: 'refined_steel_legs',
        name: '精钢护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'plate',
        rarity: 'rare',
        level: 48,
        description: '精钢打造的坚固护腿',
        icon: './assets/icons/armors/legs_plate_pants.png',
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
                value: 6,
                description: '物理抗性+6%'
            }
        ],
        requirements: { level: 48 },
        value: 10000
    },
    
    '不朽护腿': {
        id: 'immortal_legs',
        name: '不朽护腿',
        type: 'armor',
        subType: 'legs',
        armorType: 'plate',
        rarity: 'legendary',
        level: 100,
        description: '永恒不朽的神之护腿',
        icon: './assets/icons/armors/legs_plate_pants.png',
        stats: {
            physicalResistance: 150,
            magicResistance: 75,
            maxHp: 960,
            weight: 9,
            agility: 2
        },
        effects: [
            {
                type: 'all_resistance',
                value: 0.18,
                description: '全抗性+18%'
            },
            {
                type: 'stat_bonus',
                stat: 'maxHp',
                value: 120,
                description: '最大HP+120'
            }
        ],
        requirements: { level: 100 },
        value: 570000
    }
};