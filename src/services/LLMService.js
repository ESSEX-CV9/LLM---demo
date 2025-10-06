// services/LLMService.js

class LLMService {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    async generateResponse(prompt, options = {}) {
        try {
            const defaultOptions = {
                components: {
                    list: [
                        'ALL_PREON',
                        {
                            role: 'system',
                            content: prompt,
                            position: 'BEFORE_PROMPT'
                        }
                    ]
                },
                api: {
                    inherit: true,
                    overrides: {
                        maxTokens: 6000
                    }
                },
                streaming: {
                    enabled: true,
                    onChunk: (chunk, acc) => {
                        this.eventBus.emit('llm:streaming', { chunk, accumulated: acc }, 'game');
                    }
                },
                debug: { enabled: true }
            };

            // 🔧 使用深度合并替代浅合并，避免嵌套对象被完全覆盖
            const mergedOptions = this.deepMerge(defaultOptions, options);
            
            this.eventBus.emit('llm:request:start', mergedOptions, 'game');
            
            const response = await window.callGenerate(mergedOptions);
            
            this.eventBus.emit('llm:response:complete', response, 'game');
            
            return response;
        } catch (error) {
            // 🔧 改进错误日志，帮助调试
            console.error('[LLMService] 生成失败，错误详情:');
            console.error('[LLMService] 错误对象:', error);
            console.error('[LLMService] 错误类型:', typeof error);
            console.error('[LLMService] 错误消息:', error?.message || String(error));
            console.error('[LLMService] 错误堆栈:', error?.stack);
            
            // 尝试序列化错误对象以获取更多信息
            if (typeof error === 'object' && error !== null) {
                try {
                    console.error('[LLMService] 错误JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                } catch (e) {
                    console.error('[LLMService] 无法序列化错误对象');
                }
            }
            
            this.eventBus.emit('llm:error', error, 'game');
            throw error;
        }
    }

    /**
     * 深度合并对象，保留嵌套对象中的所有属性
     * @param {Object} target - 目标对象（默认配置）
     * @param {Object} source - 源对象（传入的配置）
     * @returns {Object} - 合并后的对象
     */
    deepMerge(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        // 如果目标中没有这个键，直接赋值
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        // 如果目标中有这个键，递归合并
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    // 非对象类型直接覆盖
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        // 🔧 特殊处理：当 streaming.enabled=false 时，移除 onChunk 回调
        // 因为小白X插件在非流式模式下不需要（也不应该有）onChunk 回调
        if (output.streaming && output.streaming.enabled === false && output.streaming.onChunk) {
            console.log('[LLMService] 检测到非流式模式，移除 onChunk 回调');
            delete output.streaming.onChunk;
        }
        
        return output;
    }

    /**
     * 判断是否为普通对象（非数组、非null）
     * @param {*} item - 要判断的项
     * @returns {boolean}
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
}

// 每个服务类都需要添加：
export default LLMService;