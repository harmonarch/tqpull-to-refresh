// packages/core/src/index.ts
import './style.css';

export type PullState = 'pending' | 'pulling' | 'releasing' | 'refreshing' | 'refreshend';
// ✨ 新增：上拉加载的状态机类型
export type LoadMoreState = 'idle' | 'loading' | 'noMore';

export interface PullToRefreshOptions {
  container: HTMLElement;
  content: HTMLElement;
  indicator?: HTMLElement; // 自定义的 indicator 配置项
  distanceToRefresh?: number;
  resistance?: number;
  onRefresh: () => Promise<void>;
  onPulling?: (distance: number) => void;
  onPulldownProgress?: (state: PullState) => void; // 新增：状态变更回调

  // ✨ 新增：上拉加载相关配置
  onLoadMore?: () => Promise<void>;
  distanceToLoadMore?: number; // 距离底部多少像素触发加载 (默认 50)
  footer?: HTMLElement; // ✨ 新增：支持传入自定义底部 DOM
  onLoadMoreProgress?: (state: LoadMoreState) => void; // ✨ 新增：底部状态变更回调
}

export class PullToRefresh {
  private options: Required<PullToRefreshOptions>;
  
  private indicator!: HTMLElement;
  private icon!: HTMLElement;
  private footer?: HTMLElement; // ✨ 底部的加载状态 DOM

  private startY: number = 0;
  private currentY: number = 0;
  private distance: number = 0;
  private isPulling: boolean = false;
  private state: PullState = 'pending';

  // ✨ 上拉加载的状态控制
  private hasMore: boolean = true;
  private loadMoreState: LoadMoreState = 'idle'; // ✨ 引入专属状态机
  private onScrollFn: () => void;

  // 复用上一节的 iOS 菊花图 SVG
  private iosSpinnerSvg = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="15" x2="50" y2="30" opacity="1.0" transform="rotate(0 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.9" transform="rotate(30 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.8" transform="rotate(60 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.7" transform="rotate(90 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.6" transform="rotate(120 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.5" transform="rotate(150 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.4" transform="rotate(180 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.3" transform="rotate(210 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.2" transform="rotate(240 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.15" transform="rotate(270 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.1" transform="rotate(300 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.05" transform="rotate(330 50 50)"/>
    </g>
  </svg>`;

  constructor(options: PullToRefreshOptions) {
    this.options = {
      indicator: undefined as any, // 占位
      distanceToRefresh: 60,
      resistance: 2.5,
      onPulling: () => {},
      onPulldownProgress: () => {},
      onLoadMore: undefined as any,
      distanceToLoadMore: 50, // 默认距离底部 50px 触发
      footer: undefined as any,
      onLoadMoreProgress: () => {},
      ...options,
    };

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onScrollFn = this.handleScroll.bind(this);

    this.init();
  }

  private init() {
    const { container } = this.options;
    container.style.position = 'relative';
    
    this.setupIndicator();
    this.setupFooter(); // ✨ 初始化底部 Footer

    container.addEventListener('touchstart', this.onTouchStart);
    container.addEventListener('touchmove', this.onTouchMove, { passive: false });
    container.addEventListener('touchend', this.onTouchEnd);

    // ✨ 绑定滚动事件，用于探测上拉触底
    if (this.options.onLoadMore) {
      container.addEventListener('scroll', this.onScrollFn);
    }
  }

  // ===== ✨ 上拉加载核心逻辑开始 =====
  private setupFooter() {
    if (!this.options.onLoadMore) return;
    const { content, footer } = this.options;

    if (footer) {
      // 使用传入的自定义 footer
      this.footer = footer;
      // 如果调用者没有把自定义 DOM 放入内容层，核心库代为挂载
      if (!this.footer.parentNode) {
        content.appendChild(this.footer);
      }
    } else {
      // 默认的内部 Footer
      this.footer = document.createElement('div');
      this.footer.className = 'ptr-footer';
      content.appendChild(this.footer);
    }
  }

  // ✨ 统一派发底部状态
  private setLoadMoreState(newState: LoadMoreState) {
    if (this.loadMoreState !== newState) {
      this.loadMoreState = newState;
      this.options.onLoadMoreProgress(newState);
      this.updateDefaultFooterUI(); // 尝试更新默认 UI（如果是自定义则内部会被拦截）
    }
  }

  private handleScroll() {
    // 只有在 idle (空闲) 状态下才允许触发触底
    if (!this.options.onLoadMore || this.loadMoreState !== 'idle') return;  

    const { container, distanceToLoadMore } = this.options;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - distanceToLoadMore) {
      this.triggerLoadMore();
    }
  }

  private triggerLoadMore() {
    this.setLoadMoreState('loading');

    this.options.onLoadMore().then(() => {
      if (this.hasMore) this.setLoadMoreState('idle');
    }).catch(() => {
      if (this.hasMore) this.setLoadMoreState('idle');
    });
  }

  // ✨ 对外暴露的 API：控制是否还有更多数据
  public setHasMore(hasMore: boolean) {
    this.hasMore = hasMore;
    if (!hasMore) {
      this.setLoadMoreState('noMore');
    } else if (this.loadMoreState === 'noMore') {
      // 比如触发了下拉刷新，重置了 hasMore，我们将状态切回空闲
      this.setLoadMoreState('idle');
    }
  }

  private updateDefaultFooterUI() {
    if (!this.footer || this.options.footer) return; // 如果是 DIY 模式，核心库坚决不干涉 UI 渲染

    if (this.loadMoreState === 'noMore') {
      this.footer.innerHTML = '没有更多数据了';
      this.footer.style.display = 'flex';
    } else if (this.loadMoreState === 'loading') {
      this.footer.innerHTML = `<div class="ptr-icon ptr-spinning">${this.iosSpinnerSvg}</div> <span>正在加载...</span>`;
      this.footer.style.display = 'flex';
    } else {
      this.footer.style.display = 'none';
    }
  }
  // ===== ✨ 上拉加载核心逻辑结束 =====

  private setupIndicator() {
    const { container, indicator } = this.options;

    if (indicator) {
      // 使用传入的自定义 indicator
      this.indicator = indicator;
      // 如果调用者没有把自定义 DOM 放入容器，核心库代为挂载
      if (!this.indicator.parentNode) {
        container.appendChild(this.indicator);
      }
      return;
    }

    // 生成默认的 Material 风格 Indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'ptr-indicator-wrapper';
    
    const circle = document.createElement('div');
    circle.className = 'ptr-indicator-circle';

    this.icon = this.createDefaultIcon();
    
    circle.appendChild(this.icon);
    this.indicator.appendChild(circle);
    container.appendChild(this.indicator);
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
      this.options.onPulldownProgress(newState);
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

    if (this.icon) {
      this.icon.style.transform = `rotate(${this.distance * 4}deg)`;
    }
    
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
    this.setState('refreshend');
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
    container.removeEventListener('scroll', this.onScrollFn);
    // 销毁时顺便清理内部生成的 DOM
    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }
  }
}