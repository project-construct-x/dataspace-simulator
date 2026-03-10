import { useState, useRef } from 'react';

/**
 * Hook für Drag-Handling eines einzelnen Nodes
 */
export const useNodeDrag = ({ isZoomed, scale, onDragStart, onDrag, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const hasDragged = useRef(false);

    const handlePointerDown = (e) => {
        // Only allow left-click dragging (button 0)
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        setIsDragging(true);
        hasDragged.current = false;
        onDragStart();

        const startX = e.clientX;
        const startY = e.clientY;
        const currentScale = scale || 1;

        const handlePointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                hasDragged.current = true;
            }

            const deltaX = dx / currentScale;
            const deltaY = dy / currentScale;
            onDrag(null, { offset: { x: deltaX, y: deltaY } });
        };

        const handlePointerUp = (upEvent) => {
            setIsDragging(false);
            const deltaX = (upEvent.clientX - startX) / currentScale;
            const deltaY = (upEvent.clientY - startY) / currentScale;

            onDragEnd(null, { offset: { x: deltaX, y: deltaY } });

            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    return { isDragging, hasDragged, handlePointerDown };
};

export default useNodeDrag;
