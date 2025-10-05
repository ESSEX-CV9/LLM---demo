// utils/SkillTreeInteraction.js - 技能树交互控制器
// 处理缩放、拖动、触摸等交互功能

class SkillTreeInteraction {
  constructor(container, canvas, options = {}) {
    this.container = container; // 容器元素
    this.canvas = canvas; // 画布元素
    
    // 变换状态
    this.scale = options.initialScale || 1;
    this.translateX = options.initialX || 0;
    this.translateY = options.initialY || 0;
    
    // 缩放限制
    this.minScale = options.minScale || 0.3;
    this.maxScale = options.maxScale || 3;
    this.zoomStep = options.zoomStep || 0.1;
    
    // 拖动状态
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lastTranslateX = 0;
    this.lastTranslateY = 0;
    
    // 触摸状态
    this.touches = {};
    this.lastTouchDistance = 0;
    
    // 回调函数
    this.onTransformChange = options.onTransformChange || null;
    
    // 初始化
    this.init();
  }
  
  init() {
    console.log('[SkillTreeInteraction] 初始化交互控制器');
    
    // 绑定所有交互事件
    this.bindZoom();
    this.bindDrag();
    this.bindTouch();
    this.bindResize();
    
    // 应用初始变换
    this.applyTransform();
  }
  
  /**
   * 绑定缩放事件（鼠标滚轮）
   */
  bindZoom() {
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // 计算缩放中心（鼠标位置）
      const rect = this.container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // 计算缩放前在画布上的坐标
      const canvasX = (mouseX - this.translateX) / this.scale;
      const canvasY = (mouseY - this.translateY) / this.scale;
      
      // 计算新缩放值
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = this.clampScale(this.scale * delta);
      
      // 如果缩放值没有变化（达到限制），直接返回
      if (newScale === this.scale) return;
      
      // 调整平移以保持鼠标位置不变
      this.translateX = mouseX - canvasX * newScale;
      this.translateY = mouseY - canvasY * newScale;
      this.scale = newScale;
      
      // 应用变换
      this.applyTransform();
      this.notifyChange();
    }, { passive: false });
  }
  
  /**
   * 绑定拖动事件（鼠标）
   */
  bindDrag() {
    // 鼠标按下（绑定到容器而不是画布）
    this.container.addEventListener('mousedown', (e) => {
      // 只响应左键
      if (e.button !== 0) return;
      
      // 如果点击在节点上，不触发拖动
      if (e.target.closest('.skill-tree-node')) return;
      
      // 如果点击在控制按钮上，不触发拖动
      if (e.target.closest('.tree-controls')) return;
      
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastTranslateX = this.translateX;
      this.lastTranslateY = this.translateY;
      
      this.container.style.cursor = 'grabbing';
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      
      this.translateX = this.lastTranslateX + dx;
      this.translateY = this.lastTranslateY + dy;
      
      this.applyTransform();
    });
    
    // 鼠标释放
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.style.cursor = '';
        this.canvas.style.cursor = 'grab';
        this.notifyChange();
      }
    });
  }
  
  /**
   * 绑定触摸事件（移动端）
   */
  bindTouch() {
    // 触摸开始
    this.container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      
      // 记录所有触摸点
      Array.from(e.touches).forEach(touch => {
        this.touches[touch.identifier] = {
          x: touch.clientX,
          y: touch.clientY
        };
      });
      
      // 双指缩放
      if (e.touches.length === 2) {
        this.lastTouchDistance = this.getTouchDistance(e.touches);
      }
    }, { passive: false });
    
    // 触摸移动
    this.container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      if (e.touches.length === 1) {
        // 单指拖动
        const touch = e.touches[0];
        const lastTouch = this.touches[touch.identifier];
        
        if (lastTouch) {
          const dx = touch.clientX - lastTouch.x;
          const dy = touch.clientY - lastTouch.y;
          
          this.translateX += dx;
          this.translateY += dy;
          this.applyTransform();
          
          this.touches[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY
          };
        }
      } else if (e.touches.length === 2) {
        // 双指缩放
        const distance = this.getTouchDistance(e.touches);
        const scaleFactor = distance / this.lastTouchDistance;
        
        // 计算缩放中心（两指中点）
        const rect = this.container.getBoundingClientRect();
        const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
        
        // 计算缩放前在画布上的坐标
        const canvasX = (centerX - this.translateX) / this.scale;
        const canvasY = (centerY - this.translateY) / this.scale;
        
        // 应用缩放
        const newScale = this.clampScale(this.scale * scaleFactor);
        
        // 调整平移
        this.translateX = centerX - canvasX * newScale;
        this.translateY = centerY - canvasY * newScale;
        this.scale = newScale;
        
        this.applyTransform();
        this.lastTouchDistance = distance;
      }
    }, { passive: false });
    
    // 触摸结束
    this.container.addEventListener('touchend', (e) => {
      Array.from(e.changedTouches).forEach(touch => {
        delete this.touches[touch.identifier];
      });
      
      if (e.touches.length < 2) {
        this.lastTouchDistance = 0;
      }
      
      if (e.touches.length === 0) {
        this.notifyChange();
      }
    });
  }
  
  /**
   * 绑定窗口大小变化事件
   */
  bindResize() {
    window.addEventListener('resize', () => {
      // 窗口大小变化时，可能需要调整视图
      this.notifyChange();
    });
  }
  
  /**
   * 缩放到指定比例（以容器中心为基准）
   * @param {Number} factor - 缩放因子
   */
  zoomToCenter(factor) {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 计算缩放前在画布上的坐标
    const canvasX = (centerX - this.translateX) / this.scale;
    const canvasY = (centerY - this.translateY) / this.scale;
    
    // 应用缩放
    const newScale = this.clampScale(this.scale * factor);
    
    // 调整平移
    this.translateX = centerX - canvasX * newScale;
    this.translateY = centerY - canvasY * newScale;
    this.scale = newScale;
    
    this.applyTransform(true);
    this.notifyChange();
  }
  
  /**
   * 放大
   */
  zoomIn() {
    this.zoomToCenter(1 + this.zoomStep);
  }
  
  /**
   * 缩小
   */
  zoomOut() {
    this.zoomToCenter(1 - this.zoomStep);
  }
  
  /**
   * 重置视图
   * @param {Boolean} animated - 是否使用动画
   */
  resetView(animated = true) {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    
    this.applyTransform(animated);
    this.notifyChange();
  }
  
  /**
   * 居中到指定节点
   * @param {Object} node - 节点对象 { x, y }
   * @param {Number} targetScale - 目标缩放比例
   * @param {Boolean} animated - 是否使用动画
   * @param {Object} offset - 可选偏移量 { x: 0, y: 0 }，正值向右/下偏移
   */
  centerOnNode(node, targetScale = 1.5, animated = true, offset = { x: 0, y: 0 }) {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 应用缩放
    this.scale = this.clampScale(targetScale);
    
    // 计算平移使节点居中，并附加偏移
    this.translateX = centerX - node.x * this.scale + (offset.x || 0);
    this.translateY = centerY - node.y * this.scale + (offset.y || 0);
    
    this.applyTransform(animated);
    this.notifyChange();
  }
  
  /**
   * 自适应画布大小
   * @param {Object} bounds - 边界 { minX, maxX, minY, maxY }
   * @param {Number} padding - 内边距
   * @param {Boolean} animated - 是否使用动画
   */
  fitToScreen(bounds, padding = 50, animated = true) {
    const rect = this.container.getBoundingClientRect();
    
    // 计算内容尺寸
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    // 计算适合的缩放比例
    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    this.scale = this.clampScale(Math.min(scaleX, scaleY));
    
    // 计算居中平移
    const contentCenterX = (bounds.minX + bounds.maxX) / 2;
    const contentCenterY = (bounds.minY + bounds.maxY) / 2;
    
    this.translateX = rect.width / 2 - contentCenterX * this.scale;
    this.translateY = rect.height / 2 - contentCenterY * this.scale;
    
    this.applyTransform(animated);
    this.notifyChange();
  }
  
  /**
   * 应用变换到画布
   * @param {Boolean} animated - 是否使用动画
   */
  applyTransform(animated = false) {
    if (animated) {
      this.canvas.style.transition = 'transform 0.3s ease-out';
    } else {
      this.canvas.style.transition = 'none';
    }
    
    // 重要：先缩放再平移，使计算公式 screen = scale * content + translate 生效
    // 这与 bindZoom/centerOnNode/fitToScreen 的数学推导一致，避免出现“右下角偏移”
    this.canvas.style.transform = `
      translate(${this.translateX}px, ${this.translateY}px)\n      scale(${this.scale})
    `;
    
    // 清除transition以便后续拖动流畅
    if (animated) {
      setTimeout(() => {
        this.canvas.style.transition = 'none';
      }, 300);
    }
  }
  
  /**
   * 限制缩放比例
   * @param {Number} scale - 缩放值
   * @returns {Number} 限制后的缩放值
   */
  clampScale(scale) {
    return Math.max(this.minScale, Math.min(this.maxScale, scale));
  }
  
  /**
   * 计算两个触摸点之间的距离
   * @param {TouchList} touches - 触摸点列表
   * @returns {Number} 距离
   */
  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 通知变换变化
   */
  notifyChange() {
    if (this.onTransformChange) {
      this.onTransformChange({
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY
      });
    }
  }
  
  /**
   * 获取当前变换状态
   * @returns {Object} { scale, translateX, translateY }
   */
  getTransform() {
    return {
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY
    };
  }
  
  /**
   * 设置变换状态
   * @param {Object} transform - { scale, translateX, translateY }
   * @param {Boolean} animated - 是否使用动画
   */
  setTransform(transform, animated = false) {
    if (transform.scale !== undefined) {
      this.scale = this.clampScale(transform.scale);
    }
    if (transform.translateX !== undefined) {
      this.translateX = transform.translateX;
    }
    if (transform.translateY !== undefined) {
      this.translateY = transform.translateY;
    }
    
    this.applyTransform(animated);
    this.notifyChange();
  }
  
  /**
   * 销毁交互控制器
   */
  destroy() {
    // 移除事件监听器（如果需要）
    console.log('[SkillTreeInteraction] 销毁交互控制器');
  }
}

export default SkillTreeInteraction;

// 全局可用（调试）
if (typeof window !== 'undefined') {
  window.SkillTreeInteraction = SkillTreeInteraction;
}