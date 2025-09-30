// data/Items.js - 物品和装备数据库
class ItemsDB {
    constructor() {
        this.items = this.initializeItems();
        this.equipment = this.initializeEquipment();
    }

    initializeItems() {
        return {
            // 消耗品
            '治疗药水': {
                id: 'healing_potion',
                name: '治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复50点生命值的神奇药水',
                effect: { type: 'heal', value: 50 },
                rarity: 'common',
                icon: '🧪',
                stackable: true,
                maxStack: 99,
                value: 25
            },
            '高级治疗药水': {
                id: 'greater_healing_potion',
                name: '高级治疗药水',
                type: 'consumable',
                subType: 'healing',
                description: '恢复100点生命值的强效药水',
                effect: { type: 'heal', value: 100 },
                rarity: 'rare',
                icon: '🧪',
                stackable: true,
                maxStack: 99,
                value: 60
            },
            '法力药水': {
                id: 'mana_potion',
                name: '法力药水',
                type: 'consumable',
                subType: 'mana',
                description: '恢复30点法力值的蓝色药水',
                effect: { type: 'restore_mana', value: 30 },
                rarity: 'common',
                icon: '🔵',
                stackable: true,
                maxStack: 99,
                value: 20
            },
            '耐力药水': {
                id: 'stamina_potion',
                name: '耐力药水',
                type: 'consumable',
                subType: 'stamina',
                description: '恢复25点耐力值的绿色药水',
                effect: { type: 'restore_stamina', value: 25 },
                rarity: 'common',
                icon: '🟢',
                stackable: true,
                maxStack: 99,
                value: 18
            },
            '面包': {
                id: 'bread',
                name: '面包',
                type: 'consumable',
                subType: 'food',
                description: '简单的食物，恢复少量生命值',
                effect: { type: 'heal', value: 20 },
                rarity: 'common',
                icon: '🍞',
                stackable: true,
                maxStack: 99,
                value: 5
            },
            '力量药水': {
                id: 'strength_potion',
                name: '力量药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加10点攻击力，持续5回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { attack: 10 },
                    duration: 5 
                },
                rarity: 'uncommon',
                icon: '💪',
                stackable: true,
                maxStack: 20,
                value: 50
            },
            '防御药水': {
                id: 'defense_potion',
                name: '防御药水',
                type: 'consumable',
                subType: 'buff',
                description: '临时增加8点防御力，持续5回合',
                effect: { 
                    type: 'temp_buff', 
                    stats: { defense: 8 },
                    duration: 5 
                },
                rarity: 'uncommon',
                icon: '🛡️',
                stackable: true,
                maxStack: 20,
                value: 45
            },

            // 材料
            '铁矿石': {
                id: 'iron_ore',
                name: '铁矿石',
                type: 'material',
                subType: 'ore',
                description: '用于锻造武器和防具的基础材料',
                rarity: 'common',
                icon: '⛏️',
                stackable: true,
                maxStack: 99,
                value: 8
            },
            '皮革': {
                id: 'leather',
                name: '皮革',
                type: 'material',
                subType: 'hide',
                description: '制作轻甲的基础材料',
                rarity: 'common',
                icon: '🦌',
                stackable: true,
                maxStack: 99,
                value: 12
            },
            '魔法水晶': {
                id: 'magic_crystal',
                name: '魔法水晶',
                type: 'material',
                subType: 'crystal',
                description: '蕴含魔法能量的珍贵水晶',
                rarity: 'rare',
                icon: '💎',
                stackable: true,
                maxStack: 50,
                value: 100
            },

            // 货币
            '铜币': {
                id: 'copper_coin',
                name: '铜币',
                type: 'currency',
                subType: 'coin',
                description: '基础货币',
                rarity: 'common',
                icon: '🪙',
                stackable: true,
                maxStack: 9999,
                value: 1
            },
            '银币': {
                id: 'silver_coin',
                name: '银币',
                type: 'currency',
                subType: 'coin',
                description: '中级货币，价值100铜币',
                rarity: 'uncommon',
                icon: '🥈',
                stackable: true,
                maxStack: 999,
                value: 100
            },
            '金币': {
                id: 'gold_coin',
                name: '金币',
                type: 'currency',
                subType: 'coin',
                description: '高级货币，价值100银币',
                rarity: 'rare',
                icon: '🥇',
                stackable: true,
                maxStack: 999,
                value: 10000
            }
        };
    }

    initializeEquipment() {
        return {
            // 武器 - 剑类
            '木剑': {
                id: 'wooden_sword',
                name: '木剑',
                type: 'weapon',
                subType: 'sword',
                description: '简陋的木制训练剑',
                rarity: 'common',
                icon: '🗡️',
                level: 1,
                stats: {
                    attack: 8,
                    physicalPower: 3
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 15
            },
            '铁剑': {
                id: 'iron_sword',
                name: '铁剑',
                type: 'weapon',
                subType: 'sword',
                description: '普通的铁制剑，增加攻击力',
                rarity: 'common',
                icon: '⚔️',
                level: 2,
                stats: {
                    attack: 15,
                    physicalPower: 6
                },
                requirements: { minLevel: 2 },
                durability: { current: 100, max: 100 },
                value: 50
            },
            '精制铁剑': {
                id: 'refined_iron_sword',
                name: '精制铁剑',
                type: 'weapon',
                subType: 'sword',
                description: '经过精心锻造的铁剑，锋利无比',
                rarity: 'uncommon',
                icon: '⚔️',
                level: 3,
                stats: {
                    attack: 22,
                    physicalPower: 9,
                    criticalChance: 5
                },
                requirements: { minLevel: 3 },
                durability: { current: 120, max: 120 },
                value: 120
            },
            '钢剑': {
                id: 'steel_sword',
                name: '钢剑',
                type: 'weapon',
                subType: 'sword',
                description: '坚固的钢制长剑，平衡性极佳',
                rarity: 'uncommon',
                icon: '⚔️',
                level: 4,
                stats: {
                    attack: 30,
                    physicalPower: 12,
                    speed: 2
                },
                requirements: { minLevel: 4 },
                durability: { current: 150, max: 150 },
                value: 200
            },
            '银剑': {
                id: 'silver_sword',
                name: '银剑',
                type: 'weapon',
                subType: 'sword',
                description: '银制长剑，对邪恶生物有特效',
                rarity: 'rare',
                icon: '⚔️',
                level: 5,
                stats: {
                    attack: 38,
                    physicalPower: 15,
                    criticalChance: 8
                },
                effects: [
                    { type: 'damage_bonus', target: 'undead', value: 1.5, description: '对不死生物伤害+50%' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 180, max: 180 },
                value: 400
            },

            // 武器 - 法杖类
            '木杖': {
                id: 'wooden_staff',
                name: '木杖',
                type: 'weapon',
                subType: 'staff',
                description: '简单的木制法杖',
                rarity: 'common',
                icon: '🪄',
                level: 1,
                stats: {
                    attack: 5,
                    magicPower: 8,
                    maxMana: 10
                },
                requirements: { minLevel: 1 },
                durability: { current: 60, max: 60 },
                value: 25
            },
            '法师杖': {
                id: 'mage_staff',
                name: '法师杖',
                type: 'weapon',
                subType: 'staff',
                description: '镶嵌水晶的法师专用法杖',
                rarity: 'uncommon',
                icon: '🔮',
                level: 3,
                stats: {
                    attack: 12,
                    magicPower: 20,
                    maxMana: 25
                },
                effects: [
                    { type: 'spell_cost_reduction', value: 0.1, description: '法术消耗-10%' }
                ],
                requirements: { minLevel: 3 },
                durability: { current: 100, max: 100 },
                value: 150
            },
            '奥术法杖': {
                id: 'arcane_staff',
                name: '奥术法杖',
                type: 'weapon',
                subType: 'staff',
                description: '蕴含强大奥术能量的高级法杖',
                rarity: 'rare',
                icon: '🔮',
                level: 5,
                stats: {
                    attack: 18,
                    magicPower: 35,
                    maxMana: 40,
                    criticalChance: 10
                },
                effects: [
                    { type: 'spell_cost_reduction', value: 0.15, description: '法术消耗-15%' },
                    { type: 'mana_regeneration', value: 2, description: '每回合回复2点法力' }
                ],
                requirements: { minLevel: 5 },
                durability: { current: 150, max: 150 },
                value: 500
            },

            // 防具 - 头盔
            '皮帽': {
                id: 'leather_cap',
                name: '皮帽',
                type: 'armor',
                subType: 'helmet',
                description: '简单的皮制头盔',
                rarity: 'common',
                icon: '🎩',
                level: 1,
                stats: {
                    defense: 3,
                    maxHp: 5
                },
                requirements: { minLevel: 1 },
                durability: { current: 40, max: 40 },
                value: 20
            },
            '铁盔': {
                id: 'iron_helmet',
                name: '铁盔',
                type: 'armor',
                subType: 'helmet',
                description: '坚固的铁制头盔',
                rarity: 'uncommon',
                icon: '⛑️',
                level: 3,
                stats: {
                    defense: 8,
                    maxHp: 15
                },
                requirements: { minLevel: 3 },
                durability: { current: 80, max: 80 },
                value: 80
            },

            // 防具 - 胸甲
            '皮甲': {
                id: 'leather_armor',
                name: '皮甲',
                type: 'armor',
                subType: 'chest',
                description: '简单的皮制护甲，增加防御力',
                rarity: 'common',
                icon: '🦺',
                level: 1,
                stats: {
                    defense: 5,
                    maxHp: 10
                },
                requirements: { minLevel: 1 },
                durability: { current: 60, max: 60 },
                value: 35
            },
            '链甲': {
                id: 'chain_mail',
                name: '链甲',
                type: 'armor',
                subType: 'chest',
                description: '铁环编织的链式护甲',
                rarity: 'uncommon',
                icon: '🛡️',
                level: 2,
                stats: {
                    defense: 12,
                    maxHp: 20,
                    speed: -1
                },
                requirements: { minLevel: 2 },
                durability: { current: 100, max: 100 },
                value: 100
            },
            '板甲': {
                id: 'plate_armor',
                name: '板甲',
                type: 'armor',
                subType: 'chest',
                description: '厚重的钢制板甲，防护力极强',
                rarity: 'rare',
                icon: '🛡️',
                level: 4,
                stats: {
                    defense: 25,
                    maxHp: 40,
                    speed: -3
                },
                effects: [
                    { type: 'damage_reduction', value: 0.1, description: '受到伤害-10%' }
                ],
                requirements: { minLevel: 4 },
                durability: { current: 200, max: 200 },
                value: 300
            },

            // 防具 - 护腿
            '皮裤': {
                id: 'leather_pants',
                name: '皮裤',
                type: 'armor',
                subType: 'legs',
                description: '简单的皮制护腿',
                rarity: 'common',
                icon: '👖',
                level: 1,
                stats: {
                    defense: 3,
                    maxHp: 8
                },
                requirements: { minLevel: 1 },
                durability: { current: 50, max: 50 },
                value: 25
            },

            // 防具 - 靴子
            '皮靴': {
                id: 'leather_boots',
                name: '皮靴',
                type: 'armor',
                subType: 'boots',
                description: '舒适的皮制靴子',
                rarity: 'common',
                icon: '👢',
                level: 1,
                stats: {
                    defense: 2,
                    speed: 1
                },
                requirements: { minLevel: 1 },
                durability: { current: 40, max: 40 },
                value: 18
            },
            '疾风靴': {
                id: 'swift_boots',
                name: '疾风靴',
                type: 'armor',
                subType: 'boots',
                description: '轻盈的靴子，大幅提升移动速度',
                rarity: 'uncommon',
                icon: '👢',
                level: 3,
                stats: {
                    defense: 5,
                    speed: 5,
                    maxStamina: 10
                },
                requirements: { minLevel: 3 },
                durability: { current: 80, max: 80 },
                value: 120
            },

            // 饰品 - 戒指
            '力量戒指': {
                id: 'ring_of_strength',
                name: '力量戒指',
                type: 'accessory',
                subType: 'ring',
                description: '增强佩戴者力量的魔法戒指',
                rarity: 'uncommon',
                icon: '💍',
                level: 2,
                stats: {
                    attack: 5,
                    physicalPower: 8
                },
                requirements: { minLevel: 2 },
                value: 150
            },
            '智慧戒指': {
                id: 'ring_of_wisdom',
                name: '智慧戒指',
                type: 'accessory',
                subType: 'ring',
                description: '增强佩戴者魔法能力的戒指',
                rarity: 'uncommon',
                icon: '💍',
                level: 2,
                stats: {
                    magicPower: 12,
                    maxMana: 20
                },
                requirements: { minLevel: 2 },
                value: 160
            },

            // 饰品 - 项链
            '生命项链': {
                id: 'necklace_of_life',
                name: '生命项链',
                type: 'accessory',
                subType: 'necklace',
                description: '增强生命力的神秘项链',
                rarity: 'rare',
                icon: '📿',
                level: 3,
                stats: {
                    maxHp: 50,
                    defense: 3
                },
                effects: [
                    { type: 'hp_regeneration', value: 1 }
                ],
                requirements: { minLevel: 3 },
                value: 250
            },

            // 饰品 - 护符
            '守护护符': {
                id: 'guardian_amulet',
                name: '守护护符',
                type: 'accessory',
                subType: 'amulet',
                description: '提供全面保护的古老护符',
                rarity: 'rare',
                icon: '🔱',
                level: 4,
                stats: {
                    defense: 8,
                    maxHp: 25,
                    maxMana: 15
                },
                effects: [
                    { type: 'status_resistance', value: 0.2 }
                ],
                requirements: { minLevel: 4 },
                value: 300
            }
        };
    }

    // 获取物品数据
    getItem(itemName) {
        return this.items[itemName] || null;
    }

    // 获取装备数据
    getEquipment(equipmentName) {
        return this.equipment[equipmentName] || null;
    }

    // 获取所有物品
    getAllItems() {
        return { ...this.items };
    }

    // 获取所有装备
    getAllEquipment() {
        return { ...this.equipment };
    }

    // 根据类型获取装备
    getEquipmentByType(type, subType = null) {
        const result = [];
        for (const [name, equipment] of Object.entries(this.equipment)) {
            if (equipment.type === type) {
                if (!subType || equipment.subType === subType) {
                    result.push({ name, ...equipment });
                }
            }
        }
        return result;
    }

    // 根据等级获取装备
    getEquipmentByLevel(minLevel, maxLevel = null) {
        const result = [];
        for (const [name, equipment] of Object.entries(this.equipment)) {
            if (equipment.level >= minLevel) {
                if (!maxLevel || equipment.level <= maxLevel) {
                    result.push({ name, ...equipment });
                }
            }
        }
        return result;
    }

    // 获取稀有度颜色
    getRarityColor(rarity) {
        const colors = {
            'common': '#ffffff',
            'uncommon': '#1eff00',
            'rare': '#0070dd',
            'epic': '#a335ee',
            'legendary': '#ff8000'
        };
        return colors[rarity] || colors.common;
    }

    // 检查装备需求
    checkEquipmentRequirements(equipment, player) {
        if (!equipment.requirements) return { canEquip: true };

        const requirements = equipment.requirements;
        const issues = [];

        if (requirements.minLevel && player.level < requirements.minLevel) {
            issues.push(`需要等级 ${requirements.minLevel}`);
        }

        if (requirements.minStrength && (player.strength || 0) < requirements.minStrength) {
            issues.push(`需要力量 ${requirements.minStrength}`);
        }

        if (requirements.minIntelligence && (player.intelligence || 0) < requirements.minIntelligence) {
            issues.push(`需要智力 ${requirements.minIntelligence}`);
        }

        return {
            canEquip: issues.length === 0,
            issues: issues
        };
    }
}

const itemsDB = new ItemsDB();
export default itemsDB;