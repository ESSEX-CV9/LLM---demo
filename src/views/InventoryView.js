// views/InventoryView.js
class InventoryView {
    constructor(eventBus, gameView) {
        this.eventBus = eventBus;
        this.gameView = gameView; // 引用主 GameView，用于通知与输入控制
        this.globalTooltipEl = null;
        this.globalTooltipAnchor = null;
        this._globalTooltipReposition = null;
        this._globalScrollTargets = null;
        this._suppressedInlineTooltip = null;
    }

    // 显示背包与装备界面
    show(data) {
        const { items, maxSlots, usedSlots } = data;

        // 获取玩家装备信息
        const gameStateService = window.gameCore?.getService('gameStateService');
        const player = gameStateService?.getState()?.player;
        const equipment = player?.equipment || {};

        // 创建背包界面
        const inventoryModal = document.createElement('div');
        inventoryModal.className = 'inventory-modal';
        inventoryModal.innerHTML = `
            <div class="inventory-content">
                <div class="inventory-header">
                    <h3>🎒 背包与装备</h3>
                    <button class="close-button" onclick="this.closest('.inventory-modal').remove()">×</button>
                </div>
                <div class="inventory-main">
                    <div class="equipment-panel">
                        <h4>⚔️ 装备</h4>
                        <div class="equipment-slots">
                            ${this.generateEquipmentSlots(equipment)}
                        </div>
                        <div class="equipment-stats">
                            ${this.generateEquipmentStats(player)}
                        </div>
                    </div>
                    <div class="inventory-panel">
                        <h4>🎒 背包 (${usedSlots}/${maxSlots})</h4>
                        <div class="inventory-tabs">
                            <button class="tab-button active" data-tab="all">全部</button>
                            <button class="tab-button" data-tab="equipment">装备</button>
                            <button class="tab-button" data-tab="consumable">消耗品</button>
                            <button class="tab-button" data-tab="material">材料</button>
                        </div>
                        <div class="inventory-grid" id="inventoryGrid">
                            ${this.generateInventoryGrid(items, maxSlots)}
                        </div>
                    </div>
                </div>
                <div class="inventory-footer">
                    <p>左键使用/装备物品，右键查看详情，拖拽到装备槽位可直接装备</p>
                </div>
            </div>
        `;

        document.body.appendChild(inventoryModal);

        // 添加事件
        this.setupInventoryEvents(inventoryModal);
        this.setupEquipmentEvents(inventoryModal);
        this.setupInventoryTabs(inventoryModal);
    }

    // 刷新界面（不移除模态框）
    refresh() {
        const modal = document.querySelector('.inventory-modal');
        if (!modal) return;

        const inventoryService = window.gameCore?.getService('inventoryService');
        const gameStateService = window.gameCore?.getService('gameStateService');

        if (inventoryService && gameStateService) {
            const stats = inventoryService.getInventoryStats();
            const player = gameStateService.getState().player;
            const equipment = player?.equipment || {};

            // 更新装备面板
            const equipmentPanel = modal.querySelector('.equipment-slots');
            if (equipmentPanel) {
                equipmentPanel.innerHTML = this.generateEquipmentSlots(equipment);
            }

            // 更新装备统计
            const equipmentStats = modal.querySelector('.equipment-stats');
            if (equipmentStats) {
                equipmentStats.innerHTML = this.generateEquipmentStats(player);
            }

            // 更新背包标题
            const inventoryTitle = modal.querySelector('.inventory-panel h4');
            if (inventoryTitle) {
                inventoryTitle.textContent = `🎒 背包 (${stats.usedSlots}/${stats.maxSlots})`;
            }

            // 更新背包网格
            const inventoryGrid = modal.querySelector('#inventoryGrid');
            if (inventoryGrid) {
                inventoryGrid.innerHTML = this.generateInventoryGrid(inventoryService.getAllItems(), stats.maxSlots);
            }

            // 重新绑定事件
            this.setupInventoryEvents(modal);
            this.setupEquipmentEvents(modal);
        }
    }

    // 更新网格内容（响应 inventory:updated）
    update(data) {
        const inventoryModal = document.querySelector('.inventory-modal');
        if (!inventoryModal) return;

        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            const stats = inventoryService.getInventoryStats();

            const header = inventoryModal.querySelector('.inventory-header h3');
            if (header) {
                header.textContent = `🎒 背包 (${stats.usedSlots}/${stats.maxSlots})`;
            }

            const grid = inventoryModal.querySelector('#inventoryGrid');
            if (grid) {
                grid.innerHTML = this.generateInventoryGrid(inventoryService.getAllItems(), stats.maxSlots);
                this.setupInventoryEvents(inventoryModal);
            }
        }
    }

    // 生成背包网格
    generateInventoryGrid(items, maxSlots) {
        let html = '';

        for (let i = 0; i < maxSlots; i++) {
            const item = items[i];
            if (item) {
                const rarityColor = this.getRarityColor(item.rarity);
                const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
                const itemClass = isEquipment ? 'equipment-item' : 'consumable-item';

                html += `
                    <div class="inventory-slot filled ${itemClass}"
                         data-item="${item.name}"
                         data-type="${item.type}"
                         data-subtype="${item.subType || ''}"
                         style="border-color: ${rarityColor}"
                         draggable="true">
                        <div class="item-icon">
                            ${(() => {
                                const icon = item.icon || '';
                                const isAsset = icon.startsWith('./assets/') || icon.startsWith('assets/');
                                const base = (typeof window !== 'undefined' && window.CDN_BASE_URL) ? window.CDN_BASE_URL : '';
                                const src = isAsset && base ? (base + icon.replace(/^\.\//, '')) : icon;
                                return (isAsset || icon.startsWith('http://') || icon.startsWith('https://'))
                                    ? `<img src="${src}" alt="${item.name}" style="width: 32px; height: 32px; object-fit: contain;">`
                                    : icon;
                            })()}
                        </div>
                        <div class="item-quantity">${item.quantity > 1 ? item.quantity : ''}</div>
                        <div class="item-tooltip">
                            <div class="tooltip-name" style="color: ${rarityColor}">${item.name}</div>
                            <div class="tooltip-description">${item.description}</div>
                            ${isEquipment ? this.generateEquipmentTooltip(item) : this.generateItemTooltip(item)}
                        </div>
                    </div>
                `;
            } else {
                html += '<div class="inventory-slot empty"></div>';
            }
        }

        return html;
    }

    // 生成装备提示
    generateEquipmentTooltip(item) {
        if (!item.stats) return '';

        let statsHtml = '<div class="tooltip-stats">';
        const stats = item.stats;

        if (stats.attack) statsHtml += `<div>攻击力: +${stats.attack}</div>`;
        if (stats.physicalResistance) statsHtml += `<div>物理抗性: +${stats.physicalResistance}%</div>`;
        if (stats.magicResistance) statsHtml += `<div>魔法抗性: +${stats.magicResistance}%</div>`;
        if (stats.physicalPower) statsHtml += `<div>物理强度: +${stats.physicalPower}</div>`;
        if (stats.magicPower) statsHtml += `<div>魔法强度: +${stats.magicPower}</div>`;
        if (stats.agility) statsHtml += `<div>敏捷: ${stats.agility > 0 ? '+' : ''}${stats.agility}</div>`;
        if (stats.weight) statsHtml += `<div>重量: ${stats.weight > 0 ? '+' : ''}${stats.weight}</div>`;
        if (stats.maxHp) statsHtml += `<div>生命值: +${stats.maxHp}</div>`;
        if (stats.maxMana) statsHtml += `<div>法力值: +${stats.maxMana}</div>`;
        if (stats.maxStamina) statsHtml += `<div>耐力值: +${stats.maxStamina}</div>`;
        if (stats.criticalChance) statsHtml += `<div>暴击率: +${stats.criticalChance}%</div>`;
        if (stats.inventorySlots) statsHtml += `<div>背包容量: +${stats.inventorySlots}格</div>`;
        if (item.weaponType === 'two-handed') {
            statsHtml += `<div>持握方式: 双手武器</div>`;
        } else if (item.weaponType === 'one-handed') {
            statsHtml += `<div>持握方式: 单手武器</div>`;
        }

        statsHtml += '</div>';

        if (item.requirements) {
            statsHtml += '<div class="tooltip-requirements">';
            if (item.requirements.minLevel) {
                statsHtml += `<div>需要等级: ${item.requirements.minLevel}</div>`;
            }
            statsHtml += '</div>';
        }

        return statsHtml;
    }

    // 生成非装备物品提示
    generateItemTooltip(item) {
        let tooltipHtml = '';
        tooltipHtml += '<div class="tooltip-stats">';

        if (item.type === 'consumable') {
            tooltipHtml += `<div class="tooltip-type">类型: 消耗品</div>`;
            if (item.effect) {
                const effect = item.effect;
                switch (effect.type) {
                    case 'heal':
                        tooltipHtml += `<div class="tooltip-effect">💚 恢复生命值: +${effect.value}</div>`;
                        break;
                    case 'restore_mana':
                        tooltipHtml += `<div class="tooltip-effect">🔷 恢复法力值: +${effect.value}</div>`;
                        break;
                    case 'restore_stamina':
                        tooltipHtml += `<div class="tooltip-effect">🟠 恢复耐力值: +${effect.value}</div>`;
                        break;
                    case 'temp_buff':
                        if (effect.stats) {
                            const buffStats = Object.entries(effect.stats).map(([key, value]) => {
                                const statNames = {
                                    attack: '攻击力',
                                    defense: '防御力',
                                    magicPower: '魔法强度',
                                    physicalPower: '物理强度'
                                };
                                return `${statNames[key] || key}: +${value}`;
                            }).join(', ');
                            tooltipHtml += `<div class="tooltip-effect">✨ 临时增益: ${buffStats}</div>`;
                            if (effect.duration) {
                                tooltipHtml += `<div class="tooltip-duration">⏱️ 持续: ${effect.duration}回合</div>`;
                            }
                        }
                        break;
                }
            }
            if (item.stackable !== false && item.maxStack) {
                tooltipHtml += `<div class="tooltip-stack">📦 最大堆叠: ${item.maxStack}</div>`;
            }
        } else if (item.type === 'material') {
            tooltipHtml += `<div class="tooltip-type">类型: 材料</div>`;
            tooltipHtml += `<div class="tooltip-effect">🔨 用于制作和锻造</div>`;
            if (item.stackable !== false && item.maxStack) {
                tooltipHtml += `<div class="tooltip-stack">📦 最大堆叠: ${item.maxStack}</div>`;
            }
        } else if (item.type === 'currency') {
            tooltipHtml += `<div class="tooltip-type">类型: 货币</div>`;
            tooltipHtml += `<div class="tooltip-effect">💰 用于交易和购买</div>`;
            if (item.stackable !== false && item.maxStack) {
                tooltipHtml += `<div class="tooltip-stack">📦 最大堆叠: ${item.maxStack}</div>`;
            }
        }

        if (item.rarity) {
            const rarityNames = {
                'common': '普通',
                'uncommon': '优秀',
                'rare': '稀有',
                'epic': '史诗',
                'legendary': '传说'
            };
            const rarityColor = this.getRarityColor(item.rarity);
            tooltipHtml += `<div class="tooltip-rarity" style="color: ${rarityColor}">⭐ 稀有度: ${rarityNames[item.rarity] || item.rarity}</div>`;
        }

        if (item.value) {
            tooltipHtml += `<div class="tooltip-value">💰 价值: ${item.value} 铜币</div>`;
        }

        tooltipHtml += '</div>';
        return tooltipHtml;
    }

    // 生成装备槽位
    generateEquipmentSlots(equipment) {
        const slots = {
            weapon1: { name: '武器槽1', icon: '⚔️', position: 'weapon1' },
            helmet: { name: '头盔', icon: '⛑️', position: 'helmet' },
            amulet: { name: '护符', icon: '🔱', position: 'amulet' },
            weapon2: { name: '武器槽2', icon: '🗡️', position: 'weapon2' },
            chest: { name: '胸甲', icon: '🛡️', position: 'chest' },
            backpack: { name: '背包', icon: '🎒', position: 'backpack' },
            boots: { name: '靴子', icon: '👢', position: 'boots' },
            legs: { name: '护腿', icon: '👖', position: 'legs' },
            ring: { name: '戒指', icon: '💍', position: 'ring' }
        };

        let html = '';
        for (const [slotKey, slotInfo] of Object.entries(slots)) {
            const equippedItem = equipment[slotKey];
            const isEmpty = !equippedItem;

            const isSecondarySlot = equippedItem && equippedItem.isSecondarySlot;
            const displayItem = isSecondarySlot ? null : equippedItem;

            html += `
                <div class="equipment-slot ${isEmpty ? 'empty' : 'filled'} ${isSecondarySlot ? 'secondary-slot' : ''}"
                     data-slot="${slotKey}"
                     data-droppable="true">
                    ${isEmpty || isSecondarySlot ?
                        `<div class="slot-placeholder ${isSecondarySlot ? 'occupied-by-two-handed' : ''}">
                            <div class="slot-icon">${isSecondarySlot ? '⚔️' : slotInfo.icon}</div>
                            <div class="slot-name">${isSecondarySlot ? '双手武器' : slotInfo.name}</div>
                        </div>` :
                        `<div class="equipped-item" data-item="${displayItem.name}" title="${displayItem.name}: ${displayItem.description}">
                            <div class="item-icon">
                                ${(() => {
                                    const icon = displayItem.icon || '';
                                    const isAsset = icon.startsWith('./assets/') || icon.startsWith('assets/');
                                    const base = (typeof window !== 'undefined' && window.CDN_BASE_URL) ? window.CDN_BASE_URL : '';
                                    const src = isAsset && base ? (base + icon.replace(/^\.\//, '')) : icon;
                                    return (isAsset || icon.startsWith('http://') || icon.startsWith('https://'))
                                        ? `<img src="${src}" alt="${displayItem.name}" style="width: 32px; height: 32px; object-fit: contain;">`
                                        : icon;
                                })()}
                            </div>
                            <div class="item-tooltip">
                                <div class="tooltip-name" style="color: ${this.getRarityColor(displayItem.rarity)}">${displayItem.name}</div>
                                <div class="tooltip-description">${displayItem.description}</div>
                                ${this.generateEquipmentTooltip(displayItem)}
                            </div>
                        </div>`
                    }
                </div>
            `;
        }

        return html;
    }

    // 生成装备属性统计
    generateEquipmentStats(player) {
        if (!player) return '';

        const gameState = window.gameCore?.getService('gameStateService')?.getState();
        const stats = gameState?.getPlayerStats() || player;
        const equipmentSummary = gameState?.getEquipmentSummary() || {};

        const baseStats = {
            attack: gameState?.getBasePlayerAttack() || stats.attack || 0,
            physicalResistance: gameState?.getBasePlayerPhysicalResistance() || stats.physicalResistance || 0,
            magicResistance: gameState?.getBasePlayerMagicResistance() || stats.magicResistance || 0,
            physicalPower: gameState?.getBasePlayerPhysicalPower() || stats.physicalPower || 0,
            magicPower: gameState?.getBasePlayerMagicPower() || stats.magicPower || 0,
            agility: gameState?.getBasePlayerAgility() || stats.agility || 0,
            weight: gameState?.getBasePlayerWeight() || stats.weight || 0,
            criticalChance: gameState?.getBasePlayerCriticalChance() || stats.criticalChance || 0
        };

        const formatStat = (totalValue, baseValue, suffix = '') => {
            if (totalValue !== baseValue) {
                return `<span class="stat-with-buff">${totalValue}<span class="base-stat">(${baseValue})</span></span>${suffix}`;
            } else {
                return `${totalValue}${suffix}`;
            }
        };

        return `
            <div class="stats-summary">
                <h5>属性总览</h5>
                <div class="stat-row">
                    <span>攻击力:</span>
                    <span>${formatStat(stats.attack || 0, baseStats.attack)}</span>
                </div>
                <div class="stat-row">
                    <span>物理抗性:</span>
                    <span>${formatStat(stats.physicalResistance || 0, baseStats.physicalResistance, '%')}</span>
                </div>
                <div class="stat-row">
                    <span>魔法抗性:</span>
                    <span>${formatStat(stats.magicResistance || 0, baseStats.magicResistance, '%')}</span>
                </div>
                <div class="stat-row">
                    <span>物理强度:</span>
                    <span>${formatStat(stats.physicalPower || 0, baseStats.physicalPower)}</span>
                </div>
                <div class="stat-row">
                    <span>魔法强度:</span>
                    <span>${formatStat(stats.magicPower || 0, baseStats.magicPower)}</span>
                </div>
                <div class="stat-row">
                    <span>敏捷:</span>
                    <span>${formatStat(stats.agility || 0, baseStats.agility)}</span>
                </div>
                <div class="stat-row">
                    <span>重量:</span>
                    <span>${formatStat(stats.weight || 0, baseStats.weight)}</span>
                </div>
                <div class="stat-row">
                    <span>暴击率:</span>
                    <span>${formatStat(stats.criticalChance || 0, baseStats.criticalChance, '%')}</span>
                </div>
                <div class="equipment-count">
                    已装备: ${equipmentSummary.equippedCount || 0}/${equipmentSummary.totalSlots || 8}
                </div>
            </div>
        `;
    }

    // 稀有度颜色
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

    // 背包格子事件
    setupInventoryEvents(modal) {
        const slots = modal.querySelectorAll('.inventory-slot.filled');
        slots.forEach(slot => {
            // 左键使用/装备
            slot.addEventListener('click', () => {
                const itemName = slot.dataset.item;
                this.useInventoryItem(itemName);
            });

            // 右键查看详情
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const itemName = slot.dataset.item;
                this.showItemDetails(itemName);
            });

            // 拖拽开始
            slot.addEventListener('dragstart', (e) => {
                const itemName = slot.dataset.item;
                const itemType = slot.dataset.type;
                const itemSubType = slot.dataset.subtype;

                e.dataTransfer.setData('text/plain', itemName);
                e.dataTransfer.setData('application/json', JSON.stringify({
                    itemName: itemName,
                    type: itemType,
                    subType: itemSubType
                }));
                e.dataTransfer.effectAllowed = 'move';
                slot.classList.add('dragging');
            });

            // 拖拽结束
            slot.addEventListener('dragend', () => {
                slot.classList.remove('dragging');
            });

            // 悬浮全局提示（Portal）
            slot.addEventListener('mouseenter', () => {
                const tooltipEl = slot.querySelector('.item-tooltip');
                if (tooltipEl) {
                    this.showGlobalTooltip(slot, tooltipEl.innerHTML);
                }
            });
            slot.addEventListener('mouseleave', () => {
                this.hideGlobalTooltip();
            });
        });
    }

    // 装备槽位事件
    setupEquipmentEvents(modal) {
        const equipmentSlots = modal.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            // 点击卸下装备
            slot.addEventListener('click', () => {
                if (slot.classList.contains('filled')) {
                    const slotType = slot.dataset.slot;
                    this.unequipItem(slotType);
                }
            });

            // 拖拽放置
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (slot.dataset.droppable === 'true') {
                    slot.classList.add('drag-over');
                }
            });

            slot.addEventListener('dragleave', (e) => {
                if (!slot.contains(e.relatedTarget)) {
                    slot.classList.remove('drag-over');
                }
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                try {
                    const jsonData = e.dataTransfer.getData('application/json');
                    const textData = e.dataTransfer.getData('text/plain');

                    let data;
                    if (jsonData) {
                        data = JSON.parse(jsonData);
                    } else if (textData) {
                        data = { itemName: textData };
                    } else {
                        throw new Error('无法获取拖拽数据');
                    }

                    const slotType = slot.dataset.slot;

                    if (this.canEquipToSlot(data, slotType)) {
                        this.equipItemToSlot(data.itemName, slotType);
                    } else {
                        this._notify('该装备不能装备到此槽位', 'warning');
                    }
                } catch (error) {
                    console.error('[拖拽] 装备失败:', error);
                    this._notify('装备失败: ' + error.message, 'error');
                }
            });

            // 悬浮全局提示（Portal）
            slot.addEventListener('mouseenter', () => {
                const anchor = slot.querySelector('.equipped-item') || slot;
                const tooltipEl = slot.querySelector('.item-tooltip');
                if (tooltipEl) {
                    this.showGlobalTooltip(anchor, tooltipEl.innerHTML);
                }
            });
            slot.addEventListener('mouseleave', () => {
                this.hideGlobalTooltip();
            });
        });
    }

    // 标签切换
    setupInventoryTabs(modal) {
        const tabButtons = modal.querySelectorAll('.tab-button');
        const inventoryGrid = modal.querySelector('#inventoryGrid');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const tabType = button.dataset.tab;
                this.filterInventoryItems(inventoryGrid, tabType);
            });
        });
    }

    // 过滤显示
    filterInventoryItems(grid, filterType) {
        const slots = grid.querySelectorAll('.inventory-slot');

        slots.forEach(slot => {
            if (slot.classList.contains('empty')) {
                slot.style.display = filterType === 'all' ? 'block' : 'none';
                return;
            }

            const itemType = slot.dataset.type;
            let shouldShow = false;

            switch (filterType) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'equipment':
                    shouldShow = itemType === 'weapon' || itemType === 'armor' || itemType === 'accessory';
                    break;
                case 'consumable':
                    shouldShow = itemType === 'consumable';
                    break;
                case 'material':
                    shouldShow = itemType === 'material' || itemType === 'currency';
                    break;
            }

            slot.style.display = shouldShow ? 'block' : 'none';
        });
    }

    // 检查是否能装备到槽位
    canEquipToSlot(itemData, slotType) {
        const { type, subType, itemName } = itemData;

        // 如果没有类型信息，尝试从物品数据库获取
        if (!type && itemName) {
            let itemsDB = window.itemsDB;
            if (!itemsDB) {
                try {
                    itemsDB = window.gameCore?.itemsDB;
                } catch (e) {}
            }

            if (itemsDB) {
                const equipmentData = itemsDB.getEquipment(itemName);
                if (equipmentData) {
                    const equipmentType = equipmentData.type;
                    const equipmentSubType = equipmentData.subType;
                    const weaponType = equipmentData.weaponType;
                    return this.canEquipToSlot({
                        type: equipmentType,
                        subType: equipmentSubType,
                        weaponType: weaponType
                    }, slotType);
                }
            }
        }

        // 武器槽位
        if (slotType === 'weapon1' || slotType === 'weapon2') {
            return type === 'weapon';
        }

        // 防具槽位
        if (['helmet', 'chest', 'legs', 'boots'].includes(slotType)) {
            return type === 'armor' && subType === slotType;
        }

        // 饰品槽位
        if (['ring', 'amulet', 'backpack'].includes(slotType)) {
            return type === 'accessory' && subType === slotType;
        }

        return false;
    }

    // 装备物品到槽位
    equipItemToSlot(itemName, slotType) {
        const equipmentService = window.gameCore?.getService('equipmentService');
        if (equipmentService) {
            const result = equipmentService.equipItem(itemName, slotType);
            if (result.success) {
                this.refresh();
                this._notify(result.message, 'success');
            } else {
                this._notify(result.message, 'error');
            }
        } else {
            this._notify('装备系统不可用', 'error');
        }
    }

    // 卸下装备
    unequipItem(slotType) {
        const equipmentService = window.gameCore?.getService('equipmentService');
        if (equipmentService) {
            const result = equipmentService.unequipItem(slotType);
            if (result.success) {
                this.refresh();
            }
        }
    }

    // 使用背包物品
    useInventoryItem(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            const result = inventoryService.useItem(itemName);
            if (result) {
                this.refresh();
            }
        } else {
            this._notify('背包系统不可用', 'error');
        }
    }

    // 显示物品详情（轻量通知）
    showItemDetails(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            const item = inventoryService.getItem(itemName);
            if (item) {
                this._notify(`${item.name}: ${item.description}`, 'info');
            }
        }
    }

    // 使用主视图的通知（最小重复）
    _notify(message, type = 'info') {
        if (this.gameView && typeof this.gameView.showNotification === 'function') {
            this.gameView.showNotification(message, type);
        } else {
            // 后备简单提示
            console.log(`[Notification][${type}] ${message}`);
        }
    }

    // 全局提示（Portal）
    showGlobalTooltip(anchor, html) {
        try {
            if (!this.globalTooltipEl) {
                this.globalTooltipEl = document.createElement('div');
                this.globalTooltipEl.className = 'global-item-tooltip';
                this.globalTooltipEl.style.cssText = `
                    position: fixed;
                    z-index: 1000000;
                    pointer-events: none;
                    background: rgba(0, 0, 0, 0.95);
                    color: #fff;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.8);
                    border: 1px solid rgba(255,255,255,0.2);
                    max-width: 320px;
                    min-width: 200px;
                    opacity: 0;
                    transition: opacity 0.15s ease-out;
                `;
                document.body.appendChild(this.globalTooltipEl);
            }

            this.globalTooltipEl.innerHTML = html;
            this.globalTooltipAnchor = anchor;

            const inline = anchor.querySelector('.item-tooltip');
            if (inline) {
                this._suppressedInlineTooltip = inline;
                inline.dataset._prevDisplay = inline.style.display || '';
                inline.style.display = 'none';
            }

            this.repositionGlobalTooltip();
            this.globalTooltipEl.style.opacity = '1';

            this._globalTooltipReposition = () => this.repositionGlobalTooltip();

            this._globalScrollTargets = [];
            const addScrollTarget = (el) => {
                if (el && typeof el.addEventListener === 'function') {
                    el.addEventListener('scroll', this._globalTooltipReposition, true);
                    this._globalScrollTargets.push(el);
                }
            };

            const modal = document.querySelector('.inventory-modal');
            const content = modal ? modal.querySelector('.inventory-content') : null;
            const grid = modal ? modal.querySelector('#inventoryGrid') : null;

            addScrollTarget(window);
            addScrollTarget(document);
            addScrollTarget(modal);
            addScrollTarget(content);
            addScrollTarget(grid);

            window.addEventListener('resize', this._globalTooltipReposition, true);
        } catch (e) {
            console.warn('[InventoryView] showGlobalTooltip error:', e);
        }
    }

    // 重新定位全局提示
    repositionGlobalTooltip() {
        try {
            if (!this.globalTooltipEl || !this.globalTooltipAnchor) return;

            const rect = this.globalTooltipAnchor.getBoundingClientRect();
            const margin = 8;

            const ttRect = this.globalTooltipEl.getBoundingClientRect();

            let top = rect.top - ttRect.height - margin;
            let left = rect.left + rect.width / 2 - ttRect.width / 2;

            const clamp = (min, v, max) => Math.max(min, Math.min(v, max));
            left = clamp(10, left, window.innerWidth - ttRect.width - 10);

            if (top < 10) {
                top = rect.bottom + margin;
            }
            if (top + ttRect.height > window.innerHeight - 10) {
                top = window.innerHeight - ttRect.height - 10;
            }

            this.globalTooltipEl.style.left = `${Math.round(left)}px`;
            this.globalTooltipEl.style.top = `${Math.round(top)}px`;
        } catch (e) {
            console.warn('[InventoryView] repositionGlobalTooltip error:', e);
        }
    }

    // 隐藏全局提示
    hideGlobalTooltip() {
        try {
            if (this._globalTooltipReposition) {
                window.removeEventListener('resize', this._globalTooltipReposition, true);
            }
            if (this._globalScrollTargets && this._globalScrollTargets.length) {
                for (const el of this._globalScrollTargets) {
                    el.removeEventListener('scroll', this._globalTooltipReposition, true);
                }
                this._globalScrollTargets = null;
            }
            this._globalTooltipReposition = null;

            if (this._suppressedInlineTooltip) {
                const inline = this._suppressedInlineTooltip;
                inline.style.display = inline.dataset._prevDisplay || '';
                delete inline.dataset._prevDisplay;
                this._suppressedInlineTooltip = null;
            }

            if (this.globalTooltipEl && this.globalTooltipEl.parentNode) {
                const el = this.globalTooltipEl;
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 150);
            }

            this.globalTooltipEl = null;
            this.globalTooltipAnchor = null;
        } catch (e) {
            console.warn('[InventoryView] hideGlobalTooltip error:', e);
        }
    }
}

export default InventoryView;

// 全局暴露（可选）
window.InventoryView = InventoryView;