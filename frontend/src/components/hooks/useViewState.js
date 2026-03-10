import { useState, useRef } from 'react';

/**
 * Hook für Pan/Zoom-Steuerung der MacroView
 */
export const useViewState = (initialScale = 0.4) => {
    const [viewState, setViewState] = useState({ x: 0, y: -100, scale: initialScale });
    const [isPanning, setIsPanning] = useState(false);

    const handleWheel = (e, containerRef) => {
        const { x, y, scale } = viewState;
        const scaleChange = -e.deltaY * 0.0005; // Reduced from 0.001 for smoother zoom
        const newScale = Math.max(0.1, Math.min(4, scale + scaleChange));
        const ratio = newScale / scale;

        const rect = containerRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;

        const newX = cx * (1 - ratio) + x * ratio;
        const newY = cy * (1 - ratio) + y * ratio;

        setViewState({ x: newX, y: newY, scale: newScale });
    };

    const handlePanStart = (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        setIsPanning(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startViewX = viewState.x;
        const startViewY = viewState.y;

        const handlePanMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            setViewState(prev => ({ ...prev, x: startViewX + dx, y: startViewY + dy }));
        };

        const handlePanUp = () => {
            window.removeEventListener('pointermove', handlePanMove);
            window.removeEventListener('pointerup', handlePanUp);
            setIsPanning(false);
        };

        window.addEventListener('pointermove', handlePanMove);
        window.addEventListener('pointerup', handlePanUp);
    };

    return { viewState, setViewState, handleWheel, handlePanStart, isPanning };
};

export default useViewState;
