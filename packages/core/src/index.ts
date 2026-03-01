// packages/core/src/index.ts
import './style.css';

export type PullState = 'pending' | 'pulling' | 'releasing' | 'refreshing';

export interface PullToRefreshOptions {
  container: HTMLElement;
  content: HTMLElement;
  indicatorIcon?: HTMLElement; // 支持传入自定义的ICON DOM 节点
  distanceToRefresh?: number;
  resistance?: number;
  onRefresh: () => Promise<void>;
  onPulling?: (distance: number) => void;
  onStateChange?: (state: PullState) => void; // 新增：状态变更回调
}

export class PullToRefresh {
  private options: Required<PullToRefreshOptions>;
  
  private indicator!: HTMLElement;
  private icon!: HTMLElement;

  private startY: number = 0;
  private currentY: number = 0;
  private distance: number = 0;
  private isPulling: boolean = false;
  private state: PullState = 'pending';

  constructor(options: PullToRefreshOptions) {
    this.options = {
      indicatorIcon: undefined as any, // 占位
      distanceToRefresh: 60,
      resistance: 2.5,
      onPulling: () => {},
      onStateChange: () => {},
      ...options,
    };

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.init();
  }

  private init() {
    const { container } = this.options;
    container.style.position = 'relative';
    
    this.setupIndicator();

    container.addEventListener('touchstart', this.onTouchStart);
    container.addEventListener('touchmove', this.onTouchMove, { passive: false });
    container.addEventListener('touchend', this.onTouchEnd);
  }

  private setupIndicator() {
    const { container } = this.options;

    // 2. 生成默认的 Material 风格 Indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'ptr-indicator-wrapper';
    
    const circle = document.createElement('div');
    circle.className = 'ptr-indicator-circle';

    this.icon = this.getIcon();
    
    circle.appendChild(this.icon);
    this.indicator.appendChild(circle);
    container.appendChild(this.indicator);
  }

  private getIcon(): HTMLElement {
    const { indicatorIcon } = this.options;

    console.log('用户传入的 indicatorIcon:', indicatorIcon);

    return indicatorIcon || this.createDefaultIcon();
  }

  createDefaultIcon(): HTMLElement {
    const icon = document.createElement('div');
    icon.className = 'ptr-icon';
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-1.35"/></svg>`;
    return icon;
  }

  private setState(newState: PullState) {
    if (this.state !== newState) {
      this.state = newState;
      this.options.onStateChange(newState);
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (this.state === 'refreshing') return;
    if (this.options.container.scrollTop > 0) return;

    this.startY = e.touches[0].clientY;
    this.isPulling = true;
    this.setState('pending');
    
    this.options.content.style.transition = 'none';
    this.indicator.style.transition = 'none';
  }

  private calculateDamping(pullDistance: number): number {
    return pullDistance / (1 + pullDistance / (window.innerHeight / this.options.resistance));
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isPulling) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    if (deltaY < 0) {
      this.isPulling = false;
      return;
    }

    if (e.cancelable) e.preventDefault();

    this.distance = this.calculateDamping(deltaY);
    this.setState(this.distance > this.options.distanceToRefresh ? 'releasing' : 'pulling');

    const progress = Math.min(this.distance / this.options.distanceToRefresh, 1);
    
    // Core 统一接管透明度和整体下降的位移
    this.indicator.style.opacity = progress.toString();
    this.indicator.style.transform = `translate3d(0, ${this.distance}px, 0)`;

    // if (this.icon) {
    //   this.icon.style.transform = `rotate(${this.distance * 4}deg)`;
    // }
    
    this.options.onPulling(this.distance);
  }

  private onTouchEnd() {
    if (!this.isPulling) return;
    this.isPulling = false;

    const bounceTransition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    // this.options.content.style.transition = bounceTransition;
    this.indicator.style.transition = bounceTransition;

    if (this.state === 'releasing') {
      this.setState('refreshing');
      
      this.indicator.style.transform = `translate3d(0, ${this.options.distanceToRefresh}px, 0)`;
      
      if (this.icon) {
        this.icon.style.transform = '';
        this.icon.classList.add('ptr-spinning');
      }

      this.options.onRefresh()
        .then(() => this.reset())
        .catch(() => this.reset());
    } else {
      this.reset();
    }
  }

  private reset() {
    this.setState('pending');
    this.distance = 0;
    
    this.options.content.style.transition = 'transform 0.3s';
    this.options.content.style.transform = `translate3d(0, 0, 0)`;
    
    this.indicator.style.transition = 'transform 0.3s, opacity 0.3s';
    this.indicator.style.transform = `translate3d(0, 0, 0)`;
    this.indicator.style.opacity = '0';

    setTimeout(() => {
      if (this.icon) this.icon.classList.remove('ptr-spinning');
      this.indicator.style.transition = 'none';
    }, 300);
  }

  public destroy() {
    const { container } = this.options;
    container.removeEventListener('touchstart', this.onTouchStart);
    container.removeEventListener('touchmove', this.onTouchMove);
    container.removeEventListener('touchend', this.onTouchEnd);
    // 销毁时顺便清理内部生成的 DOM
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }
}