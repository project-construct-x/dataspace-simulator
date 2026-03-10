import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const INDUSTRY_OPTIONS = ['construction', 'manufacturing', 'logistics', 'energy', 'automotive'];
const ROLE_OPTIONS = ['customer', 'contractor', 'supplier', 'manufacturer'];

const EditParticipantDialog = ({ show, participantData, name, bpn, onSave, onCancel }) => {
    const [industry, setIndustry] = useState('');
    const [orgRole, setOrgRole] = useState('');

    useEffect(() => {
        if (!show) return;
        setIndustry(participantData?.industry || participantData?.metadata?.industry || '');
        setOrgRole(participantData?.orgRole || participantData?.metadata?.orgRole || '');
    }, [show, participantData]);

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
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
                zIndex: 1000,
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onWheel={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    width: '460px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Edit Credentials</h3>
                    <button
                        onClick={onCancel}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Name</label>
                        <input
                            value={name || ''}
                            readOnly
                            style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>DID</label>
                        <input
                            value={bpn || ''}
                            readOnly
                            style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'monospace', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Industry</label>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                            >
                                <option value="">-- any --</option>
                                {INDUSTRY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Org. Role</label>
                            <select
                                value={orgRole}
                                onChange={(e) => setOrgRole(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                            >
                                <option value="">-- any --</option>
                                {ROLE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                        onClick={onCancel}
                        style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ industry, orgRole })}
                        style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        Save
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EditParticipantDialog;
