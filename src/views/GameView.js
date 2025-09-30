// views/GameView.js
class GameView {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isInputDisabled = false; // 输入禁用状态
        this.loadingMessageElement = null; // 加载消息元素
        this.setupEventListeners();
        this.initializeUI();
    }

    setupEventListeners() {
        this.eventBus.on('ui:display:narrative', this.displayNarrative.bind(this), 'game');
        this.eventBus.on('ui:display:function:result', this.displayFunctionResult.bind(this), 'game');
        this.eventBus.on('ui:display:error', this.displayError.bind(this), 'game');
        this.eventBus.on('state:player:updated', this.updatePlayerStats.bind(this), 'game');
        this.eventBus.on('llm:streaming', this.handleStreaming.bind(this), 'game');
        this.eventBus.on('core:initialized', this.hideLoadingScreen.bind(this), 'system');
        
        // 输入控制相关事件监听
        this.eventBus.on('llm:request:start', this.handleLLMStart.bind(this), 'game');
        this.eventBus.on('llm:response:complete', this.handleLLMComplete.bind(this), 'game');
        this.eventBus.on('function:execute:start', this.disableInput.bind(this), 'game');
        this.eventBus.on('function:execute:complete', this.handleFunctionComplete.bind(this), 'game');
        this.eventBus.on('llm:error', this.handleLLMError.bind(this), 'game');
        this.eventBus.on('function:execute:error', this.enableInput.bind(this), 'game');
        this.eventBus.on('conversation:summary:complete', this.handleSummaryComplete.bind(this), 'game');
        
        // 战斗界面事件监听
        this.eventBus.on('ui:battle:show', this.showBattleInterface.bind(this), 'game');
        this.eventBus.on('ui:battle:hide', this.hideBattleInterface.bind(this), 'game');
        this.eventBus.on('ui:battle:update', this.updateBattleInterface.bind(this), 'game');
        
        // 背包界面事件监听
        this.eventBus.on('ui:inventory:show', this.showInventoryInterface.bind(this), 'game');
        this.eventBus.on('inventory:updated', this.updateInventoryDisplay.bind(this), 'game');
        this.eventBus.on('ui:notification', this.showNotification.bind(this), 'game');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    initializeUI() {
        const gameRoot = document.getElementById('game-root');
        gameRoot.innerHTML = `
            <div class="game-container fade-in">
                <div class="game-header">
                    <h1>🏰 地牢探险</h1>
                    <div class="player-stats" id="playerStats">
                        <div class="stat tooltip" data-tooltip="角色等级">
                            <span class="stat-label">等级:</span>
                            <span class="stat-value" id="playerLevel">1</span>
                        </div>
                        <div class="stat tooltip" data-tooltip="生命值">
                            <span class="stat-label">HP:</span>
                            <span class="stat-value" id="playerHp">100</span>/<span id="playerMaxHp">100</span>
                        </div>
                        <div class="stat tooltip" data-tooltip="经验值">
                            <span class="stat-label">经验:</span>
                            <span class="stat-value" id="playerExp">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-main">
                    <div class="narrative-area" id="narrativeArea">
                        <div class="narrative-message intro">
                            🌟 欢迎来到地牢探险！
                            <br><br>
                            你站在古老地牢的入口前，黑暗的通道向前延伸，空气中弥漫着神秘的气息...
                            <br><br>
                            <em>提示：试试输入"向前探索"、"搜索房间"或"查看状态"来开始你的冒险！</em>
                        </div>
                    </div>
                    
                    <div class="action-area">
                        <div class="input-group">
                            <input type="text" id="actionInput" placeholder="输入你的行动..." 
                                   onkeypress="if(event.key==='Enter') window.gameView.handleAction()"
                                   autocomplete="off">
                            <button class="primary-button" onclick="window.gameView.handleAction()">
                                ⚡ 执行行动
                            </button>
                        </div>
                        <div class="quick-actions">
                            <button class="quick-action-button" onclick="window.gameView.quickAction('向前探索')">
                                🚶 向前探索
                            </button>
                            <button class="quick-action-button" onclick="window.gameView.quickAction('搜索房间')">
                                🔍 搜索房间
                            </button>
                            <button class="quick-action-button" onclick="window.gameView.quickAction('查看状态')">
                                📊 查看状态
                            </button>
                            <button class="quick-action-button" onclick="window.gameView.quickAction('休息回血')">
                                💤 休息回血
                            </button>
                            <button class="quick-action-button inventory-button" onclick="window.gameView.showInventory()">
                                🎒 背包
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="game-status" id="gameStatus">
                    <div class="status-left">
                        <span class="status-indicator ready" id="statusIndicator"></span>
                        <span id="statusText">就绪</span>
                    </div>
                    <div class="status-center">
                        <span id="locationText">地牢入口</span>
                    </div>
                    <div class="status-right">
                        <span id="debugToggle" onclick="toggleDebugPanel()" style="cursor: pointer;">
                            🐛 调试 (Ctrl+D)
                        </span>
                    </div>
                </div>
            </div>
        `;

        // 聚焦到输入框
        document.getElementById('actionInput').focus();
    }

    handleAction() {
        // 检查输入是否被禁用
        if (this.isInputDisabled) {
            this.showNotification('请等待当前操作完成...', 'warning');
            return;
        }
        
        const input = document.getElementById('actionInput');
        const action = input.value.trim();
        
        if (!action) {
            this.showNotification('请输入行动内容！', 'warning');
            return;
        }
        
        this.displayPlayerAction(action);
        input.value = '';
        input.focus();
        
        this.disableInput(); // 立即禁用输入
        this.setStatus('processing', '正在处理行动...');
        this.eventBus.emit('ui:player:action', { action }, 'game');
    }

    quickAction(action) {
        // 检查输入是否被禁用
        if (this.isInputDisabled) {
            this.showNotification('请等待当前操作完成...', 'warning');
            return;
        }
        
        this.displayPlayerAction(action);
        this.disableInput(); // 立即禁用输入
        this.setStatus('processing', '正在处理行动...');
        this.eventBus.emit('ui:player:action', { action }, 'game');
    }

    // 禁用输入控制（仅限制操作区域，不影响叙述区的“进入战斗”按钮）
    disableInput() {
        console.log('[DEBUG] 禁用用户输入');
        this.isInputDisabled = true;
        
        const actionArea = document.querySelector('.action-area');
        const input = document.getElementById('actionInput');
        const mainActionButton = actionArea ? actionArea.querySelector('.primary-button') : null;
        const quickButtons = actionArea ? actionArea.querySelectorAll('.quick-action-button') : [];
        
        if (input) {
            input.disabled = true;
            input.placeholder = '请等待当前操作完成...';
            input.style.opacity = '0.6';
        }
        
        if (mainActionButton) {
            mainActionButton.disabled = true;
            mainActionButton.style.opacity = '0.6';
            mainActionButton.style.cursor = 'not-allowed';
        }
        
        quickButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });

        // 保持“进入战斗”按钮可用
        document.querySelectorAll('.battle-start-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }

    // 启用输入控制（仅恢复操作区域按钮）
    enableInput() {
        console.log('[DEBUG] 启用用户输入');
        this.isInputDisabled = false;
        
        const actionArea = document.querySelector('.action-area');
        const input = document.getElementById('actionInput');
        const mainActionButton = actionArea ? actionArea.querySelector('.primary-button') : null;
        const quickButtons = actionArea ? actionArea.querySelectorAll('.quick-action-button') : [];
        
        if (input) {
            input.disabled = false;
            input.placeholder = '输入你的行动...';
            input.style.opacity = '1';
            input.focus(); // 重新聚焦
        }
        
        if (mainActionButton) {
            mainActionButton.disabled = false;
            mainActionButton.style.opacity = '1';
            mainActionButton.style.cursor = 'pointer';
        }
        
        quickButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        
        this.setStatus('ready', '就绪');
    }

    // 处理函数执行完成事件
    handleFunctionComplete(data) {
        console.log('[DEBUG] 函数执行完成，但需要等待后续剧情生成');
        // 注意：这里不立即启用输入，因为还需要等待后续剧情生成
        // 输入将在 displayNarrative (gm_continuation) 时启用
    }
    //  处理对话总结完成事件
    handleSummaryComplete(data) {
        console.log('[DEBUG] 对话总结完成:', data);
        
        this.showNotification(
            `📚 历史记录已压缩：${data.compressedItems}条记录 → 1条总结`, 
            'info'
        );
        
        // 在叙述区域添加总结提示
        this.addMessage({
            content: `📚 系统提示：为了保持对话流畅，已将前${data.compressedItems}条历史记录压缩为总结。当前共有${data.summaryCount}个历史总结。`,
            type: 'system_info'
        });
    }

    // 处理LLM生成开始
    handleLLMStart(data) {
        console.log('[DEBUG] LLM生成开始');
        this.disableInput();
        this.showLoadingMessage();
    }

    // 处理LLM生成完成
    handleLLMComplete(data) {
        console.log('[DEBUG] LLM生成完成');
        this.hideLoadingMessage();
        // 注意：不在这里启用输入，因为可能还有函数执行或后续生成
    }

    // 处理LLM生成错误
    handleLLMError(data) {
        console.log('[DEBUG] LLM生成错误');
        this.hideLoadingMessage();
        this.enableInput();
    }

    // 显示加载消息
    showLoadingMessage() {
        if (this.loadingMessageElement) {
            return; // 已经在显示了
        }

        const narrativeArea = document.getElementById('narrativeArea');
        this.loadingMessageElement = document.createElement('div');
        this.loadingMessageElement.className = 'narrative-message loading-message slide-up';
        
        this.loadingMessageElement.innerHTML = `
            <div class="ai-loading-content">
                <div class="loading-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
                <span class="loading-text">AI正在思考中...</span>
            </div>
        `;
        
        narrativeArea.appendChild(this.loadingMessageElement);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;
    }

    // 隐藏加载消息
    hideLoadingMessage() {
        if (this.loadingMessageElement && this.loadingMessageElement.parentNode) {
            this.loadingMessageElement.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (this.loadingMessageElement && this.loadingMessageElement.parentNode) {
                    this.loadingMessageElement.parentNode.removeChild(this.loadingMessageElement);
                }
                this.loadingMessageElement = null;
            }, 300);
        }
    }


    displayPlayerAction(action) {
        this.addMessage({
            content: `> ${action}`,
            type: 'player_action'
        });
    }

    displayNarrative(data) {
        this.addMessage(data);
        
        // 根据叙述类型决定是否启用输入
        if (data.type === 'gm_narrative' && !data.content.includes('<FUNCTION_CALL>')) {
            // 普通GM叙述且没有函数调用，启用输入
            this.enableInput();
        } else if (data.type === 'gm_continuation') {
            // 后续剧情生成完成，启用输入
            this.enableInput();
        } else if (data.type === 'gm_fallback') {
            // 后备叙述，启用输入
            this.enableInput();
        }
        // 其他情况保持当前状态
    }

    displayFunctionResult(data) {
        // 普通函数结果显示
        if (!(data.functionName === 'start_battle' && data.result && data.result.outcome === 'battle_ready')) {
            this.addMessage({
                content: `⚔️ 【${data.functionName}】${data.result.description}`,
                type: 'function_result'
            });
            return;
        }

        // 战斗准备态：显示“进入战斗”按钮，禁止其他行动，直到玩家点击
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'narrative-message function_result slide-up';

        // 时间戳
        const timestamp = new Date().toLocaleTimeString();
        const timeElement = document.createElement('div');
        timeElement.style.fontSize = '10px';
        timeElement.style.opacity = '0.6';
        timeElement.style.marginBottom = '5px';
        timeElement.textContent = timestamp;

        // 内容
        const contentElement = document.createElement('div');
        contentElement.textContent = `⚔️ 【${data.functionName}】${data.result.description}`;

        // 进入战斗按钮
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '10px';
        const startBtn = document.createElement('button');
        startBtn.className = 'primary-button battle-start-button';
        startBtn.textContent = '进入战斗';
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.onclick = () => {
            // 点击进入战斗
            const battleService = window.gameCore?.getService('battleService');
            if (battleService && typeof battleService.launchPreparedBattle === 'function') {
                battleService.launchPreparedBattle();
            }
        };

        buttonWrapper.appendChild(startBtn);
        messageDiv.appendChild(timeElement);
        messageDiv.appendChild(contentElement);
        messageDiv.appendChild(buttonWrapper);

        narrativeArea.appendChild(messageDiv);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;

        // 战斗准备期间禁止其他输入
        this.disableInput();
        this.setStatus('processing', '战斗待开始...');
    }

    displayError(data) {
        this.addMessage({
            content: `❌ 错误: ${data.message}`,
            type: 'error'
        });
        this.setStatus('error', '发生错误');
        this.showNotification(data.message, 'error');
    }

    updatePlayerStats(playerData) {
        const oldLevel = parseInt(document.getElementById('playerLevel').textContent);
        const oldHp = parseInt(document.getElementById('playerHp').textContent);
        const oldExp = parseInt(document.getElementById('playerExp').textContent);
        
        console.log('[DEBUG] UI更新玩家状态:', {
            旧状态: { level: oldLevel, hp: oldHp, exp: oldExp },
            新状态: playerData
        });
        
        // 更新显示
        document.getElementById('playerLevel').textContent = playerData.level;
        document.getElementById('playerHp').textContent = playerData.hp;
        document.getElementById('playerMaxHp').textContent = playerData.maxHp;
        document.getElementById('playerExp').textContent = playerData.experience;
        
        // 升级提示
        if (playerData.level > oldLevel) {
            this.showLevelUpNotification(oldLevel, playerData.level);
        }
        
        // HP变化提示
        if (playerData.hp !== oldHp) {
            const hpChange = playerData.hp - oldHp;
            if (hpChange > 0) {
                this.showNotification(`💚 恢复了 ${hpChange} 点生命值`, 'success');
            } else if (hpChange < 0) {
                this.showNotification(`💔 损失了 ${Math.abs(hpChange)} 点生命值`, 'warning');
            }
        }
        
        // 经验值变化提示
        if (playerData.experience > oldExp) {
            const expGain = playerData.experience - oldExp;
            this.showNotification(`✨ 获得了 ${expGain} 点经验值`, 'info');
        }
    }

    // 升级通知
    showLevelUpNotification(oldLevel, newLevel) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <h3>🎉 等级提升！</h3>
                <p>从 Lv.${oldLevel} 升级到 Lv.${newLevel}</p>
                <p>生命值已完全恢复！</p>
            </div>
        `;
        
        // 添加特殊样式
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #333;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
            z-index: 10000;
            animation: levelUpPulse 2s ease-in-out;
            text-align: center;
            font-weight: bold;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 3000);
    }

    handleStreaming(data) {
        const { chunk, accumulated } = data;
        this.setStatus('processing', `正在生成回应... (${accumulated.length} 字符)`);
    }

    addMessage(messageData) {
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `narrative-message ${messageData.type} slide-up`;
        
        // 添加时间戳
        const timestamp = new Date().toLocaleTimeString();
        const timeElement = document.createElement('div');
        timeElement.style.fontSize = '10px';
        timeElement.style.opacity = '0.6';
        timeElement.style.marginBottom = '5px';
        timeElement.textContent = timestamp;
        
        const contentElement = document.createElement('div');
        contentElement.textContent = messageData.content;
        
        messageDiv.appendChild(timeElement);
        messageDiv.appendChild(contentElement);
        
        narrativeArea.appendChild(messageDiv);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;
        
        // 更新调试信息
        this.updateDebugLog(`Message: ${messageData.type}`, 'info');
    }

    setStatus(type, text) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        indicator.className = `status-indicator ${type}`;
        statusText.textContent = text;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateDebugLog(message, type = 'info') {
        const debugLog = document.getElementById('debug-event-log');
        if (debugLog) {
            const entry = document.createElement('div');
            entry.className = `debug-log-entry ${type}`;
            entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            
            debugLog.appendChild(entry);
            debugLog.scrollTop = debugLog.scrollHeight;
            
            // 限制日志条数
            while (debugLog.children.length > 50) {
                debugLog.removeChild(debugLog.firstChild);
            }
        }
    }

    // 显示背包界面
    showInventory() {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            inventoryService.showInventory();
        }
    }

    // 显示背包界面弹窗
    showInventoryInterface(data) {
        const { items, maxSlots, usedSlots } = data;
        
        // 创建背包界面
        const inventoryModal = document.createElement('div');
        inventoryModal.className = 'inventory-modal';
        inventoryModal.innerHTML = `
            <div class="inventory-content">
                <div class="inventory-header">
                    <h3>🎒 背包 (${usedSlots}/${maxSlots})</h3>
                    <button class="close-button" onclick="this.closest('.inventory-modal').remove()">×</button>
                </div>
                <div class="inventory-grid" id="inventoryGrid">
                    ${this.generateInventoryGrid(items, maxSlots)}
                </div>
                <div class="inventory-footer">
                    <p>点击物品使用，右键查看详情</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(inventoryModal);
        
        // 添加点击事件
        this.setupInventoryEvents(inventoryModal);
    }

    generateInventoryGrid(items, maxSlots) {
        let html = '';
        const itemMap = new Map(items.map(item => [item.name, item]));
        
        for (let i = 0; i < maxSlots; i++) {
            const item = items[i];
            if (item) {
                const rarityColor = this.getRarityColor(item.rarity);
                html += `
                    <div class="inventory-slot filled" data-item="${item.name}" style="border-color: ${rarityColor}">
                        <div class="item-icon">${item.icon}</div>
                        <div class="item-quantity">${item.quantity}</div>
                        <div class="item-tooltip">
                            <div class="tooltip-name" style="color: ${rarityColor}">${item.name}</div>
                            <div class="tooltip-description">${item.description}</div>
                        </div>
                    </div>
                `;
            } else {
                html += '<div class="inventory-slot empty"></div>';
            }
        }
        
        return html;
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

    setupInventoryEvents(modal) {
        const slots = modal.querySelectorAll('.inventory-slot.filled');
        slots.forEach(slot => {
            slot.addEventListener('click', (e) => {
                const itemName = slot.dataset.item;
                this.useInventoryItem(itemName);
            });
            
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const itemName = slot.dataset.item;
                this.showItemDetails(itemName);
            });
        });
    }

    useInventoryItem(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            inventoryService.useItem(itemName);
        }
    }

    showItemDetails(itemName) {
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            const item = inventoryService.getItem(itemName);
            if (item) {
                this.showNotification(`${item.name}: ${item.description}`, 'info');
            }
        }
    }

    updateInventoryDisplay(data) {
        // 如果背包界面打开，更新显示
        const inventoryModal = document.querySelector('.inventory-modal');
        if (inventoryModal) {
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
    }

    // 显示战斗界面
    showBattleInterface(battleState) {
        // 禁用游戏输入
        this.disableInput();
        
        // 创建战斗界面
        const battleModal = document.createElement('div');
        battleModal.className = 'battle-modal';
        battleModal.innerHTML = `
            <div class="battle-content">
                <div class="battle-header">
                    <h3>⚔️ 战斗 - 第${battleState.round}回合</h3>
                </div>
                <div class="battle-main">
                    <div class="battle-participants">
                        <div class="player-section">
                            <h4>🛡️ ${battleState.player.name || '冒险者'}</h4>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${(battleState.player.hp / battleState.player.maxHp) * 100}%"></div>
                                <span class="hp-text">${battleState.player.hp}/${battleState.player.maxHp}</span>
                            </div>
                        </div>
                        <div class="enemies-section">
                            ${battleState.enemies.map((enemy, index) => `
                                <div class="enemy ${enemy.hp <= 0 ? 'defeated' : ''}" data-index="${index}">
                                    <h4>👹 ${enemy.type}</h4>
                                    <div class="hp-bar">
                                        <div class="hp-fill enemy-hp" style="width: ${(enemy.hp / enemy.maxHp) * 100}%"></div>
                                        <span class="hp-text">${enemy.hp}/${enemy.maxHp}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="battle-log" id="battleLog">
                        ${battleState.battleLog.map(log => `
                            <div class="log-entry ${log.type}">${log.message}</div>
                        `).join('')}
                    </div>
                    <div class="battle-actions" id="battleActions">
                        ${this.generateBattleActions(battleState)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(battleModal);
        this.setupBattleEvents(battleModal, battleState);
    }

    generateBattleActions(battleState) {
        if (battleState.turn !== 'player') {
            return '<div class="waiting-message">等待敌人行动...</div>';
        }
        
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        
        return `
            <div class="action-buttons">
                <button class="battle-action-btn attack-btn" data-action="攻击">⚔️ 攻击</button>
                <button class="battle-action-btn defend-btn" data-action="防御">🛡️ 防御</button>
                <button class="battle-action-btn item-btn" data-action="使用物品">🧪 使用物品</button>
                <button class="battle-action-btn escape-btn" data-action="逃跑">🏃 逃跑</button>
            </div>
            <div class="target-selection hidden" id="targetSelection">
                <h4>选择目标：</h4>
                ${aliveEnemies.map((enemy, index) => `
                    <button class="target-btn" data-target="${battleState.enemies.indexOf(enemy)}">
                        ${enemy.type} (${enemy.hp}/${enemy.maxHp})
                    </button>
                `).join('')}
            </div>
        `;
    }

    setupBattleEvents(modal, battleState) {
        const actionButtons = modal.querySelectorAll('.battle-action-btn');
        const targetSelection = modal.querySelector('#targetSelection');
        
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                
                if (action === '攻击') {
                    // 显示目标选择
                    targetSelection.classList.remove('hidden');
                } else {
                    // 直接执行行动
                    this.executeBattleAction(action);
                }
            });
        });
        
        // 目标选择事件
        const targetButtons = modal.querySelectorAll('.target-btn');
        targetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = parseInt(btn.dataset.target);
                this.executeBattleAction('攻击', target);
                targetSelection.classList.add('hidden');
            });
        });
    }

    executeBattleAction(action, target, item) {
        const battleService = window.gameCore?.getService('battleService');
        if (battleService) {
            battleService.handleBattleAction({ action, target, item });
        }
    }

    updateBattleInterface(battleState) {
        const battleModal = document.querySelector('.battle-modal');
        if (!battleModal) return;
        
        // 更新回合数
        const header = battleModal.querySelector('.battle-header h3');
        if (header) {
            header.textContent = `⚔️ 战斗 - 第${battleState.round}回合`;
        }
        
        // 更新HP条
        const playerHpFill = battleModal.querySelector('.player-section .hp-fill');
        const playerHpText = battleModal.querySelector('.player-section .hp-text');
        if (playerHpFill && playerHpText) {
            const hpPercent = (battleState.player.hp / battleState.player.maxHp) * 100;
            playerHpFill.style.width = hpPercent + '%';
            playerHpText.textContent = `${battleState.player.hp}/${battleState.player.maxHp}`;
        }
        
        // 更新敌人HP
        battleState.enemies.forEach((enemy, index) => {
            const enemyDiv = battleModal.querySelector(`.enemy[data-index="${index}"]`);
            if (enemyDiv) {
                const hpFill = enemyDiv.querySelector('.hp-fill');
                const hpText = enemyDiv.querySelector('.hp-text');
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

    hideBattleInterface() {
        const battleModal = document.querySelector('.battle-modal');
        if (battleModal) {
            battleModal.remove();
        }
        
        // 重新启用游戏输入
        this.enableInput();
    }
}

export default GameView;

// 确保类在全局可用
window.GameView = GameView;