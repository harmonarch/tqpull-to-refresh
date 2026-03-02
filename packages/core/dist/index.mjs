// #style-inject:#style-inject
function styleInject(css, { insertAt } = {}) {
  if (!css || typeof document === "undefined") return;
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");
  style.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

// src/style.css
styleInject(".ptr-indicator-wrapper {\n  position: absolute;\n  top: -60px;\n  left: 0;\n  width: 100%;\n  height: 60px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 10;\n  opacity: 0;\n  pointer-events: none;\n}\n.ptr-indicator-circle {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background-color: #ffffff;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.ptr-icon {\n  width: 20px;\n  height: 20px;\n  color: #007bff;\n  display: flex;\n}\n@keyframes ptr-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.ptr-spinning {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  animation: ptr-spin 0.8s linear infinite;\n}\n.ptr-footer {\n  width: 100%;\n  height: 50px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: #888;\n  font-size: 14px;\n  display: none;\n}\n.ptr-footer .ptr-icon {\n  width: 18px;\n  height: 18px;\n  margin-right: 8px;\n  color: #888;\n}\n");

// src/index.ts
var PullToRefresh = class {
  options;
  indicator;
  icon;
  footer;
  // ✨ 底部的加载状态 DOM
  startY = 0;
  currentY = 0;
  distance = 0;
  isPulling = false;
  state = "pending";
  // ✨ 上拉加载的状态控制
  hasMore = true;
  loadMoreState = "idle";
  // ✨ 引入专属状态机
  onScrollFn;
  // 复用上一节的 iOS 菊花图 SVG
  iosSpinnerSvg = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="15" x2="50" y2="30" opacity="1.0" transform="rotate(0 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.9" transform="rotate(30 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.8" transform="rotate(60 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.7" transform="rotate(90 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.6" transform="rotate(120 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.5" transform="rotate(150 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.4" transform="rotate(180 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.3" transform="rotate(210 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.2" transform="rotate(240 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.15" transform="rotate(270 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.1" transform="rotate(300 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.05" transform="rotate(330 50 50)"/>
    </g>
  </svg>`;
  constructor(options) {
    this.options = {
      indicatorIcon: void 0,
      // 占位
      distanceToRefresh: 60,
      resistance: 2.5,
      onPulling: () => {
      },
      onStateChange: () => {
      },
      onLoadMore: void 0,
      distanceToLoadMore: 50,
      // 默认距离底部 50px 触发
      footer: void 0,
      onLoadMoreStateChange: () => {
      },
      ...options
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onScrollFn = this.handleScroll.bind(this);
    this.init();
  }
  init() {
    const { container } = this.options;
    container.style.position = "relative";
    this.setupIndicator();
    this.setupFooter();
    container.addEventListener("touchstart", this.onTouchStart);
    container.addEventListener("touchmove", this.onTouchMove, { passive: false });
    container.addEventListener("touchend", this.onTouchEnd);
    if (this.options.onLoadMore) {
      container.addEventListener("scroll", this.onScrollFn);
    }
  }
  // ===== ✨ 上拉加载核心逻辑开始 =====
  setupFooter() {
    if (!this.options.onLoadMore) return;
    const { content, footer } = this.options;
    if (footer) {
      this.footer = footer;
      if (!this.footer.parentNode) {
        content.appendChild(this.footer);
      }
    } else {
      this.footer = document.createElement("div");
      this.footer.className = "ptr-footer";
      content.appendChild(this.footer);
    }
  }
  // ✨ 统一派发底部状态
  setLoadMoreState(newState) {
    if (this.loadMoreState !== newState) {
      this.loadMoreState = newState;
      this.options.onLoadMoreStateChange(newState);
      this.updateDefaultFooterUI();
    }
  }
  handleScroll() {
    if (!this.options.onLoadMore || this.loadMoreState !== "idle") return;
    const { container, distanceToLoadMore } = this.options;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - distanceToLoadMore) {
      this.triggerLoadMore();
    }
  }
  triggerLoadMore() {
    this.setLoadMoreState("loading");
    this.options.onLoadMore().then(() => {
      if (this.hasMore) this.setLoadMoreState("idle");
    }).catch(() => {
      if (this.hasMore) this.setLoadMoreState("idle");
    });
  }
  // ✨ 对外暴露的 API：控制是否还有更多数据
  setHasMore(hasMore) {
    this.hasMore = hasMore;
    if (!hasMore) {
      this.setLoadMoreState("noMore");
    } else if (this.loadMoreState === "noMore") {
      this.setLoadMoreState("idle");
    }
  }
  updateDefaultFooterUI() {
    if (!this.footer || this.options.footer) return;
    if (this.loadMoreState === "noMore") {
      this.footer.innerHTML = "\u6CA1\u6709\u66F4\u591A\u6570\u636E\u4E86";
      this.footer.style.display = "flex";
    } else if (this.loadMoreState === "loading") {
      this.footer.innerHTML = `<div class="ptr-icon ptr-spinning">${this.iosSpinnerSvg}</div> <span>\u6B63\u5728\u52A0\u8F7D...</span>`;
      this.footer.style.display = "flex";
    } else {
      this.footer.style.display = "none";
    }
  }
  // ===== ✨ 上拉加载核心逻辑结束 =====
  setupIndicator() {
    const { container } = this.options;
    this.indicator = document.createElement("div");
    this.indicator.className = "ptr-indicator-wrapper";
    const circle = document.createElement("div");
    circle.className = "ptr-indicator-circle";
    this.icon = this.getIcon();
    circle.appendChild(this.icon);
    this.indicator.appendChild(circle);
    container.appendChild(this.indicator);
  }
  getIcon() {
    const { indicatorIcon } = this.options;
    return indicatorIcon || this.createDefaultIcon();
  }
  createDefaultIcon() {
    const icon = document.createElement("div");
    icon.className = "ptr-icon";
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-1.35"/></svg>`;
    return icon;
  }
  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.options.onStateChange(newState);
    }
  }
  onTouchStart(e) {
    if (this.state === "refreshing") return;
    if (this.options.container.scrollTop > 0) return;
    this.startY = e.touches[0].clientY;
    this.isPulling = true;
    this.setState("pending");
    this.options.content.style.transition = "none";
    this.indicator.style.transition = "none";
  }
  calculateDamping(pullDistance) {
    return pullDistance / (1 + pullDistance / (window.innerHeight / this.options.resistance));
  }
  onTouchMove(e) {
    if (!this.isPulling) return;
    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    if (deltaY < 0) {
      this.isPulling = false;
      return;
    }
    if (e.cancelable) e.preventDefault();
    this.distance = this.calculateDamping(deltaY);
    this.setState(this.distance > this.options.distanceToRefresh ? "releasing" : "pulling");
    const progress = Math.min(this.distance / this.options.distanceToRefresh, 1);
    this.indicator.style.opacity = progress.toString();
    this.indicator.style.transform = `translate3d(0, ${this.distance}px, 0)`;
    if (this.icon) {
      this.icon.style.transform = `rotate(${this.distance * 4}deg)`;
    }
    this.options.onPulling(this.distance);
  }
  onTouchEnd() {
    if (!this.isPulling) return;
    this.isPulling = false;
    const bounceTransition = "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";
    this.indicator.style.transition = bounceTransition;
    if (this.state === "releasing") {
      this.setState("refreshing");
      this.indicator.style.transform = `translate3d(0, ${this.options.distanceToRefresh}px, 0)`;
      if (this.icon) {
        this.icon.style.transform = "";
        this.icon.classList.add("ptr-spinning");
      }
      this.options.onRefresh().then(() => this.reset()).catch(() => this.reset());
    } else {
      this.reset();
    }
  }
  reset() {
    this.setState("pending");
    this.distance = 0;
    this.options.content.style.transition = "transform 0.3s";
    this.options.content.style.transform = `translate3d(0, 0, 0)`;
    this.indicator.style.transition = "transform 0.3s, opacity 0.3s";
    this.indicator.style.transform = `translate3d(0, 0, 0)`;
    this.indicator.style.opacity = "0";
    setTimeout(() => {
      if (this.icon) this.icon.classList.remove("ptr-spinning");
      this.indicator.style.transition = "none";
    }, 300);
  }
  destroy() {
    const { container } = this.options;
    container.removeEventListener("touchstart", this.onTouchStart);
    container.removeEventListener("touchmove", this.onTouchMove);
    container.removeEventListener("touchend", this.onTouchEnd);
    container.removeEventListener("scroll", this.onScrollFn);
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }
};
export {
  PullToRefresh
};
