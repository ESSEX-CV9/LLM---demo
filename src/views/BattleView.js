// views/BattleView.js
class BattleView {
    constructor(eventBus, gameView) {
        this.eventBus = eventBus;
        this.gameView = gameView; // 引用主 GameView，用于控制输入启用/禁用
    }

    // 显示战斗界面（横版布局）
    show(battleState) {
        // 禁用游戏输入（通过主视图控制）
        if (this.gameView && typeof this.gameView.disableInput === 'function') {
            this.gameView.disableInput();
        }

        // 创建战斗界面
        const battleModal = document.createElement('div');
        battleModal.className = 'battle-modal';
        battleModal.innerHTML = `
            <div class="battle-content-landscape">
                <!-- 战斗头部：回合数和关闭按钮 -->
                <div class="battle-header-landscape">
                    <h3>⚔️ 战斗 - 第${battleState.round}回合</h3>
                </div>
                
                <!-- 战斗主体区域：横版布局 -->
                <div class="battle-main-landscape">
                    <!-- 敌人区域（左侧） -->
                    <div class="battle-enemies-area">
                        ${this.generateEnemiesDisplay(battleState)}
                    </div>
                    
                    <!-- 中间战斗信息区域 -->
                    <div class="battle-center-area">
                        <div class="battle-log-landscape" id="battleLog">
                            ${battleState.battleLog.map(log => `
                                <div class="log-entry ${log.type}">${log.message}</div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 玩家区域（右侧） -->
                    <div class="battle-player-area">
                        ${this.generatePlayerDisplay(battleState)}
                    </div>
                </div>
                
                <!-- 底部操作区域 -->
                <div class="battle-bottom-area">
                    <!-- 战斗操作按钮（占满宽度） -->
                    <div class="battle-actions-landscape" id="battleActions">
                        ${this.generateBattleActions(battleState)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(battleModal);
        this.setupBattleEvents(battleModal, battleState);
    }

    // 生成敌人显示（支持最多3个敌人）- 横向矮长方形布局
    generateEnemiesDisplay(battleState) {
        const enemies = battleState.enemies.slice(0, 3); // 最多显示3个
        return `
            <div class="enemies-container">
                ${enemies.map((enemy, index) => `
                    <div class="enemy-unit ${enemy.hp <= 0 ? 'defeated' : ''}" data-index="${index}">
                        <!-- 左侧：头像和名称 -->
                        <div class="enemy-left-section">
                            <div class="enemy-sprite-compact">
                                <span class="sprite-emoji">👹</span>
                            </div>
                            <div class="enemy-name-compact">👹 ${enemy.type}</div>
                        </div>
                        
                        <!-- 右侧：状态条（垂直排列） -->
                        <div class="enemy-bars-horizontal">
                            <!-- HP条 -->
                            <div class="status-bar hp-bar">
                                <div class="bar-label">HP</div>
                                <div class="bar-container">
                                    <div class="bar-fill hp-fill" style="width: ${(enemy.hp / enemy.maxHp) * 100}%"></div>
                                    <span class="bar-text">${enemy.hp}/${enemy.maxHp}</span>
                                </div>
                            </div>
                            
                            ${enemy.mana !== undefined ? `
                            <!-- MP条 -->
                            <div class="status-bar mp-bar">
                                <div class="bar-label">MP</div>
                                <div class="bar-container">
                                    <div class="bar-fill mp-fill" style="width: ${((enemy.mana || 0) / (enemy.maxMana || 1)) * 100}%"></div>
                                    <span class="bar-text">${enemy.mana || 0}</span>
                                </div>
                            </div>
                            ` : ''}
                            
                            ${enemy.stamina !== undefined ? `
                            <!-- SP条 -->
                            <div class="status-bar sp-bar">
                                <div class="bar-label">SP</div>
                                <div class="bar-container">
                                    <div class="bar-fill sp-fill" style="width: ${((enemy.stamina || 0) / (enemy.maxStamina || 1)) * 100}%"></div>
                                    <span class="bar-text">${enemy.stamina || 0}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 生成玩家显示
    generatePlayerDisplay(battleState) {
        const player = battleState.player;
        return `
            <div class="player-unit">
                <!-- 玩家名称 -->
                <div class="player-name">🛡️ ${player.name || '冒险者'}</div>
                
                <!-- 玩家图片/贴图占位 -->
                <div class="player-sprite">
                    <div class="sprite-placeholder">
                        <span class="sprite-emoji">🛡️</span>
                    </div>
                </div>
                
                <!-- 玩家状态条 -->
                <div class="player-bars">
                    <!-- HP条 -->
                    <div class="status-bar hp-bar">
                        <div class="bar-label">HP</div>
                        <div class="bar-container">
                            <div class="bar-fill hp-fill player-hp" style="width: ${(player.hp / player.maxHp) * 100}%"></div>
                            <span class="bar-text">${player.hp}/${player.maxHp}</span>
                        </div>
                    </div>
                    
                    <!-- MP条 -->
                    <div class="status-bar mp-bar">
                        <div class="bar-label">MP</div>
                        <div class="bar-container">
                            <div class="bar-fill mp-fill player-mp" style="width: ${((player.mana || 0) / (player.maxMana || 1)) * 100}%"></div>
                            <span class="bar-text">${player.mana || 0}/${player.maxMana || 0}</span>
                        </div>
                    </div>
                    
                    <!-- SP条 -->
                    <div class="status-bar sp-bar">
                        <div class="bar-label">SP</div>
                        <div class="bar-container">
                            <div class="bar-fill sp-fill player-sp" style="width: ${((player.stamina || 0) / (player.maxStamina || 1)) * 100}%"></div>
                            <span class="bar-text">${player.stamina || 0}/${player.maxStamina || 0}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 玩家属性详情（类似背包格式） -->
                <div class="player-stats-detail">
                    ${this.generatePlayerStatsDetail(player)}
                </div>
            </div>
        `;
    }

    // 生成玩家属性详情（类似背包的格式，带临时增益）
    generatePlayerStatsDetail(player) {
        const gameState = window.gameCore?.getService('gameStateService')?.getState();
        const stats = gameState?.getPlayerStats() || player;
        
        // 获取基础属性值（不包含临时增益）
        const baseStats = {
            attack: gameState?.getBasePlayerAttack() || stats.attack || 0,
            physicalResistance: gameState?.getBasePlayerPhysicalResistance() || stats.physicalResistance || 0,
            magicResistance: gameState?.getBasePlayerMagicResistance() || stats.magicResistance || 0,
            magicPower: gameState?.getBasePlayerMagicPower() || stats.magicPower || 0,
            physicalPower: gameState?.getBasePlayerPhysicalPower() || stats.physicalPower || 0,
            agility: gameState?.getBasePlayerAgility() || stats.agility || 0,
            weight: gameState?.getBasePlayerWeight() || stats.weight || 0,
            criticalChance: gameState?.getBasePlayerCriticalChance() || stats.criticalChance || 0
        };
        
        // 格式化属性显示：如果有临时增益则高亮显示差值
        const formatStat = (label, emoji, totalValue, baseValue, suffix = '') => {
            const hasBuff = totalValue !== baseValue;
            const diff = totalValue - baseValue;
            return `
                <div class="stat-row-detail ${hasBuff ? 'has-buff' : ''}" ${hasBuff ? `data-buff-info="${label} +${diff}"` : ''}>
                    <span class="stat-emoji">${emoji}</span>
                    <span class="stat-label-detail">${label}:</span>
                    <span class="stat-value-detail">
                        ${totalValue}${suffix}${hasBuff ? ` <span class="buff-indicator">(+${diff})</span>` : ''}
                    </span>
                </div>
            `;
        };
        
        return `
            <div class="stats-detail-container">
                <div class="stats-detail-title">角色属性</div>
                ${formatStat('攻击力', '⚔️', stats.attack || 0, baseStats.attack)}
                ${formatStat('物理抗性', '🛡️', stats.physicalResistance || 0, baseStats.physicalResistance, '%')}
                ${formatStat('魔法抗性', '✨', stats.magicResistance || 0, baseStats.magicResistance, '%')}
                ${formatStat('物理强度', '💪', stats.physicalPower || 0, baseStats.physicalPower)}
                ${formatStat('魔法强度', '🔮', stats.magicPower || 0, baseStats.magicPower)}
                ${formatStat('敏捷', '⚡', stats.agility || 0, baseStats.agility)}
                ${formatStat('重量', '⚖️', stats.weight || 0, baseStats.weight)}
                ${formatStat('暴击率', '💥', stats.criticalChance || 0, baseStats.criticalChance, '%')}
            </div>
            ${this.generateActiveBuffsDisplay(player.buffs || [])}
        `;
    }

    // 生成活跃增益效果显示（详细版，带持续时间）
    generateActiveBuffsDisplay(buffs) {
        if (!buffs || buffs.length === 0) return '';
        
        return `
            <div class="active-buffs-container">
                <div class="buffs-title">活跃增益</div>
                <div class="buffs-list">
                    ${buffs.map(buff => `
                        <div class="buff-item-detail" title="${buff.description || buff.name}">
                            <span class="buff-icon-detail">${buff.icon || '✨'}</span>
                            <div class="buff-info">
                                <div class="buff-name-detail">${buff.name}</div>
                                ${buff.duration ? `<div class="buff-duration">剩余: ${buff.duration}回合</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 生成增益效果显示
    generateBuffsDisplay(buffs) {
        if (!buffs || buffs.length === 0) return '';
        return buffs.map(buff => `
            <div class="buff-icon" title="${buff.name}: ${buff.description}">
                ${buff.icon || '✨'}
            </div>
        `).join('');
    }

    // 生成玩家属性简览（已移到玩家卡片内，此函数保留用于兼容）
    generatePlayerStatsOverview(battleState) {
        // 此函数不再使用，属性已移到玩家卡片下方
        return '';
    }

    // 生成战斗操作按钮 - 新布局：技能按钮在左，通用操作在右
    generateBattleActions(battleState) {
        if (battleState.turn !== 'player') {
            return '<div class="waiting-message">等待敌人行动...</div>';
        }

        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const skillService = window.gameCore?.getService('skillService');
        const equippedSkills = skillService ? skillService.getEquippedSkills(battleState.player) : [];

        // 生成4个技能槽按钮
        const skillButtons = [];
        for (let i = 0; i < 4; i++) {
            const skillData = equippedSkills[i];
            if (skillData && skillData.skillData) {
                const skill = skillData.skillData;
                const level = skillData.level || 1;
                const cooldownLeft = skillData.cooldownLeft || 0;
                const lvIdx = level - 1;
                
                // 获取消耗
                const mpCost = skill.cost?.mp?.[lvIdx] ?? 0;
                const spCost = skill.cost?.sp?.[lvIdx] ?? 0;
                
                // 检查是否可用
                const canUse = cooldownLeft === 0 &&
                              (battleState.player.mana || 0) >= mpCost &&
                              (battleState.player.stamina || 0) >= spCost;
                
                const disabledClass = canUse ? '' : 'disabled';
                const cooldownText = cooldownLeft > 0 ? `<span class="cooldown-text">冷却${cooldownLeft}</span>` : '';
                
                skillButtons.push(`
                    <button class="battle-skill-slot-btn ${disabledClass}"
                            data-skill="${skill.id}"
                            data-level="${level}"
                            ${!canUse ? 'disabled' : ''}>
                        <span class="skill-slot-icon">✨</span>
                        <span class="skill-slot-name">${skill.name}</span>
                        ${cooldownText}
                    </button>
                `);
            } else {
                skillButtons.push(`
                    <button class="battle-skill-slot-btn empty" disabled>
                        <span class="skill-slot-icon">—</span>
                        <span class="skill-slot-name">空</span>
                    </button>
                `);
            }
        }

        return `
            <div class="battle-actions-new-layout">
                <!-- 左侧：4个技能槽 -->
                <div class="battle-skills-row">
                    ${skillButtons.join('')}
                </div>
                
                <!-- 右侧：通用操作按钮 -->
                <div class="battle-general-actions">
                    <div class="general-row">
                        <button class="battle-action-btn attack-btn" data-action="攻击">
                            <span class="btn-icon">⚔️</span>
                            <span class="btn-text">攻击</span>
                        </button>
                        <button class="battle-action-btn item-btn" data-action="使用物品">
                            <span class="btn-icon">🧪</span>
                            <span class="btn-text">物品</span>
                        </button>
                    </div>
                    <div class="general-row">
                        <button class="battle-action-btn defend-btn" data-action="防御">
                            <span class="btn-icon">🛡️</span>
                            <span class="btn-text">防御</span>
                        </button>
                        <button class="battle-action-btn escape-btn" data-action="逃跑">
                            <span class="btn-icon">🏃</span>
                            <span class="btn-text">逃跑</span>
                        </button>
                    </div>
                </div>
            </div>
            
            ${aliveEnemies.length > 1 ? `
            <div class="target-selection-landscape hidden" id="targetSelection">
                <h4>选择目标：</h4>
                <div class="target-buttons">
                    ${aliveEnemies.map((enemy, index) => `
                        <button class="target-btn" data-target="${battleState.enemies.indexOf(enemy)}">
                            ${enemy.type} (${enemy.hp}/${enemy.maxHp})
                        </button>
                    `).join('')}
                </div>
            </div>` : '' }
        `;
    }

    setupBattleEvents(modal, battleState) {
        const actionButtons = modal.querySelectorAll('.battle-action-btn');
        const targetSelection = modal.querySelector('#targetSelection');
        const skillsSelection = modal.querySelector('#skillsSelection');

        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const singleTargetIndex = aliveEnemies.length === 1 ? battleState.enemies.indexOf(aliveEnemies[0]) : null;

        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;

                if (action === '攻击') {
                    // 1v1直接攻击，无需选择目标
                    if (singleTargetIndex !== null) {
                        this.executeBattleAction('攻击', singleTargetIndex);
                    } else {
                        // 多目标时显示目标选择
                        if (targetSelection) targetSelection.classList.toggle('hidden');
                    }
                } else if (action === '使用物品') {
                    // 直接弹出背包界面
                    this.openInventoryForBattle(battleState);
                } else {
                    // 直接执行行动（防御、逃跑）
                    this.executeBattleAction(action);
                }
            });
        });

        // 目标选择事件（用于多目标时）
        const targetButtons = modal.querySelectorAll('.target-btn');
        targetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = parseInt(btn.dataset.target);
                this.executeBattleAction('攻击', target);
                if (targetSelection) targetSelection.classList.add('hidden');
            });
        });

        // 技能槽按钮事件
        const skillSlotButtons = modal.querySelectorAll('.battle-skill-slot-btn:not(.empty):not(.disabled)');
        skillSlotButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = btn.dataset.skill;
                if (singleTargetIndex !== null) {
                    this.executeBattleAction('技能', singleTargetIndex, null, skillId);
                } else {
                    // 多目标下默认选第一个存活敌人
                    const fallbackIndex = aliveEnemies.length > 0 ? battleState.enemies.indexOf(aliveEnemies[0]) : 0;
                    this.executeBattleAction('技能', fallbackIndex, null, skillId);
                }
            });
        });
    }

    // 在战斗中打开背包界面使用物品
    openInventoryForBattle(battleState) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (!inventoryService) {
            if (this.gameView) {
                this.gameView.showNotification('背包系统不可用', 'error');
            }
            return;
        }

        // 获取背包数据
        const stats = inventoryService.getInventoryStats();
        const items = inventoryService.getAllItems();

        // 创建战斗专用背包界面
        const battleInventoryModal = document.createElement('div');
        battleInventoryModal.className = 'battle-inventory-overlay';
        battleInventoryModal.innerHTML = `
            <div class="battle-inventory-modal">
                <div class="battle-inventory-header">
                    <h3>🎒 使用物品</h3>
                    <button class="close-button" onclick="this.closest('.battle-inventory-overlay').remove()">×</button>
                </div>
                <div class="battle-inventory-content">
                    <div class="battle-inventory-tabs">
                        <button class="tab-button active" data-tab="consumable">消耗品</button>
                        <button class="tab-button" data-tab="all">全部</button>
                    </div>
                    <div class="battle-inventory-grid" id="battleInventoryGrid">
                        ${this.generateBattleInventoryGrid(items)}
                    </div>
                </div>
                <div class="battle-inventory-footer">
                    <p>点击物品使用，只能使用消耗品</p>
                </div>
            </div>
        `;

        document.body.appendChild(battleInventoryModal);

        // 设置背包事件
        this.setupBattleInventoryEvents(battleInventoryModal, battleState);
    }

    // 生成战斗背包网格
    generateBattleInventoryGrid(items) {
        const consumableItems = items.filter(item => item && item.type === 'consumable');
        
        if (consumableItems.length === 0) {
            return '<div class="no-items-message">没有可用的消耗品</div>';
        }

        return consumableItems.map(item => {
            const rarityColor = this.getRarityColor(item.rarity);
            return `
                <div class="battle-inventory-slot" 
                     data-item="${item.name}"
                     style="border-color: ${rarityColor}">
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
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">×${item.quantity}</div>
                    <div class="item-tooltip">
                        <div class="tooltip-name" style="color: ${rarityColor}">${item.name}</div>
                        <div class="tooltip-description">${item.description}</div>
                        ${this.generateItemEffect(item)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 生成物品效果说明
    generateItemEffect(item) {
        if (!item.effect) return '';
        
        const effect = item.effect;
        let effectText = '';
        
        switch (effect.type) {
            case 'heal':
                effectText = `💚 恢复生命值: +${effect.value}`;
                break;
            case 'restore_mana':
                effectText = `🔷 恢复法力值: +${effect.value}`;
                break;
            case 'restore_stamina':
                effectText = `🟠 恢复耐力值: +${effect.value}`;
                break;
            case 'temp_buff':
                effectText = `✨ 临时增益`;
                break;
            default:
                effectText = '特殊效果';
        }
        
        return `<div class="tooltip-effect">${effectText}</div>`;
    }

    // 设置战斗背包事件
    setupBattleInventoryEvents(modal, battleState) {
        const slots = modal.querySelectorAll('.battle-inventory-slot');
        
        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const itemName = slot.dataset.item;
                this.useBattleItem(itemName, battleState);
                // 使用后关闭背包界面
                modal.remove();
            });
        });

        // 标签切换
        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const tabType = button.dataset.tab;
                this.filterBattleInventory(modal, tabType);
            });
        });
    }

    // 过滤战斗背包显示
    filterBattleInventory(modal, filterType) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (!inventoryService) return;

        const items = inventoryService.getAllItems();
        const grid = modal.querySelector('#battleInventoryGrid');
        
        if (filterType === 'consumable') {
            grid.innerHTML = this.generateBattleInventoryGrid(items);
        } else {
            // 显示全部物品但禁用非消耗品
            grid.innerHTML = items.filter(item => item).map(item => {
                const isConsumable = item.type === 'consumable';
                const rarityColor = this.getRarityColor(item.rarity);
                return `
                    <div class="battle-inventory-slot ${!isConsumable ? 'disabled' : ''}"
                         data-item="${isConsumable ? item.name : ''}"
                         style="border-color: ${rarityColor}">
                        <div class="item-icon">
                            ${(() => {
                                const icon = item.icon || '';
                                const isAsset = icon.startsWith('./assets/') || icon.startsWith('assets/');
                                const base = (typeof window !== 'undefined' && window.CDN_BASE_URL) ? window.CDN_BASE_URL : '';
                                const src = isAsset && base ? (base + icon.replace(/^\.\//, '')) : icon;
                                return (isAsset || icon.startsWith('http://') || icon.startsWith('https://'))
                                    ? `<img src="${src}" alt="${item.name}" style="width: 32px; height: 32px; object-fit: contain;">`
                                    : (icon || '📦');
                            })()}
                        </div>
                        <div class="item-name">${item.name}</div>
                        ${isConsumable ? `<div class="item-quantity">×${item.quantity}</div>` : ''}
                    </div>
                `;
            }).join('');
        }
        
        // 重新绑定事件（只绑定可消耗物品）
        const slots = modal.querySelectorAll('.battle-inventory-slot:not(.disabled)');
        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const itemName = slot.dataset.item;
                if (itemName) {
                    this.useBattleItem(itemName);
                    modal.remove();
                }
            });
        });
    }

    // 在战斗中使用物品
    useBattleItem(itemName, battleState) {
        this.executeBattleAction('使用物品', null, itemName);
    }

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

    executeBattleAction(action, target, item, skillId) {
        const battleService = window.gameCore?.getService('battleService');
        if (battleService) {
            battleService.handleBattleAction({ action, target, item, skillId });
        }
    }

    update(battleState) {
        const battleModal = document.querySelector('.battle-modal');
        if (!battleModal) return;

        // 更新回合数
        const header = battleModal.querySelector('.battle-header-landscape h3');
        if (header) {
            header.textContent = `⚔️ 战斗 - 第${battleState.round}回合`;
        }

        // 更新玩家状态条
        this.updatePlayerBars(battleModal, battleState.player);

        // 更新敌人状态
        this.updateEnemiesBars(battleModal, battleState.enemies);

        // 更新战斗日志
        const battleLog = battleModal.querySelector('#battleLog');
        if (battleLog) {
            battleLog.innerHTML = battleState.battleLog.map(log => `
                <div class="log-entry ${log.type}">${log.message}</div>
            `).join('');
            battleLog.scrollTop = battleLog.scrollHeight;
        }

        // 更新行动按钮
        const battleActions = battleModal.querySelector('#battleActions');
        if (battleActions) {
            battleActions.innerHTML = this.generateBattleActions(battleState);
            this.setupBattleEvents(battleModal, battleState);
        }
    }

    updatePlayerBars(modal, player) {
        const playerHp = modal.querySelector('.player-hp');
        const playerMp = modal.querySelector('.player-mp');
        const playerSp = modal.querySelector('.player-sp');

        if (playerHp) {
            const hpPercent = (player.hp / player.maxHp) * 100;
            playerHp.style.width = hpPercent + '%';
            const hpText = playerHp.parentElement.querySelector('.bar-text');
            if (hpText) hpText.textContent = `${player.hp}/${player.maxHp}`;
        }

        if (playerMp) {
            const mpPercent = ((player.mana || 0) / (player.maxMana || 1)) * 100;
            playerMp.style.width = mpPercent + '%';
            const mpText = playerMp.parentElement.querySelector('.bar-text');
            if (mpText) mpText.textContent = `${player.mana || 0}/${player.maxMana || 0}`;
        }

        if (playerSp) {
            const spPercent = ((player.stamina || 0) / (player.maxStamina || 1)) * 100;
            playerSp.style.width = spPercent + '%';
            const spText = playerSp.parentElement.querySelector('.bar-text');
            if (spText) spText.textContent = `${player.stamina || 0}/${player.maxStamina || 0}`;
        }
    }

    updateEnemiesBars(modal, enemies) {
        enemies.forEach((enemy, index) => {
            const enemyDiv = modal.querySelector(`.enemy-unit[data-index="${index}"]`);
            if (enemyDiv) {
                const hpFill = enemyDiv.querySelector('.hp-fill');
                const hpText = enemyDiv.querySelector('.hp-bar .bar-text');

                if (hpFill && hpText) {
                    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
                    hpFill.style.width = hpPercent + '%';
                    hpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
                }

                if (enemy.hp <= 0) {
                    enemyDiv.classList.add('defeated');
                }
            }
        });
    }

    hide() {
        const battleModal = document.querySelector('.battle-modal');
        if (battleModal) {
            battleModal.remove();
        }

        // 重新启用游戏输入（通过主视图控制）
        if (this.gameView && typeof this.gameView.enableInput === 'function') {
            this.gameView.enableInput();
        }
    }
}

export default BattleView;

// 确保类在全局可用（可选）
window.BattleView = BattleView;