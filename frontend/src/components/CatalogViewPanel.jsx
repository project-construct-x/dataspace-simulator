import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ArrowLeft, FileText, Shield, FileCode,
    Download, Clock, Server, CheckCircle, AlertCircle
} from 'lucide-react';

/**
 * Catalog View Panel - Zeigt Assets eines spezifischen Providers
 * Wird nach "View Catalog" im Browse Dataspace Panel angezeigt
 */
const CatalogViewPanel = ({
    isOpen,
    onClose,
    onBack,
    provider,
    assets,
    isLoading,
    onRequestContract
}) => {
    const getTrustColor = (level) => {
        switch (level) {
            case 'High': return '#22c55e';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getPolicyColor = (policy) => {
        if (policy?.toLowerCase().includes('public')) return '#22c55e';
        if (policy?.toLowerCase().includes('partner')) return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        position: 'fixed',
                        top: 60,
                        right: 0,
                        bottom: 0,
                        width: '450px',
                        background: 'var(--bg-surface)',
                        borderLeft: '1px solid var(--border-color)',
                        zIndex: 510,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '-10px 0 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={onBack}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Catalog</h3>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{provider?.name}</div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Provider Info */}
                    {provider && (
                        <div style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'rgba(59, 130, 246, 0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Server size={16} color="#3b82f6" />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {provider.dspEndpoint || 'Endpoint not available'}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.65rem',
                                    fontWeight: '600',
                                    background: `${getTrustColor(provider.trustLevel)}22`,
                                    color: getTrustColor(provider.trustLevel),
                                    border: `1px solid ${getTrustColor(provider.trustLevel)}44`
                                }}>
                                    Trust: {provider.trustLevel}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Assets List */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontWeight: '600',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>Verfügbare Assets</span>
                            <span style={{ color: '#f97316' }}>{assets?.length || 0}</span>
                        </div>

                        {isLoading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#64748b'
                            }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    style={{ display: 'inline-block', marginBottom: '12px' }}
                                >
                                    <Clock size={32} />
                                </motion.div>
                                <div style={{ fontSize: '0.85rem' }}>Lade Catalog...</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#3b82f6' }}>
                                    Verbindung zu Control Plane
                                </div>
                            </div>
                        ) : assets && assets.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {assets.map((asset, index) => (
                                    <motion.div
                                        key={asset['@id'] || asset.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid #334155',
                                            borderRadius: '10px',
                                            padding: '14px',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Asset Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                background: 'rgba(249, 115, 22, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <FileText size={18} color="#f97316" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.9rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {asset.name || asset['@id'] || 'Unnamed Asset'}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    color: '#64748b',
                                                    fontFamily: 'monospace',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {asset['@id'] || asset.id}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {asset.description && (
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                marginBottom: '10px',
                                                lineHeight: '1.4'
                                            }}>
                                                {asset.description.substring(0, 100)}
                                                {asset.description.length > 100 && '...'}
                                            </div>
                                        )}

                                        {/* Metadata Tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                            {/* Format */}
                                            {asset.format && (
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.65rem',
                                                    background: 'rgba(139, 92, 246, 0.15)',
                                                    color: '#c4b5fd',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <FileCode size={10} />
                                                    {asset.format}
                                                </span>
                                            )}

                                            {/* Ontology */}
                                            {asset.ontology && (
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.65rem',
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    color: '#93c5fd'
                                                }}>
                                                    {asset.ontology}
                                                </span>
                                            )}

                                            {/* Policy */}
                                            {asset.policy && (
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.65rem',
                                                    background: `${getPolicyColor(asset.policy)}22`,
                                                    color: getPolicyColor(asset.policy),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Shield size={10} />
                                                    {asset.policy}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => onRequestContract(asset, provider)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Download size={14} />
                                            Vertrag anfragen
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#64748b',
                                fontSize: '0.85rem'
                            }}>
                                <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <div>No Assets available</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                    This provider has no published assets
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Footer */}
                    <div style={{
                        padding: '12px 20px',
                        borderTop: '1px solid var(--border-color)',
                        background: 'rgba(249, 115, 22, 0.05)',
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#f97316'
                        }} />
                        <span>Catalog Request - Control Plane zu Control Plane</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CatalogViewPanel;
