// 胸甲数据（布甲、皮甲、镶钉皮甲、锁甲、板甲）
export const Armors_Chests = {
    // ========== 布甲（轻型，法师向）==========
    // 1-20级
    '布衣': {
        id: 'cloth_shirt',
        name: '布衣',
        type: 'armor',
        subType: 'chest',
        armorType: 'cloth',
        rarity: 'common',
        level: 1,
        description: '简单的布制衣服',
        icon: './assets/icons/armors/chest_cloth_robe.png',
        stats: {
            physicalResistance: 2,
            magicResistance: 4,
            maxHp: 8,
            maxMana: 5,
            weight: 2,
            agility: 2
        },
        requirements: { level: 1 },
        value: 15
    },
    
    '法师袍': {
        id: 'mage_robe',
        name: '法师袍',
        type: 'armor',
        subType: 'chest',
        armorType: 'cloth',
        rarity: 'uncommon',
        level: 10,
        description: '法师穿着的长袍',
        icon: './assets/icons/armors/chest_cloth_robe.png',
        stats: {
            physicalResistance: 7,
            magicResistance: 10,
            maxHp: 26,
            maxMana: 18,
            weight: 2,
            agility: 3
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 2,
                description: '魔法抗性+2%'
            }
        ],
        requirements: { level: 10 },
        value: 280
    },
    
    '符文法袍': {
        id: 'runic_robe',
        name: '符文法袍',
        type: 'armor',
        subType: 'chest',
        armorType: 'cloth',
        rarity: 'epic',
        level: 20,
        description: '刻有魔法符文的强大法袍',
        icon: './assets/icons/armors/chest_cloth_robe.png',
        stats: {
            physicalResistance: 16,
            magicResistance: 22,
            maxHp: 60,
            maxMana: 45,
            weight: 2,
            agility: 5
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 6,
                description: '魔法抗性+6%'
            },
            {
                type: 'mana_regeneration',
                value: 2,
                description: '每回合+2MP'
            }
        ],
        requirements: { level: 20 },
        value: 1450
    },
    
    // 40级+ 高级布甲
    '奥术长袍': {
        id: 'arcane_robe',
        name: '奥术长袍',
        type: 'armor',
        subType: 'chest',
        armorType: 'cloth',
        rarity: 'epic',
        level: 60,
        description: '蕴含强大奥术之力的法袍',
        icon: './assets/icons/armors/chest_cloth_robe.png',
        stats: {
            physicalResistance: 35,
            magicResistance: 54,
            maxHp: 398,
            maxMana: 128,
            weight: 3,
            agility: 7
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 18,
                description: '魔法抗性+18%'
            },
            {
                type: 'mana_regeneration',
                value: 7,
                description: '每回合+7MP'
            }
        ],
        requirements: { level: 60 },
        value: 35000
    },
    
    '法神圣袍': {
        id: 'archmage_sacred_robe',
        name: '法神圣袍',
        type: 'armor',
        subType: 'chest',
        armorType: 'cloth',
        rarity: 'legendary',
        level: 100,
        description: '法神的至高圣袍',
        icon: './assets/icons/armors/chest_cloth_robe.png',
        stats: {
            physicalResistance: 120,
            magicResistance: 220,
            maxHp: 1500,
            maxMana: 550,
            weight: 1,
            agility: 20
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'all',
                value: 120,
                description: '全属性+120'
            },
            {
                type: 'stat_bonus',
                stat: 'magicResistance',
                value: 35,
                description: '魔法抗性+35%'
            },
            {
                type: 'spell_cost_reduction',
                value: 0.4,
                description: '法术消耗-40%'
            }
        ],
        requirements: { level: 100 },
        value: 1500000
    },

    // ========== 皮甲（轻-中型）==========
    // 1-20级
    '粗皮甲': {
        id: 'rough_leather',
        name: '粗皮甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'leather',
        rarity: 'common',
        level: 1,
        description: '粗糙的皮革护甲',
        icon: './assets/icons/armors/chest_leather_armor.png',
        stats: {
            physicalResistance: 4,
            magicResistance: 2,
            maxHp: 12,
            weight: 4,
            agility: 1
        },
        requirements: { level: 1 },
        value: 25
    },
    
    '强化皮甲': {
        id: 'reinforced_leather',
        name: '强化皮甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'leather',
        rarity: 'uncommon',
        level: 12,
        description: '经过强化处理的皮甲',
        icon: './assets/icons/armors/chest_leather_armor.png',
        stats: {
            physicalResistance: 13,
            magicResistance: 6,
            maxHp: 40,
            weight: 7,
            agility: 0
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 2,
                description: '物理抗性+2%'
            }
        ],
        requirements: { level: 12 },
        value: 380
    },
    
    '龙皮甲': {
        id: 'dragon_leather',
        name: '龙皮甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'leather',
        rarity: 'epic',
        level: 20,
        description: '用龙皮制成的强韧护甲',
        icon: './assets/icons/armors/chest_superior_leather.png',
        stats: {
            physicalResistance: 22,
            magicResistance: 11,
            maxHp: 72,
            weight: 7,
            agility: 2
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.15,
                description: '火焰抗性+15%'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 6,
                description: '物理抗性+6%'
            }
        ],
        requirements: { level: 20 },
        value: 1450
    },
    
    // 40级+ 敏捷向皮甲
    '刺客皮甲': {
        id: 'assassin_leather',
        name: '刺客皮甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'leather',
        rarity: 'rare',
        level: 45,
        description: '刺客专用的轻便护甲',
        icon: './assets/icons/armors/chest_superior_leather.png',
        stats: {
            physicalResistance: 28,
            magicResistance: 16,
            maxHp: 240,
            weight: 6,
            agility: 4
        },
        effects: [
            {
                type: 'evasion_bonus',
                value: 0.08,
                description: '闪避率+8%'
            },
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 3,
                description: '敏捷+3'
            }
        ],
        requirements: { level: 45 },
        value: 14000
    },
    
    '影之主宰': {
        id: 'shadow_master_armor',
        name: '影之主宰',
        type: 'armor',
        subType: 'chest',
        armorType: 'leather',
        rarity: 'legendary',
        level: 100,
        description: '暗影之主的传说护甲',
        icon: './assets/icons/armors/chest_superior_leather.png',
        stats: {
            physicalResistance: 155,
            magicResistance: 125,
            maxHp: 1600,
            weight: 3,
            agility: 22
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'agility',
                value: 20,
                description: '敏捷+20'
            },
            {
                type: 'evasion_bonus',
                value: 0.35,
                description: '闪避率+35%'
            },
            {
                type: 'first_strike',
                description: '必定先手'
            },
            {
                type: 'counter_attack',
                chance: 0.2,
                description: '反击20%'
            }
        ],
        requirements: { level: 100 },
        value: 1400000
    },

    // ========== 镶钉皮甲（中型）==========
    // 20-40级
    '镶钉皮甲': {
        id: 'studded_leather',
        name: '镶钉皮甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'studded',
        rarity: 'common',
        level: 20,
        description: '镶嵌金属钉的加强皮甲',
        icon: './assets/icons/armors/chest_studded_leather.png',
        stats: {
            physicalResistance: 18,
            magicResistance: 6,
            maxHp: 65,
            weight: 9,
            agility: 0
        },
        requirements: { level: 20 },
        value: 1200
    },
    
    '精制镶钉甲': {
        id: 'refined_studded_armor',
        name: '精制镶钉甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'studded',
        rarity: 'rare',
        level: 28,
        description: '工艺精良的镶钉护甲',
        icon: './assets/icons/armors/chest_studded_leather.png',
        stats: {
            physicalResistance: 31,
            magicResistance: 11,
            maxHp: 115,
            weight: 10,
            agility: 0
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 5,
                description: '物理抗性+5%'
            },
            {
                type: 'stat_bonus',
                stat: 'maxHp',
                value: 15,
                description: '最大HP+15'
            }
        ],
        requirements: { level: 28 },
        value: 3200
    },
    
    '龙鳞镶钉甲': {
        id: 'dragonscale_studded',
        name: '龙鳞镶钉甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'studded',
        rarity: 'epic',
        level: 40,
        description: '镶嵌龙鳞的强大护甲',
        icon: './assets/icons/armors/chest_superior_studded.png',
        stats: {
            physicalResistance: 54,
            magicResistance: 22,
            maxHp: 220,
            weight: 10,
            agility: 1
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.22,
                description: '火焰抗性+22%'
            },
            {
                type: 'hp_regeneration',
                value: 3,
                description: '每回合+3HP'
            }
        ],
        requirements: { level: 40 },
        value: 10000
    },

    // ========== 锁子甲（中-重型）==========
    // 25-40级
    '锁子甲': {
        id: 'chainmail',
        name: '锁子甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'chainmail',
        rarity: 'common',
        level: 25,
        description: '环环相扣的金属锁甲',
        icon: './assets/icons/armors/chest_chainmail.png',
        stats: {
            physicalResistance: 26,
            magicResistance: 8,
            maxHp: 95,
            weight: 13,
            agility: -2
        },
        requirements: { level: 25 },
        value: 2400
    },
    
    '精制锁子甲': {
        id: 'refined_chainmail',
        name: '精制锁子甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'chainmail',
        rarity: 'rare',
        level: 32,
        description: '精工细作的锁子甲',
        icon: './assets/icons/armors/chest_chainmail.png',
        stats: {
            physicalResistance: 40,
            magicResistance: 13,
            maxHp: 148,
            weight: 14,
            agility: -2
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 6,
                description: '物理抗性+6%'
            },
            {
                type: 'stat_bonus',
                stat: 'maxHp',
                value: 20,
                description: '最大HP+20'
            }
        ],
        requirements: { level: 32 },
        value: 5000
    },
    
    '秘银锁子甲': {
        id: 'mithril_chainmail',
        name: '秘银锁子甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'chainmail',
        rarity: 'epic',
        level: 40,
        description: '秘银打造的轻便锁甲',
        icon: './assets/icons/armors/chest_superior_chainmail.png',
        stats: {
            physicalResistance: 58,
            magicResistance: 20,
            maxHp: 222,
            weight: 14,
            agility: -1
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 11,
                description: '物理抗性+11%'
            },
            {
                type: 'damage_reduction',
                value: 0.07,
                description: '受到伤害-7%'
            }
        ],
        requirements: { level: 40 },
        value: 10500
    },

    // ========== 板甲（重型）==========
    // 40级+
    '板甲': {
        id: 'plate_armor',
        name: '板甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'plate',
        rarity: 'common',
        level: 40,
        description: '厚重的金属板甲',
        icon: './assets/icons/armors/chest_plate_armor.png',
        stats: {
            physicalResistance: 48,
            magicResistance: 14,
            maxHp: 205,
            weight: 18,
            agility: -3
        },
        requirements: { level: 40 },
        value: 9200
    },
    
    '精钢板甲': {
        id: 'refined_plate',
        name: '精钢板甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'plate',
        rarity: 'rare',
        level: 48,
        description: '精钢铸造的坚固板甲',
        icon: './assets/icons/armors/chest_plate_armor.png',
        stats: {
            physicalResistance: 69,
            magicResistance: 21,
            maxHp: 302,
            weight: 20,
            agility: -3
        },
        effects: [
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 9,
                description: '物理抗性+9%'
            },
            {
                type: 'damage_reduction',
                value: 0.08,
                description: '受到伤害-8%'
            }
        ],
        requirements: { level: 48 },
        value: 16500
    },
    
    '龙鳞板甲': {
        id: 'dragonscale_plate',
        name: '龙鳞板甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'plate',
        rarity: 'epic',
        level: 60,
        description: '融合龙鳞的传说护甲',
        icon: './assets/icons/armors/chest_superior_plate.png',
        stats: {
            physicalResistance: 108,
            magicResistance: 36,
            maxHp: 496,
            weight: 18,
            agility: -2
        },
        effects: [
            {
                type: 'elemental_resistance',
                element: 'fire',
                value: 0.26,
                description: '火焰抗性+26%'
            },
            {
                type: 'stat_bonus',
                stat: 'physicalResistance',
                value: 17,
                description: '物理抗性+17%'
            }
        ],
        requirements: { level: 60 },
        value: 34500
    },
    
    '审判战甲': {
        id: 'judgment_plate',
        name: '审判战甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'plate',
        rarity: 'legendary',
        level: 80,
        description: '审判者的神圣战甲',
        icon: './assets/icons/armors/chest_superior_plate.png',
        stats: {
            physicalResistance: 200,
            magicResistance: 80,
            maxHp: 1050,
            weight: 17,
            agility: 0
        },
        effects: [
            {
                type: 'all_resistance',
                value: 0.18,
                description: '全抗性+18%'
            },
            {
                type: 'damage_reduction',
                value: 0.22,
                description: '受到伤害-22%'
            },
            {
                type: 'reflect',
                percent: 0.18,
                description: '反伤18%'
            },
            {
                type: 'hp_regeneration',
                value: 10,
                description: '每回合+10HP'
            }
        ],
        requirements: { level: 80 },
        value: 125000
    },
    
    '不朽神甲': {
        id: 'immortal_plate',
        name: '不朽神甲',
        type: 'armor',
        subType: 'chest',
        armorType: 'plate',
        rarity: 'legendary',
        level: 100,
        description: '永不损坏的神之战甲',
        icon: './assets/icons/armors/chest_superior_plate.png',
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
                type: 'reflect',
                percent: 0.25,
                description: '反伤25%'
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