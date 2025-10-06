// 护符数据
export const Accessories_Amulets = {
    // 1-40级
    '木质护符': {
        id: 'wooden_amulet',
        name: '木质护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'common',
        level: 1,
        description: '简单的木制护符',
        icon: './assets/icons/ringtiles/amulet_life.png',
        stats: {
            maxHp: 12
        },
        requirements: { level: 1 },
        value: 35
    },
    
    '守护护符': {
        id: 'guardian_amulet',
        name: '守护护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'uncommon',
        level: 10,
        description: '提供基础防护的护符',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 35,
            physicalResistance: 3
        },
        requirements: { level: 10 },
        value: 350
    },
    
    '生命护符': {
        id: 'life_amulet',
        name: '生命护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'rare',
        level: 20,
        description: '蕴含生命之力的护符',
        icon: './assets/icons/ringtiles/amulet_life.png',
        stats: {
            maxHp: 70,
            physicalResistance: 5,
            magicResistance: 5
        },
        effects: [
            {
                type: 'hp_regeneration',
                value: 2,
                description: '每回合+2HP'
            }
        ],
        requirements: { level: 20 },
        value: 1400
    },
    
    '秘银护符': {
        id: 'mithril_amulet',
        name: '秘银护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'epic',
        level: 30,
        description: '秘银打造的强大护符',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 115,
            physicalResistance: 8,
            magicResistance: 8
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.08,
                description: '受到伤害-8%'
            },
            {
                type: 'hp_regeneration',
                value: 3,
                description: '每回合+3HP'
            }
        ],
        requirements: { level: 30 },
        value: 4500
    },
    
    '龙鳞护符': {
        id: 'dragonscale_amulet',
        name: '龙鳞护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'epic',
        level: 40,
        description: '龙鳞制成的防护护符',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 170,
            physicalResistance: 11,
            magicResistance: 11
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.2,
                description: '火焰抗性+20%'
            },
            {
                type: 'reflect',
                percent: 0.08,
                description: '反伤8%'
            }
        ],
        requirements: { level: 40 },
        value: 11000
    },
    
    // 41-80级
    '符文护符': {
        id: 'runic_amulet',
        name: '符文护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'epic',
        level: 50,
        description: '刻有古老符文的护符',
        icon: './assets/icons/ringtiles/amulet_arcane.png',
        stats: {
            maxHp: 240,
            physicalResistance: 13,
            magicResistance: 13
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.12,
                description: '受到伤害-12%'
            }
        ],
        requirements: { level: 50 },
        value: 22000
    },
    
    '泰坦护符': {
        id: 'titan_amulet',
        name: '泰坦护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'rare',
        level: 60,
        description: '泰坦之力凝聚的护符',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 320,
            physicalResistance: 10
        },
        effects: [
            {
                type: 'hp_regeneration',
                value: 5,
                description: '每回合+5HP'
            }
        ],
        requirements: { level: 60 },
        value: 41000
    },
    
    '虚空护符': {
        id: 'void_amulet',
        name: '虚空护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'epic',
        level: 70,
        description: '虚空之力的护符',
        icon: './assets/icons/ringtiles/amulet_arcane.png',
        stats: {
            maxHp: 420,
            physicalResistance: 16,
            magicResistance: 16
        },
        effects: [
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
        requirements: { level: 70 },
        value: 69000
    },
    
    '永恒护符': {
        id: 'eternal_amulet',
        name: '永恒护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'legendary',
        level: 80,
        description: '永恒不朽的传说护符',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 560,
            physicalResistance: 20,
            magicResistance: 20
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.2,
                description: '受到伤害-20%'
            },
            {
                type: 'hp_regeneration',
                value: 10,
                description: '每回合+10HP'
            },
            {
                type: 'reflect',
                percent: 0.15,
                description: '反伤15%'
            }
        ],
        requirements: { level: 80 },
        value: 145000
    },
    
    // 81-100级
    '至高护符': {
        id: 'supreme_amulet',
        name: '至高护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'epic',
        level: 90,
        description: '至高力量的护符',
        icon: './assets/icons/ringtiles/amulet_arcane.png',
        stats: {
            maxHp: 720,
            physicalResistance: 24,
            magicResistance: 24
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.24,
                description: '受到伤害-24%'
            },
            {
                type: 'reflect',
                percent: 0.18,
                description: '反伤18%'
            }
        ],
        requirements: { level: 90 },
        value: 270000
    },
    
    '创世护符': {
        id: 'genesis_amulet',
        name: '创世护符',
        type: 'accessory',
        subType: 'amulet',
        rarity: 'legendary',
        level: 100,
        description: '创世之神的护符，能够复活持有者',
        icon: './assets/icons/ringtiles/amulet_defense.png',
        stats: {
            maxHp: 1000,
            physicalResistance: 30,
            magicResistance: 30
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.3,
                description: '受到伤害-30%'
            },
            {
                type: 'hp_regeneration',
                value: 15,
                description: '每回合+15HP'
            },
            {
                type: 'reflect',
                percent: 0.25,
                description: '反伤25%'
            },
            {
                type: 'revive',
                description: '复活一次'
            }
        ],
        requirements: { level: 100 },
        value: 850000
    }
};