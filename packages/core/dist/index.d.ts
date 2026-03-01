type PullState = 'pending' | 'pulling' | 'releasing' | 'refreshing';
interface PullToRefreshOptions {
    container: HTMLElement;
    content: HTMLElement;
    indicatorIcon?: HTMLElement;
    distanceToRefresh?: number;
    resistance?: number;
    onRefresh: () => Promise<void>;
    onPulling?: (distance: number) => void;
    onStateChange?: (state: PullState) => void;
}
declare class PullToRefresh {
    private options;
    private indicator;
    private icon;
    private startY;
    private currentY;
    private distance;
    private isPulling;
    private state;
    constructor(options: PullToRefreshOptions);
    private init;
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

export { type PullState, PullToRefresh, type PullToRefreshOptions };
