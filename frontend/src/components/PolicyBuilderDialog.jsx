import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Globe, Users, Factory, Briefcase, CheckCircle, Edit3, Save } from 'lucide-react';

const API_BASE = '/api';

const SYS_IDS = ['sys-open', 'sys-did-group', 'sys-industry', 'sys-role'];

const POLICY_META = {
    'sys-open': { icon: Globe, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', desc: 'No restrictions — every participant can access this asset.' },
    'sys-did-group': { icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', desc: 'Only specific DIDs may access. Edit the DID list below.' },
    'sys-industry': { icon: Factory, color: '#f97316', bg: 'rgba(249,115,22,0.12)', desc: 'Restricted by industry sector (comma-separated, any match).' },
    'sys-role': { icon: Briefcase, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', desc: 'Restricted by organisational role (comma-separated, any match).' },
};

const CONSTRAINT_LABELS = {
    'cx-policy:consumerDid': 'DID(s)',
    'cx-policy:industry': 'Industry/Sector(s)',
    'cx-policy:orgRole': 'Role(s)',
    'cx-policy:consumerBpn': 'DID(s)',
};

// ── small inline editor for a comma-separated value ───────────────
function ConstraintEditor({ label, value, onSave }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const save = () => { onSave(draft.trim()); setEditing(false); };

    return (
        <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
            </div>
            {editing ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                        autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                        placeholder="comma-separated values"
                        style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-surface)', border: '1px solid #3b82f6', borderRadius: '7px', color: 'var(--text-primary)', fontSize: '0.83rem', outline: 'none' }}
                    />
                    <button onClick={save} style={{ padding: '6px 11px', background: '#3b82f6', border: 'none', borderRadius: '7px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <Save size={13} /> Save
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => { setDraft(value); setEditing(true); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-surface)', border: '1px solid #1e293b', borderRadius: '7px', cursor: 'pointer' }}
                >
                    <span style={{ fontSize: '0.84rem', color: value ? 'var(--text-primary)' : '#475569', fontStyle: value ? 'normal' : 'italic' }}>
                        {value || 'click to set…'}
                    </span>
                    <Edit3 size={13} color="#64748b" />
                </div>
            )}
            {value && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {value.split(',').map(v => v.trim()).filter(Boolean).map(v => (
                        <span key={v} style={{ padding: '2px 8px', borderRadius: '100px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: '0.75rem' }}>{v}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── policy card ────────────────────────────────────────────────────
function PolicyCard({ policy, onUpdateConstraint }) {
    const meta = POLICY_META[policy.policy_id] || { icon: ShieldCheck, color: '#64748b', bg: 'rgba(100,116,139,0.1)', desc: '' };
    const Icon = meta.icon;
    const constraints = Array.isArray(policy.constraints) ? policy.constraints : [];
    const isOpen = policy.policy_id === 'sys-open';

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: meta.bg, border: `1px solid ${meta.color}33`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={meta.color} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{policy.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>{meta.desc}</div>
                </div>
            </div>

            {isOpen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#22c55e', fontSize: '0.8rem' }}>
                    <CheckCircle size={14} /> Unrestricted access for all participants
                </div>
            )}

            {!isOpen && constraints.map((c, i) => {
                const label = CONSTRAINT_LABELS[c.key] || c.key;
                return (
                    <ConstraintEditor
                        key={i} label={label} value={c.value}
                        onSave={newVal => onUpdateConstraint(policy.policy_id, i, newVal)}
                    />
                );
            })}
        </motion.div>
    );
}

// ── main dialog ────────────────────────────────────────────────────
const PolicyBuilderDialog = ({ isOpen, onClose }) => {
    const [policies, setPolicies] = useState([]);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const r = await fetch(`${API_BASE}/policies`);
            const d = await r.json();
            // Show system policies first, in fixed order
            const sys = SYS_IDS.map(id => d.find(p => p.policy_id === id)).filter(Boolean);
            const rest = d.filter(p => !SYS_IDS.includes(p.policy_id));
            setPolicies([...sys, ...rest]);
        } catch { /* ignore */ }
    };

    useEffect(() => { if (isOpen) load(); }, [isOpen]);

    const handleUpdateConstraint = async (policyId, constraintIdx, newValue) => {
        const pol = policies.find(p => p.policy_id === policyId);
        if (!pol) return;
        const updated = { ...pol, constraints: pol.constraints.map((c, i) => i === constraintIdx ? { ...c, value: newValue } : c) };
        setSaving(true);
        try {
            await fetch(`${API_BASE}/policies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policyId: pol.policy_id, name: pol.name, constraintOperand: pol.constraint_operand, constraints: updated.constraints }),
            });
            await load();
        } finally { setSaving(false); }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onMouseDown={onClose}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}
            >
                <motion.div
                    initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                    onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
                    style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '26px', width: '500px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={20} color="#818cf8" />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>Access Policies</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>4 predefined templates — click a value to configure</div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                    </div>

                    {policies.filter(p => SYS_IDS.includes(p.policy_id)).map(p => (
                        <PolicyCard key={p.policy_id} policy={p} onUpdateConstraint={handleUpdateConstraint} />
                    ))}

                    {saving && (
                        <div style={{ textAlign: 'center', padding: '6px', color: '#64748b', fontSize: '0.78rem' }}>Saving…</div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PolicyBuilderDialog;
