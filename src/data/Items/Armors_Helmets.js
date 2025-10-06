// 头盔数据（布帽、皮盔、镶钉皮盔、锁甲盔、板甲盔）
export const Armors_Helmets = {
    // 布帽（法师向）
    '布帽': {
        id: 'cloth_hood',
        name: '布帽',
        type: 'armor',
        subType: 'helmet',
        armorType: 'cloth',
        rarity: 'common',
        level: 1,
        description: '简单的布制头巾',
        icon: './assets/icons/armors/helmet_cloth_hood.png',
        stats: {
            physicalResistance: 1,
            magicResistance: 2,
            maxHp: 5,
            weight: 1,
            agility: 1
        },
        requirements: { level: 1 },
        value: 10
    },
    
    '法师头冠': {
        id: 'mage_crown',
        name: '法师头冠',
        type: 'armor',
        subType: 'helmet',
        armorType: 'cloth',
        rarity: 'rare',
        level: 48,
        description: '法师的魔法头冠',
        icon: './assets/icons/armors/helmet_cloth_hood.png',
        stats: {
            physicalResistance: 14,
            magicResistance: 22,
            maxHp: 135,
            maxMana: 38,
            weight: 2,
            agility: 3
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 7,
                description: '魔法抗性+7%'
            }
        ],
        requirements: { level: 48 },
        value: 15200
    },
    
    '神圣法冠': {
        id: 'divine_crown',
        name: '神圣法冠',
        type: 'armor',
        subType: 'helmet',
        armorType: 'cloth',
        rarity: 'legendary',
        level: 100,
        description: '神圣魔法的象征',
        icon: './assets/icons/armors/helmet_cloth_hood.png',
        stats: {
            physicalResistance: 78,
            magicResistance: 165,
            maxHp: 1200,
            maxMana: 420,
            weight: 1,
            agility: 15
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 420,
                description: '最大MP+420'
            },
            {
                type: 'all_resistance',
                value: 0.75,
                description: '魔法抗性达上限'
            },
            {
                type: 'spell_cost_reduction',
                value: 0.45,
                description: '法术消耗-45%'
            }
        ],
        requirements: { level: 100 },
        value: 920000
    },
    
    // 皮盔
    '皮帽': {
        id: 'leather_cap',
        name: '皮帽',
        type: 'armor',
        subType: 'helmet',
        armorType: 'leather',
        rarity: 'common',
        level: 5,
        description: '简单的皮革头盔',
        icon: './assets/icons/armors/helmet_leather.png',
        stats: {
            physicalResistance: 3,
            magicResistance: 1,
            maxHp: 12,
            weight: 2,
            agility: 0
        },
        requirements: { level: 5 },
        value: 60
    },
    
    '刺客头巾': {
        id: 'assassin_hood',
        name: '刺客头巾',
        type: 'armor',
        subType: 'helmet',
        armorType: 'leather',
        rarity: 'epic',
        level: 52,
        description: '刺客的标志性头巾',
        icon: './assets/icons/armors/helmet_leather.png',
        stats: {
            physicalResistance: 20,
            magicResistance: 13,
            maxHp: 172,
            weight: 3,
            agility: 5
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
                value: 4,
                description: '敏捷+4'
            }
        ],
        requirements: { level: 52 },
        value: 19800
    },
    
    '终极暗影': {
        id: 'ultimate_shadow_hood',
        name: '终极暗影',
        type: 'armor',
        subType: 'helmet',
        armorType: 'leather',
        rarity: 'legendary',
        level: 100,
        description: '暗影大师的终极头盔',
        icon: './assets/icons/armors/helmet_leather.png',
        stats: {
            physicalResistance: 88,
            magicResistance: 98,
            maxHp: 1350,
            weight: 2,
            agility: 20
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 18,
                description: '敏捷+18'
            },
            {
                type: 'evasion_bonus',
                value: 0.32,
                description: '闪避率+32%'
            },
            {
                type: 'first_strike',
                description: '必定先手'
            },
            {
                type: 'counter_attack',
                chance: 0.28,
                description: '反击28%'
            }
        ],
        requirements: { level: 100 },
        value: 920000
    },
    
    // 锁甲头盔
    '锁子甲头盔': {
        id: 'chainmail_helmet',
        name: '锁子甲头盔',
        type: 'armor',
        subType: 'helmet',
        armorType: 'chainmail',
        rarity: 'uncommon',
        level: 25,
        description: '锁链护住头部',
        icon: './assets/icons/armors/helmet_chainmail.png',
        stats: {
            physicalResistance: 16,
            magicResistance: 5,
            maxHp: 62,
            weight: 7,
            agility: -1
        },
        requirements: { level: 25 },
        value: 2000
    },
    
    // 板甲头盔
    '板甲头盔': {
        id: 'plate_helmet',
        name: '板甲头盔',
        type: 'armor',
        subType: 'helmet',
        armorType: 'plate',
        rarity: 'uncommon',
        level: 40,
        description: '厚重的金属头盔',
        icon: './assets/icons/armors/helmet_plate.png',
        stats: {
            physicalResistance: 34,
            magicResistance: 10,
            maxHp: 138,
            weight: 10,
            agility: -2
        },
        requirements: { level: 40 },
        value: 8500
    },
    
    '龙鳞头盔': {
        id: 'dragonscale_helmet',
        name: '龙鳞头盔',
        type: 'armor',
        subType: 'helmet',
        armorType: 'plate',
        rarity: 'rare',
        level: 60,
        description: '龙鳞护甲的头盔',
        icon: './assets/icons/armors/helmet_horned_iron.png',
        stats: {
            physicalResistance: 75,
            magicResistance: 26,
            maxHp: 348,
            weight: 11,
            agility: -1
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.2,
                description: '火焰抗性+20%'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 12,
                description: '物理抗性+12%'
            }
        ],
        requirements: { level: 60 },
        value: 33000
    },
    
    '不朽神冠': {
        id: 'immortal_crown',
        name: '不朽神冠',
        type: 'armor',
        subType: 'helmet',
        armorType: 'plate',
        rarity: 'legendary',
        level: 100,
        description: '永恒不灭的神之头盔',
        icon: './assets/icons/armors/helmet_full_knight_plate.png',
        stats: {
            physicalResistance: 250,
            magicResistance: 125,
            maxHp: 1600,
            weight: 9,
            agility: 3
        },
        effects: [
            {
                type: 'all_resistance',
                value: 0.25,
                description: '全抗性+25%'
            },
            {
                type: 'damage_reduction',
                value: 0.3,
                description: '受到伤害-30%'
            },
            {
                type: 'hp_regeneration',
                value: 15,
                description: '每回合+15HP'
            }
        ],
        requirements: { level: 100 },
        value: 950000
    }
};