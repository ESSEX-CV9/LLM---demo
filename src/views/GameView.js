// views/GameView.js
class GameView {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isInputDisabled = false; // 输入禁用状态
        this.loadingMessageElement = null; // 加载消息元素
        this.completedBattles = new Set(); // 跟踪已完成的战斗ID
        this.battleIdCounter = 0; // 战斗ID计数器
        this.setupEventListeners();
        this.initializeUI();
    }

    setupEventListeners() {
        this.eventBus.on('ui:display:narrative', this.displayNarrative.bind(this), 'game');
        this.eventBus.on('ui:display:function:result', this.displayFunctionResult.bind(this), 'game');
        this.eventBus.on('ui:display:error', this.displayError.bind(this), 'game');
        this.eventBus.on('state:player:updated', this.updatePlayerStats.bind(this), 'game');
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
        
        // 战斗完成事件监听
        this.eventBus.on('battle:completed', this.handleBattleCompleted.bind(this), 'game');
        
        // 背包界面事件监听
        this.eventBus.on('ui:inventory:show', this.showInventoryInterface.bind(this), 'game');
        this.eventBus.on('inventory:updated', this.updateInventoryDisplay.bind(this), 'game');
        this.eventBus.on('ui:notification', this.showNotification.bind(this), 'game');

        // 存档加载后恢复叙述区
        this.eventBus.on('save:loaded', this.restoreNarrativeFromHistory.bind(this), 'game');
        
        // 新游戏开始时重置UI状态
        this.eventBus.on('game:new-game:started', this.handleNewGameStarted.bind(this), 'game');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        // 显示新的开始页面
        this.showStartPage();
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
                        <div class="stat tooltip" data-tooltip="法力值">
                            <span class="stat-label">MP:</span>
                            <span class="stat-value" id="playerMana">50</span>/<span id="playerMaxMana">50</span>
                        </div>
                        <div class="stat tooltip" data-tooltip="耐力值">
                            <span class="stat-label">SP:</span>
                            <span class="stat-value" id="playerStamina">50</span>/<span id="playerMaxStamina">50</span>
                        </div>
                        <div class="stat tooltip" data-tooltip="技能点">
                            <span class="stat-label">技能点:</span>
                            <span class="stat-value" id="playerSkillPoints">0</span>
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
                            <button class="quick-action-button" onclick="window.gameView.showSkills()">
                                🧠 技能
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
                        <div style="display: inline-flex; gap: 4px; margin-right: 8px;">
                            <button class="quick-action-button" style="min-width: 80px; white-space: nowrap;" onclick="window.gameView.returnToStartPage()">🏠 开始界面</button>
                            <button class="quick-action-button" style="min-width: 60px; white-space: nowrap;" onclick="window.gameView.openSaveManager('manage')">💾 存档</button>
                        </div>
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

        // 战斗准备态：显示"进入战斗"按钮，禁止其他行动，直到玩家点击
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'narrative-message function_result slide-up';

        // 生成唯一的战斗ID
        const battleId = ++this.battleIdCounter;
        messageDiv.setAttribute('data-battle-id', battleId);

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
        startBtn.setAttribute('data-battle-id', battleId);
        startBtn.onclick = () => {
            // 检查战斗是否已完成
            if (this.completedBattles.has(battleId)) {
                this.showNotification('这场战斗已经结束了', 'warning');
                return;
            }
            
            // 点击进入战斗
            const battleService = window.gameCore?.getService('battleService');
            if (battleService && typeof battleService.launchPreparedBattle === 'function') {
                // 将战斗ID传递给战斗服务，以便战斗结束时能够标记
                battleService.currentBattleId = battleId;
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
        const oldMana = parseInt(document.getElementById('playerMana')?.textContent || '0');
        const oldStamina = parseInt(document.getElementById('playerStamina')?.textContent || '0');
        const oldSkillPoints = parseInt(document.getElementById('playerSkillPoints')?.textContent || '0');
        
        console.log('[DEBUG] UI更新玩家状态:', {
            旧状态: { level: oldLevel, hp: oldHp, exp: oldExp },
            新状态: playerData
        });
        
        // 更新显示
        document.getElementById('playerLevel').textContent = playerData.level;
        document.getElementById('playerHp').textContent = playerData.hp;
        document.getElementById('playerMaxHp').textContent = playerData.maxHp;
        document.getElementById('playerExp').textContent = playerData.experience;
        // 新增资源显示
        const manaEl = document.getElementById('playerMana');
        const maxManaEl = document.getElementById('playerMaxMana');
        const staminaEl = document.getElementById('playerStamina');
        const maxStaminaEl = document.getElementById('playerMaxStamina');
        const spEl = document.getElementById('playerSkillPoints');
        if (manaEl && maxManaEl) {
            manaEl.textContent = playerData.mana ?? 0;
            maxManaEl.textContent = playerData.maxMana ?? 0;
        }
        if (staminaEl && maxStaminaEl) {
            staminaEl.textContent = playerData.stamina ?? 0;
            maxStaminaEl.textContent = playerData.maxStamina ?? 0;
        }
        if (spEl) {
            spEl.textContent = playerData.skillPoints ?? 0;
        }
        
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
        
        // 法力/耐力变化提示
        if (playerData.mana !== undefined && playerData.mana !== oldMana) {
            const delta = playerData.mana - oldMana;
            if (delta > 0) {
                this.showNotification(`🔷 恢复了 ${delta} 点法力`, 'success');
            } else if (delta < 0) {
                this.showNotification(`🔷 消耗了 ${Math.abs(delta)} 点法力`, 'warning');
            }
        }
        if (playerData.stamina !== undefined && playerData.stamina !== oldStamina) {
            const delta = playerData.stamina - oldStamina;
            if (delta > 0) {
                this.showNotification(`🟠 恢复了 ${delta} 点耐力`, 'success');
            } else if (delta < 0) {
                this.showNotification(`🟠 消耗了 ${Math.abs(delta)} 点耐力`, 'warning');
            }
        }
        if (playerData.skillPoints !== undefined && playerData.skillPoints > oldSkillPoints) {
            const delta = playerData.skillPoints - oldSkillPoints;
            this.showNotification(`🧠 获得了 ${delta} 点技能点`, 'info');
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


    addMessage(messageData) {
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `narrative-message ${messageData.type} slide-up`;
        
        // 添加时间戳（支持外部传入）
        const ts = messageData.timestamp ? new Date(messageData.timestamp) : new Date();
        const timestamp = ts.toLocaleTimeString();
        const timeElement = document.createElement('div');
        timeElement.style.fontSize = '10px';
        timeElement.style.opacity = '0.6';
        timeElement.style.marginBottom = '5px';
        timeElement.textContent = timestamp;
        
        const contentElement = document.createElement('div');
        contentElement.textContent = messageData.content ?? '';
        
        messageDiv.appendChild(timeElement);
        messageDiv.appendChild(contentElement);
        
        narrativeArea.appendChild(messageDiv);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;
        
        // 将 GM 叙述加入历史，以便存档恢复（避免重复，仅针对 gm_* 类型，且不是从历史恢复的）
        try {
            const typeVal = messageData.type || '';
            if (!messageData.skipHistory && (typeVal === 'gm_narrative' || typeVal === 'gm_continuation' || typeVal === 'gm_fallback')) {
                const gsService = window.gameCore?.getService('gameStateService');
                if (gsService && typeof gsService.addConversationEntry === 'function') {
                    gsService.addConversationEntry({
                        role: 'system',
                        content: messageData.content ?? '',
                        type: typeVal
                    });
                }
            }
        } catch (e) {
            // 忽略历史写入异常，避免影响UI
        }
        
        // 更新调试信息
        this.updateDebugLog(`Message: ${messageData.type}`, 'info');
    }

    setStatus(type, text) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        indicator.className = `status-indicator ${type}`;
        statusText.textContent = text;
    }

    showNotification(input, type = 'info') {
        // 兼容事件总线传入对象 { message, type }
        let message = '';
        let level = type;
        if (input && typeof input === 'object') {
            message = input.message ?? (typeof input === 'string' ? input : '[通知]');
            level = input.type ?? type;
        } else {
            message = input ?? '';
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${level}`;
        notification.textContent = message;
        
        // 计算当前通知的位置，避免重叠
        const existingNotifications = document.querySelectorAll('.notification');
        let topOffset = 20; // 初始距离顶部20px
        existingNotifications.forEach((existing, index) => {
            topOffset += 60; // 每个通知高度约50px + 10px间距
        });
        
        notification.style.cssText = `
            position: fixed;
            top: ${topOffset}px;
            right: 20px;
            background: ${level === 'error' ? '#ff4444' : level === 'warning' ? '#ffaa00' : level === 'success' ? '#44ff44' : '#4488ff'};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
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

    // 显示技能页面
    showSkills() {
        const skillService = window.gameCore?.getService('skillService');
        if (skillService) {
            skillService.showSkills();
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
                            <div class="hp-bar mp-bar">
                                <div class="hp-fill mp-fill" style="width: ${((battleState.player.mana || 0) / (battleState.player.maxMana || 1)) * 100}%"></div>
                                <span class="hp-text">${battleState.player.mana || 0}/${battleState.player.maxMana || 0} MP</span>
                            </div>
                            <div class="hp-bar sp-bar">
                                <div class="hp-fill sp-fill" style="width: ${((battleState.player.stamina || 0) / (battleState.player.maxStamina || 1)) * 100}%"></div>
                                <span class="hp-text">${battleState.player.stamina || 0}/${battleState.player.maxStamina || 0} SP</span>
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
        const skillService = window.gameCore?.getService('skillService');
        const usableSkills = skillService ? skillService.getUsableSkills(battleState) : [];
        
        return `
            <div class="action-buttons">
                <button class="battle-action-btn attack-btn" data-action="攻击">⚔️ 攻击</button>
                <button class="battle-action-btn skill-btn" data-action="技能">✨ 技能</button>
                <button class="battle-action-btn defend-btn" data-action="防御">🛡️ 防御</button>
                <button class="battle-action-btn item-btn" data-action="使用物品">🧪 使用物品</button>
                <button class="battle-action-btn escape-btn" data-action="逃跑">🏃 逃跑</button>
            </div>
            ${aliveEnemies.length > 1 ? `
            <div class="target-selection hidden" id="targetSelection">
                <h4>选择目标：</h4>
                ${aliveEnemies.map((enemy, index) => `
                    <button class="target-btn" data-target="${battleState.enemies.indexOf(enemy)}">
                        ${enemy.type} (${enemy.hp}/${enemy.maxHp})
                    </button>
                `).join('')}
            </div>` : '' }
            <div class="skills-selection hidden" id="skillsSelection">
                <h4>选择技能：</h4>
                ${usableSkills.length > 0 ? usableSkills.map(({ skill, level }) => `
                    <button class="skill-btn" data-skill="${skill.id}" data-level="${level}">
                        ${skill.name} Lv.${level}
                    </button>
                `).join('') : '<div class="no-skills">暂无可用技能（资源不足或冷却中）</div>'}
            </div>
        `;
    }

    setupBattleEvents(modal, battleState) {
        const actionButtons = modal.querySelectorAll('.battle-action-btn');
        const targetSelection = modal.querySelector('#targetSelection');
        const skillsSelection = modal.querySelector('#skillsSelection');
        
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const singleTargetIndex = aliveEnemies.length === 1 ? battleState.enemies.indexOf(aliveEnemies[0]) : null;

        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                
                if (action === '攻击') {
                    // 1v1直接攻击，无需选择目标
                    if (singleTargetIndex !== null) {
                        this.executeBattleAction('攻击', singleTargetIndex);
                    } else {
                        // 多目标时显示目标选择
                        if (targetSelection) targetSelection.classList.remove('hidden');
                    }
                } else if (action === '技能') {
                    // 打开技能选择列表
                    if (skillsSelection) skillsSelection.classList.remove('hidden');
                } else {
                    // 直接执行行动
                    this.executeBattleAction(action);
                }
            });
        });
        
        // 目标选择事件（用于多目标时）
        const targetButtons = modal.querySelectorAll('.target-btn');
        targetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = parseInt(btn.dataset.target);
                this.executeBattleAction('攻击', target);
                if (targetSelection) targetSelection.classList.add('hidden');
            });
        });

        // 技能选择事件
        const skillButtons = modal.querySelectorAll('.skills-selection .skill-btn');
        skillButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = btn.dataset.skill;
                if (singleTargetIndex !== null) {
                    this.executeBattleAction('技能', singleTargetIndex, null, skillId);
                } else {
                    // 多目标下默认选第一个存活敌人（后续可扩展为选择目标）
                    const fallbackIndex = aliveEnemies.length > 0 ? battleState.enemies.indexOf(aliveEnemies[0]) : 0;
                    this.executeBattleAction('技能', fallbackIndex, null, skillId);
                }
                if (skillsSelection) skillsSelection.classList.add('hidden');
            });
        });
    }

    executeBattleAction(action, target, item, skillId) {
        const battleService = window.gameCore?.getService('battleService');
        if (battleService) {
            battleService.handleBattleAction({ action, target, item, skillId });
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
        // 更新MP/SP
        const playerMpFill = battleModal.querySelector('.player-section .mp-fill');
        const playerSpFill = battleModal.querySelector('.player-section .sp-fill');
        const mpTextEl = battleModal.querySelector('.player-section .mp-bar .hp-text');
        const spTextEl = battleModal.querySelector('.player-section .sp-bar .hp-text');
        if (playerMpFill && mpTextEl) {
            const mpPercent = ((battleState.player.mana || 0) / (battleState.player.maxMana || 1)) * 100;
            playerMpFill.style.width = mpPercent + '%';
            mpTextEl.textContent = `${battleState.player.mana || 0}/${battleState.player.maxMana || 0} MP`;
        }
        if (playerSpFill && spTextEl) {
            const spPercent = ((battleState.player.stamina || 0) / (battleState.player.maxStamina || 1)) * 100;
            playerSpFill.style.width = spPercent + '%';
            spTextEl.textContent = `${battleState.player.stamina || 0}/${battleState.player.maxStamina || 0} SP`;
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

    // 显示新的开始页面
    showStartPage() {
        try {
            // 导入并显示 StartView
            import('../views/StartView.js').then(module => {
                const StartView = module.default;
                this.startView = new StartView(this.eventBus);
                this.startView.show();
            }).catch(error => {
                console.error('[UI] Failed to load StartView:', error);
                // 降级处理：显示简单的开始界面
                this.showFallbackStartInterface();
            });
        } catch (e) {
            console.warn('[UI] showStartPage error:', e);
            this.showFallbackStartInterface();
        }
    }

    // 降级开始界面
    showFallbackStartInterface() {
        const saveService = window.gameCore?.getService('saveService');
        const latest = saveService?.getLatestSlot?.() || null;
        const hasSaves = !!latest;
        
        const overlay = document.createElement('div');
        overlay.id = 'fallback-start';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: #1e3c72;
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; color: white; font-family: sans-serif;
        `;
        overlay.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1>🏰 地牢探险</h1>
                <p>LLM 驱动 RPG Demo</p>
                <div style="margin: 30px 0;">
                    <button id="newGameBtn" style="margin: 10px; padding: 15px 30px; font-size: 16px;">开始新游戏</button>
                    <button id="continueBtn" style="margin: 10px; padding: 15px 30px; font-size: 16px;" ${!hasSaves ? 'disabled' : ''}>继续游戏</button>
                    <button id="loadBtn" style="margin: 10px; padding: 15px 30px; font-size: 16px;">加载存档</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // 事件处理
        overlay.querySelector('#newGameBtn').onclick = () => {
            saveService?.startNewGame();
            overlay.remove();
        };
        overlay.querySelector('#continueBtn').onclick = () => {
            if (hasSaves) {
                saveService?.loadFromSlot(latest.index);
                overlay.remove();
            }
        };
        overlay.querySelector('#loadBtn').onclick = () => {
            overlay.remove();
            this.openSaveManager('load');
        };
    }

    // 隐藏开始页面
    hideStartPage() {
        if (this.startView) {
            this.startView.hide();
            this.startView = null;
        }
        const fallback = document.getElementById('fallback-start');
        if (fallback) {
            fallback.remove();
        }
    }

    // 存档管理器（加载/保存/导入/导出/删除）
    openSaveManager(mode = 'load') {
        // 如果来自开始页面，记录需要返回
        const fromStartPage = !!this.startView || !!document.getElementById('fallback-start');
        
        // 隐藏开始页面
        this.hideStartPage();

        const existing = document.querySelector('.save-manager-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'save-manager-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
        `;
        const box = document.createElement('div');
        box.style.cssText = `
            background:#1f2430; color:#fff; width: 720px; max-width: 96%;
            border-radius:12px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,.45);
        `;
        const title = mode === 'manage' ? '💾 存档管理' : '📂 加载存档';
        box.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <h3 style="margin:0;">${title}</h3>
                <div>
                    <button class="quick-action-button" id="importBtn">📥 导入</button>
                    ${fromStartPage ? '<button class="quick-action-button" id="backToStartBtn" style="margin-left:8px;">🔙 返回</button>' : ''}
                    <button class="close-button" id="closeSaveMgr" style="margin-left:8px;">×</button>
                </div>
            </div>
            <div id="slotsContainer"></div>
            <div style="margin-top:12px; font-size:12px; opacity:.85">
                提示：共有 6 个槽位。导出为 JSON 可分享或备份，导入可恢复进度。
            </div>
        `;
        modal.appendChild(box);
        document.body.appendChild(modal);

        const container = box.querySelector('#slotsContainer');
        const saveService = window.gameCore?.getService('saveService');
        const list = saveService?.listSaves?.() || new Array(6).fill(null);
        container.innerHTML = this._renderSlotsHTML(list, mode);

        this._setupSaveManagerEvents(modal, mode);

        // 关闭按钮
        box.querySelector('#closeSaveMgr')?.addEventListener('click', () => {
            modal.remove();
            if (fromStartPage) {
                this.showStartPage();
            }
        });

        // 返回开始页面按钮
        box.querySelector('#backToStartBtn')?.addEventListener('click', () => {
            modal.remove();
            this.showStartPage();
        });

        // 导入按钮
        box.querySelector('#importBtn')?.addEventListener('click', () => {
            this._promptImport(false /*autoLoad*/, () => {
                // 刷新列表
                const updated = saveService?.listSaves?.() || new Array(6).fill(null);
                container.innerHTML = this._renderSlotsHTML(updated, mode);
                this._setupSaveManagerEvents(modal, mode);
            });
        });
    }

    _renderSlotsHTML(list, mode) {
        const saveService = window.gameCore?.getService('saveService');
        const latest = saveService?.getLatestSlot?.();
        const cards = list.map((slot, i) => {
            if (!slot) {
                return `
                <div class="slot-card" style="background:#2a3142; border-radius:8px; padding:12px; margin:8px 0; display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-weight:600;">槽位 ${i + 1}</div>
                        <div style="opacity:.8; font-size:12px;">空槽位</div>
                    </div>
                    <div>
                        <button class="quick-action-button save-btn" data-slot="${i}">保存</button>
                    </div>
                </div>`;
            }
            const isLatest = latest && latest.index === i;
            const dt = slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : '-';
            const subtitle = `Lv.${slot.summary.level || 1}｜${slot.summary.name || '冒险者'}｜${slot.summary.location || '-'}`;
            return `
            <div class="slot-card" style="background:#2a3142; border-radius:8px; padding:12px; margin:8px 0; display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <div style="font-weight:600;">槽位 ${i + 1} ${isLatest ? '<span style="font-size:12px; color:#ffd54f; margin-left:6px;">最新</span>' : ''}</div>
                    <div style="opacity:.85; font-size:12px;">${subtitle}</div>
                    <div style="opacity:.7; font-size:12px;">更新：${dt}</div>
                </div>
                <div>
                    <button class="quick-action-button load-btn" data-slot="${i}">加载</button>
                    <button class="quick-action-button save-btn" data-slot="${i}">保存</button>
                    <button class="quick-action-button export-btn" data-slot="${i}">导出</button>
                    <button class="quick-action-button delete-btn" data-slot="${i}">删除</button>
                </div>
            </div>`;
        }).join('');
        return `<div>${cards}</div>`;
    }

    _setupSaveManagerEvents(modal, mode) {
        const saveService = window.gameCore?.getService('saveService');

        modal.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.loadFromSlot(slot);
                    modal.remove();
                }
            });
        });
        modal.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.saveToSlot(slot, { label: '手动存档' });
                }
            });
        });
        modal.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    saveService.exportSlot(slot);
                }
            });
        });
        modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    if (confirm(`确认删除槽位 ${slot + 1} 的存档？`)) {
                        saveService.deleteSlot(slot);
                        // 刷新列表
                        const container = modal.querySelector('#slotsContainer');
                        const list = saveService.listSaves();
                        container.innerHTML = this._renderSlotsHTML(list, mode);
                        this._setupSaveManagerEvents(modal, mode);
                    }
                }
            });
        });
    }

    _promptImport(autoLoad = false, onDone) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            if (file) {
                const text = await file.text();
                const saveService = window.gameCore?.getService('saveService');
                const res = saveService.importToSlot(text);
                if (res.success) {
                    if (autoLoad) {
                        saveService.loadFromSlot(res.slot);
                    }
                    if (typeof onDone === 'function') onDone(res);
                } else {
                    this.showNotification(res.error || '导入失败', 'error');
                }
            }
            document.body.removeChild(input);
        });
        input.click();
    }

    // 返回开始界面
    returnToStartPage() {
        // 确认对话框
        if (confirm('确定要返回开始界面吗？当前进度将会自动保存。')) {
            // 自动保存当前进度
            const saveService = window.gameCore?.getService('saveService');
            if (saveService) {
                saveService._autoSave('返回开始界面自动存档');
            }
            
            // 显示开始页面
            this.showStartPage();
            
            // 显示通知
            this.showNotification('已返回开始界面，进度已自动保存', 'info');
        }
    }

    // 显示新游戏存档位置选择对话框
    showNewGameSlotSelection() {
        const existing = document.querySelector('.new-game-slot-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'new-game-slot-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 10001;
        `;
        
        const box = document.createElement('div');
        box.style.cssText = `
            background: #1f2430; color: #fff; width: 600px; max-width: 96%;
            border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.6);
        `;
        
        box.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4CAF50;">🌱 选择新游戏存档位置</h3>
                <button class="close-button" id="closeNewGameSlot" style="background: #f44336; border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">×</button>
            </div>
            <div style="margin-bottom: 15px; padding: 10px; background: #2a3142; border-radius: 8px; border-left: 4px solid #ff9800;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                    ⚠️ <strong>重要提示：</strong>选择存档槽位后将开始新游戏，该槽位的现有存档将被覆盖！
                </p>
            </div>
            <div id="newGameSlotsContainer"></div>
            <div style="margin-top: 15px; text-align: center;">
                <button class="quick-action-button" id="cancelNewGame" style="background: #666; margin-right: 10px;">取消</button>
            </div>
        `;
        
        modal.appendChild(box);
        document.body.appendChild(modal);

        // 渲染存档槽位
        const container = box.querySelector('#newGameSlotsContainer');
        const saveService = window.gameCore?.getService('saveService');
        const list = saveService?.listSaves?.() || new Array(6).fill(null);
        
        container.innerHTML = this._renderNewGameSlotsHTML(list);
        this._setupNewGameSlotEvents(modal);

        // 关闭按钮事件
        box.querySelector('#closeNewGameSlot')?.addEventListener('click', () => {
            modal.remove();
            // 通知StartView新游戏流程已取消
            this.eventBus.emit('start:new-game:cancelled', {}, 'game');
            this.showStartPage(); // 返回开始界面
        });
        
        box.querySelector('#cancelNewGame')?.addEventListener('click', () => {
            modal.remove();
            // 通知StartView新游戏流程已取消
            this.eventBus.emit('start:new-game:cancelled', {}, 'game');
            this.showStartPage(); // 返回开始界面
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                // 通知StartView新游戏流程已取消
                this.eventBus.emit('start:new-game:cancelled', {}, 'game');
                this.showStartPage(); // 返回开始界面
            }
        });
    }

    // 渲染新游戏存档槽位HTML
    _renderNewGameSlotsHTML(list) {
        const cards = list.map((slot, i) => {
            const isEmpty = !slot;
            const statusText = isEmpty ? '空槽位' : '有存档 - 将被覆盖';
            const statusColor = isEmpty ? '#4CAF50' : '#ff9800';
            const subtitle = isEmpty ? '推荐选择' :
                `Lv.${slot.summary.level || 1}｜${slot.summary.name || '冒险者'}｜${slot.summary.location || '-'}`;
            const updateTime = slot ? new Date(slot.updatedAt).toLocaleString() : '-';
            
            return `
            <div class="new-game-slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${isEmpty ? '#4CAF50' : '#ff9800'};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 5px;">
                            槽位 ${i + 1}
                            <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                        </div>
                        <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">${subtitle}</div>
                        ${!isEmpty ? `<div style="opacity: 0.7; font-size: 11px;">更新时间: ${updateTime}</div>` : ''}
                    </div>
                    <div>
                        <button class="new-game-slot-btn" data-slot="${i}" style="
                            background: ${isEmpty ? '#4CAF50' : '#ff9800'};
                            border: none;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            ${isEmpty ? '选择此槽位' : '覆盖此槽位'}
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
        
        return `<div>${cards}</div>`;
    }

    // 设置新游戏槽位选择事件
    _setupNewGameSlotEvents(modal) {
        modal.querySelectorAll('.new-game-slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    // 确认对话框
                    const saveService = window.gameCore?.getService('saveService');
                    const list = saveService?.listSaves?.() || [];
                    const hasExisting = list[slot] !== null;
                    
                    const confirmMsg = hasExisting ?
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？\n\n⚠️ 这将覆盖现有存档！` :
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？`;
                    
                    if (confirm(confirmMsg)) {
                        modal.remove();
                        this.startNewGameInSlot(slot);
                    }
                }
            });
        });
    }

    // 在指定槽位开始新游戏
    startNewGameInSlot(slotIndex) {
        const saveService = window.gameCore?.getService('saveService');
        if (saveService) {
            // 开始新游戏
            const result = saveService.startNewGame();
            if (result.success) {
                // 立即保存到指定槽位
                saveService.saveToSlot(slotIndex, { label: '新游戏' });
                
                // 隐藏开始页面
                this.hideStartPage();
                
                // 显示成功通知
                this.showNotification(`🌱 新游戏已在槽位 ${slotIndex + 1} 开始！`, 'success');
                
                // 发送新游戏开始事件（确保StartView能够接收到）
                this.eventBus.emit('start:new-game', { slot: slotIndex }, 'game');
                
                // 确保游戏界面可见
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.classList.remove('hidden');
                    gameContainer.style.display = 'block';
                }
                
                // 聚焦到输入框
                const actionInput = document.getElementById('actionInput');
                if (actionInput) {
                    actionInput.focus();
                }
            } else {
                this.showNotification('新游戏启动失败', 'error');
                // 如果新游戏启动失败，重新显示开始页面
                this.showStartPage();
            }
        }
    }

// 从存档恢复叙述区历史
restoreNarrativeFromHistory(data) {
    try {
        const gs = window.gameCore?.getService('gameStateService');
        const history = gs?.getState()?.conversation?.history || [];
        const narrativeArea = document.getElementById('narrativeArea');
        if (!narrativeArea) return;

        // 清空当前叙述区（移除欢迎提示），用存档历史重建
        narrativeArea.innerHTML = '';

        // 始终显示欢迎消息（无论是否有历史记录）
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'narrative-message intro';
        welcomeDiv.innerHTML = `
            🌟 欢迎回到地牢探险！
            <br><br>
            你重新回到了这个充满神秘与危险的地牢世界...
            <br><br>
            <em>存档已加载，继续你的冒险吧！</em>
        `;
        narrativeArea.appendChild(welcomeDiv);

        // 如果有历史记录，恢复它们
        if (history.length > 0) {
            history.forEach(entry => {
                let content = entry.content || '';
                let type = entry.type || (entry.role === 'user' ? 'player_action' : 'gm_narrative');
                
                // 修复玩家行动格式：确保有 > 前缀
                if (type === 'player_action' && !content.startsWith('>')) {
                    content = `> ${content}`;
                }
                
                // 修复函数结果显示：从 result 字段恢复原始显示内容
                if (type === 'function_result' && entry.result) {
                    if (entry.result.description) {
                        // 从存档的 result.description 恢复原始显示格式
                        const functionName = content.match(/函数执行结果:\s*(\w+)/)?.[1] || 'unknown';
                        content = `⚔️ 【${functionName}】${entry.result.description}`;
                        
                        // 如果是战斗准备状态，需要重新添加"进入战斗"按钮
                        if (functionName === 'start_battle' && entry.result.outcome === 'battle_ready') {
                            // 延迟处理，确保消息已添加到DOM
                            setTimeout(() => {
                                this.restoreBattleReadyButton(entry.result);
                            }, 100);
                        }
                    }
                }

                this.addMessage({
                    content,
                    type,
                    timestamp: entry.timestamp || Date.now(),
                    skipHistory: true // 避免重复写入历史
                });
            });
        }

        // 检查是否需要恢复战斗状态
        if (data && data.hasPreparedBattle) {
            console.log('[UI] 检测到战斗准备状态，禁用输入');
            this.disableInput();
            this.setStatus('processing', '战斗待开始...');
        } else if (data && data.isInBattle) {
            console.log('[UI] 检测到活跃战斗状态');
            // 战斗界面会由 BattleService 自动恢复
        } else {
            // 正常状态，启用输入
            this.enableInput();
        }

    } catch (e) {
        console.warn('[UI] restoreNarrativeFromHistory error:', e);
    }
}

// 恢复战斗准备状态的"进入战斗"按钮
restoreBattleReadyButton(battleResult) {
    try {
        const narrativeArea = document.getElementById('narrativeArea');
        const messages = narrativeArea.querySelectorAll('.narrative-message.function_result');
        
        // 找到最后一个战斗函数结果消息
        let targetMessage = null;
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.textContent.includes('start_battle') && msg.textContent.includes(battleResult.description)) {
                targetMessage = msg;
                break;
            }
        }
        
        if (targetMessage) {
            // 检查是否已经有按钮
            if (targetMessage.querySelector('.battle-start-button')) {
                return; // 已经有按钮了
            }
            
            // 生成战斗ID（恢复时使用负数以避免与新战斗冲突）
            const battleId = --this.battleIdCounter;
            targetMessage.setAttribute('data-battle-id', battleId);
            
            // 添加进入战斗按钮
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.marginTop = '10px';
            const startBtn = document.createElement('button');
            startBtn.className = 'primary-button battle-start-button';
            startBtn.textContent = '进入战斗';
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
            startBtn.setAttribute('data-battle-id', battleId);
            startBtn.onclick = () => {
                // 检查战斗是否已完成
                if (this.completedBattles.has(battleId)) {
                    this.showNotification('这场战斗已经结束了', 'warning');
                    return;
                }
                
                // 点击进入战斗
                const battleService = window.gameCore?.getService('battleService');
                if (battleService && typeof battleService.launchPreparedBattle === 'function') {
                    battleService.currentBattleId = battleId;
                    battleService.launchPreparedBattle();
                }
            };
            
            buttonWrapper.appendChild(startBtn);
            targetMessage.appendChild(buttonWrapper);
            
            console.log('[UI] 恢复了战斗准备按钮，ID:', battleId);
        }
    } catch (e) {
        console.warn('[UI] restoreBattleReadyButton error:', e);
    }
}

    // 处理战斗完成事件
    handleBattleCompleted(battleResult) {
        console.log('[GameView] 战斗完成，更新按钮状态');
        
        // 获取当前战斗ID
        const battleService = window.gameCore?.getService('battleService');
        const battleId = battleService?.currentBattleId;
        
        if (battleId) {
            // 标记战斗为已完成
            this.completedBattles.add(battleId);
            
            // 更新对应的战斗按钮状态
            this.updateBattleButtonState(battleId);
            
            // 清除战斗服务中的当前战斗ID
            if (battleService) {
                battleService.currentBattleId = null;
            }
        }
    }

    // 更新战斗按钮状态
    updateBattleButtonState(battleId) {
        const button = document.querySelector(`.battle-start-button[data-battle-id="${battleId}"]`);
        if (button) {
            button.disabled = true;
            button.textContent = '战斗已结束';
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.background = '#666';
            
            // 添加已完成的样式类
            const messageDiv = button.closest('.narrative-message');
            if (messageDiv) {
                messageDiv.classList.add('battle-completed');
            }
            
            console.log(`[GameView] 已禁用战斗按钮 ID: ${battleId}`);
        }
    }

    // 处理新游戏开始事件
    handleNewGameStarted(data) {
        console.log('[GameView] 新游戏开始，重置UI状态');
        
        // 重置战斗状态跟踪
        this.completedBattles.clear();
        this.battleIdCounter = 0;
        
        // 强制启用输入，清除任何禁用状态
        this.enableInput();
        
        // 重置状态显示
        this.setStatus('ready', '就绪');
        
        // 清空叙述区并显示新游戏欢迎信息
        const narrativeArea = document.getElementById('narrativeArea');
        if (narrativeArea) {
            narrativeArea.innerHTML = '';
            
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'narrative-message intro slide-up';
            welcomeDiv.innerHTML = `
                🌟 欢迎来到地牢探险！
                <br><br>
                你站在古老地牢的入口前，黑暗的通道向前延伸，空气中弥漫着神秘的气息...
                <br><br>
                <em>提示：试试输入"向前探索"、"搜索房间"或"查看状态"来开始你的冒险！</em>
            `;
            narrativeArea.appendChild(welcomeDiv);
        }
        
        // 聚焦到输入框
        const actionInput = document.getElementById('actionInput');
        if (actionInput) {
            actionInput.focus();
        }
        
        // 确保游戏界面可见
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'block';
        }
        
        console.log('[GameView] 新游戏UI状态重置完成');
    }
}
 
export default GameView;
 
// 确保类在全局可用
window.GameView = GameView;