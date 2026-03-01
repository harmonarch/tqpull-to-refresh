var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PullToRefresh: () => PullToRefresh
});
module.exports = __toCommonJS(index_exports);

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
styleInject(".ptr-indicator-wrapper {\n  position: absolute;\n  top: -60px;\n  left: 0;\n  width: 100%;\n  height: 60px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 10;\n  opacity: 0;\n  pointer-events: none;\n}\n.ptr-indicator-circle {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background-color: #ffffff;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.ptr-icon {\n  width: 20px;\n  height: 20px;\n  color: #007bff;\n  display: flex;\n}\n@keyframes ptr-spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.ptr-spinning {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  animation: ptr-spin 0.8s linear infinite;\n}\n");

// src/index.ts
var PullToRefresh = class {
  options;
  indicator;
  icon;
  startY = 0;
  currentY = 0;
  distance = 0;
  isPulling = false;
  state = "pending";
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
      ...options
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.init();
  }
  init() {
    const { container } = this.options;
    container.style.position = "relative";
    this.setupIndicator();
    container.addEventListener("touchstart", this.onTouchStart);
    container.addEventListener("touchmove", this.onTouchMove, { passive: false });
    container.addEventListener("touchend", this.onTouchEnd);
  }
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
    console.log("\u7528\u6237\u4F20\u5165\u7684 indicatorIcon:", indicatorIcon);
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
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PullToRefresh
});
