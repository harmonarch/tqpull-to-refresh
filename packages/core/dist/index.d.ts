type PullState = 'pending' | 'pulling' | 'releasing' | 'refreshing';
type LoadMoreState = 'idle' | 'loading' | 'noMore';
interface PullToRefreshOptions {
    container: HTMLElement;
    content: HTMLElement;
    indicatorIcon?: HTMLElement;
    distanceToRefresh?: number;
    resistance?: number;
    onRefresh: () => Promise<void>;
    onPulling?: (distance: number) => void;
    onStateChange?: (state: PullState) => void;
    onLoadMore?: () => Promise<void>;
    distanceToLoadMore?: number;
    footer?: HTMLElement;
    onLoadMoreStateChange?: (state: LoadMoreState) => void;
}
declare class PullToRefresh {
    private options;
    private indicator;
    private icon;
    private footer?;
    private startY;
    private currentY;
    private distance;
    private isPulling;
    private state;
    private hasMore;
    private loadMoreState;
    private onScrollFn;
    private iosSpinnerSvg;
    constructor(options: PullToRefreshOptions);
    private init;
    private setupFooter;
    private setLoadMoreState;
    private handleScroll;
    private triggerLoadMore;
    setHasMore(hasMore: boolean): void;
    private updateDefaultFooterUI;
    private setupIndicator;
    private getIcon;
    createDefaultIcon(): HTMLElement;
    private setState;
    private onTouchStart;
    private calculateDamping;
    private onTouchMove;
    private onTouchEnd;
    private reset;
    destroy(): void;
}

export { type LoadMoreState, type PullState, PullToRefresh, type PullToRefreshOptions };
