import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';

const ParticipantDropdownMenu = ({ show, onEdit, onDelete, isDemo = true }) => {
    if (!show) return null;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    minWidth: '120px',
                    zIndex: 20
                }}
            >
                {isDemo && (
                    <button
                        onClick={onEdit}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <Pencil size={14} /> Edit
                    </button>
                )}
                {isDemo && (
                    <button
                        onClick={onDelete}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                )}
                {!isDemo && (
                    <div style={{
                        padding: '10px 12px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}>
                        Managed by participant
                    </div>
                )}
            </Motion.div>
        </AnimatePresence>
    );
};

export default ParticipantDropdownMenu;
