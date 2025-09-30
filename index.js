// index.js
import EventBus from './src/core/EventBus.js';
import ServiceLocator from './src/core/ServiceLocator.js';
import GameState from './src/models/GameState.js';
import LLMService from './src/services/LLMService.js';
import FunctionCallService from './src/services/FunctionCallService.js';
import GameStateService from './src/services/GameStateService.js';
import GameController from './src/controllers/GameController.js';
import GameView from './src/views/GameView.js';
import GameCore from './src/core/GameCore.js';

(async () => {
    try {
        if (typeof window.callGenerate !== 'function') {
            throw new Error('callGenerate function not available...');
        }
        
        console.log('LLM Game Demo starting...');
        
        const gameCore = new GameCore();
        // 提前暴露到全局，避免 core:initialized 事件触发时 window.gameCore 为空导致开始覆盖层无法访问存档服务
        window.gameCore = gameCore;
        await gameCore.initialize();
        
        console.log('Game ready!');
        
    } catch (error) {
        console.error('Failed to start game:', error);
        // 错误处理
    }
})();