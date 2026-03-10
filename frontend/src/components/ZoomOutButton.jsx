import React from 'react';

/**
 * Button zum Herauszoomen aus der Detailansicht
 */
const ZoomOutButton = ({ onClick, isVisible }) => {
    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            style={{
                position: 'fixed',
                top: '80px',
                right: '2rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: '1px solid white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                zIndex: 2001,
                pointerEvents: 'auto'
            }}
        >
            Zoom Out
        </button>
    );
};

export default ZoomOutButton;
