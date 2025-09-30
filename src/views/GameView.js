// views/GameView.js
class GameView {
    constructor(eventBus) {
        this.eventBus = eventBus;
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
        const input = document.getElementById('actionInput');
        const action = input.value.trim();
        
        if (!action) {
            this.showNotification('请输入行动内容！', 'warning');
            return;
        }
        
        this.displayPlayerAction(action);
        input.value = '';
        input.focus();
        
        this.setStatus('processing', '正在处理行动...');
        this.eventBus.emit('ui:player:action', { action }, 'game');
    }

    quickAction(action) {
        this.displayPlayerAction(action);
        this.setStatus('processing', '正在处理行动...');
        this.eventBus.emit('ui:player:action', { action }, 'game');
    }

    displayPlayerAction(action) {
        this.addMessage({
            content: `> ${action}`,
            type: 'player_action'
        });
    }

    displayNarrative(data) {
        this.addMessage(data);
        this.setStatus('ready', '就绪');
    }

    displayFunctionResult(data) {
        this.addMessage({
            content: `⚔️ 【${data.functionName}】${data.result.description}`,
            type: 'function_result'
        });
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
        document.getElementById('playerLevel').textContent = playerData.level;
        document.getElementById('playerHp').textContent = playerData.hp;
        document.getElementById('playerMaxHp').textContent = playerData.maxHp;
        document.getElementById('playerExp').textContent = playerData.experience;
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
}

export default GameView;

// 确保类在全局可用
window.GameView = GameView;