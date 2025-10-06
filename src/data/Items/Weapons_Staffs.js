// 法杖类武器数据（单手法杖、双手法杖）
export const Weapons_Staffs = {
    // ========== 单手法杖 ==========
    // 1-30级
    '橡木魔杖': {
        id: 'oak_wand',
        name: '橡木魔杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 2,
        description: '简单的橡木魔杖',
        icon: './assets/icons/weapons/wand1.png',
        stats: {
            attack: 6,
            magicPower: 20,
            maxMana: 15,
            weight: 1,
            criticalChance: 5
        },
        requirements: { level: 2 },
        value: 40
    },
    
    '紫杉法杖': {
        id: 'yew_staff',
        name: '紫杉法杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'common',
        level: 5,
        description: '紫杉木制成的法杖',
        icon: './assets/icons/weapons/staff1.png',
        stats: {
            attack: 10,
            magicPower: 30,
            maxMana: 25,
            weight: 2,
            criticalChance: 5
        },
        requirements: { level: 5 },
        value: 90
    },
    
    '水晶法杖': {
        id: 'crystal_staff',
        name: '水晶法杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'uncommon',
        level: 11,
        description: '镶嵌水晶的魔法杖',
        icon: './assets/icons/weapons/staff1.png',
        stats: {
            attack: 18,
            magicPower: 52,
            maxMana: 45,
            weight: 2,
            criticalChance: 7
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.05,
                description: '法术消耗-5%'
            }
        ],
        requirements: { level: 11 },
        value: 360
    },
    
    '秘银法杖': {
        id: 'mithril_staff',
        name: '秘银法杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'rare',
        level: 14,
        description: '秘银打造的轻盈法杖',
        icon: './assets/icons/weapons/staff2.png',
        stats: {
            attack: 23,
            magicPower: 65,
            maxMana: 58,
            weight: 2,
            criticalChance: 9
        },
        effects: [
            {
                type: 'mana_regeneration',
                value: 2,
                description: '每回合+2MP'
            }
        ],
        requirements: { level: 14 },
        value: 650
    },
    
    '贤者之杖': {
        id: 'sage_staff',
        name: '贤者之杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 20,
        description: '智者使用的强力法杖',
        icon: './assets/icons/weapons/staff2.png',
        stats: {
            attack: 34,
            magicPower: 93,
            maxMana: 85,
            weight: 2,
            criticalChance: 14
        },
        effects: [
            {
                type: 'mana_regeneration',
                value: 3,
                description: '每回合+3MP'
            },
            {
                type: 'critical_damage_bonus',
                value: 1.25,
                description: '魔法暴击伤害+25%'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    // 30-60级
    '虚空法杖': {
        id: 'void_staff',
        name: '虚空法杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'epic',
        level: 42,
        description: '蕴含虚空之力的法杖',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 90,
            magicPower: 231,
            maxMana: 222,
            weight: 1,
            criticalChance: 24
        },
        effects: [
            {
                type: 'penetration',
                magic: 16,
                description: '无视16%魔法抗性'
            }
        ],
        requirements: { level: 42 },
        value: 13000
    },
    
    '永恒智慧': {
        id: 'eternal_wisdom',
        name: '永恒智慧',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 60,
        description: '蕴含永恒智慧的传说法杖',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 186,
            magicPower: 450,
            maxMana: 450,
            weight: 1,
            criticalChance: 38
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 75,
                description: '魔法强度+75'
            },
            {
                type: 'spell_damage_bonus',
                value: 1.22,
                description: '所有法术伤害+22%'
            },
            {
                type: 'mana_regeneration',
                value: 8,
                description: '每回合+8MP'
            }
        ],
        requirements: { level: 60 },
        value: 62000
    },
    
    // 80级传说
    '法神之杖': {
        id: 'archmage_staff',
        name: '法神之杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 80,
        description: '大法师的至高权杖',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 365,
            magicPower: 875,
            maxMana: 890,
            weight: 0,
            agility: 4,
            criticalChance: 58
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.28,
                description: '法术消耗-28%'
            },
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 165,
                description: '魔法强度+165'
            },
            {
                type: 'spell_damage_bonus',
                value: 1.3,
                description: '所有法术伤害+30%'
            }
        ],
        requirements: { level: 80 },
        value: 205000
    },
    
    // 100级传说
    '法神权杖': {
        id: 'god_mage_scepter',
        name: '法神权杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'oneHandStaff',
        weaponType: 'one-handed',
        rarity: 'legendary',
        level: 100,
        description: '掌控魔法本源的神器',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 750,
            magicPower: 1800,
            maxMana: 1850,
            weight: 0,
            agility: 10,
            criticalChance: 80
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 190,
                description: '全属性+190'
            },
            {
                type: 'spell_damage_bonus',
                value: 1.6,
                description: '所有法术伤害+60%'
            },
            {
                type: 'guaranteed_spell_critical',
                description: '法术必定暴击'
            }
        ],
        requirements: { level: 100 },
        value: 1600000
    },

    // ========== 双手法杖 ==========
    // 8-40级
    '长木杖': {
        id: 'long_wooden_staff',
        name: '长木杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'common',
        level: 8,
        description: '长长的木制法杖',
        icon: './assets/icons/weapons/staff1.png',
        stats: {
            attack: 16,
            magicPower: 50,
            maxMana: 45,
            weight: 5,
            criticalChance: 6
        },
        requirements: { level: 8 },
        value: 180
    },
    
    '法师杖': {
        id: 'mage_staff',
        name: '法师杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'uncommon',
        level: 12,
        description: '正式法师使用的双手杖',
        icon: './assets/icons/weapons/staff1.png',
        stats: {
            attack: 26,
            magicPower: 70,
            maxMana: 65,
            weight: 6,
            criticalChance: 9
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'maxMana',
                value: 10,
                description: '最大MP+10'
            }
        ],
        requirements: { level: 12 },
        value: 450
    },
    
    '秘银大杖': {
        id: 'mithril_great_staff',
        name: '秘银大杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'rare',
        level: 20,
        description: '秘银制成的强大法杖',
        icon: './assets/icons/weapons/staff2.png',
        stats: {
            attack: 52,
            magicPower: 125,
            maxMana: 120,
            weight: 6,
            criticalChance: 16
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 18,
                description: '魔法强度+18'
            },
            {
                type: 'mana_regeneration',
                value: 3,
                description: '每回合+3MP'
            }
        ],
        requirements: { level: 20 },
        value: 1550
    },
    
    '符文大杖': {
        id: 'runic_great_staff',
        name: '符文大杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'epic',
        level: 28,
        description: '刻满强大符文的法杖',
        icon: './assets/icons/weapons/staff2.png',
        stats: {
            attack: 82,
            magicPower: 195,
            maxMana: 188,
            weight: 6,
            criticalChance: 24
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.14,
                description: '法术消耗-14%'
            },
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 28,
                description: '魔法强度+28'
            }
        ],
        requirements: { level: 28 },
        value: 3750
    },
    
    '大贤者之杖': {
        id: 'grand_sage_staff',
        name: '大贤者之杖',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 40,
        description: '大贤者的传说法杖',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 154,
            magicPower: 342,
            maxMana: 332,
            weight: 4,
            criticalChance: 35
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.22,
                description: '法术消耗-22%'
            },
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 45,
                description: '魔法强度+45'
            },
            {
                type: 'mana_regeneration',
                value: 7,
                description: '每回合+7MP'
            }
        ],
        requirements: { level: 40 },
        value: 14000
    },
    
    // 60-80级
    '元素之主': {
        id: 'elemental_lord',
        name: '元素之主',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 60,
        description: '掌控元素之力的至高法杖',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 325,
            magicPower: 740,
            maxMana: 730,
            weight: 3,
            criticalChance: 52
        },
        effects: [
            {
                type: 'elemental_damage_bonus',
                value: 1.38,
                description: '所有元素伤害+38%'
            },
            {
                type: 'spell_cost_reduction',
                value: 0.25,
                description: '法术消耗-25%'
            }
        ],
        requirements: { level: 60 },
        value: 62000
    },
    
    '法则之塔': {
        id: 'tower_of_law',
        name: '法则之塔',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 80,
        description: '掌握魔法法则的神器',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 650,
            magicPower: 1485,
            maxMana: 1475,
            weight: 2,
            criticalChance: 74
        },
        effects: [
            {
                type: 'spell_cost_reduction',
                value: 0.32,
                description: '法术消耗-32%'
            },
            {
                type: 'stat_bonus',
                stat: 'magicPower',
                value: 210,
                description: '魔法强度+210'
            },
            {
                type: 'spell_damage_bonus',
                value: 1.42,
                description: '所有法术伤害+42%'
            }
        ],
        requirements: { level: 80 },
        value: 205000
    },
    
    // 100级传说
    '终极法则': {
        id: 'ultimate_law',
        name: '终极法则',
        type: 'weapon',
        subType: 'staff',
        weaponCategory: 'staff',
        weaponSubCategory: 'twoHandStaff',
        weaponType: 'two-handed',
        rarity: 'legendary',
        level: 100,
        description: '魔法的终极体现',
        icon: './assets/icons/weapons/staff3.png',
        stats: {
            attack: 1350,
            magicPower: 3100,
            maxMana: 3100,
            weight: 1,
            criticalChance: 95
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 250,
                description: '全属性+250'
            },
            {
                type: 'spell_damage_bonus',
                value: 1.8,
                description: '所有法术伤害+80%'
            },
            {
                type: 'guaranteed_spell_critical',
                description: '法术必定暴击'
            }
        ],
        requirements: { level: 100 },
        value: 2000000
    }
};