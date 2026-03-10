import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Users, Server, Plus, ChevronLeft, ChevronRight, Trash2, RotateCcw } from 'lucide-react';
import './Components.css';

/**
 * SideMenu - Collapsible sidebar with list of hosted dataspaces
 */
const SideMenu = ({
    dataspaces = [],
    activeDataspaceId,
    onSelectDataspace,
    onHostDataspace,
    onDeleteDataspace
}) => {
    // Persist sidebar state in localStorage
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }, [isOpen]);

    const [copiedCode, setCopiedCode] = useState(null);

    const copyCode = async (code, e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            // Fallback for browsers without clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedCode(code);
                setTimeout(() => setCopiedCode(null), 2000);
            } catch (e) {
                console.error('Copy failed:', e);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleResetDemo = async () => {
        setIsResetting(true);
        try {
            // Clear backend demo assets
            await fetch(`${window.location.origin}/api/demo/reset`, {
                method: 'POST'
            });

            // Clear localStorage
            localStorage.removeItem('dataspace-nodes-demo');
            localStorage.removeItem('dataspace-assets-demo');
            localStorage.removeItem('dataspace-logs-demo');

            // Reload page to get fresh state
            window.location.reload();
        } catch (error) {
            console.error('Reset failed:', error);
            setIsResetting(false);
            setShowResetConfirm(false);
        }
    };

    return (
        <motion.div
            className="side-menu"
            animate={{ width: isOpen ? 280 : 60 }}
            transition={{ duration: 0.2 }}
            style={{
                padding: isOpen ? '16px' : '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* Reset Confirmation Dialog */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}
                        onClick={() => setShowResetConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '1px solid #334155',
                                maxWidth: '400px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Reset Demo?</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                                This will delete all published assets and reset the dataspace to its initial state.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    disabled={isResetting}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'transparent',
                                        border: '1px solid #334155',
                                        borderRadius: '6px',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetDemo}
                                    disabled={isResetting}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        opacity: isResetting ? 0.7 : 1
                                    }}
                                >
                                    {isResetting ? 'Resetting...' : 'Reset'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div
                className="menu-toggle"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: isOpen ? '-12px' : '-12px',
                    width: '24px',
                    height: '24px',
                    background: 'var(--bg-card)',
                    border: '1px solid #334155',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                {isOpen ? <ChevronLeft size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
            </div>

            {isOpen ? (
                <>
                    {/* Header */}
                    <div className="sidebar-header" style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '16px'
                    }}>
                        Hosted Dataspaces
                    </div>

                    {/* Dataspace List */}
                    <div style={{ flex: 1, overflow: 'auto', marginBottom: '12px' }}>
                        {dataspaces.length === 0 ? (
                            <div style={{
                                padding: '24px 16px',
                                background: 'rgba(59, 130, 246, 0.05)',
                                border: '1px dashed #334155',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <Server size={28} style={{ color: '#475569', marginBottom: '8px' }} />
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    No dataspaces yet
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <AnimatePresence>
                                    {dataspaces.map((ds) => (
                                        <motion.div
                                            key={ds.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onClick={() => onSelectDataspace(ds.id)}
                                            className={`sidebar-item ${activeDataspaceId === ds.id ? 'active' : ''}`}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {/* Status Dot + Name */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#22c55e',
                                                    flexShrink: 0
                                                }} />
                                                <div className="sidebar-item-name" style={{
                                                    flex: 1,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {ds.name || `Dataspace ${ds.id.slice(-4)}`}
                                                </div>
                                                {!ds.isDemo && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDeleteDataspace(ds.id); }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#64748b',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            display: 'flex'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Code + Copy */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginBottom: '6px'
                                            }}>
                                                <code className="sidebar-item-code" style={{
                                                    fontSize: '0.9rem',
                                                    letterSpacing: '0.05em',
                                                    fontWeight: '600'
                                                }}>
                                                    {ds.code}
                                                </code>
                                                <button
                                                    onClick={(e) => copyCode(ds.code, e)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: copiedCode === ds.code ? '#22c55e' : '#64748b',
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        display: 'flex',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    title={copiedCode === ds.code ? 'Copied!' : 'Copy code'}
                                                >
                                                    {copiedCode === ds.code ? '✓' : <Copy size={12} />}
                                                </button>
                                            </div>

                                            {/* Participants */}
                                            <div className="sidebar-item-meta" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.7rem'
                                            }}>
                                                <Users size={12} />
                                                {ds.participants || 0} participants
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Host New Button */}
                        <button
                            onClick={onHostDataspace}
                            style={{
                                padding: '12px',
                                background: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}
                        >
                            <Plus size={18} />
                            Host New Dataspace
                        </button>

                        {/* Reset Demo Button */}
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            style={{
                                padding: '10px',
                                background: 'transparent',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '0.8rem'
                            }}
                        >
                            <RotateCcw size={14} />
                            Reset Demo
                        </button>
                    </div>
                </>
            ) : (
                /* Collapsed View */
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    marginTop: '40px'
                }}>
                    <div
                        onClick={onHostDataspace}
                        style={{
                            width: '40px',
                            height: '40px',
                            background: '#3b82f6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        title="Host New Dataspace"
                    >
                        <Plus size={20} color="white" />
                    </div>

                    {dataspaces.map((ds) => (
                        <div
                            key={ds.id}
                            onClick={() => onSelectDataspace(ds.id)}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: activeDataspaceId === ds.id ? 'rgba(59, 130, 246, 0.2)' : '#0f172a',
                                border: activeDataspaceId === ds.id ? '2px solid #3b82f6' : '1px solid #334155',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: '#93c5fd'
                            }}
                            title={`${ds.name || 'Dataspace'} (${ds.code})`}
                        >
                            {ds.code.slice(0, 2)}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default SideMenu;
