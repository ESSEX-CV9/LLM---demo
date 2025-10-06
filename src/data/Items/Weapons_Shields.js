// 盾牌数据
export const Weapons_Shields = {
    // 1-30级
    '木盾': {
        id: 'wooden_shield',
        name: '木盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 1,
        description: '简陋的木制盾牌',
        icon: '🛡️',
        stats: {
            attack: 2,
            physicalResistance: 4,
            magicResistance: 2,
            maxHp: 8,
            weight: 4,
            agility: -1
        },
        requirements: { level: 1 },
        value: 20
    },
    
    '皮盾': {
        id: 'leather_shield',
        name: '皮盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 4,
        description: '皮革制成的轻便盾牌',
        icon: '🛡️',
        stats: {
            attack: 4,
            physicalResistance: 6,
            magicResistance: 3,
            maxHp: 14,
            weight: 5,
            agility: -1
        },
        requirements: { level: 4 },
        value: 65
    },
    
    '铁盾': {
        id: 'iron_shield',
        name: '铁盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 8,
        description: '坚固的铁制盾牌',
        icon: '🛡️',
        stats: {
            attack: 6,
            physicalResistance: 9,
            magicResistance: 5,
            maxHp: 24,
            weight: 7,
            agility: -2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.05,
                description: '格挡率+5%'
            }
        ],
        requirements: { level: 8 },
        value: 180
    },
    
    '钢盾': {
        id: 'steel_shield',
        name: '钢盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 12,
        description: '钢铁铸造的坚实盾牌',
        icon: '🛡️',
        stats: {
            attack: 8,
            physicalResistance: 13,
            magicResistance: 7,
            maxHp: 36,
            weight: 9,
            agility: -2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.08,
                description: '格挡率+8%'
            }
        ],
        requirements: { level: 12 },
        value: 420
    },
    
    '强化钢盾': {
        id: 'reinforced_steel_shield',
        name: '强化钢盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 16,
        description: '经过强化的优质钢盾',
        icon: '🛡️',
        stats: {
            attack: 10,
            physicalResistance: 17,
            magicResistance: 10,
            maxHp: 50,
            weight: 10,
            agility: -2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.1,
                description: '格挡率+10%'
            },
            {
                type: 'damage_reduction',
                value: 0.04,
                description: '受到伤害-4%'
            }
        ],
        requirements: { level: 16 },
        value: 850
    },
    
    '秘银盾': {
        id: 'mithril_shield',
        name: '秘银盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 20,
        description: '秘银打造的轻盈盾牌',
        icon: '🛡️',
        stats: {
            attack: 12,
            physicalResistance: 22,
            magicResistance: 14,
            maxHp: 68,
            weight: 10,
            agility: -2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.12,
                description: '格挡率+12%'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 4,
                description: '物理抗性+4%'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    '符文盾': {
        id: 'runic_shield',
        name: '符文盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 24,
        description: '刻有古老符文的魔法盾牌',
        icon: '🛡️',
        stats: {
            attack: 14,
            physicalResistance: 28,
            magicResistance: 18,
            maxHp: 88,
            weight: 10,
            agility: -1
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.15,
                description: '格挡率+15%'
            },
            {
                type: 'damage_reduction',
                value: 0.07,
                description: '受到伤害-7%'
            }
        ],
        requirements: { level: 24 },
        value: 2450
    },
    
    '龙鳞盾': {
        id: 'dragonscale_shield',
        name: '龙鳞盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 28,
        description: '龙鳞铸成的强大盾牌',
        icon: '🛡️',
        stats: {
            attack: 17,
            physicalResistance: 34,
            magicResistance: 23,
            maxHp: 112,
            weight: 11,
            agility: -2
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.2,
                description: '火焰抗性+20%'
            },
            {
                type: 'block_chance',
                value: 0.18,
                description: '格挡率+18%'
            }
        ],
        requirements: { level: 28 },
        value: 3750
    },
    
    // 31-60级
    '堡垒之盾': {
        id: 'fortress_shield',
        name: '堡垒之盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 33,
        description: '如城堡般坚固的盾牌',
        icon: '🛡️',
        stats: {
            attack: 22,
            physicalResistance: 44,
            magicResistance: 31,
            maxHp: 148,
            weight: 11,
            agility: -2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.1,
                description: '格挡率+10%'
            }
        ],
        requirements: { level: 33 },
        value: 6050
    },
    
    '虚空之盾': {
        id: 'void_shield',
        name: '虚空之盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 42,
        description: '吸收虚空之力的神秘盾牌',
        icon: '🛡️',
        stats: {
            attack: 35,
            physicalResistance: 68,
            magicResistance: 49,
            maxHp: 242,
            weight: 11,
            agility: -1
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.2,
                description: '格挡率+20%'
            },
            {
                type: 'reflect',
                percent: 0.08,
                description: '反伤8%'
            }
        ],
        requirements: { level: 42 },
        value: 13000
    },
    
    '守护者之盾': {
        id: 'guardian_shield',
        name: '守护者之盾',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '守护者的传说盾牌，提供绝对防护',
        icon: '🛡️',
        stats: {
            attack: 82,
            physicalResistance: 145,
            magicResistance: 115,
            maxHp: 590,
            weight: 9,
            agility: 2
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.25,
                description: '格挡率+25%'
            },
            {
                type: 'all_resistance',
                value: 0.15,
                description: '全抗性+15%'
            },
            {
                type: 'damage_reduction',
                value: 0.16,
                description: '受到伤害-16%'
            },
            {
                type: 'reflect',
                percent: 0.12,
                description: '反伤12%'
            }
        ],
        requirements: { level: 60 },
        value: 62000
    },
    
    // 80级传说
    '永恒壁垒': {
        id: 'eternal_bulwark',
        name: '永恒壁垒',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 80,
        description: '永恒不灭的防御壁垒',
        icon: '🛡️',
        stats: {
            attack: 180,
            physicalResistance: 320,
            magicResistance: 260,
            maxHp: 1300,
            weight: 7,
            agility: 6
        },
        effects: [
            {
                type: 'block_chance',
                value: 0.32,
                description: '格挡率+32%'
            },
            {
                type: 'all_resistance',
                value: 0.2,
                description: '全抗性+20%'
            },
            {
                type: 'damage_reduction',
                value: 0.24,
                description: '受到伤害-24%'
            },
            {
                type: 'reflect',
                percent: 0.22,
                description: '反伤22%'
            }
        ],
        requirements: { level: 80 },
        value: 205000
    },
    
    // 100级传说
    '终极壁垒': {
        id: 'ultimate_aegis',
        name: '终极壁垒',
        type: 'weapon',
        subType: 'shield',
        weaponCategory: 'shield',
        weaponSubCategory: 'shield',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 100,
        description: '无法破坏的绝对防御',
        icon: '🛡️',
        stats: {
            attack: 420,
            physicalResistance: 750,
            magicResistance: 650,
            maxHp: 3200,
            weight: 5,
            agility: 15
        },
        effects: [
            {
                type: 'all_resistance',
                value: 0.75,
                description: '全抗性达上限'
            },
            {
                type: 'block_chance',
                value: 0.5,
                description: '格挡率50%'
            },
            {
                type: 'damage_reduction',
                value: 0.4,
                description: '受到伤害-40%'
            },
            {
                type: 'reflect',
                percent: 0.35,
                description: '反伤35%'
            }
        ],
        requirements: { level: 100 },
        value: 1800000
    }
};