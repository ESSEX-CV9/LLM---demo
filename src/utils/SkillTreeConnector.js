// utils/SkillTreeConnector.js - 技能树SVG连接线绘制器
// 使用SVG绘制节点之间的连接线

class SkillTreeConnector {
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    
    // 样式配置
    this.strokeWidth = options.strokeWidth || 2;
    this.curveStyle = options.curveStyle || 'bezier'; // 'bezier' | 'straight' | 'step'
    this.arrowSize = options.arrowSize || 6;
    this.showArrows = options.showArrows !== false;
    
    // 颜色配置
    this.colors = {
      locked: options.lockedColor || '#666',
      learnable: options.learnableColor || '#4CAF50',
      owned: options.ownedColor || '#2196F3',
      equipped: options.equippedColor || '#FFD700',
      default: options.defaultColor || '#666'
    };
    
    // 创建箭头定义（如果需要）
    if (this.showArrows) {
      this.createArrowMarkers();
    }
  }
  
  /**
   * 创建箭头标记
   */
  createArrowMarkers() {
    // 创建defs元素
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.svg.appendChild(defs);
    }
    
    // 为每种状态创建箭头
    Object.entries(this.colors).forEach(([state, color]) => {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', `arrow-${state}`);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '5');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', this.arrowSize);
      marker.setAttribute('markerHeight', this.arrowSize);
      marker.setAttribute('orient', 'auto');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      path.setAttribute('fill', color);
      
      marker.appendChild(path);
      defs.appendChild(marker);
    });
  }
  
  /**
   * 绘制所有连接线
   * @param {Array} nodes - 节点数组
   */
  drawConnections(nodes) {
    console.log(`[SkillTreeConnector] 绘制 ${nodes.length} 个节点的连接线`);
    
    // 清空现有连接线
    this.clear();
    
    // 创建节点映射
    const nodeMap = new Map();
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // 绘制每个节点到其父节点的连接
    nodes.forEach(node => {
      if (node.parent && !node.parent.isVirtual) {
        this.drawConnection(node.parent, node);
      }
      
      // 也可以根据前置条件绘制
      const prerequisites = this.getPrerequisites(node);
      prerequisites.forEach(prereqId => {
        const parentNode = nodeMap.get(prereqId);
        if (parentNode && parentNode !== node.parent) {
          // 绘制额外的前置关系连接（虚线）
          this.drawConnection(parentNode, node, true);
        }
      });
    });
    
    console.log('[SkillTreeConnector] 连接线绘制完成');
  }
  
  /**
   * 绘制单条连接线
   * @param {Object} parent - 父节点
   * @param {Object} child - 子节点
   * @param {Boolean} isDashed - 是否使用虚线
   */
  drawConnection(parent, child, isDashed = false) {
    // 计算起点和终点
    const startX = parent.x;
    const startY = parent.y + 50; // 父节点底部
    const endX = child.x;
    const endY = child.y - 50; // 子节点顶部
    
    // 创建路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // 根据样式生成路径数据
    let pathData;
    switch (this.curveStyle) {
      case 'bezier':
        pathData = this.createBezierPath(startX, startY, endX, endY);
        break;
      case 'step':
        pathData = this.createStepPath(startX, startY, endX, endY);
        break;
      case 'straight':
      default:
        pathData = this.createStraightPath(startX, startY, endX, endY);
    }
    
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.getConnectionColor(child));
    path.setAttribute('stroke-width', this.strokeWidth);
    path.setAttribute('stroke-linecap', 'round');
    
    // 虚线样式
    if (isDashed || child.data?.state === 'locked') {
      path.setAttribute('stroke-dasharray', '5,5');
      path.setAttribute('opacity', '0.5');
    }
    
    // 添加箭头
    if (this.showArrows) {
      const state = child.data?.state || 'default';
      path.setAttribute('marker-end', `url(#arrow-${state})`);
    }
    
    // 添加数据属性
    path.setAttribute('data-parent', parent.id);
    path.setAttribute('data-child', child.id);
    
    // 添加类名用于样式控制
    path.classList.add('skill-connection');
    if (child.data?.state) {
      path.classList.add(`connection-${child.data.state}`);
    }
    
    this.svg.appendChild(path);
  }
  
  /**
   * 创建贝塞尔曲线路径
   * @param {Number} x1 - 起点X
   * @param {Number} y1 - 起点Y
   * @param {Number} x2 - 终点X
   * @param {Number} y2 - 终点Y
   * @returns {String} SVG路径数据
   */
  createBezierPath(x1, y1, x2, y2) {
    // 控制点在中间高度
    const controlY = (y1 + y2) / 2;
    
    return `
      M ${x1} ${y1}
      C ${x1} ${controlY},
        ${x2} ${controlY},
        ${x2} ${y2}
    `;
  }
  
  /**
   * 创建直线路径
   * @param {Number} x1 - 起点X
   * @param {Number} y1 - 起点Y
   * @param {Number} x2 - 终点X
   * @param {Number} y2 - 终点Y
   * @returns {String} SVG路径数据
   */
  createStraightPath(x1, y1, x2, y2) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  
  /**
   * 创建阶梯路径（直角）
   * @param {Number} x1 - 起点X
   * @param {Number} y1 - 起点Y
   * @param {Number} x2 - 终点X
   * @param {Number} y2 - 终点Y
   * @returns {String} SVG路径数据
   */
  createStepPath(x1, y1, x2, y2) {
    const midY = (y1 + y2) / 2;
    
    return `
      M ${x1} ${y1}
      L ${x1} ${midY}
      L ${x2} ${midY}
      L ${x2} ${y2}
    `;
  }
  
  /**
   * 获取连接线颜色
   * @param {Object} node - 节点
   * @returns {String} 颜色值
   */
  getConnectionColor(node) {
    const state = node.data?.state || 'default';
    return this.colors[state] || this.colors.default;
  }
  
  /**
   * 获取节点的前置条件ID列表
   * @param {Object} node - 节点
   * @returns {Array} 前置ID数组
   */
  getPrerequisites(node) {
    const prerequisites = [];
    if (node.data?.requirements?.requires) {
      node.data.requirements.requires.forEach(req => {
        prerequisites.push(req.id);
      });
    }
    return prerequisites;
  }
  
  /**
   * 高亮特定连接
   * @param {String} parentId - 父节点ID
   * @param {String} childId - 子节点ID
   */
  highlightConnection(parentId, childId) {
    const path = this.svg.querySelector(
      `path[data-parent="${parentId}"][data-child="${childId}"]`
    );
    
    if (path) {
      path.classList.add('highlighted');
      path.setAttribute('stroke-width', this.strokeWidth * 2);
    }
  }
  
  /**
   * 取消高亮所有连接
   */
  clearHighlights() {
    this.svg.querySelectorAll('path.highlighted').forEach(path => {
      path.classList.remove('highlighted');
      path.setAttribute('stroke-width', this.strokeWidth);
    });
  }
  
  /**
   * 高亮到指定节点的所有路径
   * @param {String} nodeId - 节点ID
   * @param {Array} nodes - 所有节点
   */
  highlightPathTo(nodeId, nodes) {
    this.clearHighlights();
    
    const nodeMap = new Map();
    nodes.forEach(node => nodeMap.set(node.id, node));
    
    const visited = new Set();
    const highlightRecursive = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const node = nodeMap.get(id);
      if (!node) return;
      
      // 高亮到父节点的连接
      if (node.parent && !node.parent.isVirtual) {
        this.highlightConnection(node.parent.id, id);
        highlightRecursive(node.parent.id);
      }
      
      // 高亮所有前置技能的连接
      const prerequisites = this.getPrerequisites(node);
      prerequisites.forEach(prereqId => {
        this.highlightConnection(prereqId, id);
        highlightRecursive(prereqId);
      });
    };
    
    highlightRecursive(nodeId);
  }
  
  /**
   * 更新SVG视图大小
   * @param {Object} bounds - 边界 { minX, maxX, minY, maxY }
   * @param {Number} padding - 内边距
   */
  updateViewBox(bounds, padding = 100) {
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const x = bounds.minX - padding;
    const y = bounds.minY - padding;
    
    this.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
  }
  
  /**
   * 清空所有连接线
   */
  clear() {
    // 保留defs，只删除path元素
    this.svg.querySelectorAll('path').forEach(path => path.remove());
  }
  
  /**
   * 设置连接线样式
   * @param {String} curveStyle - 样式类型
   */
  setCurveStyle(curveStyle) {
    this.curveStyle = curveStyle;
  }
  
  /**
   * 更新颜色配置
   * @param {Object} colors - 颜色映射
   */
  updateColors(colors) {
    Object.assign(this.colors, colors);
    
    // 重新创建箭头标记
    if (this.showArrows) {
      const defs = this.svg.querySelector('defs');
      if (defs) {
        defs.innerHTML = '';
      }
      this.createArrowMarkers();
    }
  }
}

export default SkillTreeConnector;

// 全局可用（调试）
if (typeof window !== 'undefined') {
  window.SkillTreeConnector = SkillTreeConnector;
}