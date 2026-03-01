// src/animate.js
var lasttime = 0;
var nextFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
  let curtime = +/* @__PURE__ */ new Date(), delay = Math.max(1e3 / 60, 1e3 / 60 - (curtime - lasttime));
  lasttime = curtime + delay;
  return setTimeout(callback, delay);
};
var cancelFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || clearTimeout;
var tween = {
  linear: function(t, b, c, d) {
    return c * t / d + b;
  },
  ease: function(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  "ease-in": function(t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  "ease-out": function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  "ease-in-out": function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  },
  bounce: function(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  }
};
var slideTo = (el, target, callback) => {
  const duration = 1e3;
  let timer1 = null;
  const stime = Date.now();
  cancelFrame(timer1);
  ani();
  function ani() {
    const offset = Math.min(duration, Date.now() - stime);
    const s = tween.ease(offset, 0, 1, duration);
    const newY = (1 - s) * target;
    if (offset < duration) {
      el.style.transform = `translate(0px, ${newY}px)`;
      timer1 = nextFrame(ani);
    }
    if (Date.now() - stime > duration) {
      console.log("\u56DE\u5F39\u52A8\u753B\u7ED3\u675F");
      el.style.transform = `translate(0px, 0px)`;
      cancelFrame(timer1);
      timer1 = null;
      callback && callback();
    }
  }
};

// src/index.js
var masDragDistance = 300;
var timer = null;
var TQPullToRefresh = class {
  constructor(onPullStart, onReleasePulling, onPulling, options = {}) {
    this.state = {
      x: 0,
      y: 0,
      endY: 0,
      ladderDistance: 0,
      // 阶梯下降时阶梯的数值
      lastY: 0,
      rate: 1,
      isRunning: false
    };
    this.containerRef = null;
    this.areaRect = null;
    this.refresherRef = null;
    this.refresherRect = null;
    this.onPullStart = onPullStart;
    this.onReleasePulling = onReleasePulling;
    this.onPulling = onPulling;
    this.options = {
      cssPath: "./refresh.css",
      imagePath: "./refresh.svg",
      targetElement: document.body,
      ...options
    };
    this.touchStartHandler = this.touchStart.bind(this);
    this.touchMoveHandler = this.touchMove.bind(this);
    this.touchEndHandler = this.touchEnd.bind(this);
    this.initializeDOM();
    this.attachEventListeners();
  }
  /**
   * 初始化 DOM 结构
   */
  initializeDOM() {
    this.loadStyles();
    this.containerRef = this.createContainer();
    this.refresherRef = this.createRefresher();
    this.options.targetElement.appendChild(this.containerRef);
  }
  /**
   * 加载样式文件
   */
  loadStyles() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    try {
      link.href = new URL(this.options.cssPath, import.meta.url).href;
    } catch (err) {
      link.href = this.options.cssPath;
    }
    document.head.appendChild(link);
  }
  /**
   * 创建容器元素
   */
  createContainer() {
    const container = document.createElement("div");
    container.className = "container";
    return container;
  }
  /**
   * 创建刷新器元素
   */
  createRefresher() {
    const refresher = document.createElement("div");
    refresher.className = "refresher";
    const img = document.createElement("img");
    try {
      img.src = new URL(this.options.imagePath, import.meta.url).href;
    } catch (err) {
      img.src = this.options.imagePath;
    }
    img.style.cssText = "width: 100%; height: 100%;";
    img.style.width = "40px";
    img.style.height = "40px";
    refresher.appendChild(img);
    this.containerRef.appendChild(refresher);
    return refresher;
  }
  /**
   * 绑定事件监听器
   */
  attachEventListeners() {
    this.containerRef.addEventListener("touchstart", this.touchStartHandler);
    this.containerRef.addEventListener("touchmove", this.touchMoveHandler);
    this.containerRef.addEventListener("touchend", this.touchEndHandler);
  }
  /**
   * 移除事件监听器
   */
  detachEventListeners() {
    this.containerRef.removeEventListener("touchstart", this.touchStartHandler);
    this.containerRef.removeEventListener("touchmove", this.touchMoveHandler);
    this.containerRef.removeEventListener("touchend", this.touchEndHandler);
  }
  prepare(touch) {
    this.refresherRect = this.refresherRef.getBoundingClientRect();
    this.state.x = this.refresherRect.left;
    this.state.y = this.refresherRect.top;
    this.state.lastY = touch.clientY;
    this.state.isRunning = true;
  }
  destroy() {
    this.detachEventListeners();
  }
  // 记录日志：动画结束的时机
  rotate(angle) {
    console.log("\u65CB\u8F6C\u52A8\u753B\u5F00\u59CB");
    cancelFrame(timer);
    this.animate(angle);
  }
  animate(angle) {
    this.refresherRef.style.transform = `translate(0px, ${this.state.y}px)  rotate(${angle}deg`;
    angle = angle === -360 ? 0 : angle - 5;
    timer = nextFrame(() => {
      this.animate(angle - 5);
    });
  }
  // 回弹
  springBack() {
    console.log("\u65CB\u8F6C\u52A8\u753B\u7ED3\u675F");
    console.log(`\u6253\u5370\u8981\u7ED3\u675F\u7684\u65CB\u8F6C\u52A8\u753B id: ${timer}`);
    cancelFrame(timer);
    this.state.y = 0;
    const rect = this.refresherRef.getBoundingClientRect();
    console.log("\u56DE\u5F39\u52A8\u753B\u5F00\u59CB");
    slideTo(this.refresherRef, rect.top, () => {
      this.isSpringBack = true;
      this.state.isRunning = false;
    });
    this.state.rate = 1;
    this.state.lastY = 0;
  }
  move(touch) {
    const dy = touch.clientY - this.state.lastY;
    this.state.lastY = touch.clientY;
    this.state.rate = this.getRate(dy, this.state.rate);
    this.state.y += dy * this.state.rate;
    if (this.state.y >= masDragDistance) {
      this.state.y = masDragDistance;
    }
    if (this.state.y < 0) {
      this.state.y = 0;
    }
    this.dragMove(this.state.y);
  }
  // 手势
  getRate(distance, rate) {
    this.state.ladderDistance += distance;
    if (distance > 0) {
      if (this.state.ladderDistance >= 100) {
        rate = Math.max(0, rate - 0.1);
        this.state.ladderDistance = 0;
      }
    } else {
      if (this.state.ladderDistance < -100) {
        rate = Math.min(1, rate + 0.1);
        this.state.ladderDistance = 0;
      }
    }
    return rate;
  }
  dragMove(translateY) {
    if (!this.refresherRef)
      return;
    const angle = ~~(translateY / masDragDistance * 360) * -1;
    this.refresherRef.style.transform = `translate(0px, ${translateY}px) rotate(${angle}deg)`;
    this.onPulling && this.onPulling(translateY);
  }
  touchStart(e) {
    const touch = e.touches[0];
    this.prepare(touch);
    this.isSpringBack = false;
    this.onPullStart && this.onPullStart();
  }
  touchEnd(e) {
    if (this.state.y >= masDragDistance) {
      console.log("\u89E6\u53D1\u65CB\u8F6C\u52A8\u753B");
      this.rotate(0);
      this.onReleaseToRefresh && this.onReleaseToRefresh();
    } else {
      console.log("\u89E6\u53D1\u56DE\u5F39\u52A8\u753B");
      this.springBack();
    }
    this.destroy();
  }
  touchMove(e) {
    const touch = e.touches[0];
    this.move(touch);
  }
};
export {
  TQPullToRefresh as default
};
