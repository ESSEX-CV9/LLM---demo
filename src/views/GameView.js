import BattleView from './BattleView.js';
import InventoryView from './InventoryView.js';
import SaveManagerView from './SaveManagerView.js';
import MerchantView from './MerchantView.js';

// views/GameView.js
class GameView {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isInputDisabled = false; // 输入禁用状态
        this.loadingMessageElement = null; // 加载消息元素
        this.completedBattles = new Set(); // 跟踪已完成的战斗ID
        this.battleIdCounter = 0; // 战斗ID计数器
        this.completedMerchantTrades = new Set(); // 跟踪已完成的商人交易ID
        this.merchantTradeIdCounter = 0; // 商人交易ID计数器

        // 解耦视图：实例化战斗与背包视图（最小侵入）
        this.battleView = new BattleView(this.eventBus, this);
        this.inventoryView = new InventoryView(this.eventBus, this);
        // 解耦视图：实例化存档视图（最小侵入）
        this.saveManagerView = new SaveManagerView(this.eventBus, this);
        // 实例化商人视图
        this.merchantView = new MerchantView(this.eventBus, this);
        
        this.setupEventListeners();
        this.initializeUI();
    }

    setupEventListeners() {
        this.eventBus.on('ui:display:narrative', this.displayNarrative.bind(this), 'game');
        this.eventBus.on('ui:display:function:result', this.displayFunctionResult.bind(this), 'game');
        this.eventBus.on('ui:display:error', this.displayError.bind(this), 'game');
        this.eventBus.on('state:player:updated', this.updatePlayerStats.bind(this), 'game');
        this.eventBus.on('core:initialized', this.hideLoadingScreen.bind(this), 'system');
        this.eventBus.on('ui:merchant:hide', this.handleMerchantClosed.bind(this), 'game');
        
        // 监听游戏状态变化，更新调试面板
        this.eventBus.on('state:player:updated', this.updateDebugGameState.bind(this), 'game');
        this.eventBus.on('state:world:updated', this.updateDebugGameState.bind(this), 'game');
        this.eventBus.on('core:initialized', this.updateDebugGameState.bind(this), 'system');
        
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
        
        // 重新生成消息相关事件
        this.eventBus.on('ui:regenerate:start', this.handleRegenerateStart.bind(this), 'game');
        this.eventBus.on('ui:regenerate:complete', this.handleRegenerateComplete.bind(this), 'game');
        this.eventBus.on('ui:regenerate:error', this.handleRegenerateError.bind(this), 'game');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        // 显示新的开始页面
        this.showStartPage();
        
        // 初始化调试面板的游戏状态显示
        setTimeout(() => {
            this.updateDebugGameState();
        }, 100);
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
                        <div class="stat tooltip" data-tooltip="金币">
                            <span class="stat-label">💰</span>
                            <span class="stat-value" id="playerCurrency" style="color: #ffd700;">0金 0银 0铜</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-main">
                    <div class="narrative-area" id="narrativeArea">
                            <div class="narrative-message intro">🌟 欢迎来到地牢探险！
    
    你站在古老地牢的入口前，黑暗的通道向前延伸，空气中弥漫着神秘的气息...
    
    <em>提示：试试输入"向前探索"、"搜索房间"或"查看状态"来开始你的冒险！</em></div>
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
                            <button class="quick-action-button" onclick="window.gameView.handleRest()" style="background: linear-gradient(135deg, #2e7d32, #388e3c); border-color: #4caf50;">
                                💤 休息
                            </button>
                            <button class="quick-action-button" onclick="window.gameView.showSkills()" style="background: linear-gradient(135deg, #7b1fa2, #9c27b0); border-color: #ba68c8;">
                                🧠 技能
                            </button>
                            <button class="quick-action-button inventory-button" onclick="window.gameView.showInventory()" title="打开装备与背包界面">
                                🎒 装备
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

        // 将战斗ID保存到历史记录中，以便存档恢复时使用
        try {
            const gsService = window.gameCore?.getService('gameStateService');
            if (gsService && typeof gsService.addConversationEntry === 'function') {
                gsService.addConversationEntry({
                    role: 'system',
                    content: `函数执行结果: ${data.functionName}`,
                    result: data.result,
                    type: 'function_result',
                    battleId: battleId // 保存战斗ID
                });
                console.log('[GameView] 已保存战斗ID到历史记录:', battleId);
            }
        } catch (e) {
            console.warn('[UI] 保存战斗ID到历史记录失败:', e);
        }

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
        
        // 更新货币显示
        if (playerData.currency !== undefined) {
            this.updateCurrencyDisplay(playerData.currency);
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
        }, 2000);
    }


    addMessage(messageData) {
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `narrative-message ${messageData.type} slide-up`;
        // 绑定精确时间戳到DOM，便于恢复时定位
        try {
            const tsVal = messageData.timestamp ? Number(messageData.timestamp) : Date.now();
            messageDiv.setAttribute('data-ts', String(tsVal));
        } catch (e) {}
        
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
        
        // 为GM生成的消息添加重新生成按钮（仅最新的消息，且不是从存档恢复）
        // 排除 rest_event 类型的消息
        const typeVal = messageData.type || '';
        if (!messageData.skipHistory && !messageData.isRestoringFromSave &&
            (typeVal === 'gm_narrative' || typeVal === 'gm_continuation' || typeVal === 'gm_fallback') &&
            typeVal !== 'rest_event') {
            // 移除之前所有消息的重新生成按钮
            this.removeAllRegenerateButtons();
            
            // 为当前消息添加重新生成按钮
            this.addRegenerateButton(messageDiv, messageData);
        }
        
        narrativeArea.appendChild(messageDiv);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;
        
        // 将 GM 叙述加入历史，以便存档恢复（避免重复，仅针对 gm_* 和 rest_event 类型，且不是从历史恢复的）
        try {
            if (!messageData.skipHistory && (typeVal === 'gm_narrative' || typeVal === 'gm_continuation' || typeVal === 'gm_fallback' || typeVal === 'rest_event')) {
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

        // 初始化通知队列与活动列表（最多并发显示3条）
        if (!this._notifQueue) this._notifQueue = [];
        if (!this._notifActive) this._notifActive = [];
        if (typeof this._notifMax !== 'number') this._notifMax = 3;

        // 定义辅助方法（首调用时挂载到实例，保持最小侵入）
        if (!this._repositionActive) {
            this._repositionActive = () => {
                this._notifActive.forEach((entry, index) => {
                    const topOffset = 20 + 60 * index; // 每条通知垂直间距
                    entry.el.style.top = `${topOffset}px`;
                    entry.el.style.left = '20px';
                });
            };
        }

        if (!this._drainNotifications) {
            this._drainNotifications = () => {
                while (this._notifActive.length < this._notifMax && this._notifQueue.length > 0) {
                    const next = this._notifQueue.shift();
                    this._createNotification(next.message, next.level);
                }
            };
        }

        if (!this._createNotification) {
            this._createNotification = (msg, lvl) => {
                const notification = document.createElement('div');
                notification.className = `notification ${lvl}`;
                notification.textContent = msg;

                // 计算位置基于当前活跃数量
                const index = this._notifActive.length;
                const topOffset = 20 + 60 * index;

                notification.style.cssText = `
                    position: fixed;
                    top: ${topOffset}px;
                    left: 20px;
                    background: ${lvl === 'error' ? '#ff4444' : lvl === 'warning' ? '#ffaa00' : lvl === 'success' ? '#2e7d32' : '#4488ff'};
                    color: white;
                    padding: 12px 16px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    z-index: 1000002; /* 提升至装备界面之上 */
                    animation: slideInLeft 0.3s ease-out;
                    max-width: 300px;
                    word-wrap: break-word;
                `;

                document.body.appendChild(notification);
                this._notifActive.push({ el: notification });

                // 自动移除并回填队列
                const backlog = (this._notifQueue?.length || 0) + (this._notifActive?.length || 0);
                const baseDuration = 2000;
                const duration = backlog > 10 ? Math.floor(baseDuration / 2) : baseDuration;
                setTimeout(() => {
                    notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                        // 从活跃列表移除
                        const idx = this._notifActive.findIndex(n => n.el === notification);
                        if (idx >= 0) {
                            this._notifActive.splice(idx, 1);
                        }
                        // 重新排列剩余通知
                        this._repositionActive();
                        // 显示队列中的下一条
                        this._drainNotifications();
                    }, 300);
                }, duration);
            };
        }

        // 如果当前活跃通知未达上限，直接显示；否则进入队列滚动显示
        if (this._notifActive.length < this._notifMax) {
            this._createNotification(message, level);
        } else {
            this._notifQueue.push({ message, level });
        }
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

    // 更新调试面板中的游戏状态显示
    updateDebugGameState() {
        const debugGameState = document.getElementById('debug-game-state');
        if (!debugGameState) return;

        try {
            const gameStateService = window.gameCore?.getService('gameStateService');
            if (!gameStateService) {
                debugGameState.textContent = '游戏状态服务未初始化';
                return;
            }

            const gameState = gameStateService.getState();
            if (!gameState) {
                debugGameState.textContent = '游戏状态未创建';
                return;
            }

            // 格式化游戏状态信息
            const stateInfo = {
                玩家: {
                    姓名: gameState.player.name,
                    等级: gameState.player.level,
                    生命值: `${gameState.player.hp}/${gameState.player.maxHp}`,
                    法力值: `${gameState.player.mana || 0}/${gameState.player.maxMana || 0}`,
                    耐力值: `${gameState.player.stamina || 0}/${gameState.player.maxStamina || 0}`,
                    经验值: gameState.player.experience,
                    技能点: gameState.player.skillPoints || 0
                },
                世界: {
                    当前位置: gameState.world.currentLocation,
                    时间: gameState.world.timeOfDay,
                    天气: gameState.world.weather
                },
                战斗: {
                    是否在战斗中: gameState.battle.isInBattle ? '是' : '否'
                },
                对话历史: `${gameState.conversation.history.length} 条记录`
            };

            // 将状态信息转换为易读的JSON格式
            debugGameState.textContent = JSON.stringify(stateInfo, null, 2);
            
            // 更新调试日志
            this.updateDebugLog('游戏状态已更新', 'info');
            
        } catch (error) {
            console.error('[DEBUG] 更新调试游戏状态失败:', error);
            debugGameState.textContent = `状态更新失败: ${error.message}`;
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

    // 显示背包界面弹窗（委托到 InventoryView）
    showInventoryInterface(data) {
        if (this.inventoryView) {
            this.inventoryView.show(data);
        }
    }

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

    generateEquipmentTooltip(item) {
        if (!item.stats) return '';
        
        // 获取玩家等级以检查装备需求
        const gameStateService = window.gameCore?.getService('gameStateService');
        const playerLevel = gameStateService?.getState()?.player?.level || 1;
        
        let statsHtml = '<div class="tooltip-stats">';
        const stats = item.stats;
        
        // 需求等级（符合条件：浅绿色，不符合：红色）
        if (item.requirements && item.requirements.level) {
            const canEquip = playerLevel >= item.requirements.level;
            const levelColor = canEquip ? '#66bb6a' : '#ff4444';
            statsHtml += `<div style="color: ${levelColor}">需要等级: ${item.requirements.level}</div>`;
        }
        
        // 武器持握方式（蓝色）
        if (item.weaponType === 'two-handed') {
            statsHtml += `<div style="color: #82b1ff">持握方式: 双手武器</div>`;
        } else if (item.weaponType === 'one-handed') {
            statsHtml += `<div style="color: #82b1ff">持握方式: 单手武器</div>`;
        }
        
        // 基础数值（白色）
        if (stats.attack) statsHtml += `<div style="color: #ffffff">攻击力: +${stats.attack}</div>`;
        if (stats.physicalResistance) statsHtml += `<div style="color: #ffffff">物理抗性: +${stats.physicalResistance}%</div>`;
        if (stats.magicResistance) statsHtml += `<div style="color: #ffffff">魔法抗性: +${stats.magicResistance}%</div>`;
        if (stats.physicalPower) statsHtml += `<div style="color: #ffffff">物理强度: +${stats.physicalPower}</div>`;
        if (stats.magicPower) statsHtml += `<div style="color: #ffffff">魔法强度: +${stats.magicPower}</div>`;
        if (stats.agility) statsHtml += `<div style="color: #ffffff">敏捷: ${stats.agility > 0 ? '+' : ''}${stats.agility}</div>`;
        if (stats.weight) statsHtml += `<div style="color: #ffffff">重量: ${stats.weight > 0 ? '+' : ''}${stats.weight}</div>`;
        if (stats.maxHp) statsHtml += `<div style="color: #ffffff">生命值: +${stats.maxHp}</div>`;
        if (stats.maxMana) statsHtml += `<div style="color: #ffffff">法力值: +${stats.maxMana}</div>`;
        if (stats.maxStamina) statsHtml += `<div style="color: #ffffff">耐力值: +${stats.maxStamina}</div>`;
        if (stats.criticalChance) statsHtml += `<div style="color: #ffffff">暴击率: +${stats.criticalChance}%</div>`;
        // 背包扩容格数显示
        if (stats.inventorySlots) statsHtml += `<div style="color: #ffffff">背包容量: +${stats.inventorySlots}格</div>`;
        
        // 显示装备特殊效果（绿色）
        if (item.effects && item.effects.length > 0) {
            for (const effect of item.effects) {
                if (effect.description) {
                    statsHtml += `<div class="tooltip-effect" style="color: #cc2fe0ff">✨ ${effect.description}</div>`;
                }
            }
        }
        
        // 显示稀有度（保持原有稀有度颜色）
        if (item.rarity) {
            const rarityNames = {
                'common': '普通',
                'uncommon': '优秀',
                'rare': '稀有',
                'epic': '史诗',
                'legendary': '传说'
            };
            const rarityColor = this.getRarityColor(item.rarity);
            statsHtml += `<div class="tooltip-rarity" style="color: ${rarityColor}">⭐ 稀有度: ${rarityNames[item.rarity] || item.rarity}</div>`;
        }
        
        // 显示价值（黄色）
        if (item.value) {
            statsHtml += `<div class="tooltip-value" style="color: #ffeb3b">💰 价值: ${item.value} 铜币</div>`;
        }
        
        statsHtml += '</div>';
        
        return statsHtml;
    }

    generateItemTooltip(item) {
        let tooltipHtml = '';
        
        // 添加物品类型信息
        tooltipHtml += '<div class="tooltip-stats">';
        
        // 根据物品类型显示不同信息
        if (item.type === 'consumable') {
            tooltipHtml += `<div class="tooltip-type">类型: 消耗品</div>`;
            
            // 显示效果信息
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
            
            // 显示堆叠信息
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
        
        // 显示稀有度
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
        
        // 显示价值
        if (item.value) {
            tooltipHtml += `<div class="tooltip-value">💰 价值: ${item.value} 铜币</div>`;
        }
        
        tooltipHtml += '</div>';
        
        return tooltipHtml;
    }

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
            
            // 检查是否是双手武器的副槽位
            const isSecondarySlot = equippedItem && equippedItem.isSecondarySlot;
            const displayItem = isSecondarySlot ? null : equippedItem; // 副槽位不显示物品图标
            
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

    generateEquipmentStats(player) {
        if (!player) return '';
        
        const gameState = window.gameCore?.getService('gameStateService')?.getState();
        const stats = gameState?.getPlayerStats() || player;
        const equipmentSummary = gameState?.getEquipmentSummary() || {};
        
        // 获取基础属性值（不包含临时增益）
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
        
        // 格式化属性显示：如果有临时增益则显示为 总值(基础值)，否则只显示总值
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
            // 左键点击使用/装备
            slot.addEventListener('click', (e) => {
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
                
                console.log('[拖拽] 开始拖拽物品:', itemName, itemType, itemSubType);
                
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
            slot.addEventListener('dragend', (e) => {
                slot.classList.remove('dragging');
                console.log('[拖拽] 拖拽结束');
            });

            // 悬浮全局提示（Portal），避免被 inventoryGrid/inventoryContent 裁剪
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

    setupEquipmentEvents(modal) {
        const equipmentSlots = modal.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            // 点击卸下装备
            slot.addEventListener('click', (e) => {
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
                // 只有当鼠标真正离开槽位时才移除样式
                if (!slot.contains(e.relatedTarget)) {
                    slot.classList.remove('drag-over');
                }
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                
                console.log('[拖拽] 物品放置到装备槽');
                
                try {
                    const jsonData = e.dataTransfer.getData('application/json');
                    const textData = e.dataTransfer.getData('text/plain');
                    
                    let data;
                    if (jsonData) {
                        data = JSON.parse(jsonData);
                    } else if (textData) {
                        // 降级处理：如果没有JSON数据，使用文本数据
                        data = { itemName: textData };
                    } else {
                        throw new Error('无法获取拖拽数据');
                    }
                    
                    const slotType = slot.dataset.slot;
                    console.log('[拖拽] 尝试装备:', data.itemName, '到槽位:', slotType);
                    
                    // 检查装备类型是否匹配槽位
                    if (this.canEquipToSlot(data, slotType)) {
                        this.equipItemToSlot(data.itemName, slotType);
                    } else {
                        this.showNotification('该装备不能装备到此槽位', 'warning');
                    }
                } catch (error) {
                    console.error('[拖拽] 装备失败:', error);
                    this.showNotification('装备失败: ' + error.message, 'error');
                }
            });

            // 悬浮全局提示（Portal），避免被 inventory-content 裁剪
            slot.addEventListener('mouseenter', () => {
                // 使用已装备的图标作为锚点
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

    setupInventoryTabs(modal) {
        const tabButtons = modal.querySelectorAll('.tab-button');
        const inventoryGrid = modal.querySelector('#inventoryGrid');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 更新标签状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 过滤显示物品
                const tabType = button.dataset.tab;
                this.filterInventoryItems(inventoryGrid, tabType);
            });
        });
    }

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

    canEquipToSlot(itemData, slotType) {
        const { type, subType, itemName } = itemData;
        
        console.log('[装备检查] 物品:', itemName, '类型:', type, '子类型:', subType, '目标槽位:', slotType);
        
        // 如果没有类型信息，尝试从物品数据库获取
        if (!type && itemName) {
            // 尝试多种方式获取物品数据库
            let itemsDB = window.itemsDB;
            if (!itemsDB) {
                // 尝试通过模块导入获取
                try {
                    itemsDB = window.gameCore?.itemsDB;
                } catch (e) {
                    console.warn('[装备检查] 无法获取物品数据库');
                }
            }
            
            if (itemsDB) {
                const equipmentData = itemsDB.getEquipment(itemName);
                if (equipmentData) {
                    const equipmentType = equipmentData.type;
                    const equipmentSubType = equipmentData.subType;
                    const weaponType = equipmentData.weaponType;
                    console.log('[装备检查] 从数据库获取类型:', equipmentType, equipmentSubType, weaponType);
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
        
        console.log('[装备检查] 无法匹配槽位');
        return false;
    }

    equipItemToSlot(itemName, slotType) {
        console.log('[装备] 尝试装备物品:', itemName, '到槽位:', slotType);
        
        const equipmentService = window.gameCore?.getService('equipmentService');
        if (equipmentService) {
            const result = equipmentService.equipItem(itemName, slotType);
            console.log('[装备] 装备结果:', result);
            
            if (result.success) {
                // 刷新背包界面
                this.refreshInventoryInterface();
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } else {
            console.error('[装备] 装备服务不可用');
            this.showNotification('装备系统不可用', 'error');
        }
    }

    unequipItem(slotType) {
        const equipmentService = window.gameCore?.getService('equipmentService');
        if (equipmentService) {
            const result = equipmentService.unequipItem(slotType);
            if (result.success) {
                // 刷新背包界面
                this.refreshInventoryInterface();
            }
        }
    }

    // 刷新背包界面（委托到 InventoryView）
    refreshInventoryInterface() {
        if (this.inventoryView) {
            this.inventoryView.refresh();
        }
    }

    useInventoryItem(itemName) {
        console.log('[使用物品] 尝试使用/装备:', itemName);
        
        const inventoryService = window.gameCore?.getService('inventoryService');
        if (inventoryService) {
            const result = inventoryService.useItem(itemName);
            console.log('[使用物品] 使用结果:', result);
            
            // 如果使用成功，刷新界面
            if (result) {
                this.refreshInventoryInterface();
            }
        } else {
            console.error('[使用物品] 背包服务不可用');
            this.showNotification('背包系统不可用', 'error');
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

    // 更新背包界面（委托到 InventoryView）
    updateInventoryDisplay(data) {
        if (this.inventoryView) {
            this.inventoryView.update(data);
        }
    }

    // 显示战斗界面（委托到 BattleView）
    showBattleInterface(battleState) {
        if (this.battleView) {
            this.battleView.show(battleState);
        }
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

    // 更新战斗界面（委托到 BattleView）
    updateBattleInterface(battleState) {
        if (this.battleView) {
            this.battleView.update(battleState);
        }
    }

    // 隐藏战斗界面（委托到 BattleView）
    hideBattleInterface() {
        if (this.battleView) {
            this.battleView.hide();
        }
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

    // 存档管理器（委托到 SaveManagerView）
    openSaveManager(mode = 'load') {
        if (this.saveManagerView) {
            this.saveManagerView.openSaveManager(mode);
        }
    }

    _renderSlotsHTML(list, mode) {
        const saveService = window.gameCore?.getService('saveService');
        const latest = saveService?.getLatestSlot?.();
        const cards = list.map((slot, i) => {
            const isEmpty = !slot;
            const statusText = isEmpty ? '空槽位' : '有存档';
            const statusColor = isEmpty ? '#4CAF50' : '#2196F3';
            const isLatest = latest && latest.index === i;
            
            if (isEmpty) {
                return `
                <div class="slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${statusColor};">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px;">
                                槽位 ${i + 1}
                                <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                            </div>
                            <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">推荐选择</div>
                        </div>
                        <div>
                            <button class="quick-action-button save-btn" data-slot="${i}" style="
                                background: ${statusColor};
                                border: none;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 600;
                            ">保存到此槽位</button>
                        </div>
                    </div>
                </div>`;
            }
            
            const dt = slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : '-';
            const subtitle = `Lv.${slot.summary.level || 1}｜${slot.summary.name || '冒险者'}｜${slot.summary.location || '-'}`;
            return `
            <div class="slot-card" style="background: #2a3142; border-radius: 8px; padding: 15px; margin: 8px 0; border: 2px solid ${statusColor};">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 5px;">
                            槽位 ${i + 1}
                            <span style="font-size: 12px; color: ${statusColor}; margin-left: 8px;">● ${statusText}</span>
                            ${isLatest ? '<span style="font-size: 12px; color: #ffd54f; margin-left: 6px;">最新</span>' : ''}
                        </div>
                        <div style="opacity: 0.85; font-size: 12px; margin-bottom: 3px;">${subtitle}</div>
                        <div style="opacity: 0.7; font-size: 11px;">更新时间: ${dt}</div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="quick-action-button load-btn" data-slot="${i}" style="
                            background: #4CAF50;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">加载</button>
                        <button class="quick-action-button save-btn" data-slot="${i}" style="
                            background: #2196F3;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">保存</button>
                        <button class="quick-action-button export-btn" data-slot="${i}" style="
                            background: #ff9800;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">导出</button>
                        <button class="quick-action-button delete-btn" data-slot="${i}" style="
                            background: #f44336;
                            border: none;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 12px;
                        ">删除</button>
                    </div>
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
            btn.addEventListener('click', async () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    const confirmed = await window.gameDialog.confirm({
                        title: '删除存档',
                        message: `确认删除槽位 ${slot + 1} 的存档？\n\n⚠️ 此操作无法撤销！`,
                        icon: '🗑️',
                        confirmText: '删除',
                        cancelText: '取消',
                        confirmType: 'danger'
                    });
                    
                    if (confirmed) {
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
    async returnToStartPage() {
        // 确认对话框
        const confirmed = await window.gameDialog.confirm({
            title: '返回开始界面',
            message: '确定要返回开始界面吗？\n\n💾 当前进度将会自动保存。',
            icon: '🏠',
            confirmText: '确认',
            cancelText: '取消',
            confirmType: 'primary'
        });
        
        if (confirmed) {
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

    // 显示新游戏存档位置选择对话框（委托到 SaveManagerView）
    showNewGameSlotSelection() {
        if (this.saveManagerView) {
            this.saveManagerView.showNewGameSlotSelection();
        }
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
            btn.addEventListener('click', async () => {
                const slot = parseInt(btn.getAttribute('data-slot'), 10);
                if (Number.isInteger(slot)) {
                    // 确认对话框
                    const saveService = window.gameCore?.getService('saveService');
                    const list = saveService?.listSaves?.() || [];
                    const hasExisting = list[slot] !== null;
                    
                    const confirmMsg = hasExisting ?
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？\n\n⚠️ 这将覆盖现有存档！` :
                        `确定要在槽位 ${slot + 1} 开始新游戏吗？`;
                    
                    const confirmed = await window.gameDialog.confirm({
                        title: '开始新游戏',
                        message: confirmMsg,
                        icon: hasExisting ? '⚠️' : '🌱',
                        confirmText: '开始',
                        cancelText: '取消',
                        confirmType: hasExisting ? 'warning' : 'success'
                    });
                    
                    if (confirmed) {
                        modal.remove();
                        this.startNewGameInSlot(slot);
                    }
                }
            });
        });
    }

    // 在指定槽位开始新游戏（委托到 SaveManagerView）
    startNewGameInSlot(slotIndex) {
        if (this.saveManagerView) {
            this.saveManagerView.startNewGameInSlot(slotIndex);
        }
    }

// 从存档恢复叙述区历史
restoreNarrativeFromHistory(data) {
    try {
        console.log('[GameView] 开始恢复叙述历史，当前已完成战斗和商人交易:', {
            completedBattles: Array.from(this.completedBattles || []),
            battleIdCounter: this.battleIdCounter,
            completedMerchantTrades: Array.from(this.completedMerchantTrades || []),
            merchantTradeIdCounter: this.merchantTradeIdCounter,
            dataReceived: data
        });
        
        const gs = window.gameCore?.getService('gameStateService');
        const history = gs?.getState()?.conversation?.history || [];
        const narrativeArea = document.getElementById('narrativeArea');
        if (!narrativeArea) return;
        // 按历史顺序为每个战斗准备消息和商人交易分配稳定ID
        let restoreAssignedId = 0;
        let restoreAssignedMerchantTradeId = 0;

        // 清空当前叙述区（移除欢迎提示），用存档历史重建
        narrativeArea.innerHTML = '';

        // 始终显示欢迎消息（无论是否有历史记录）
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'narrative-message intro';
        welcomeDiv.innerHTML = `🌟 欢迎回到地牢探险！

你重新回到了这个充满神秘与危险的地牢世界...

<em>存档已加载，继续你的冒险吧！</em>`;
        narrativeArea.appendChild(welcomeDiv);

        // 如果有历史记录，恢复它们
        if (history.length > 0) {
            history.forEach(entry => {
                let content = entry.content || '';
                let type = entry.type || (entry.role === 'user' ? 'player_action' : 'gm_narrative');
                
                // 修复玩家行动格式：确保有正确的 > 前缀
                if (type === 'player_action') {
                    // 移除时间戳和多余的前缀，重新格式化
                    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                    
                    for (const line of lines) {
                        // 跳过时间戳行（格式如 "01:20:10"）
                        if (line.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
                            continue;
                        }
                        
                        // 查找包含实际行动内容的行
                        let actionContent = line;
                        
                        // 如果行包含时间戳前缀，提取实际行动内容
                        const timestampMatch = line.match(/^\d{1,2}:\d{2}:\d{2}>\s*(.+)$/);
                        if (timestampMatch) {
                            actionContent = timestampMatch[1];
                        } else if (line.startsWith('> ')) {
                            actionContent = line.substring(2);
                        } else if (!line.startsWith('>')) {
                            // 如果不是以任何前缀开始，直接使用
                            actionContent = line;
                        }
                        
                        // 重新格式化为正确的玩家行动格式
                        content = `> ${actionContent}`;
                        break; // 找到第一个有效行动后就停止
                    }
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
                                this.restoreBattleReadyButton(entry.result, entry, ++restoreAssignedId);
                            }, 100);
                        }
                    }
                }
                
                // 如果是商人交易准备状态，需要修复内容和类型以匹配原始显示样式
                if (type === 'merchant_encounter' && entry.merchantTradeId) {
                    // 修复内容为原始显示的内容
                    content = '💰 商人正等待着你的回应...';
                    // 修复类型为function_result以匹配原始的CSS样式
                    type = 'function_result';
                    
                    // 延迟处理，确保消息已添加到DOM后再添加按钮
                    setTimeout(() => {
                        this.restoreMerchantTradeButton(entry, ++restoreAssignedMerchantTradeId);
                    }, 100);
                }

                this.addMessage({
                    content,
                    type,
                    timestamp: entry.timestamp || Date.now(),
                    skipHistory: true, // 避免重复写入历史
                    isRestoringFromSave: true // 标记为存档恢复，避免添加重新生成按钮
                });
            });
        }

        // 在历史恢复完成后，更新所有已完成战斗和商人交易的按钮状态
        // 确保计数器不小于已分配的ID数
        this.battleIdCounter = Math.max(this.battleIdCounter, restoreAssignedId);
        this.merchantTradeIdCounter = Math.max(this.merchantTradeIdCounter, restoreAssignedMerchantTradeId);
        setTimeout(() => {
            console.log('[GameView] 准备更新所有已完成战斗和商人交易按钮，当前状态:', {
                completedBattles: Array.from(this.completedBattles || []),
                battleIdCounter: this.battleIdCounter,
                completedMerchantTrades: Array.from(this.completedMerchantTrades || []),
                merchantTradeIdCounter: this.merchantTradeIdCounter
            });
            this.updateAllCompletedBattleButtons();
            this.updateAllCompletedMerchantTradeButtons();
            
            // 历史加载默认禁用所有“进入战斗”按钮，只有在存在准备中的战斗时保留最后一个可用
            try {
                const buttons = Array.from(document.querySelectorAll('.battle-start-button'));
                const hasPrepared = !!(data && data.hasPreparedBattle);
                console.log('[GameView] 历史加载按钮强制状态:', {
                    totalButtons: buttons.length,
                    hasPreparedBattle: hasPrepared
                });
                
                buttons.forEach((btn, idx) => {
                    const id = parseInt(btn.getAttribute('data-battle-id'));
                    const isCompleted = !isNaN(id) && this.completedBattles.has(id);
                    const isLast = idx === buttons.length - 1;
                    
                    // 规则：
                    // 1) 如果此ID在已完成集合中 -> 禁用
                    // 2) 如果没有准备中的战斗 -> 全部禁用
                    // 3) 如果存在准备中的战斗 -> 仅保留最后一个按钮可用，其余禁用
                    const shouldEnable = hasPrepared && isLast && !isCompleted;
                    
                    if (!shouldEnable) {
                        btn.disabled = true;
                        btn.textContent = '战斗已结束';
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                        btn.style.background = '#666';
                        const msg = btn.closest('.narrative-message');
                        if (msg) msg.classList.add('battle-completed');
                    } else {
                        btn.disabled = false;
                        btn.textContent = '进入战斗';
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        btn.style.background = '';
                    }
                    
                    console.log('[GameView] 历史按钮状态修正:', {
                        idx,
                        id,
                        isCompleted,
                        isLast,
                        enabled: !btn.disabled
                    });
                });
            } catch (e) {
                console.warn('[GameView] 历史按钮状态修正失败:', e);
            }
            
            // 额外的验证：确保UI状态确实已经恢复
            console.log('[GameView] 历史恢复完成后的最终状态验证:', {
                completedBattlesSize: this.completedBattles?.size || 0,
                completedBattlesList: Array.from(this.completedBattles || []),
                battleIdCounter: this.battleIdCounter,
                allBattleButtons: document.querySelectorAll('.battle-start-button').length,
                completedMerchantTradesSize: this.completedMerchantTrades?.size || 0,
                completedMerchantTradesList: Array.from(this.completedMerchantTrades || []),
                merchantTradeIdCounter: this.merchantTradeIdCounter,
                allMerchantTradeButtons: document.querySelectorAll('.merchant-trade-button').length
            });
        }, 200);

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
        
        // 在历史恢复完成后，为最后一个GM消息添加重新生成按钮
        setTimeout(() => {
            // 查找最后一个GM消息并添加重新生成按钮
            const gmMessages = narrativeArea.querySelectorAll('.narrative-message.gm_narrative, .narrative-message.gm_continuation, .narrative-message.gm_fallback');
            if (gmMessages.length > 0) {
                const lastGmMessage = gmMessages[gmMessages.length - 1];
                // 从最后一个GM消息获取消息数据
                const messageData = {
                    type: lastGmMessage.classList.contains('gm_narrative') ? 'gm_narrative' :
                          lastGmMessage.classList.contains('gm_continuation') ? 'gm_continuation' : 'gm_fallback',
                    content: lastGmMessage.textContent,
                    timestamp: lastGmMessage.getAttribute('data-ts') || Date.now()
                };
                
                this.addRegenerateButtonToLastGmMessage(messageData);
                console.log('[GameView] 已为存档恢复的最后GM消息添加重新生成按钮');
            }
        }, 100);

        // 更新调试面板的游戏状态
        setTimeout(() => {
            this.updateDebugGameState();
        }, 300);

    } catch (e) {
        console.warn('[UI] restoreNarrativeFromHistory error:', e);
    }
}

// 恢复战斗准备状态的"进入战斗"按钮
restoreBattleReadyButton(battleResult, historyEntry, forcedBattleId = null) {
    try {
        console.log('[GameView] 恢复战斗准备按钮:', {
            battleResult,
            historyEntry,
            currentCompletedBattles: Array.from(this.completedBattles || [])
        });
        
        // 优先通过时间戳精确定位消息
        let targetMessage = null;
        if (historyEntry && historyEntry.timestamp !== undefined) {
            targetMessage = document.querySelector(`.narrative-message.function_result[data-ts="${historyEntry.timestamp}"]`);
        }
        
        // 回退：按内容匹配最后一个
        if (!targetMessage) {
            const narrativeArea = document.getElementById('narrativeArea');
            const messages = narrativeArea.querySelectorAll('.narrative-message.function_result');
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.textContent.includes('start_battle') && msg.textContent.includes(battleResult.description)) {
                    targetMessage = msg;
                    break;
                }
            }
        }
        
        if (targetMessage) {
            // 检查是否已经有按钮（包含绑定标记避免重复）
            if (targetMessage.querySelector('.battle-start-button') || targetMessage.getAttribute('data-battle-btn-bound') === '1') {
                console.log('[GameView] 战斗按钮已存在，跳过恢复');
                return; // 已经有按钮了
            }
            
            // 尝试从历史条目或强制参数中获取战斗ID
            let battleId;
            if (typeof forcedBattleId === 'number') {
                battleId = forcedBattleId;
                console.log('[GameView] 使用强制指定的战斗ID:', battleId);
            } else if (historyEntry && historyEntry.battleId !== undefined) {
                battleId = historyEntry.battleId;
                console.log('[GameView] 使用历史记录中的战斗ID:', battleId);
            } else {
                console.log('[GameView] 缺少 battleId，跳过按钮恢复');
                return;
            }
            
            targetMessage.setAttribute('data-battle-id', battleId);
            // 绑定标记，避免重复恢复同一消息的按钮
            targetMessage.setAttribute('data-battle-btn-bound', '1');
            // 绑定标记，避免重复恢复
            targetMessage.setAttribute('data-battle-btn-bound', '1');
            
            // 添加进入战斗按钮
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.marginTop = '10px';
            const startBtn = document.createElement('button');
            startBtn.className = 'primary-button battle-start-button';
            startBtn.setAttribute('data-battle-id', battleId);
            
            // 检查战斗是否已完成
            const isCompleted = this.completedBattles.has(battleId);
            console.log('[GameView] 检查战斗完成状态:', {
                battleId,
                isCompleted,
                completedBattles: Array.from(this.completedBattles || [])
            });
            
            if (isCompleted) {
                startBtn.textContent = '战斗已结束';
                startBtn.disabled = true;
                startBtn.style.opacity = '0.5';
                startBtn.style.cursor = 'not-allowed';
                startBtn.style.background = '#666';
                targetMessage.classList.add('battle-completed');
                console.log('[GameView] 设置按钮为已完成状态');
            } else {
                startBtn.textContent = '进入战斗';
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
                startBtn.onclick = () => {
                    // 再次检查战斗是否已完成（防止竞态条件）
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
                console.log('[GameView] 设置按钮为可进入状态');
            }
            
            buttonWrapper.appendChild(startBtn);
            targetMessage.appendChild(buttonWrapper);
            
            console.log('[UI] 恢复了战斗准备按钮，ID:', battleId, '已完成:', isCompleted);
        }
    } catch (e) {
        console.warn('[UI] restoreBattleReadyButton error:', e);
    }
}

// 更新所有已完成战斗的按钮状态
updateAllCompletedBattleButtons() {
    try {
        const allBattleButtons = document.querySelectorAll('.battle-start-button');
        console.log('[GameView] 更新战斗按钮状态:', {
            totalButtons: allBattleButtons.length,
            completedBattles: Array.from(this.completedBattles || []),
            completedBattlesSize: this.completedBattles?.size || 0
        });
        
        allBattleButtons.forEach((button, index) => {
            const battleId = parseInt(button.getAttribute('data-battle-id'));
            const isCompleted = !isNaN(battleId) && this.completedBattles.has(battleId);
            console.log(`[GameView] 按钮 ${index}: ID=${battleId}, 已完成=${isCompleted}`);
            
            if (isCompleted) {
                this.updateBattleButtonState(battleId);
            }
        });
        console.log('[UI] 已更新所有已完成战斗的按钮状态');
    } catch (e) {
        console.warn('[UI] updateAllCompletedBattleButtons error:', e);
    }
}

// 恢复商人交易按钮（从存档恢复时使用）
restoreMerchantTradeButton(historyEntry, forcedMerchantTradeId = null) {
    try {
        console.log('[GameView] 恢复商人交易按钮:', {
            historyEntry,
            currentCompletedMerchantTrades: Array.from(this.completedMerchantTrades || [])
        });
        
        // 优先通过时间戳精确定位消息
        let targetMessage = null;
        if (historyEntry && historyEntry.timestamp !== undefined) {
            targetMessage = document.querySelector(`.narrative-message[data-ts="${historyEntry.timestamp}"]`);
        }
        
        // 回退：找最后一个 merchant_encounter 类型的消息
        if (!targetMessage) {
            const narrativeArea = document.getElementById('narrativeArea');
            const messages = narrativeArea.querySelectorAll('.narrative-message');
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.textContent.includes('商人正等待着你的回应')) {
                    targetMessage = msg;
                    break;
                }
            }
        }
        
        if (targetMessage) {
            // 检查是否已经有按钮
            if (targetMessage.querySelector('.merchant-trade-button') || targetMessage.getAttribute('data-merchant-trade-btn-bound') === '1') {
                console.log('[GameView] 商人交易按钮已存在，跳过恢复');
                return;
            }
            
            // 尝试从历史条目或强制参数中获取商人交易ID
            let merchantTradeId;
            if (typeof forcedMerchantTradeId === 'number') {
                merchantTradeId = forcedMerchantTradeId;
                console.log('[GameView] 使用强制指定的商人交易ID:', merchantTradeId);
            } else if (historyEntry && historyEntry.merchantTradeId !== undefined) {
                merchantTradeId = historyEntry.merchantTradeId;
                console.log('[GameView] 使用历史记录中的商人交易ID:', merchantTradeId);
            } else {
                console.log('[GameView] 缺少 merchantTradeId，跳过按钮恢复');
                return;
            }
            
            targetMessage.setAttribute('data-merchant-trade-id', merchantTradeId);
            targetMessage.setAttribute('data-merchant-trade-btn-bound', '1');
            
            // 添加与商人交易按钮
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.marginTop = '10px';
            const tradeBtn = document.createElement('button');
            tradeBtn.className = 'primary-button merchant-trade-button';
            tradeBtn.setAttribute('data-merchant-trade-id', merchantTradeId);
            
            // 检查交易是否已完成（在存档中已经完成的交易）
            const isCompleted = this.completedMerchantTrades.has(merchantTradeId);
            console.log('[GameView] 检查商人交易完成状态:', {
                merchantTradeId,
                isCompleted,
                completedMerchantTrades: Array.from(this.completedMerchantTrades || [])
            });
            
            if (isCompleted) {
                tradeBtn.textContent = '交易已结束';
                tradeBtn.disabled = true;
                tradeBtn.style.opacity = '0.5';
                tradeBtn.style.cursor = 'not-allowed';
                tradeBtn.style.background = '#666';
                targetMessage.classList.add('merchant-trade-completed');
                console.log('[GameView] 设置按钮为已完成状态');
            } else {
                tradeBtn.textContent = '与商人交易';
                tradeBtn.disabled = false;
                tradeBtn.style.opacity = '1';
                tradeBtn.style.cursor = 'pointer';
                tradeBtn.onclick = () => {
                    // 再次检查交易是否已完成（防止竞态条件）
                    if (this.completedMerchantTrades.has(merchantTradeId)) {
                        this.showNotification('交易已经结束了', 'warning');
                        return;
                    }
                    
                    // 点击进入商人界面
                    this.eventBus.emit('merchant:encounter', {}, 'game');
                    tradeBtn.disabled = true;
                    tradeBtn.textContent = '交易中...';
                    tradeBtn.style.opacity = '0.6';
                    tradeBtn.style.cursor = 'not-allowed';
                    
                    // 保存当前交易ID
                    this.currentMerchantTradeId = merchantTradeId;
                    
                    this.enableInput();
                    this.setStatus('ready', '就绪');
                };
                console.log('[GameView] 设置按钮为可交易状态');
            }
            
            buttonWrapper.appendChild(tradeBtn);
            targetMessage.appendChild(buttonWrapper);
            
            console.log('[UI] 恢复了商人交易按钮，ID:', merchantTradeId, '已完成:', isCompleted);
        }
    } catch (e) {
        console.warn('[UI] restoreMerchantTradeButton error:', e);
    }
}

// 更新所有已完成商人交易的按钮状态
updateAllCompletedMerchantTradeButtons() {
    try {
        const allMerchantButtons = document.querySelectorAll('.merchant-trade-button');
        console.log('[GameView] 更新商人交易按钮状态:', {
            totalButtons: allMerchantButtons.length,
            completedMerchantTrades: Array.from(this.completedMerchantTrades || []),
            completedMerchantTradesSize: this.completedMerchantTrades?.size || 0
        });
        
        allMerchantButtons.forEach((button, index) => {
            const merchantTradeId = parseInt(button.getAttribute('data-merchant-trade-id'));
            const isCompleted = !isNaN(merchantTradeId) && this.completedMerchantTrades.has(merchantTradeId);
            console.log(`[GameView] 商人交易按钮 ${index}: ID=${merchantTradeId}, 已完成=${isCompleted}`);
            
            if (isCompleted) {
                this.updateMerchantTradeButtonState(merchantTradeId);
            }
        });
        console.log('[UI] 已更新所有已完成商人交易的按钮状态');
    } catch (e) {
        console.warn('[UI] updateAllCompletedMerchantTradeButtons error:', e);
    }
}

    // 处理战斗完成事件
    handleBattleCompleted(battleResult) {
        console.log('[GameView] 战斗完成，更新按钮状态', {
            battleResult,
            currentCompletedBattles: Array.from(this.completedBattles || [])
        });
        
        // 获取当前战斗ID
        const battleService = window.gameCore?.getService('battleService');
        const battleId = battleService?.currentBattleId;
        
        console.log('[GameView] 当前战斗ID:', battleId);
        
        if (battleId) {
            // 标记战斗为已完成
            this.completedBattles.add(battleId);
            console.log('[GameView] 已将战斗ID添加到完成列表:', {
                battleId,
                newCompletedBattles: Array.from(this.completedBattles)
            });
            
            // 更新对应的战斗按钮状态
            this.updateBattleButtonState(battleId);
            
            // 清除战斗服务中的当前战斗ID
            if (battleService) {
                battleService.currentBattleId = null;
            }
        } else {
            console.warn('[GameView] 战斗完成但没有找到战斗ID');
        }
    }

    // 更新战斗按钮状态
    updateBattleButtonState(battleId) {
        const button = document.querySelector(`.battle-start-button[data-battle-id="${battleId}"]`);
        console.log(`[GameView] 尝试更新战斗按钮状态 ID: ${battleId}`, {
            buttonFound: !!button,
            buttonText: button?.textContent,
            buttonDisabled: button?.disabled
        });
        
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
        } else {
            console.warn(`[GameView] 未找到战斗按钮 ID: ${battleId}`);
        }
    }

// 全局提示（Portal）——避免被滚动容器裁剪
showGlobalTooltip(anchor, html) {
    try {
        // 创建或复用全局提示容器
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

        // 抑制原有槽位内的提示，避免重复显示
        const inline = anchor.querySelector('.item-tooltip');
        if (inline) {
            this._suppressedInlineTooltip = inline;
            inline.dataset._prevDisplay = inline.style.display || '';
            inline.style.display = 'none';
        }

        // 初始定位
        this.repositionGlobalTooltip();
        this.globalTooltipEl.style.opacity = '1';

        // 监听滚动与缩放，保持定位
        this._globalTooltipReposition = () => this.repositionGlobalTooltip();

        // 收集可能滚动的容器，确保滚动时重新定位
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
        console.warn('[UI] showGlobalTooltip error:', e);
    }
}

// 重新计算并定位全局提示
repositionGlobalTooltip() {
    try {
        if (!this.globalTooltipEl || !this.globalTooltipAnchor) return;

        const rect = this.globalTooltipAnchor.getBoundingClientRect();
        const margin = 8;

        // 渲染后获取提示尺寸
        const ttRect = this.globalTooltipEl.getBoundingClientRect();

        // 优先显示在上方
        let top = rect.top - ttRect.height - margin;
        let left = rect.left + rect.width / 2 - ttRect.width / 2;

        // 视口左右边界限制
        const clamp = (min, v, max) => Math.max(min, Math.min(v, max));
        left = clamp(10, left, window.innerWidth - ttRect.width - 10);

        // 如果上方空间不足，则显示在下方
        if (top < 10) {
            top = rect.bottom + margin;
        }
        // 如果下方也靠近底部，尽量不超出视口
        if (top + ttRect.height > window.innerHeight - 10) {
            top = window.innerHeight - ttRect.height - 10;
        }

        this.globalTooltipEl.style.left = `${Math.round(left)}px`;
        this.globalTooltipEl.style.top = `${Math.round(top)}px`;
    } catch (e) {
        console.warn('[UI] repositionGlobalTooltip error:', e);
    }
}

// 隐藏并清理全局提示
hideGlobalTooltip() {
    try {
        // 移除定位监听
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

        // 还原被抑制的内联提示
        if (this._suppressedInlineTooltip) {
            const inline = this._suppressedInlineTooltip;
            inline.style.display = inline.dataset._prevDisplay || '';
            delete inline.dataset._prevDisplay;
            this._suppressedInlineTooltip = null;
        }

        // 渐隐并移除
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
        console.warn('[UI] hideGlobalTooltip error:', e);
    }
}
    // 处理新游戏开始事件
    handleNewGameStarted(data) {
        console.log('[GameView] 新游戏开始，重置UI状态', {
            currentCompletedBattles: Array.from(this.completedBattles || []),
            currentBattleIdCounter: this.battleIdCounter,
            currentCompletedMerchantTrades: Array.from(this.completedMerchantTrades || []),
            currentMerchantTradeIdCounter: this.merchantTradeIdCounter,
            data
        });
        
        // 只有在明确是新游戏时才重置战斗和商人交易状态跟踪
        if (data && data.resetUI !== false) {
            console.log('[GameView] 重置战斗和商人交易状态跟踪');
            this.completedBattles.clear();
            this.battleIdCounter = 0;
            this.completedMerchantTrades.clear();
            this.merchantTradeIdCounter = 0;
        } else {
            console.log('[GameView] 跳过战斗和商人交易状态重置');
        }
        
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
            welcomeDiv.innerHTML = `🌟 欢迎来到地牢探险！

你站在古老地牢的入口前，黑暗的通道向前延伸，空气中弥漫着神秘的气息...

<em>提示：试试输入"向前探索"、"搜索房间"或"查看状态"来开始你的冒险！</em>`;
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

    // ========== 重新生成消息相关方法 ==========
    
    // 移除所有现有的重新生成按钮
    removeAllRegenerateButtons() {
        const existingButtons = document.querySelectorAll('.regenerate-button');
        existingButtons.forEach(button => {
            button.remove();
        });
    }
    
    // 为消息添加重新生成按钮
    addRegenerateButton(messageDiv, messageData) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'message-actions';
        buttonContainer.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        const regenerateButton = document.createElement('button');
        regenerateButton.className = 'regenerate-button';
        regenerateButton.innerHTML = '🔄';
        // regenerateButton.title = '重新生成这条消息'; // 移除title属性以避免悬浮提示
        regenerateButton.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        
        // 悬浮效果
        regenerateButton.addEventListener('mouseenter', () => {
            regenerateButton.style.background = 'rgba(255, 255, 255, 0.2)';
            regenerateButton.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            regenerateButton.style.transform = 'scale(1.1)';
        });
        
        regenerateButton.addEventListener('mouseleave', () => {
            regenerateButton.style.background = 'rgba(255, 255, 255, 0.1)';
            regenerateButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            regenerateButton.style.transform = 'scale(1)';
        });
        
        // 点击事件
        regenerateButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleRegenerateMessage(messageDiv, messageData);
        });
        
        buttonContainer.appendChild(regenerateButton);
        messageDiv.appendChild(buttonContainer);
        
        // 设置消息的悬浮显示按钮效果
        messageDiv.style.position = 'relative';
        messageDiv.addEventListener('mouseenter', () => {
            buttonContainer.style.opacity = '1';
        });
        messageDiv.addEventListener('mouseleave', () => {
            buttonContainer.style.opacity = '0';
        });
    }
    
    // 处理重新生成消息请求
    async handleRegenerateMessage(messageDiv, originalMessageData) {
        try {
            console.log('[GameView] 开始重新生成消息:', originalMessageData);
            
            // 如果当前输入被禁用，先重置状态（允许取消当前操作）
            if (this.isInputDisabled) {
                console.log('[GameView] 取消当前操作以进行重新生成');
                this.enableInput(); // 重置输入状态
                this.hideLoadingMessage(); // 隐藏可能存在的加载消息
                this.setStatus('ready', '就绪'); // 重置状态
            }
            
            // 记录原始消息类型，以便保持格式
            const originalMessageType = originalMessageData.type;
            const isFollowupMessage = originalMessageType === 'gm_continuation';
            
            // 禁用输入并显示状态
            this.disableInput();
            this.setStatus('processing', '正在重新生成消息...');
            
            // 获取必要的服务
            const gameController = window.gameCore?.getService('gameController');
            const gameStateService = window.gameCore?.getService('gameStateService');
            
            if (!gameController || !gameStateService) {
                throw new Error('必要的游戏服务不可用');
            }
            
            // 获取最后一次玩家行动
            const lastPlayerAction = this.getLastPlayerAction();
            if (!lastPlayerAction) {
                throw new Error('未找到最后一次玩家行动');
            }
            
            console.log('[GameView] 最后一次玩家行动:', lastPlayerAction);
            console.log('[GameView] 原始消息类型:', originalMessageType, '是否为后续消息:', isFollowupMessage);
            
            // 删除当前消息及之后的所有消息
            this.removeMessagesFromElement(messageDiv);
            
            // 从历史记录中移除对应的条目
            this.removeFromConversationHistory(originalMessageData);
            
            // 发送重新生成事件
            this.eventBus.emit('ui:regenerate:start', {
                originalMessage: originalMessageData,
                messageElement: messageDiv,
                isFollowupMessage: isFollowupMessage,
                originalType: originalMessageType
            }, 'game');
            
            // 根据消息类型选择重新生成策略
            if (isFollowupMessage) {
                // 对于后续消息，需要特殊处理以保持格式
                await this.regenerateFollowupMessage(lastPlayerAction, originalMessageType);
            } else {
                // 普通消息重新生成
                await gameController.handlePlayerAction({ action: lastPlayerAction });
            }
            
        } catch (error) {
            console.error('[GameView] 重新生成消息失败:', error);
            this.eventBus.emit('ui:regenerate:error', {
                error: error.message,
                originalMessage: originalMessageData
            }, 'game');
            this.enableInput();
            this.setStatus('error', '重新生成失败');
            this.showNotification('重新生成失败: ' + error.message, 'error');
        }
    }
    
    // 获取最后一次玩家行动
    getLastPlayerAction() {
        const narrativeArea = document.getElementById('narrativeArea');
        const playerMessages = narrativeArea.querySelectorAll('.narrative-message.player_action');
        
        if (playerMessages.length === 0) {
            console.warn('[GameView] 未找到玩家行动消息');
            return null;
        }
        
        const lastPlayerMessage = playerMessages[playerMessages.length - 1];
        const content = lastPlayerMessage.textContent.trim();
        
        console.log('[GameView] 原始玩家消息内容:', content);
        
        // 移除时间戳，查找包含 '>' 的行
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        for (const line of lines) {
            if (line.startsWith('> ')) {
                const action = line.substring(2).trim();
                console.log('[GameView] 解析出的玩家行动:', action);
                return action;
            }
        }
        
        // 如果没有找到以 '>' 开头的行，尝试查找最后一个非时间戳行
        const nonTimestampLines = lines.filter(line => !line.match(/^\d{1,2}:\d{2}:\d{2}$/));
        if (nonTimestampLines.length > 0) {
            const lastLine = nonTimestampLines[nonTimestampLines.length - 1];
            // 如果最后一行以 '>' 开头，移除它
            const action = lastLine.startsWith('> ') ? lastLine.substring(2).trim() : lastLine;
            console.log('[GameView] 从非时间戳行解析出的玩家行动:', action);
            return action;
        }
        
        console.warn('[GameView] 无法解析玩家行动内容');
        return null;
    }
    
    // 从指定元素开始删除所有后续消息
    removeMessagesFromElement(startElement) {
        let currentElement = startElement;
        const toRemove = [];
        
        // 收集要删除的元素
        while (currentElement) {
            toRemove.push(currentElement);
            currentElement = currentElement.nextElementSibling;
        }
        
        // 删除元素
        toRemove.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    // 从对话历史中移除对应的条目
    removeFromConversationHistory(messageData) {
        try {
            const gsService = window.gameCore?.getService('gameStateService');
            if (gsService && typeof gsService.removeConversationEntry === 'function') {
                gsService.removeConversationEntry(messageData);
            }
        } catch (e) {
            console.warn('[GameView] 移除历史记录失败:', e);
        }
    }
    
    // 重新生成后续消息（保持原有类型和格式）
    async regenerateFollowupMessage(lastPlayerAction, originalType) {
        try {
            // 查找最近的函数执行结果
            const lastFunctionResult = this.getLastFunctionResult();
            
            if (!lastFunctionResult) {
                console.warn('[GameView] 未找到函数执行结果，回退到普通重新生成');
                // 如果没找到函数结果，回退到普通重新生成
                const gameController = window.gameCore?.getService('gameController');
                await gameController.handlePlayerAction({ action: lastPlayerAction });
                return;
            }
            
            console.log('[GameView] 基于函数结果重新生成后续消息:', lastFunctionResult);
            
            // 直接基于已有的函数执行结果生成后续叙述
            this.generateFollowupWithFunctionResult(lastFunctionResult.functionName, lastFunctionResult.result, originalType);
            
        } catch (error) {
            console.error('[GameView] 后续消息重新生成失败:', error);
            throw error;
        }
    }
    
    // 获取最近的函数执行结果
    getLastFunctionResult() {
        try {
            const gameStateService = window.gameCore?.getService('gameStateService');
            const gameState = gameStateService?.getState();
            
            if (!gameState || !gameState.conversation || !gameState.conversation.history) {
                return null;
            }
            
            // 从历史记录中从后往前查找最近的函数执行结果
            const history = gameState.conversation.history;
            for (let i = history.length - 1; i >= 0; i--) {
                const entry = history[i];
                if (entry.type === 'function_result' && entry.result) {
                    console.log('[GameView] 找到函数执行结果:', entry);
                    return {
                        functionName: entry.content.replace('函数执行结果: ', ''),
                        result: entry.result
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.error('[GameView] 获取函数结果失败:', error);
            return null;
        }
    }
    
    // 基于函数结果生成后续消息
    async generateFollowupWithFunctionResult(functionName, functionResult, messageType) {
        try {
            const gameStateService = window.gameCore?.getService('gameStateService');
            const llmService = window.gameCore?.getService('llmService');
            
            if (!gameStateService || !llmService) {
                throw new Error('必要的服务不可用');
            }
            
            // 生成后续剧情的提示词
            const continuationPrompt = `
## 函数执行结果：
函数：${functionName}
结果：${JSON.stringify(functionResult, null, 2)}

请根据上述结果继续描述后续情节，不要再调用任何函数。

## 📝 必须遵循的输出格式：
你的回复必须包含两个部分，使用第二人称描述：

**第一部分 - 剧情描述**：
- 描述刚才函数执行的结果带来的剧情发展
- 包括战斗结果、发现物品、事件影响等
- 展现因果关系和戏剧性
- 例如战斗后："激战过后，你喘着粗气站在敌人的尸体旁。鲜血染红了地面，你的武器还在滴血。这时，一个黑袍人影从阴影中走出，她轻笑了一声，'真是莽撞啊，年轻的冒险者。'"

**第二部分 - 环境描述**：
- 纯粹描述当前的环境状态、氛围
- 不涉及具体行动，只聚焦感官细节
- 包括视觉、听觉、嗅觉等感受
- 例如战斗后环境："你环视四周，你的面前有一个石门，沉重石门看起来没法从这边打开。你的左边有一个窄小的通道，里面没有光亮，不知道到底通向何方"

记住：不要提及任何数值变化（HP、经验值、等级等），系统会自动处理和显示这些。`;

            console.log('[GameView] 开始基于函数结果生成后续消息');

            const response = await llmService.generateResponse(
                gameStateService.generateGamePrompt(),
                {
                    userInput: continuationPrompt
                }
            );

            if (response.success) {
                // 使用原始消息类型显示
                this.eventBus.emit('ui:display:narrative', {
                    content: response.result,
                    type: messageType // 保持原有类型
                }, 'game');
                console.log('[GameView] 后续消息重新生成完成，类型:', messageType);
            } else {
                throw new Error('LLM生成失败');
            }
            
        } catch (error) {
            console.error('[GameView] 生成后续消息失败:', error);
            // 显示后备消息
            this.eventBus.emit('ui:display:narrative', {
                content: '你的行动产生了一些影响，但具体细节模糊不清...',
                type: 'gm_fallback'
            }, 'game');
        }
    }

    // 处理重新生成开始事件
    handleRegenerateStart(data) {
        console.log('[GameView] 重新生成开始:', data);
        // 延迟显示加载消息，确保在LLM请求开始时显示
        setTimeout(() => {
            if (this.isInputDisabled) { // 只有在仍然处理中时才显示
                this.showLoadingMessage();
            }
        }, 100);
    }
    
    // 处理重新生成完成事件
    handleRegenerateComplete(data) {
        console.log('[GameView] 重新生成完成:', data);
        this.hideLoadingMessage();
    }
    
    // 处理重新生成错误事件
    handleRegenerateError(data) {
        console.log('[GameView] 重新生成错误:', data);
        this.hideLoadingMessage();
        this.enableInput();
        this.setStatus('error', '重新生成失败');
    }
    
    // 为最后一个GM消息添加重新生成按钮（存档恢复时使用）
    addRegenerateButtonToLastGmMessage(messageData) {
        try {
            const narrativeArea = document.getElementById('narrativeArea');
            const gmMessages = narrativeArea.querySelectorAll('.narrative-message.gm_narrative, .narrative-message.gm_continuation, .narrative-message.gm_fallback');
            
            if (gmMessages.length === 0) {
                console.log('[GameView] 没有找到GM消息');
                return;
            }
            
            // 找到最后一个GM消息
            const lastGmMessage = gmMessages[gmMessages.length - 1];
            
            // 检查是否已经有重新生成按钮
            if (lastGmMessage.querySelector('.regenerate-button')) {
                console.log('[GameView] 最后一个GM消息已经有重新生成按钮');
                return;
            }
            
            console.log('[GameView] 为存档恢复的最后GM消息添加重新生成按钮');
            
            // 移除所有现有的重新生成按钮
            this.removeAllRegenerateButtons();
            
            // 为最后一个GM消息添加重新生成按钮
            this.addRegenerateButton(lastGmMessage, messageData);
            
        } catch (error) {
            console.error('[GameView] 添加最后GM消息的重新生成按钮失败:', error);
        }
    }

    // ========== 货币系统相关方法 ==========
    
    /**
     * 更新货币显示
     */
    updateCurrencyDisplay(copperAmount) {
        const currencyEl = document.getElementById('playerCurrency');
        if (!currencyEl) return;

        const currencyService = window.gameCore?.getService('currencyService');
        const display = currencyService?.formatDisplay(copperAmount) || { gold: 0, silver: 0, copper: 0 };

        currencyEl.innerHTML = `${display.gold}金 ${display.silver}银 ${display.copper}铜`;
        currencyEl.style.color = '#ffd700';
    }

    // ========== 休息系统相关方法 ==========
    
    /**
     * 处理休息行动
     */
    handleRest() {
        // 检查输入是否被禁用
        if (this.isInputDisabled) {
            this.showNotification('请等待当前操作完成...', 'warning');
            return;
        }

        const gameStateService = window.gameCore?.getService('gameStateService');
        const gameState = gameStateService?.getState();
        const player = gameState?.player;
        
        if (!player) {
            this.showNotification('无法获取玩家状态', 'error');
            return;
        }

        // 检查休息CD：需要至少进行4轮行动才能再次休息
        const actionsSinceLastRest = gameState.actionsSinceLastRest || 0;
        if (actionsSinceLastRest < 4) {
            const remaining = 4 - actionsSinceLastRest;
            this.showNotification(`💤 你还不够累，再行动 ${remaining} 次后才能休息`, 'warning');
            return;
        }

        // 禁用输入
        this.disableInput();
        this.setStatus('processing', '休息中...');

        // 恢复属性
        const hpRestore = Math.floor(player.maxHp * 0.5);
        const spRestore = Math.floor(player.maxStamina * 0.75);
        const mpRestore = Math.floor(player.maxMana * 0.4);

        const newHp = Math.min(player.maxHp, player.hp + hpRestore);
        const newStamina = Math.min(player.maxStamina, player.stamina + spRestore);
        const newMana = Math.min(player.maxMana, player.mana + mpRestore);

        gameStateService.updatePlayerStats({
            hp: newHp,
            stamina: newStamina,
            mana: newMana
        });
        
        // 增加休息计数（使用已声明的 gameState）
        const restCount = gameState.restCount || 0;
        gameState.restCount = restCount + 1;

        // 显示休息开始消息（不显示恢复数值）
        this.addMessage({
            content: `你找了个相对安全的地方开始休息...`,
            type: 'rest_event',
            skipHistory: false  // 需要保存到历史记录
        });

        // 随机事件（第一次休息必定遇到商人）
        const isFirstRest = restCount === 0;
        const randomValue = Math.random();
        
        setTimeout(() => {
            if (isFirstRest) {
                // 第一次休息：必定遇到商人
                this.handleMerchantEncounter();
            } else if (randomValue < 0.4) {
                // 40% 概率：平安休息
                this.handlePeacefulRest();
            } else if (randomValue < 0.8) {
                // 40% 概率：遇到商人
                this.handleMerchantEncounter();
            } else {
                // 20% 概率：怪物偷袭
                this.handleMonsterAmbush();
            }
        }, 1000);
    }

    /**
     * 平安休息
     */
    handlePeacefulRest() {
        this.addMessage({
            content: '休息期间没有发生什么意外，你安全地恢复了体力。',
            type: 'rest_event',
            skipHistory: false  // 需要保存到历史记录
        });
        
        // 重置行动计数器
        const gsService = window.gameCore?.getService('gameStateService');
        const gs = gsService?.getState();
        if (gs) {
            gs.actionsSinceLastRest = 0;
        }
        
        this.enableInput();
        this.setStatus('ready', '就绪');
    }

    /**
     * 遇到商人
     */
    handleMerchantEncounter() {
        this.addMessage({
            content: '休息时，一位巡游商人恰好路过这里。\n\n"哟！旅行者，要不要看看我的货物？都是好东西！"',
            type: 'rest_event',
            skipHistory: false  // 需要保存到历史记录
        });

        // 重置行动计数器
        const gsService = window.gameCore?.getService('gameStateService');
        const gs = gsService?.getState();
        if (gs) {
            gs.actionsSinceLastRest = 0;
        }

        // 显示"与商人交易"按钮，类似战斗准备状态
        setTimeout(() => {
            this.showMerchantTradeButton();
        }, 500);
    }

    /**
     * 显示商人交易按钮
     */
    showMerchantTradeButton() {
        const narrativeArea = document.getElementById('narrativeArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'narrative-message function_result slide-up';

        // 生成唯一的商人交易ID
        const merchantTradeId = ++this.merchantTradeIdCounter;
        messageDiv.setAttribute('data-merchant-trade-id', merchantTradeId);

        // 时间戳
        const timestamp = new Date().toLocaleTimeString();
        const timeElement = document.createElement('div');
        timeElement.style.fontSize = '10px';
        timeElement.style.opacity = '0.6';
        timeElement.style.marginBottom = '5px';
        timeElement.textContent = timestamp;

        // 内容
        const contentElement = document.createElement('div');
        contentElement.textContent = '💰 商人正等待着你的回应...';

        // 交易按钮
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.marginTop = '10px';
        const tradeBtn = document.createElement('button');
        tradeBtn.className = 'primary-button merchant-trade-button';
        tradeBtn.textContent = '与商人交易';
        tradeBtn.disabled = false;
        tradeBtn.style.opacity = '1';
        tradeBtn.style.cursor = 'pointer';
        tradeBtn.setAttribute('data-merchant-trade-id', merchantTradeId);
        tradeBtn.onclick = () => {
            // 检查交易是否已完成
            if (this.completedMerchantTrades.has(merchantTradeId)) {
                this.showNotification('交易已经结束了', 'warning');
                return;
            }
            
            // 点击后进入商人界面
            this.eventBus.emit('merchant:encounter', {}, 'game');
            // 禁用按钮防止重复点击
            tradeBtn.disabled = true;
            tradeBtn.textContent = '交易中...';
            tradeBtn.style.opacity = '0.6';
            tradeBtn.style.cursor = 'not-allowed';
            
            // 保存当前交易ID到全局，供关闭时使用
            this.currentMerchantTradeId = merchantTradeId;
            
            // 启用输入
            this.enableInput();
            this.setStatus('ready', '就绪');
        };

        buttonWrapper.appendChild(tradeBtn);
        messageDiv.appendChild(timeElement);
        messageDiv.appendChild(contentElement);
        messageDiv.appendChild(buttonWrapper);

        narrativeArea.appendChild(messageDiv);
        narrativeArea.scrollTop = narrativeArea.scrollHeight;

        // 将商人交易ID保存到历史记录中，以便存档恢复时使用
        try {
            const gsService = window.gameCore?.getService('gameStateService');
            if (gsService && typeof gsService.addConversationEntry === 'function') {
                gsService.addConversationEntry({
                    role: 'system',
                    content: '商人交易准备',
                    type: 'merchant_encounter',
                    merchantTradeId: merchantTradeId // 保存商人交易ID
                });
                console.log('[GameView] 已保存商人交易ID到历史记录:', merchantTradeId);
            }
        } catch (e) {
            console.warn('[UI] 保存商人交易ID到历史记录失败:', e);
        }

        // 在等待期间禁止其他输入，但允许打开装备界面
        this.disableInputExceptInventory();
        this.setStatus('processing', '等待与商人交易...');
    }

    /**
     * 处理商人界面关闭
     */
    handleMerchantClosed() {
        console.log('[GameView] 商人界面关闭，更新按钮状态');
        
        // 获取当前交易ID
        const merchantTradeId = this.currentMerchantTradeId;
        
        if (merchantTradeId) {
            // 标记交易为已完成
            this.completedMerchantTrades.add(merchantTradeId);
            console.log('[GameView] 已将商人交易ID添加到完成列表:', {
                merchantTradeId,
                newCompletedTrades: Array.from(this.completedMerchantTrades)
            });
            
            // 更新对应的交易按钮状态
            this.updateMerchantTradeButtonState(merchantTradeId);
            
            // 清除当前交易ID
            this.currentMerchantTradeId = null;
        }
    }

    /**
     * 更新商人交易按钮状态
     */
    updateMerchantTradeButtonState(merchantTradeId) {
        const button = document.querySelector(`.merchant-trade-button[data-merchant-trade-id="${merchantTradeId}"]`);
        console.log(`[GameView] 尝试更新商人交易按钮状态 ID: ${merchantTradeId}`, {
            buttonFound: !!button,
            buttonText: button?.textContent,
            buttonDisabled: button?.disabled
        });
        
        if (button) {
            button.disabled = true;
            button.textContent = '交易已结束';
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.background = '#666';
            
            // 添加已完成的样式类
            const messageDiv = button.closest('.narrative-message');
            if (messageDiv) {
                messageDiv.classList.add('merchant-trade-completed');
            }
            
            console.log(`[GameView] 已禁用商人交易按钮 ID: ${merchantTradeId}`);
        } else {
            console.warn(`[GameView] 未找到商人交易按钮 ID: ${merchantTradeId}`);
        }
    }

    /**
     * 禁用输入但允许打开装备界面
     */
    disableInputExceptInventory() {
        console.log('[DEBUG] 禁用用户输入（装备界面除外）');
        this.isInputDisabled = true;
        
        const actionArea = document.querySelector('.action-area');
        const input = document.getElementById('actionInput');
        const mainActionButton = actionArea ? actionArea.querySelector('.primary-button') : null;
        const quickButtons = actionArea ? actionArea.querySelectorAll('.quick-action-button') : [];
        
        if (input) {
            input.disabled = true;
            input.placeholder = '请先与商人交易或等待...';
            input.style.opacity = '0.6';
        }
        
        if (mainActionButton) {
            mainActionButton.disabled = true;
            mainActionButton.style.opacity = '0.6';
            mainActionButton.style.cursor = 'not-allowed';
        }
        
        quickButtons.forEach(btn => {
            // 检查是否是装备按钮（inventory-button）
            const isInventoryBtn = btn.classList.contains('inventory-button');
            if (!isInventoryBtn) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            }
            // 装备按钮保持可用
        });

        // 保持商人交易按钮可用
        document.querySelectorAll('.merchant-trade-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }

    /**
     * 怪物偷袭
     */
    async handleMonsterAmbush() {
        this.addMessage({
            content: '你正要放松警惕时，突然听到了脚步声！\n\n一只怪物从阴影中扑了出来！',
            type: 'rest_event',
            skipHistory: false  // 需要保存到历史记录
        });

        // 重置行动计数器
        const gsService = window.gameCore?.getService('gameStateService');
        const gs = gsService?.getState();
        if (gs) {
            gs.actionsSinceLastRest = 0;
        }

        // 生成与玩家等级接近的怪物
        const player = gs?.player;
        const playerLevel = player?.level || 1;

        // 怪物等级在玩家等级 ±2 范围内
        const monsterLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);

        // 随机选择怪物种类
        const monsterSpecies = ['哥布林', '骷髅战士', '野狼', '强盗', '蜘蛛'][Math.floor(Math.random() * 5)];

        setTimeout(async () => {
            // 触发战斗 - 使用模板模式
            const functionCallService = window.gameCore?.getService('functionCallService');
            if (functionCallService) {
                const battleResult = await functionCallService.executeFunction({
                    name: 'start_battle',
                    arguments: {
                        encounter_type: 'template',  // 使用模板模式
                        enemies: [{
                            level: monsterLevel,
                            category: 'minion',  // 普通小怪
                            species: monsterSpecies,  // 怪物种类
                            count: 1  // 数量
                        }],
                        environment: '休息地点',
                        special_conditions: ['偷袭', '无法逃跑']
                    }
                });

                // 显示函数执行结果（包括进入战斗按钮）
                if (battleResult) {
                    this.eventBus.emit('ui:display:function:result', {
                        functionName: 'start_battle',
                        result: battleResult
                    }, 'game');
                }
            }
        }, 1000);
    }
}
 
export default GameView;
 
// 确保类在全局可用
window.GameView = GameView;