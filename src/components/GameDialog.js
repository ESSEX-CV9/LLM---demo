// components/GameDialog.js - 游戏内弹窗组件
class GameDialog {
    constructor() {
        this.currentDialog = null;
        this.addStyles();
    }

    // 添加弹窗样式
    addStyles() {
        if (document.getElementById('game-dialog-styles')) return;

        const style = document.createElement('style');
        style.id = 'game-dialog-styles';
        style.textContent = `
            .game-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20000;
                animation: dialogFadeIn 0.3s ease-out;
            }

            .game-dialog-content {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(255, 255, 255, 0.1);
                color: white;
                text-align: center;
                animation: dialogSlideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
            }

            .game-dialog-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 30% 20%, rgba(74, 144, 226, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, rgba(155, 89, 182, 0.1) 0%, transparent 50%);
                pointer-events: none;
            }

            .game-dialog-header {
                position: relative;
                z-index: 1;
                margin-bottom: 20px;
            }

            .game-dialog-icon {
                font-size: 3em;
                margin-bottom: 15px;
                display: block;
            }

            .game-dialog-title {
                font-size: 1.5em;
                font-weight: 600;
                margin: 0 0 10px 0;
                color: #ecf0f1;
            }

            .game-dialog-message {
                position: relative;
                z-index: 1;
                font-size: 1.1em;
                line-height: 1.6;
                margin-bottom: 30px;
                color: #bdc3c7;
            }

            .game-dialog-buttons {
                position: relative;
                z-index: 1;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .game-dialog-button {
                padding: 12px 25px;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 100px;
                position: relative;
                overflow: hidden;
            }

            .game-dialog-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }

            .game-dialog-button:hover::before {
                left: 100%;
            }

            .game-dialog-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }

            .game-dialog-button:active {
                transform: translateY(0);
            }

            .game-dialog-button.primary {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }

            .game-dialog-button.primary:hover {
                background: linear-gradient(135deg, #2980b9, #1f618d);
            }

            .game-dialog-button.success {
                background: linear-gradient(135deg, #27ae60, #229954);
                color: white;
            }

            .game-dialog-button.success:hover {
                background: linear-gradient(135deg, #229954, #1e8449);
            }

            .game-dialog-button.danger {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }

            .game-dialog-button.danger:hover {
                background: linear-gradient(135deg, #c0392b, #a93226);
            }

            .game-dialog-button.warning {
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
            }

            .game-dialog-button.warning:hover {
                background: linear-gradient(135deg, #e67e22, #d35400);
            }

            .game-dialog-button.secondary {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                color: white;
            }

            .game-dialog-button.secondary:hover {
                background: linear-gradient(135deg, #7f8c8d, #6c7b7d);
            }

            @keyframes dialogFadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes dialogSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes dialogFadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

            @keyframes dialogSlideOut {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
            }

            .game-dialog-overlay.closing {
                animation: dialogFadeOut 0.3s ease-out;
            }

            .game-dialog-overlay.closing .game-dialog-content {
                animation: dialogSlideOut 0.3s ease-out;
            }

            /* 响应式设计 */
            @media (max-width: 600px) {
                .game-dialog-content {
                    padding: 20px;
                    margin: 20px;
                }

                .game-dialog-buttons {
                    flex-direction: column;
                }

                .game-dialog-button {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 显示确认对话框
    confirm(options) {
        return new Promise((resolve) => {
            const {
                title = '确认操作',
                message = '您确定要执行此操作吗？',
                icon = '❓',
                confirmText = '确认',
                cancelText = '取消',
                confirmType = 'primary',
                cancelType = 'secondary'
            } = options;

            this.show({
                title,
                message,
                icon,
                buttons: [
                    {
                        text: cancelText,
                        type: cancelType,
                        action: () => {
                            this.close();
                            resolve(false);
                        }
                    },
                    {
                        text: confirmText,
                        type: confirmType,
                        action: () => {
                            this.close();
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    // 显示警告对话框
    alert(options) {
        return new Promise((resolve) => {
            const {
                title = '提示',
                message = '',
                icon = 'ℹ️',
                buttonText = '确定',
                buttonType = 'primary'
            } = options;

            this.show({
                title,
                message,
                icon,
                buttons: [
                    {
                        text: buttonText,
                        type: buttonType,
                        action: () => {
                            this.close();
                            resolve();
                        }
                    }
                ]
            });
        });
    }

    // 显示错误对话框
    error(options) {
        const {
            title = '错误',
            message = '',
            icon = '❌',
            buttonText = '确定',
            buttonType = 'danger'
        } = options;

        return this.alert({
            title,
            message,
            icon,
            buttonText,
            buttonType
        });
    }

    // 显示成功对话框
    success(options) {
        const {
            title = '成功',
            message = '',
            icon = '✅',
            buttonText = '确定',
            buttonType = 'success'
        } = options;

        return this.alert({
            title,
            message,
            icon,
            buttonText,
            buttonType
        });
    }

    // 显示警告对话框
    warning(options) {
        const {
            title = '警告',
            message = '',
            icon = '⚠️',
            buttonText = '确定',
            buttonType = 'warning'
        } = options;

        return this.alert({
            title,
            message,
            icon,
            buttonText,
            buttonType
        });
    }

    // 显示通用对话框
    show(options) {
        // 如果已有对话框，先关闭
        if (this.currentDialog) {
            this.close();
        }

        const {
            title = '对话框',
            message = '',
            icon = '',
            buttons = []
        } = options;

        // 创建对话框元素
        const overlay = document.createElement('div');
        overlay.className = 'game-dialog-overlay';
        
        overlay.innerHTML = `
            <div class="game-dialog-content">
                <div class="game-dialog-header">
                    ${icon ? `<div class="game-dialog-icon">${icon}</div>` : ''}
                    <h3 class="game-dialog-title">${title}</h3>
                </div>
                <div class="game-dialog-message">${message}</div>
                <div class="game-dialog-buttons">
                    ${buttons.map((button, index) => `
                        <button class="game-dialog-button ${button.type || 'primary'}" data-button-index="${index}">
                            ${button.text || '确定'}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // 添加按钮事件监听
        buttons.forEach((button, index) => {
            const buttonElement = overlay.querySelector(`[data-button-index="${index}"]`);
            if (buttonElement && button.action) {
                buttonElement.addEventListener('click', button.action);
            }
        });

        // 点击背景关闭（可选）
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                // 如果有取消按钮，触发取消操作
                const cancelButton = buttons.find(btn => btn.type === 'secondary' || btn.text === '取消');
                if (cancelButton && cancelButton.action) {
                    cancelButton.action();
                }
            }
        });

        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                const cancelButton = buttons.find(btn => btn.type === 'secondary' || btn.text === '取消');
                if (cancelButton && cancelButton.action) {
                    cancelButton.action();
                }
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // 添加到页面
        document.body.appendChild(overlay);
        this.currentDialog = overlay;

        // 聚焦到第一个按钮
        const firstButton = overlay.querySelector('.game-dialog-button');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }
    }

    // 关闭对话框
    close() {
        if (this.currentDialog) {
            const overlay = this.currentDialog;
            overlay.classList.add('closing');
            
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
            
            this.currentDialog = null;
        }
    }

    // 检查是否有对话框打开
    isOpen() {
        return !!this.currentDialog;
    }
}

// 创建全局实例
window.gameDialog = new GameDialog();

export default GameDialog;