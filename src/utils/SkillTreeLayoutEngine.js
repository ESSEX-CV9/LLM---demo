// utils/SkillTreeLayoutEngine.js - 技能树布局引擎
// 使用 Reingold-Tilford 算法实现竖版树状布局

class SkillTreeLayoutEngine {
  constructor(config = {}) {
    // 节点尺寸
    this.nodeWidth = config.nodeWidth || 100;
    this.nodeHeight = config.nodeHeight || 100;
    
    // 布局间距
    this.levelHeight = config.levelHeight || 150; // 层级间距（垂直）
    this.siblingSpacing = config.siblingSpacing || 50; // 兄弟节点间距（水平）
    this.subtreeSpacing = config.subtreeSpacing || 80; // 子树间距（水平）
    
    // 布局方向（vertical: 从上到下）
    this.direction = config.direction || 'vertical';
  }
  
  /**
   * 构建技能树结构
   * @param {Array} skills - 所有技能数据
   * @param {String} category - 技能分类（physical/magic/passive）
   * @returns {Object} 树根节点
   */
  buildTree(skills, category) {
    console.log(`[SkillTreeLayout] 构建 ${category} 技能树，技能数量: ${skills.length}`);
    
    // 过滤当前分类的技能
    const categorySkills = skills.filter(skill => {
      if (category === 'physical') return skill.tags?.includes('物理');
      if (category === 'magic') return skill.tags?.includes('魔法');
      if (category === 'passive') return skill.kind === 'passive';
      return false;
    });
    
    console.log(`[SkillTreeLayout] 过滤后技能数量: ${categorySkills.length}`);
    
    // 创建节点映射
    const nodeMap = new Map();
    categorySkills.forEach(skill => {
      nodeMap.set(skill.id, {
        id: skill.id,
        data: skill,
        children: [],
        parent: null,
        x: 0,
        y: 0,
        mod: 0, // Reingold-Tilford 算法的修正值
      });
    });
    
    // 找到根节点（没有前置条件的技能）
    const roots = [];
    
    categorySkills.forEach(skill => {
      const node = nodeMap.get(skill.id);
      const hasPrerequisites = skill.requirements?.requires?.length > 0;
      
      if (!hasPrerequisites) {
        // 没有前置条件，是根节点
        roots.push(node);
      } else {
        // 有前置条件，建立父子关系
        skill.requirements.requires.forEach(req => {
          const parentNode = nodeMap.get(req.id);
          if (parentNode) {
            parentNode.children.push(node);
            node.parent = parentNode;
          } else {
            // 前置技能不在当前分类中，视为根节点
            if (!roots.includes(node)) {
              roots.push(node);
            }
          }
        });
      }
    });
    
    console.log(`[SkillTreeLayout] 找到 ${roots.length} 个根节点`);
    
    // 如果有多个根节点，创建一个虚拟根节点
    if (roots.length > 1) {
      const virtualRoot = {
        id: `virtual-root-${category}`,
        data: null,
        children: roots,
        parent: null,
        x: 0,
        y: -this.levelHeight, // 虚拟根节点在上方
        mod: 0,
        isVirtual: true
      };
      
      roots.forEach(root => {
        root.parent = virtualRoot;
      });
      
      return virtualRoot;
    } else if (roots.length === 1) {
      return roots[0];
    } else {
      console.warn(`[SkillTreeLayout] 没有找到根节点`);
      return null;
    }
  }
  
  /**
   * 计算树的布局（Reingold-Tilford 算法）
   * @param {Object} root - 树根节点
   * @returns {Object} 布局结果 { nodes, bounds }
   */
  calculateLayout(root) {
    if (!root) {
      return { nodes: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }
    
    console.log('[SkillTreeLayout] 开始计算布局...');
    
    // 第一次遍历：后序遍历，计算初始 x 坐标和 mod 值
    this.firstWalk(root, 0);
    
    // 第二次遍历：前序遍历，应用 mod 值，计算最终 x 坐标
    this.secondWalk(root, 0, 0);
    
    // 收集所有节点并计算边界
    const nodes = [];
    const bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    };
    
    this.collectNodes(root, nodes, bounds);
    
    console.log(`[SkillTreeLayout] 布局完成，节点数: ${nodes.length}`);
    console.log(`[SkillTreeLayout] 边界:`, bounds);
    
    return { nodes, bounds };
  }
  
  /**
   * 第一次遍历：后序遍历计算初始位置
   * @param {Object} node - 当前节点
   * @param {Number} depth - 深度
   */
  firstWalk(node, depth) {
    node.y = depth * this.levelHeight;
    
    if (node.children.length === 0) {
      // 叶子节点
      if (node.leftSibling) {
        node.x = node.leftSibling.x + this.nodeWidth + this.siblingSpacing;
      } else {
        node.x = 0;
      }
    } else {
      // 有子节点
      let defaultX = 0;
      
      // 递归处理子节点
      node.children.forEach((child, index) => {
        if (index > 0) {
          child.leftSibling = node.children[index - 1];
        }
        this.firstWalk(child, depth + 1);
      });
      
      // 计算中点
      const leftmost = node.children[0];
      const rightmost = node.children[node.children.length - 1];
      const midpoint = (leftmost.x + rightmost.x) / 2;
      
      if (node.leftSibling) {
        node.x = node.leftSibling.x + this.nodeWidth + this.siblingSpacing;
        node.mod = node.x - midpoint;
      } else {
        node.x = midpoint;
      }
    }
  }
  
  /**
   * 第二次遍历：前序遍历应用修正值
   * @param {Object} node - 当前节点
   * @param {Number} modSum - 累积的修正值
   * @param {Number} depth - 深度
   */
  secondWalk(node, modSum, depth) {
    node.x += modSum;
    node.y = depth * this.levelHeight;
    
    node.children.forEach(child => {
      this.secondWalk(child, modSum + node.mod, depth + 1);
    });
  }
  
  /**
   * 收集所有节点并计算边界
   * @param {Object} node - 当前节点
   * @param {Array} nodes - 节点数组
   * @param {Object} bounds - 边界对象
   */
  collectNodes(node, nodes, bounds) {
    if (!node.isVirtual) {
      nodes.push(node);
      
      // 更新边界
      bounds.minX = Math.min(bounds.minX, node.x - this.nodeWidth / 2);
      bounds.maxX = Math.max(bounds.maxX, node.x + this.nodeWidth / 2);
      bounds.minY = Math.min(bounds.minY, node.y - this.nodeHeight / 2);
      bounds.maxY = Math.max(bounds.maxY, node.y + this.nodeHeight / 2);
    }
    
    node.children.forEach(child => {
      this.collectNodes(child, nodes, bounds);
    });
  }
  
  /**
   * 获取节点的所有前置节点ID
   * @param {Object} node - 节点
   * @returns {Array} 前置节点ID数组
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
   * 简化版布局（改进版）
   * 按升级链路排列，同一链路的技能垂直对齐
   * @param {Array} skills - 技能数组
   * @param {String} category - 分类
   * @returns {Object} 布局结果
   */
  simpleLayout(skills, category) {
    console.log(`[SkillTreeLayout] 使用改进链路布局 ${category}`);
    
    // 过滤分类
    const categorySkills = skills.filter(skill => {
      if (category === 'physical') return skill.tags?.includes('物理');
      if (category === 'magic') return skill.tags?.includes('魔法');
      if (category === 'passive') return skill.kind === 'passive';
      return false;
    });
    
    console.log(`[SkillTreeLayout] 过滤后技能数量: ${categorySkills.length}`);
    
    // 创建节点映射
    const nodeMap = new Map();
    categorySkills.forEach(skill => {
      nodeMap.set(skill.id, {
        id: skill.id,
        data: skill,
        x: 0,
        y: 0,
        children: [],
        parent: null,
        level: 0,
        column: 0
      });
    });
    
    // 建立父子关系
    categorySkills.forEach(skill => {
      const node = nodeMap.get(skill.id);
      if (skill.requirements?.requires?.length > 0) {
        // 有前置条件，找到第一个父节点（主要前置）
        const firstReq = skill.requirements.requires[0];
        const parentNode = nodeMap.get(firstReq.id);
        if (parentNode) {
          parentNode.children.push(node);
          node.parent = parentNode;
        }
      }
    });
    
    // 计算层级（基于前置深度）
    const calculateLevel = (node, visited = new Set()) => {
      if (visited.has(node.id)) return 0;
      visited.add(node.id);
      
      if (!node.parent) {
        node.level = 0;
        return 0;
      }
      
      const parentLevel = calculateLevel(node.parent, visited);
      node.level = parentLevel + 1;
      return node.level;
    };
    
    nodeMap.forEach(node => calculateLevel(node));
    
    // 找到所有根节点（没有父节点的）
    const roots = Array.from(nodeMap.values()).filter(node => !node.parent);
    console.log(`[SkillTreeLayout] 找到 ${roots.length} 个根节点`);
    
    // 改进的列分配算法：父节点与子节点居中对齐
    let currentColumn = 0;
    
    // 第一步：先递归处理所有子节点，分配列编号
    const assignColumnsToChildren = (node) => {
      if (node.children.length === 0) {
        // 叶子节点，分配新列
        node.column = currentColumn++;
        return;
      }
      
      // 先递归处理所有子节点
      node.children.forEach(child => {
        assignColumnsToChildren(child);
      });
      
      // 然后根据子节点的列范围，计算父节点的列
      if (node.children.length === 1) {
        // 单个子节点，父节点与子节点同列
        node.column = node.children[0].column;
      } else {
        // 多个子节点，父节点在中间
        const childColumns = node.children.map(c => c.column);
        const minCol = Math.min(...childColumns);
        const maxCol = Math.max(...childColumns);
        
        // 计算中间位置
        // 如果是奇数个子节点，取中间；如果是偶数，取中间偏左
        const middleIndex = Math.floor((node.children.length - 1) / 2);
        node.column = node.children[middleIndex].column;
      }
    };
    
    // 为根节点分配列
    roots.forEach(root => {
      assignColumnsToChildren(root);
    });
    
    // 按层级分组
    const levels = new Map();
    nodeMap.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level).push(node);
    });
    
    // 🆕 计算每列的X坐标（居中显示）
    const maxColumn = Math.max(...Array.from(nodeMap.values()).map(n => n.column));
    const minColumn = Math.min(...Array.from(nodeMap.values()).map(n => n.column));
    
    // 让所有节点居中：找到中间列，以0为中心
    const centerColumn = (maxColumn + minColumn) / 2;
    
    // 布局节点
    const nodes = [];
    const bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    };
    
    nodeMap.forEach(node => {
      // X坐标基于列编号，居中对齐
      node.x = (node.column - centerColumn) * (this.nodeWidth + this.siblingSpacing);
      // Y坐标基于层级
      node.y = node.level * this.levelHeight;
      
      nodes.push(node);
      
      // 更新边界
      bounds.minX = Math.min(bounds.minX, node.x - this.nodeWidth / 2);
      bounds.maxX = Math.max(bounds.maxX, node.x + this.nodeWidth / 2);
      bounds.minY = Math.min(bounds.minY, node.y - this.nodeHeight / 2);
      bounds.maxY = Math.max(bounds.maxY, node.y + this.nodeHeight / 2);
    });
    
    console.log(`[SkillTreeLayout] 布局完成，共 ${nodes.length} 个节点，${maxColumn + 1} 列`);
    
    return { nodes, bounds };
  }
  
  /**
   * 计算技能层级（基于前置条件的深度）
   * @param {Object} skill - 技能
   * @param {Array} allSkills - 所有技能
   * @param {Map} cache - 缓存
   * @returns {Number} 层级
   */
  calculateSkillLevel(skill, allSkills, cache = new Map()) {
    if (cache.has(skill.id)) {
      return cache.get(skill.id);
    }
    
    if (!skill.requirements?.requires?.length) {
      cache.set(skill.id, 0);
      return 0;
    }
    
    let maxLevel = 0;
    skill.requirements.requires.forEach(req => {
      const reqSkill = allSkills.find(s => s.id === req.id);
      if (reqSkill) {
        const reqLevel = this.calculateSkillLevel(reqSkill, allSkills, cache);
        maxLevel = Math.max(maxLevel, reqLevel + 1);
      }
    });
    
    cache.set(skill.id, maxLevel);
    return maxLevel;
  }
}

export default SkillTreeLayoutEngine;

// 全局可用（调试）
if (typeof window !== 'undefined') {
  window.SkillTreeLayoutEngine = SkillTreeLayoutEngine;
}