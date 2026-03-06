// packages/react/src/index.tsx

import React, { useEffect, useRef, useImperativeHandle, forwardRef, ReactNode, ReactElement } from 'react';
// 直接复用 Core 包的类型和核心类
import { PullToRefresh as CorePTR, PullState, LoadMoreState } from '@tqpull-to-refresh/core';
// import '@tqpull-to-refresh/core/style.css';
import './style.css';

// 1. 定义组件的 Props，完美继承 Core 的配置，并将 DOM 替换为 ReactNode
export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  distanceToRefresh?: number;
  distanceToLoadMore?: number;
  resistance?: number;
  
  // 支持传入 React 组件作为自定义视图
  indicator?: ReactElement<{
    ref?: React.Ref<HTMLElement>;
  }>;
  footer?: ReactNode;
  
  onPulldownProgress?: (state: PullState) => void;
  onLoadMoreProgress?: (state: LoadMoreState) => void;
  onPulling?: (distance: number) => void;
  
  // 允许外部控制容器的样式
  className?: string;
  style?: React.CSSProperties;
}

// 2. 定义对外暴露的实例方法
export interface PullToRefreshInstance {
  setHasMore: (hasMore: boolean) => void;
}

export const PullToRefresh = forwardRef<PullToRefreshInstance, PullToRefreshProps>((props, ref) => {
  const {
    children,
    onRefresh,
    onLoadMore,
    distanceToRefresh = 60,
    distanceToLoadMore = 50,
    resistance = 2.5,
    indicator,
    footer,
    onPulldownProgress,
    onLoadMoreProgress,
    onPulling = () => {},
    className,
    style
  } = props;

  // 获取真实 DOM 的引用，交给 Core 去控制
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorAnchorRef = useRef<HTMLDivElement>(null);
  const footerAnchorRef = useRef<HTMLDivElement>(null);
  
  // 保存 Core 实例
  const ptrInstance = useRef<CorePTR | null>(null);

  // 3. 将 setHasMore 方法暴露给使用该组件的父级
  useImperativeHandle(ref, () => ({
    setHasMore: (hasMore: boolean) => {
      ptrInstance.current?.setHasMore(hasMore);
    }
  }));

  // 4. 组件挂载时初始化 Core，卸载时销毁
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    console.log(indicator);

    ptrInstance.current = new CorePTR({
      container: containerRef.current,
      content: contentRef.current,
      // 只要用户传了 indicator，我们就把“幽灵锚点”交给 Core 去操纵位移和透明度
      indicator: indicator ? indicatorAnchorRef.current! : undefined,
      footer: footer ? footerAnchorRef.current! : undefined,
      
      onRefresh,
      onLoadMore,
      distanceToRefresh,
      distanceToLoadMore,
      resistance,
      onPulldownProgress,
      onLoadMoreProgress,
      onPulling
    });

    return () => {
      ptrInstance.current?.destroy();
      ptrInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. 渲染基础的 DOM 骨架
  return (
    <div
      ref={containerRef}
      className={`ptr-react-container ${className || ''}`}
      style={{
        flex: 1,
        // height: '100%', 
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch', // iOS 顺滑滚动 
        position: 'relative', // 必须为 relative，作为 indicator 的参考系
        ...style 
      }}
    >

      {/* ✨ 幽灵锚点 (Ghost Anchor)
        Core 库只会改变这个 div 的 opacity 和 transform (向下的 Y 轴位移)。
        使用者传入的 indicator 只需要在里面写 top: -60px 藏在上面即可。
      */}
      {indicator && (
        <div 
          ref={indicatorAnchorRef} 
          className="ptr-react-indicator-anchor"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            zIndex: 10,
            // 注意：这里绝对不能写 opacity: 0，交由 Core 自动控制！
          }}
        >
          {indicator}
        </div>
      )}


      {/* 滚动的内容区 */}
      <div 
        ref={contentRef} 
        className="ptr-react-content"
        style={{ minHeight: '100%', backgroundColor: '#fff', zIndex: 2 }}
      >
        {children}
        
        {/* Footer 锚点 */}
        {footer && (
          <div ref={footerAnchorRef} className="ptr-react-footer-anchor">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

PullToRefresh.displayName = 'PullToRefresh';

export type { PullState, LoadMoreState };