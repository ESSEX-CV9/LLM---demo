// 锤类武器数据（单手锤、双手锤）
export const Weapons_Hammers = {
    // ========== 单手锤 ==========
    // 1-30级
    '木棒': {
        id: 'wooden_club',
        name: '木棒',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 3,
        description: '简陋的木制棍棒',
        icon: './assets/icons/weapons/club1.png',
        stats: {
            attack: 12,
            physicalPower: 10,
            weight: 6,
            agility: -1
        },
        requirements: { level: 3 },
        value: 40
    },
    
    '铁锤': {
        id: 'iron_hammer',
        name: '铁锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 6,
        description: '沉重的铁制战锤',
        icon: './assets/icons/weapons/hammer1.png',
        stats: {
            attack: 18,
            physicalPower: 16,
            weight: 8,
            agility: -2
        },
        requirements: { level: 6 },
        value: 110
    },
    
    '战锤': {
        id: 'war_hammer',
        name: '战锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 10,
        description: '战场上的钝击武器',
        icon: './assets/icons/weapons/hammer1.png',
        stats: {
            attack: 28,
            physicalPower: 26,
            weight: 10,
            agility: -2,
            criticalChance: 2
        },
        requirements: { level: 10 },
        value: 350
    },
    
    '强化战锤': {
        id: 'reinforced_war_hammer',
        name: '强化战锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 18,
        description: '加固过的强力战锤',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 50,
            physicalPower: 48,
            weight: 11,
            agility: -2,
            criticalChance: 5
        },
        effects: [
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 1,
                chance: 0.2,
                description: '攻击有20%几率晕眩1回合'
            }
        ],
        requirements: { level: 18 },
        value: 1100
    },
    
    '雷霆战锤': {
        id: 'thunder_hammer',
        name: '雷霆战锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 25,
        description: '蕴含雷电之力的战锤',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 72,
            physicalPower: 70,
            weight: 11,
            agility: -1,
            criticalChance: 9
        },
        effects: [
            {
                type: 'elemental_damage',
                element: 'thunder',
                value: 15,
                description: '攻击附加雷电伤害15点'
            }
        ],
        requirements: { level: 25 },
        value: 2700
    },
    
    // 30-60级
    '泰坦之锤': {
        id: 'titan_hammer',
        name: '泰坦之锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 42,
        description: '泰坦巨人使用的战锤',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 152,
            physicalPower: 150,
            weight: 11,
            agility: -1,
            criticalChance: 15
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 26,
                description: '物理强度+26'
            }
        ],
        requirements: { level: 42 },
        value: 13000
    },
    
    '审判之锤': {
        id: 'judgment_hammer',
        name: '审判之锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'oneHandHammer',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '神圣的审判之锤，能够震慑邪恶',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 285,
            physicalPower: 283,
            weight: 9,
            agility: 3,
            criticalChance: 28
        },
        effects: [
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 2,
                chance: 0.55,
                description: '攻击有55%几率晕眩2回合'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 45,
                description: '物理强度+45'
            }
        ],
        requirements: { level: 60 },
        value: 52000
    },

    // ========== 双手锤 ==========
    // 10-40级
    '重锤': {
        id: 'heavy_hammer',
        name: '重锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 10,
        description: '需要双手才能举起的巨锤',
        icon: './assets/icons/weapons/hammer1.png',
        stats: {
            attack: 36,
            physicalPower: 32,
            weight: 14,
            agility: -3
        },
        requirements: { level: 10 },
        value: 380
    },
    
    '铁质巨锤': {
        id: 'iron_maul',
        name: '铁质巨锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 14,
        description: '巨大的铁制战锤',
        icon: './assets/icons/weapons/hammer1.png',
        stats: {
            attack: 50,
            physicalPower: 46,
            weight: 16,
            agility: -4,
            criticalChance: 2
        },
        requirements: { level: 14 },
        value: 700
    },
    
    '破碎者': {
        id: 'skull_crusher',
        name: '破碎者',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'rare',
        level: 26,
        description: '能粉碎一切的恐怖武器',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 104,
            physicalPower: 100,
            weight: 19,
            agility: -3,
            criticalChance: 9
        },
        effects: [
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 1,
                chance: 0.35,
                description: '攻击有35%几率晕眩1回合'
            }
        ],
        requirements: { level: 26 },
        value: 3050
    },
    
    '泰坦巨锤': {
        id: 'titan_maul',
        name: '泰坦巨锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 40,
        description: '泰坦族的神圣武器',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 208,
            physicalPower: 204,
            weight: 17,
            agility: -1,
            criticalChance: 24
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 35,
                description: '物理强度+35'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.9,
                description: '暴击伤害×1.9'
            }
        ],
        requirements: { level: 40 },
        value: 15000
    },
    
    // 60-80级
    '战神之锤': {
        id: 'warhammer_of_ares',
        name: '战神之锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 60,
        description: '战神阿瑞斯的武器，象征着至高无上的力量',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 405,
            physicalPower: 401,
            weight: 15,
            agility: 2,
            criticalChance: 34
        },
        effects: [
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 2,
                chance: 0.6,
                description: '攻击有60%几率晕眩2回合'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.1,
                description: '暴击伤害×2.1'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 55,
                description: '物理强度+55'
            }
        ],
        requirements: { level: 60 },
        value: 65000
    },
    
    '雷神之锤': {
        id: 'mjolnir',
        name: '雷神之锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 80,
        description: '雷神托尔的神器，掌控雷电与风暴',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 765,
            physicalPower: 761,
            weight: 13,
            agility: 5,
            criticalChance: 50
        },
        effects: [
            {
                type: 'elemental_damage',
                element: 'thunder',
                value: 90,
                description: '攻击附加雷电伤害90点'
            },
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 2,
                chance: 0.7,
                description: '攻击有70%几率晕眩2回合'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.3,
                description: '暴击伤害×2.3'
            }
        ],
        requirements: { level: 80 },
        value: 225000
    },
    
    // 100级传说
    '创世之锤': {
        id: 'genesis_hammer',
        name: '创世之锤',
        type: 'weapon',
        subType: 'hammer',
        weaponCategory: 'hammer',
        weaponSubCategory: 'twoHandHammer',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 100,
        description: '创造与毁灭并存的终极武器',
        icon: './assets/icons/weapons/hammer2.png',
        stats: {
            attack: 1530,
            physicalPower: 1530,
            weight: 10,
            agility: 12,
            criticalChance: 65
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 180,
                description: '全属性+180'
            },
            {
                type: 'cc_effect',
                ccType: 'stun',
                duration: 3,
                chance: 1.0,
                description: '攻击必定晕眩3回合'
            },
            {
                type: 'critical_damage_bonus',
                value: 3.5,
                description: '暴击伤害×3.5'
            }
        ],
        requirements: { level: 100 },
        value: 1400000
    }
};