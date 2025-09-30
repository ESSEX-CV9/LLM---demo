// views/StartView.js - 独立的开始页面视图
class StartView {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.container = null;
        this._newGameInProgress = false; // 标记新游戏流程是否正在进行
        this._setupNewGameEventListeners(); // 设置事件监听
    }

    // 显示开始页面
    show() {
        this.createStartPage();
        this.setupEventListeners();
    }

    // 隐藏开始页面
    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }

    // 创建开始页面HTML结构
    createStartPage() {
        // 如果已存在则先移除
        this.hide();

        // 创建开始页面容器
        this.container = document.createElement('div');
        this.container.id = 'start-page';
        this.container.className = 'start-page';
        
        // 检查是否有存档
        const saveService = window.gameCore?.getService('saveService');
        const latest = saveService?.getLatestSlot?.() || null;
        const hasSaves = !!latest;
        
        // 构建页面HTML
        this.container.innerHTML = `
            <div class="start-page-background">
                <div class="start-page-content">
                    <div class="game-title">
                        <h1>🏰 地牢探险</h1>
                        <p class="game-subtitle">LLM 驱动 RPG Demo</p>
                        <div class="title-decoration">⚔️ 🛡️ 🏺 ⚔️</div>
                    </div>
                    
                    ${hasSaves ? `
                        <div class="latest-save-info">
                            <h3>📁 最近存档</h3>
                            <div class="save-details">
                                <p><strong>时间：</strong>${new Date(latest.meta.updatedAt).toLocaleString()}</p>
                                <p><strong>标签：</strong>${latest.meta.label || '存档'}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="start-menu">
                        <button id="newGameBtn" class="start-menu-button new-game">
                            <span class="button-icon">🌱</span>
                            <span class="button-text">开始新游戏</span>
                            <span class="button-desc">开始全新的冒险</span>
                        </button>
                        
                        <button id="continueGameBtn" class="start-menu-button continue-game" ${!hasSaves ? 'disabled' : ''}>
                            <span class="button-icon">▶️</span>
                            <span class="button-text">继续游戏</span>
                            <span class="button-desc">${hasSaves ? '从最新存档继续' : '没有可用存档'}</span>
                        </button>
                        
                        <button id="loadGameBtn" class="start-menu-button load-game">
                            <span class="button-icon">📂</span>
                            <span class="button-text">加载存档</span>
                            <span class="button-desc">选择特定存档加载</span>
                        </button>
                    </div>
                    
                    <div class="start-footer">
                        <div class="import-section">
                            <a id="importSaveLink" href="javascript:void(0)" class="import-link">
                                📥 从文件导入存档
                            </a>
                        </div>
                        <div class="version-info">
                            <p>Version 1.0 | 基于AI驱动的角色扮演游戏</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        this.addStyles();
        
        // 添加到页面
        document.body.appendChild(this.container);
    }

    // 添加CSS样式
    addStyles() {
        if (document.getElementById('start-page-styles')) return;

        const style = document.createElement('style');
        style.id = 'start-page-styles';
        style.textContent = `
            .start-page {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .start-page-background {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
                background-size: 400% 400%;
                animation: gradientShift 8s ease infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .start-page-background::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
                pointer-events: none;
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            .start-page-content {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
                max-width: 500px;
                width: 90%;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: slideInUp 0.8s ease-out;
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .game-title h1 {
                font-size: 2.5em;
                margin: 0 0 10px 0;
                color: #2c3e50;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }

            .game-subtitle {
                font-size: 1.1em;
                color: #7f8c8d;
                margin: 0 0 15px 0;
            }

            .title-decoration {
                font-size: 1.5em;
                margin-bottom: 30px;
                opacity: 0.8;
            }

            .latest-save-info {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 25px;
                border-left: 4px solid #3498db;
            }

            .latest-save-info h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
                font-size: 1.1em;
            }

            .save-details p {
                margin: 5px 0;
                color: #5a6c7d;
                font-size: 0.9em;
            }

            .start-menu {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }

            .start-menu-button {
                background: linear-gradient(135deg, #3498db, #2980b9);
                border: none;
                border-radius: 12px;
                padding: 18px 25px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                text-align: left;
                box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                position: relative;
                overflow: hidden;
            }

            .start-menu-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }

            .start-menu-button:hover::before {
                left: 100%;
            }

            .start-menu-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
            }

            .start-menu-button:active {
                transform: translateY(0);
            }

            .start-menu-button.new-game {
                background: linear-gradient(135deg, #27ae60, #229954);
                box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            }

            .start-menu-button.new-game:hover {
                box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
            }

            .start-menu-button.load-game {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
            }

            .start-menu-button.load-game:hover {
                box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
            }

            .start-menu-button:disabled {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                cursor: not-allowed;
                box-shadow: 0 2px 8px rgba(149, 165, 166, 0.3);
            }

            .start-menu-button:disabled:hover {
                transform: none;
                box-shadow: 0 2px 8px rgba(149, 165, 166, 0.3);
            }

            .button-icon {
                font-size: 1.8em;
                margin-right: 15px;
                min-width: 40px;
            }

            .button-text {
                font-size: 1.2em;
                font-weight: 600;
                margin-bottom: 2px;
                flex: 1;
            }

            .button-desc {
                font-size: 0.9em;
                opacity: 0.9;
                margin-left: auto;
                text-align: right;
                max-width: 150px;
            }

            .start-footer {
                border-top: 1px solid #ecf0f1;
                padding-top: 20px;
                margin-top: 20px;
            }

            .import-section {
                margin-bottom: 15px;
            }

            .import-link {
                color: #3498db;
                text-decoration: none;
                font-size: 0.95em;
                transition: color 0.3s ease;
            }

            .import-link:hover {
                color: #2980b9;
                text-decoration: underline;
            }

            .version-info p {
                margin: 0;
                color: #95a5a6;
                font-size: 0.85em;
            }

            @media (max-width: 600px) {
                .start-page-content {
                    padding: 30px 20px;
                    margin: 20px;
                }

                .game-title h1 {
                    font-size: 2em;
                }

                .start-menu-button {
                    flex-direction: column;
                    text-align: center;
                    padding: 15px 20px;
                }

                .button-desc {
                    text-align: center;
                    max-width: none;
                    margin-left: 0;
                    margin-top: 5px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 设置事件监听器
    setupEventListeners() {
        const newGameBtn = this.container.querySelector('#newGameBtn');
        const continueGameBtn = this.container.querySelector('#continueGameBtn');
        const loadGameBtn = this.container.querySelector('#loadGameBtn');
        const importSaveLink = this.container.querySelector('#importSaveLink');

        // 开始新游戏
        newGameBtn.addEventListener('click', () => {
            this.startNewGame();
        });

        // 继续游戏
        continueGameBtn.addEventListener('click', () => {
            if (!continueGameBtn.disabled) {
                this.continueGame();
            }
        });

        // 加载存档
        loadGameBtn.addEventListener('click', () => {
            this.showLoadGameDialog();
        });

        // 导入存档
        importSaveLink.addEventListener('click', () => {
            this.importSaveFile();
        });
    }

    // 开始新游戏
    startNewGame() {
        // 标记新游戏流程开始，避免误判
        this._newGameInProgress = true;
        
        // 隐藏开始页面
        this.hide();
        
        // 显示存档位置选择对话框
        const gameView = window.gameCore?.getService('gameView');
        if (gameView && typeof gameView.showNewGameSlotSelection === 'function') {
            // 设置取消回调，让用户可以返回开始界面
            const originalShowNewGameSlotSelection = gameView.showNewGameSlotSelection.bind(gameView);
            gameView.showNewGameSlotSelection = () => {
                originalShowNewGameSlotSelection();
                
                // 监听模态框关闭事件，如果用户取消则重新显示开始界面
                const checkModalClosed = () => {
                    const modal = document.querySelector('.new-game-slot-modal');
                    if (!modal) {
                        // 模态框已关闭，检查是否开始了游戏
                        setTimeout(() => {
                            const stillHasModal = document.querySelector('.new-game-slot-modal');
                            const hasStartPage = document.querySelector('.start-page') || document.querySelector('#fallback-start');
                            const gameStarted = this._checkGameStarted();
                            
                            if (!stillHasModal && !hasStartPage && !gameStarted && this._newGameInProgress) {
                                // 没有模态框、没有开始页面、游戏未开始，且新游戏流程仍在进行中，说明用户取消了
                                this._newGameInProgress = false;
                                this.show();
                            }
                        }, 100);
                        return;
                    }
                    // 继续检查
                    setTimeout(checkModalClosed, 100);
                };
                setTimeout(checkModalClosed, 100);
            };
            gameView.showNewGameSlotSelection();
            // 恢复原始方法
            gameView.showNewGameSlotSelection = originalShowNewGameSlotSelection;
        } else {
            // 降级处理：直接开始新游戏（保持原有逻辑）
            const saveService = window.gameCore?.getService('saveService');
            if (saveService) {
                saveService.startNewGame();
            }
            this._newGameInProgress = false;
            this.eventBus.emit('start:new-game', {}, 'game');
        }
    }

    // 继续游戏
    continueGame() {
        const saveService = window.gameCore?.getService('saveService');
        if (saveService) {
            const latest = saveService.getLatestSlot();
            if (latest) {
                saveService.loadFromSlot(latest.index);
            }
        }
        this.hide();
        this.eventBus.emit('start:continue-game', {}, 'game');
    }

    // 显示加载游戏对话框
    showLoadGameDialog() {
        // 隐藏开始页面，显示存档管理器
        this.hide();
        const gameView = window.gameCore?.getService('gameView');
        if (gameView && typeof gameView.openSaveManager === 'function') {
            gameView.openSaveManager('load');
        }
    }

    // 导入存档文件
    importSaveFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const saveService = window.gameCore?.getService('saveService');
                    const result = saveService.importToSlot(text);
                    
                    if (result.success) {
                        // 导入成功，自动加载
                        saveService.loadFromSlot(result.slot);
                        this.hide();
                        this.eventBus.emit('start:import-success', { slot: result.slot }, 'game');
                    } else {
                        await window.gameDialog.error({
                            title: '导入失败',
                            message: `存档导入失败：\n\n${result.error || '未知错误'}`,
                            icon: '❌'
                        });
                    }
                } catch (error) {
                    await window.gameDialog.error({
                        title: '文件读取失败',
                        message: `无法读取存档文件：\n\n${error.message}`,
                        icon: '📄'
                    });
                }
            }
            document.body.removeChild(input);
        });
        
        input.click();
    }

    // 检查游戏是否已开始（通过检查游戏界面是否显示）
    _checkGameStarted() {
        try {
            // 检查游戏主界面是否存在且可见
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && !gameContainer.classList.contains('hidden')) {
                return true;
            }
            
            // 检查是否有活跃的游戏状态
            const gameStateService = window.gameCore?.getService('gameStateService');
            if (gameStateService) {
                const state = gameStateService.getState();
                // 如果玩家已经有了非默认状态，说明游戏已开始
                if (state.player && (state.player.level > 1 || state.player.experience > 0)) {
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            return false;
        }
    }

    // 监听新游戏成功开始事件
    _setupNewGameEventListeners() {
        // 监听新游戏开始事件
        this.eventBus.on('start:new-game', () => {
            this._newGameInProgress = false;
        }, 'game');
        
        // 监听存档加载事件
        this.eventBus.on('save:loaded', () => {
            this._newGameInProgress = false;
        }, 'game');
        
        // 监听新游戏取消事件
        this.eventBus.on('start:new-game:cancelled', () => {
            this._newGameInProgress = false;
        }, 'game');
    }

    // 刷新页面（当存档状态改变时）
    refresh() {
        if (this.container) {
            this.show();
        }
    }
}

export default StartView;

// 确保类在全局可用
window.StartView = StartView;