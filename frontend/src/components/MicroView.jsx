import React from 'react';
import { motion } from 'framer-motion';
import { X, Database, FileText, Play, Activity } from 'lucide-react';
import './Components.css';

const MicroView = ({ connectorId, onClose, onAction, logs = [], catalog = [], simulationState }) => {
    const isConsumer = connectorId === 'alice';
    const isProvider = connectorId === 'bob' || connectorId === 'charlie';
    const name = connectorId.charAt(0).toUpperCase() + connectorId.slice(1);
    const role = isConsumer ? 'Consumer' : 'Provider';

    // Animation States
    const isBroadcasting = simulationState === 'broadcasting';
    const isNegotiating = simulationState === 'negotiating';
    const isTransferring = simulationState === 'transferring';

    return (
        <div className="micro-view-overlay">
            <div className="blueprint-container">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 100 }}
                >
                    <X size={32} />
                </button>

                {/* 1. Dataspace Arc (Left) */}
                <div className="blueprint-dataspace-arc">
                    <div className="blueprint-dataspace-label">DATASPACE</div>
                </div>

                {/* 2. Connector Stack (Center Left) */}
                <div className="blueprint-connector">
                    <div className="connector-title">Connector (Software Stack)</div>

                    {/* Control Plane */}
                    <div className={`plane-box control ${isBroadcasting || isNegotiating ? 'active' : ''}`}>
                        <span className="plane-label" style={{ color: '#3b82f6' }}>Control Plane</span>
                        <span className="plane-sub" style={{ color: '#94a3b8' }}>Metadata & Identity</span>
                        {(isBroadcasting || isNegotiating) && (
                            <motion.div
                                style={{ position: 'absolute', right: '10px', top: '10px' }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Activity size={16} color="#3b82f6" />
                            </motion.div>
                        )}
                    </div>

                    {/* Data Plane */}
                    <div className={`plane-box data ${isTransferring ? 'active' : ''}`}>
                        <span className="plane-label" style={{ color: '#f97316' }}>Data Plane</span>
                        <span className="plane-sub" style={{ color: '#94a3b8' }}>Payload Transfer</span>
                        {isTransferring && (
                            <motion.div
                                style={{ position: 'absolute', right: '10px', top: '10px' }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                <Database size={16} color="#f97316" />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* 3. Participant App (Top Right) */}
                <div className="blueprint-app">
                    <div className="app-header">
                        {name}: {role}
                    </div>

                    <div className="app-actions">
                        {isConsumer && (
                            <>
                                <button className="app-btn primary" onClick={() => onAction('browse_catalog')}>
                                    <FileText size={18} /> Browse Catalog
                                </button>

                                {/* Catalog List */}
                                {catalog.length > 0 && (
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem' }}>
                                        {catalog.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#cbd5e1' }}>{item['name'] || 'Asset'}</span>
                                                <button
                                                    style={{ background: '#10b981', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer', fontSize: '0.7rem' }}
                                                    onClick={() => onAction('request_transfer', item)}
                                                >
                                                    Get
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {isProvider && (
                            <div style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                                Passive Provider Node
                            </div>
                        )}
                    </div>

                    <div className="log-window">
                        {logs.length === 0 && <span style={{ opacity: 0.5 }}>System Ready...</span>}
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>

                {/* 4. Data Storage (Bottom Right) */}
                <div className="blueprint-storage">
                    <div className="storage-title">Data Storage</div>
                    <Database size={48} color="#64748b" style={{ opacity: 0.5 }} />

                    <div className="data-grid">
                        {/* Resting Data Points */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="data-point" />
                        ))}

                        {/* Incoming/Outgoing Animation */}
                        {isTransferring && (
                            <motion.div
                                className="data-point"
                                style={{ background: '#fff', boxShadow: '0 0 15px #fff' }}
                                initial={{ opacity: 0, y: isConsumer ? 50 : 0 }}
                                animate={{ opacity: [0, 1, 1, 0], y: isConsumer ? 0 : 50 }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                    </div>
                </div>

                {/* 5. SVG Connections Layer */}
                <svg className="cables-layer" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="grad-control" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                        </linearGradient>
                    </defs>

                    {/* App to Connector (Control) */}
                    <path
                        d="M 1400 200 C 1200 200, 800 400, 600 450"
                        className={`cable control ${isBroadcasting || isNegotiating ? 'active' : ''}`}
                        stroke="url(#grad-control)"
                    />

                    {/* Storage to Connector (Data) */}
                    <path
                        d="M 1400 800 C 1200 800, 800 600, 600 550"
                        className={`cable data ${isTransferring ? 'active' : ''}`}
                    />

                    {/* Connector to Dataspace (Left) */}
                    <path
                        d="M 300 450 L 100 450"
                        className={`cable control ${isBroadcasting || isNegotiating ? 'active' : ''}`}
                    />
                    <path
                        d="M 300 550 L 100 550"
                        className={`cable data ${isTransferring ? 'active' : ''}`}
                    />

                    {/* Animated Pulses */}
                    {(isBroadcasting || isNegotiating) && (
                        <motion.circle r="4" fill="#fff">
                            <animateMotion
                                dur="1s"
                                repeatCount="indefinite"
                                path="M 1400 200 C 1200 200, 800 400, 600 450"
                            />
                        </motion.circle>
                    )}

                    {isTransferring && (
                        <motion.circle r="6" fill="#fff">
                            <animateMotion
                                dur="0.5s"
                                repeatCount="indefinite"
                                path={isConsumer ? "M 600 550 C 800 600, 1200 800, 1400 800" : "M 1400 800 C 1200 800, 800 600, 600 550"}
                            />
                        </motion.circle>
                    )}

                </svg>

            </div>
        </div>
    );
};

export default MicroView;
