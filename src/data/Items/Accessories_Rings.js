// 戒指数据
export const Accessories_Rings = {
    // 1-40级
    '铜戒指': {
        id: 'copper_ring',
        name: '铜戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'common',
        level: 1,
        description: '简单的铜制戒指',
        icon: './assets/icons/ringtiles/ring_novice_adventurer.png',
        stats: {
            maxHp: 8,
            maxMana: 5
        },
        requirements: { level: 1 },
        value: 30
    },
    
    '铁戒指': {
        id: 'iron_ring',
        name: '铁戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'common',
        level: 5,
        description: '普通的铁制戒指',
        icon: './assets/icons/ringtiles/ring_iron_adventurer.png',
        stats: {
            maxHp: 15,
            attack: 3
        },
        requirements: { level: 5 },
        value: 100
    },
    
    '钢戒指': {
        id: 'steel_ring',
        name: '钢戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'uncommon',
        level: 10,
        description: '钢铁打造的实用戒指',
        icon: './assets/icons/ringtiles/ring_silver_adventurer.png',
        stats: {
            attack: 6,
            physicalPower: 5
        },
        requirements: { level: 10 },
        value: 320
    },
    
    '强化钢戒': {
        id: 'reinforced_steel_ring',
        name: '强化钢戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'uncommon',
        level: 15,
        description: '经过强化的钢戒',
        icon: './assets/icons/ringtiles/ring_silver_adventurer.png',
        stats: {
            attack: 10,
            physicalPower: 8
        },
        requirements: { level: 15 },
        value: 700
    },
    
    '秘银戒指': {
        id: 'mithril_ring',
        name: '秘银戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 20,
        description: '秘银打造的精美戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 14,
            criticalChance: 4
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.2,
                description: '暴击伤害+20%'
            }
        ],
        requirements: { level: 20 },
        value: 1350
    },
    
    '精制秘银戒': {
        id: 'refined_mithril_ring',
        name: '精制秘银戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 25,
        description: '精工打造的秘银戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            magicPower: 20,
            maxMana: 35
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.06,
                description: '法术消耗-6%'
            }
        ],
        requirements: { level: 25 },
        value: 2400
    },
    
    '龙骨戒指': {
        id: 'dragonbone_ring',
        name: '龙骨戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 30,
        description: '龙骨雕刻的强大戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 10,
            physicalPower: 10,
            magicPower: 10,
            maxHp: 10
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.12,
                description: '所有伤害+12%'
            }
        ],
        requirements: { level: 30 },
        value: 4200
    },
    
    '符文戒指': {
        id: 'runic_ring',
        name: '符文戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 35,
        description: '刻有魔法符文的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 25,
            magicPower: 25,
            criticalChance: 6
        },
        requirements: { level: 35 },
        value: 6800
    },
    
    '泰坦之戒': {
        id: 'titan_ring',
        name: '泰坦之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 40,
        description: '泰坦之力的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 32,
            maxHp: 65,
            physicalPower: 22
        },
        requirements: { level: 40 },
        value: 10500
    },
    
    // 41-80级
    '强化符文戒': {
        id: 'enhanced_runic_ring',
        name: '强化符文戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 45,
        description: '增强版符文戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 15,
            physicalPower: 15,
            magicPower: 15,
            maxHp: 15
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.15,
                description: '所有伤害+15%'
            }
        ],
        requirements: { level: 45 },
        value: 14500
    },
    
    '奥术戒指': {
        id: 'arcane_ring',
        name: '奥术戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 50,
        description: '蕴含奥术之力的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            magicPower: 45,
            maxMana: 85
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.1,
                description: '法术消耗-10%'
            },
            {
                type: 'mana_regeneration',
                value: 4,
                description: '每回合+4MP'
            }
        ],
        requirements: { level: 50 },
        value: 21000
    },
    
    '破坏之戒': {
        id: 'destruction_ring',
        name: '破坏之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 55,
        description: '破坏力量的体现',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 48,
            criticalChance: 10
        },
        effects: [
            {
                type: 'critical_damage_bonus',
                value: 1.45,
                description: '暴击伤害+45%'
            }
        ],
        requirements: { level: 55 },
        value: 30000
    },
    
    '守护之戒': {
        id: 'guardian_ring',
        name: '守护之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 60,
        description: '守护者的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            maxHp: 120,
            physicalResistance: 8,
            magicResistance: 8
        },
        effects: [
            {
                type: 'damage_reduction',
                value: 0.08,
                description: '受到伤害-8%'
            }
        ],
        requirements: { level: 60 },
        value: 40000
    },
    
    '虚空戒指': {
        id: 'void_ring',
        name: '虚空戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 65,
        description: '虚空之力凝聚的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 25,
            physicalPower: 25,
            magicPower: 25,
            maxHp: 25
        },
        effects: [
            {
                type: 'penetration',
                physical: 12,
                magic: 12,
                description: '无视12%所有抗性'
            }
        ],
        requirements: { level: 65 },
        value: 52000
    },
    
    '元素之戒': {
        id: 'elemental_ring',
        name: '元素之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 70,
        description: '掌控元素之力的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            magicPower: 70,
            attack: 15,
            physicalPower: 15,
            magicPower: 15
        },
        effects: [
            {
                type: 'elemental_damage_bonus',
                value: 1.22,
                description: '所有元素伤害+22%'
            }
        ],
        requirements: { level: 70 },
        value: 68000
    },
    
    '神铸戒指': {
        id: 'divine_forged_ring',
        name: '神铸戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 75,
        description: '神匠打造的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 72,
            physicalPower: 68
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.25,
                description: '物理伤害+25%'
            }
        ],
        requirements: { level: 75 },
        value: 88000
    },
    
    '永恒之戒': {
        id: 'eternal_ring',
        name: '永恒之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'legendary',
        level: 80,
        description: '永恒不朽的传说戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 45,
            physicalPower: 45,
            magicPower: 45,
            maxHp: 45,
            maxMana: 45
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.25,
                description: '所有伤害+25%'
            },
            {
                type: 'skill_cost_reduction',
                value: 0.12,
                description: '所有技能消耗-12%'
            }
        ],
        requirements: { level: 80 },
        value: 140000
    },
    
    // 81-100级
    '至高戒指': {
        id: 'supreme_ring',
        name: '至高戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 85,
        description: '至高力量的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 55,
            physicalPower: 55,
            magicPower: 55,
            maxHp: 55,
            maxMana: 55
        },
        effects: [
            {
                type: 'penetration',
                physical: 18,
                magic: 18,
                description: '无视18%所有抗性'
            }
        ],
        requirements: { level: 85 },
        value: 185000
    },
    
    '神话戒指': {
        id: 'mythical_ring',
        name: '神话戒指',
        type: 'accessory',
        subType: 'ring',
        rarity: 'epic',
        level: 90,
        description: '神话时代的遗物',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 70,
            physicalPower: 70,
            magicPower: 70,
            maxHp: 70,
            criticalChance: 12
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.32,
                description: '所有伤害+32%'
            }
        ],
        requirements: { level: 90 },
        value: 260000
    },
    
    '宇宙之戒': {
        id: 'cosmic_ring',
        name: '宇宙之戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'rare',
        level: 95,
        description: '蕴含宇宙之力',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 85,
            physicalPower: 85,
            magicPower: 85,
            maxHp: 85
        },
        effects: [
            {
                type: 'penetration',
                physical: 22,
                magic: 22,
                description: '无视22%所有抗性'
            }
        ],
        requirements: { level: 95 },
        value: 350000
    },
    
    '创世神戒': {
        id: 'genesis_ring',
        name: '创世神戒',
        type: 'accessory',
        subType: 'ring',
        rarity: 'legendary',
        level: 100,
        description: '创世之神的戒指',
        icon: './assets/icons/ringtiles/ring_gold_adventurer.png',
        stats: {
            attack: 150,
            physicalPower: 150,
            magicPower: 150,
            maxHp: 150,
            maxMana: 150,
            criticalChance: 20
        },
        effects: [
            {
                type: 'damage_bonus',
                target: '全部',
                value: 1.4,
                description: '所有伤害+40%'
            },
            {
                type: 'skill_cost_reduction',
                value: 0.25,
                description: '所有技能消耗-25%'
            }
        ],
        requirements: { level: 100 },
        value: 800000
    }
};