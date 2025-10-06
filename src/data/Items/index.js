// src/data/Items/index.js - 统一物品导出

import { Consumables } from './Consumables.js';
import { Weapons_Swords } from './Weapons_Swords.js';
import { Weapons_Axes } from './Weapons_Axes.js';
import { Weapons_Hammers } from './Weapons_Hammers.js';
import { Weapons_Bows } from './Weapons_Bows.js';
import { Weapons_Staffs } from './Weapons_Staffs.js';
import { Weapons_Shields } from './Weapons_Shields.js';
import { Armors_Chests } from './Armors_Chests.js';
import { Armors_Helmets } from './Armors_Helmets.js';
import { Armors_Legs } from './Armors_Legs.js';
import { Armors_Boots } from './Armors_Boots.js';
import { Accessories_Rings } from './Accessories_Rings.js';
import { Accessories_Amulets } from './Accessories_Amulets.js';
import { Accessories_Backpacks } from './Accessories_Backpacks.js';
import { TestEquipment } from './TestEquipment.js';

// 合并所有物品
const AllItems = {
    ...Consumables,
    ...Weapons_Swords,
    ...Weapons_Axes,
    ...Weapons_Hammers,
    ...Weapons_Bows,
    ...Weapons_Staffs,
    ...Weapons_Shields,
    ...Armors_Chests,
    ...Armors_Helmets,
    ...Armors_Legs,
    ...Armors_Boots,
    ...Accessories_Rings,
    ...Accessories_Amulets,
    ...Accessories_Backpacks,
    ...TestEquipment
};

// 统计物品数量
const itemCount = Object.keys(AllItems).length;
console.log(`[ItemsDB] 加载了 ${itemCount} 个物品`);

// 辅助函数

// 通过名称获取物品
function getItemByName(name) {
    return AllItems[name] || null;
}

// 通过ID获取物品
function getItemById(id) {
    return Object.values(AllItems).find(item => item.id === id) || null;
}

// 获取所有物品
function getAllItems() {
    return { ...AllItems };
}

// 获取所有物品数组
function getAllItemsArray() {
    return Object.values(AllItems);
}

// 按类型获取物品
function getItemsByType(type) {
    return Object.values(AllItems).filter(item => item.type === type);
}

// 按子类型获取物品
function getItemsBySubType(subType) {
    return Object.values(AllItems).filter(item => item.subType === subType);
}

// 按稀有度获取物品
function getItemsByRarity(rarity) {
    return Object.values(AllItems).filter(item => item.rarity === rarity);
}

// 按等级范围获取物品
function getItemsByLevelRange(minLevel, maxLevel = 100) {
    return Object.values(AllItems).filter(item => 
        item.level >= minLevel && item.level <= maxLevel
    );
}

// 按护甲类型获取防具
function getArmorsByType(armorType) {
    return Object.values(AllItems).filter(item => 
        item.type === 'armor' && item.armorType === armorType
    );
}

// 按武器类别获取武器
function getWeaponsByCategory(weaponCategory) {
    return Object.values(AllItems).filter(item => 
        item.type === 'weapon' && item.weaponCategory === weaponCategory
    );
}

// 按武器子类别获取武器
function getWeaponsBySubCategory(weaponSubCategory) {
    return Object.values(AllItems).filter(item => 
        item.type === 'weapon' && item.weaponSubCategory === weaponSubCategory
    );
}

// 获取消耗品
function getConsumables() {
    return Object.values(AllItems).filter(item => item.type === 'consumable');
}

// 获取装备（武器+防具+饰品）
function getEquipment() {
    return Object.values(AllItems).filter(item => 
        item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory'
    );
}

// 获取物品统计信息
function getItemStats() {
    const items = Object.values(AllItems);
    const stats = {
        total: items.length,
        byType: {},
        bySubType: {},
        byRarity: {},
        byLevel: {},
        weapons: {
            total: 0,
            byCategory: {},
            bySubCategory: {}
        },
        armors: {
            total: 0,
            byType: {},
            bySlot: {}
        },
        accessories: {
            total: 0,
            bySubType: {}
        },
        consumables: 0
    };
    
    items.forEach(item => {
        // 按类型统计
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        
        // 按子类型统计
        if (item.subType) {
            stats.bySubType[item.subType] = (stats.bySubType[item.subType] || 0) + 1;
        }
        
        // 按稀有度统计
        if (item.rarity) {
            stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;
        }
        
        // 按等级统计
        if (item.level) {
            const levelRange = Math.floor(item.level / 10) * 10;
            const rangeKey = `${levelRange}-${levelRange + 9}`;
            stats.byLevel[rangeKey] = (stats.byLevel[rangeKey] || 0) + 1;
        }
        
        // 武器统计
        if (item.type === 'weapon') {
            stats.weapons.total++;
            if (item.weaponCategory) {
                stats.weapons.byCategory[item.weaponCategory] = 
                    (stats.weapons.byCategory[item.weaponCategory] || 0) + 1;
            }
            if (item.weaponSubCategory) {
                stats.weapons.bySubCategory[item.weaponSubCategory] = 
                    (stats.weapons.bySubCategory[item.weaponSubCategory] || 0) + 1;
            }
        }
        
        // 防具统计
        if (item.type === 'armor') {
            stats.armors.total++;
            if (item.armorType) {
                stats.armors.byType[item.armorType] = 
                    (stats.armors.byType[item.armorType] || 0) + 1;
            }
            if (item.subType) {
                stats.armors.bySlot[item.subType] = 
                    (stats.armors.bySlot[item.subType] || 0) + 1;
            }
        }
        
        // 饰品统计
        if (item.type === 'accessory') {
            stats.accessories.total++;
            if (item.subType) {
                stats.accessories.bySubType[item.subType] = 
                    (stats.accessories.bySubType[item.subType] || 0) + 1;
            }
        }
        
        // 消耗品统计
        if (item.type === 'consumable') {
            stats.consumables++;
        }
    });
    
    return stats;
}

// 搜索物品（模糊搜索）
function searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(AllItems).filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
}

// 按价值范围获取物品
function getItemsByValueRange(minValue, maxValue = Infinity) {
    return Object.values(AllItems).filter(item => 
        item.value >= minValue && item.value <= maxValue
    );
}

// 获取特定等级和稀有度的物品
function getItemsByLevelAndRarity(level, rarity) {
    return Object.values(AllItems).filter(item => 
        item.level === level && item.rarity === rarity
    );
}

// 获取带特定效果的物品
function getItemsWithEffect(effectType) {
    return Object.values(AllItems).filter(item => 
        item.effects && item.effects.some(effect => effect.type === effectType)
    );
}

// 构建ItemsDB对象
const ItemsDB = {
    // 获取方法
    getItemByName,
    getItemById,
    getAllItems,
    getAllItemsArray,
    getItemsByType,
    getItemsBySubType,
    getItemsByRarity,
    getItemsByLevelRange,
    getArmorsByType,
    getWeaponsByCategory,
    getWeaponsBySubCategory,
    getConsumables,
    getEquipment,
    getItemStats,
    searchItems,
    getItemsByValueRange,
    getItemsByLevelAndRarity,
    getItemsWithEffect,
    
    // 直接访问
    Items: AllItems
};

// 输出统计信息
const stats = getItemStats();
console.log('[ItemsDB] 物品统计:', stats);

export default ItemsDB;