// 斧类武器数据（单手斧、双手斧）
export const Weapons_Axes = {
    // ========== 单手斧 ==========
    // 1-20级
    '手斧': {
        id: 'hand_axe',
        name: '手斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 2,
        description: '简单的单手战斧',
        icon: './assets/icons/weapons/axe1.png',
        stats: {
            attack: 10,
            physicalPower: 10,
            weight: 6,
            agility: -1
        },
        requirements: { level: 2 },
        value: 30
    },
    
    '铁斧': {
        id: 'iron_axe',
        name: '铁斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 5,
        description: '坚固的铁制战斧',
        icon: './assets/icons/weapons/axe1.png',
        stats: {
            attack: 16,
            physicalPower: 16,
            weight: 7,
            agility: -1,
            criticalChance: 2
        },
        requirements: { level: 5 },
        value: 80
    },
    
    '战斧': {
        id: 'battle_axe',
        name: '战斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 8,
        description: '战场上常见的单手斧',
        icon: './assets/icons/weapons/axe2.png',
        stats: {
            attack: 23,
            physicalPower: 23,
            weight: 8,
            agility: -2,
            criticalChance: 4
        },
        requirements: { level: 8 },
        value: 180
    },
    
    '钢制战斧': {
        id: 'steel_battle_axe',
        name: '钢制战斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 14,
        description: '用优质钢材打造的战斧',
        icon: './assets/icons/weapons/axe2.png',
        stats: {
            attack: 38,
            physicalPower: 38,
            weight: 8,
            agility: -1,
            criticalChance: 7
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'attack',
                value: 5,
                description: '攻击力+5'
            }
        ],
        requirements: { level: 14 },
        value: 600
    },
    
    '秘银战斧': {
        id: 'mithril_battle_axe',
        name: '秘银战斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 20,
        description: '秘银合金打造的轻便战斧',
        icon: './assets/icons/weapons/axe3.png',
        stats: {
            attack: 55,
            physicalPower: 55,
            weight: 8,
            agility: -1,
            criticalChance: 11
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.3,
                description: '暴击伤害+30%'
            }
        ],
        requirements: { level: 20 },
        value: 1450
    },
    
    // 21-40级
    '破甲战斧': {
        id: 'armor_breaker_axe',
        name: '破甲战斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 32,
        description: '专门设计用来破坏敌人护甲',
        icon: './assets/icons/weapons/axe3.png',
        stats: {
            attack: 90,
            physicalPower: 90,
            weight: 8,
            agility: 0,
            criticalChance: 14
        },
        effects: [
            {
                type: 'penetration',
                physical: 15,
                description: '无视15%物理抗性'
            }
        ],
        requirements: { level: 32 },
        value: 5200
    },
    
    '屠龙之斧': {
        id: 'dragonslayer_axe',
        name: '屠龙之斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 40,
        description: '传说中屠龙者的武器',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 132,
            physicalPower: 132,
            weight: 7,
            agility: 3,
            criticalChance: 20
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '龙族',
                value: 1.75,
                description: '对龙族伤害+75%'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.45,
                description: '暴击伤害+45%'
            }
        ],
        requirements: { level: 40 },
        value: 13500
    },
    
    // 60级传说
    '审判战斧': {
        id: 'judgment_axe',
        name: '审判战斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'oneHandAxe',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '执行审判的神圣战斧',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 248,
            physicalPower: 248,
            weight: 6,
            agility: 5,
            criticalChance: 28
        },
        effects: [
            {
                type: 'execute_damage',
                threshold: 0.4,
                bonus: 1.6,
                description: '攻击低于40%HP目标+60%伤害'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.0,
                description: '暴击伤害×2.0'
            }
        ],
        requirements: { level: 60 },
        value: 55000
    },

    // ========== 双手斧 ==========
    // 5-30级
    '大斧': {
        id: 'great_axe',
        name: '大斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 5,
        description: '需要双手挥舞的巨大斧头',
        icon: './assets/icons/weapons/axe2.png',
        stats: {
            attack: 22,
            physicalPower: 20,
            weight: 12,
            agility: -3
        },
        requirements: { level: 5 },
        value: 100
    },
    
    '重斧': {
        id: 'heavy_axe',
        name: '重斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 8,
        description: '极其沉重的双手斧',
        icon: './assets/icons/weapons/axe2.png',
        stats: {
            attack: 30,
            physicalPower: 28,
            weight: 13,
            agility: -3,
            criticalChance: 2
        },
        requirements: { level: 8 },
        value: 200
    },
    
    '战场巨斧': {
        id: 'battlefield_greataxe',
        name: '战场巨斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'uncommon',
        level: 12,
        description: '战场上使用的巨型战斧',
        icon: './assets/icons/weapons/axe3.png',
        stats: {
            attack: 42,
            physicalPower: 40,
            weight: 14,
            agility: -3,
            criticalChance: 4
        },
        requirements: { level: 12 },
        value: 450
    },
    
    '破甲巨斧': {
        id: 'armor_crusher_greataxe',
        name: '破甲巨斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'rare',
        level: 20,
        description: '专门用来破坏重甲的巨斧',
        icon: './assets/icons/weapons/axe3.png',
        stats: {
            attack: 72,
            physicalPower: 70,
            weight: 15,
            agility: -3,
            criticalChance: 8
        },
        effects: [
            {
                type: 'penetration',
                physical: 10,
                description: '无视10%物理抗性'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    '符文巨斧': {
        id: 'runic_greataxe',
        name: '符文巨斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 30,
        description: '刻有远古符文的强大战斧',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 120,
            physicalPower: 118,
            weight: 15,
            agility: -2,
            criticalChance: 14
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalPower',
                value: 22,
                description: '物理强度+22'
            }
        ],
        requirements: { level: 30 },
        value: 4800
    },
    
    // 40-60级
    '嗜血巨斧': {
        id: 'bloodthirst_greataxe',
        name: '嗜血巨斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 57,
        description: '渴望鲜血的恐怖武器',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 300,
            physicalPower: 298,
            weight: 15,
            agility: -1,
            criticalChance: 22
        },
        effects: [
            {
                type: 'lifesteal',
                percent: 0.42,
                description: '暴击时吸取42%伤害为HP'
            }
        ],
        requirements: { level: 57 },
        value: 36500
    },
    
    '屠龙巨斧': {
        id: 'dragon_slayer_greataxe',
        name: '屠龙巨斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 60,
        description: '专为屠龙而生的传说武器',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 340,
            physicalPower: 338,
            weight: 14,
            agility: 1,
            criticalChance: 30
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '龙族',
                value: 1.88,
                description: '对龙族伤害+88%'
            },
            {
                type: 'critical_damage_bonus',
                value: 2.0,
                description: '暴击伤害×2.0'
            },
            {
                type: 'stat_bonus',
                stat: 'attack',
                value: 30,
                description: '攻击力+30'
            }
        ],
        requirements: { level: 60 },
        value: 52000
    },
    
    // 80级传说
    '毁灭之斧': {
        id: 'annihilation_axe',
        name: '毁灭之斧',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 80,
        description: '毁灭万物的终极武器',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 600,
            physicalPower: 598,
            weight: 12,
            agility: 4,
            criticalChance: 38
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 2.5,
                description: '暴击伤害×2.5'
            },
            {
                type: 'max_hp_damage',
                percent: 0.3,
                max_damage: 125,
                description: '攻击附加目标30%最大HP伤害(上限125)'
            }
        ],
        requirements: { level: 80 },
        value: 168000
    },
    
    // 100级传说
    '终极破坏': {
        id: 'ultimate_destroyer',
        name: '终极破坏',
        type: 'weapon',
        subType: 'axe',
        weaponCategory: 'axe',
        weaponSubCategory: 'twoHandAxe',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 100,
        description: '破坏一切的绝对力量',
        icon: './assets/icons/weapons/axe4.png',
        stats: {
            attack: 1150,
            physicalPower: 1150,
            weight: 9,
            agility: 10,
            criticalChance: 52
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 140,
                description: '全属性+140'
            },
            {
                type: 'guaranteed_critical',
                description: '攻击必定暴击'
            },
            {
                type: 'penetration',
                physical: 48,
                description: '无视48%物理抗性'
            }
        ],
        requirements: { level: 100 },
        value: 1050000
    }
};