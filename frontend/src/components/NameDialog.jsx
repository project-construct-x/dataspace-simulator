import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import './Components.css';
import { PRESET_PARTICIPANTS } from './MacroView';

// Auto-generate a DID from a participant name
function generateDid(name) {
    if (!name) return '';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28);
    const suffix = Math.random().toString(36).slice(2, 5);
    return `did:web:${slug}-${suffix}.sim.local`;
}

// Match DOMAIN_OPTIONS from participant app (constants.js)
const INDUSTRY_OPTIONS = ['Construction', 'Manufacturing', 'Logistics', 'Energy', 'Automotive'];
const ROLE_OPTIONS = ['customer', 'contractor', 'supplier', 'manufacturer'];


const NameDialog = ({ isOpen, onClose, onConfirm, editMode = false, initialData = null, existingNodes = {} }) => {
    const [name, setName] = useState('');
    const [did, setDid] = useState('');
    const [industry, setIndustry] = useState('');
    const [orgRole, setOrgRole] = useState('');
    const [showPresets, setShowPresets] = useState(true);
    const [hoveredPreset, setHoveredPreset] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const d = editMode && initialData ? initialData : null;
            setName(d?.name || '');
            setDid(d?.bpn || d?.did || '');
            setIndustry(d?.metadata?.industry || '');
            setOrgRole(d?.metadata?.orgRole || '');
            setShowPresets(true);
            setHoveredPreset(null);
        }
    }, [isOpen, editMode, initialData]);

    // Auto-generate DID when name changes (create mode only)
    useEffect(() => {
        if (!editMode) {
            setDid(name.trim().length >= 3 ? generateDid(name.trim()) : '');
        }
    }, [name, editMode]);

    const existingDids = Object.values(existingNodes).map(n => n.bpn || n.did);
    const availablePresets = Object.entries(PRESET_PARTICIPANTS).filter(
        ([, p]) => !existingDids.includes(p.bpn)
    );

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !did.trim()) return;
        onConfirm({
            name: name.trim(),
            bpn: did.trim(),  // 'bpn' key kept for backward compat with the rest of the app
            metadata: { industry: industry.trim(), orgRole: orgRole.trim() },
        });
        setName(''); setDid(''); setIndustry(''); setOrgRole('');
    };

    const handleClose = () => { setName(''); setDid(''); setIndustry(''); setOrgRole(''); onClose(); };

    const inputStyle = {
        width: '100%', padding: '9px 12px', background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)', borderRadius: '8px',
        color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box'
    };
    const selectStyle = { ...inputStyle, cursor: 'pointer' };
    const labelStyle = {
        display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem',
        marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em'
    };
    const fmt = (v) => {
        if (!v) return 'n/a';
        return String(v).charAt(0).toUpperCase() + String(v).slice(1);
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-content" style={{ width: '460px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{editMode ? 'Edit Participant' : 'Add Participant'}</h3>
                    <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ overflow: 'auto', flex: 1, paddingRight: '2px' }}>
                    {/* Quick Select Presets */}
                    {!editMode && availablePresets.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Select</span>
                                <button type="button" onClick={() => setShowPresets(v => !v)}
                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem' }}>
                                    {showPresets ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showPresets && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                                        {availablePresets.map(([key, preset]) => {
                                            const isHovered = hoveredPreset?.bpn === preset.bpn;
                                            return (
                                                <button key={key} type="button"
                                                    onClick={() => { onConfirm(preset); setName(''); setDid(''); setIndustry(''); setOrgRole(''); }}
                                                    onMouseEnter={() => setHoveredPreset(preset)}
                                                    onMouseLeave={() => setHoveredPreset(null)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        background: isHovered ? 'rgba(34,197,94,0.22)' : 'rgba(34,197,94,0.12)',
                                                        border: '1px solid rgba(34,197,94,0.35)',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'background 120ms ease'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Building2 size={15} color="#22c55e" />
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{preset.name}</div>
                                                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{preset.location}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {hoveredPreset && (
                                        <div style={{
                                            marginBottom: '16px',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)',
                                            background: 'var(--bg-surface)',
                                            fontSize: '0.76rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Preview Credentials</div>
                                            <div>Industry: <strong>{fmt(hoveredPreset.metadata?.industry)}</strong></div>
                                            <div>Org. Role: <strong>{fmt(hoveredPreset.metadata?.orgRole)}</strong></div>
                                            <div>DID: <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{hoveredPreset.bpn}</span></div>
                                            <div>Capabilities: <strong>{hoveredPreset.roles?.provider ? 'Provider' : ''}{hoveredPreset.roles?.provider && hoveredPreset.roles?.consumer ? ' + ' : ''}{hoveredPreset.roles?.consumer ? 'Consumer' : ''}</strong></div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '-10px', background: 'var(--bg-card)', padding: '0 12px', color: '#64748b', fontSize: '0.75rem' }}>
                                    or enter manually
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Name */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Participant Name *</label>
                        <input type="text" value={name} autoFocus onChange={e => setName(e.target.value)}
                            placeholder="e.g. Bergstein Bau GmbH" style={inputStyle} />
                    </div>

                    {/* DID */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                            <span>DID (auto-generated)</span>
                            {!editMode && <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.7rem', textTransform: 'none' }}>editable</span>}
                        </label>
                        <input type="text" value={did} onChange={e => setDid(e.target.value.toLowerCase())} placeholder="did:web:…"
                            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem', color: did ? 'var(--text-secondary)' : 'var(--text-muted)' }} />
                        {!editMode && name.trim().length >= 3 && (
                            <button type="button" onClick={() => setDid(generateDid(name.trim()))}
                                style={{ marginTop: '4px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}>
                                ↻ Regenerate
                            </button>
                        )}
                    </div>

                    {/* Credentials — evaluated by the policy engine */}
                    <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                            Credentials <span style={{ color: '#475569', fontWeight: 400 }}>— used for policy evaluation</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={labelStyle}>Industry</label>
                                <select value={industry} onChange={e => setIndustry(e.target.value)} style={selectStyle}>
                                    <option value="">— any —</option>
                                    {INDUSTRY_OPTIONS.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Org. Role</label>
                                <select value={orgRole} onChange={e => setOrgRole(e.target.value)} style={selectStyle}>
                                    <option value="">— any —</option>
                                    {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="dialog-actions" style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button type="button" onClick={handleClose} className="dialog-btn cancel">Cancel</button>
                        <button type="submit" className="dialog-btn confirm"
                            disabled={!name.trim() || !did.trim()}
                            style={{ opacity: (!name.trim() || !did.trim()) ? 0.5 : 1 }}>
                            {editMode ? 'Save' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NameDialog;
