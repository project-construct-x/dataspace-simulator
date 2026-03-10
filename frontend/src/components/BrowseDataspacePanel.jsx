import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, MapPin, Building2, FileCode, Tag, Shield,
    ChevronDown, ChevronUp, Eye, Server, Sparkles, AlertCircle,
    ArrowRight
} from 'lucide-react';

const API_BASE = '/api';
const ONTOLOGY_OPTIONS = ['IFC', 'BOT', 'BRICK', 'RealEstateCore', 'SAREF'];
const DOMAIN_OPTIONS = ['Construction', 'Manufacturing', 'Logistics', 'Energy', 'Automotive'];
const TRUST_LEVELS = ['Low', 'Medium', 'High'];

const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
};

/**
 * BrowseDataspacePanel
 * Two tabs:
 *  - Filter: browse providers by structured criteria
 *  - Semantic Search: full-text / SPARQL semantic asset search across all nodes
 */
const BrowseDataspacePanel = ({
    isOpen,
    onClose,
    allNodes,
    currentNodeId,
    onSearchProviders,
    onViewCatalog,
    searchResults,
    isSearching
}) => {
    // ── Tab ─────────────────────────────────────────────────────────
    const [tab, setTab] = useState('browse');

    // ── Browse filters ───────────────────────────────────────────────
    const [filters, setFilters] = useState({
        location: '', domain: '', ontologies: [], tags: '', trustLevel: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ── Semantic search ──────────────────────────────────────────────
    const [semanticQuery, setSemanticQuery] = useState('');
    const [semanticResults, setSemanticResults] = useState(null);
    const [semanticLoading, setSemanticLoading] = useState(false);
    const [semanticError, setSemanticError] = useState(null);
    const [sparqlQuery, setSparqlQuery] = useState('');
    const [showSparql, setShowSparql] = useState(false);
    const [expandedResult, setExpandedResult] = useState(null);

    // ── Filter helpers ────────────────────────────────────────────────
    const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const toggleOntology = (ont) => setFilters(prev => ({
        ...prev, ontologies: prev.ontologies.includes(ont)
            ? prev.ontologies.filter(o => o !== ont)
            : [...prev.ontologies, ont]
    }));
    const handleSearch = () => {
        const processedFilters = {
            ...filters,
            tags: filters.tags ? filters.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            roles: { provider: true }
        };
        onSearchProviders(processedFilters);
    };
    const clearFilters = () => setFilters({ location: '', domain: '', ontologies: [], tags: '', trustLevel: '' });

    const chipStyle = (isActive) => ({
        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', cursor: 'pointer',
        border: '1px solid', borderColor: isActive ? '#3b82f6' : '#334155',
        background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
        color: isActive ? '#93c5fd' : '#94a3b8', transition: 'all 0.2s'
    });

    const getTrustColor = (level) => {
        switch (level) {
            case 'High': return '#22c55e';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#ef4444';
            default: return '#64748b';
        }
    };

    // ── Semantic search handler ───────────────────────────────────────
    const handleSemanticSearch = async () => {
        if (!semanticQuery.trim()) return;
        setSemanticLoading(true);
        setSemanticError(null);
        setSemanticResults(null);
        setSparqlQuery('');
        try {
            const providerNodeIds = Object.entries(allNodes || {})
                .filter(([id, n]) => id !== currentNodeId && n?.roles?.provider)
                .map(([id]) => id);
            const res = await fetch(`${API_BASE}/semantic/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchText: semanticQuery, consumerNodeId: currentNodeId, providerNodeIds, limit: 30 })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.details || 'Semantic search failed');
            const all = Array.isArray(data.results) ? data.results : [];
            const ownNode = allNodes[currentNodeId] || {};
            const ownBpn = (ownNode.bpn || '').toLowerCase();
            const filtered = all.filter((r) => {
                const publisherNodeId = String(r.publisherNodeId || '').toLowerCase();
                const publisherBpn = String(r.publisherBpn || '').toLowerCase();
                return publisherNodeId !== String(currentNodeId || '').toLowerCase() && (!ownBpn || publisherBpn !== ownBpn);
            });
            setSemanticResults(filtered);
            setSparqlQuery(data.generatedQuery || '');
        } catch (err) {
            setSemanticError(err.message || 'Search failed');
        } finally {
            setSemanticLoading(false);
        }
    };

    const TabBtn = ({ id, icon: Icon, label }) => (
        <button onClick={() => setTab(id)} style={{
            flex: 1, padding: '8px 6px', border: 'none', cursor: 'pointer',
            borderRadius: '7px', fontSize: '0.8rem', fontWeight: tab === id ? 600 : 400,
            background: tab === id
                ? (id === 'semantic' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)')
                : 'transparent',
            color: tab === id ? (id === 'semantic' ? '#c4b5fd' : '#93c5fd') : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center',
            transition: 'all 0.15s'
        }}>
            <Icon size={13} /> {label}
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        position: 'fixed', top: 60, right: 0, bottom: 0, width: '420px',
                        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)',
                        zIndex: 500, display: 'flex', flexDirection: 'column',
                        boxShadow: '-10px 0 30px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Search size={20} color="#3b82f6" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Browse Dataspace</h3>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', borderRadius: '9px', padding: '4px' }}>
                            <TabBtn id="browse" icon={Search} label="Browse Providers" />
                            <TabBtn id="semantic" icon={Sparkles} label="Semantic Search" />
                        </div>
                    </div>

                    {/* ── BROWSE TAB ── */}
                    {tab === 'browse' && (
                        <>
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', overflowY: 'auto', maxHeight: '55%' }}>
                                {/* Location */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <MapPin size={14} /> Location
                                    </label>
                                    <input type="text" value={filters.location} onChange={e => updateFilter('location', e.target.value)} placeholder="e.g. Munich, Germany" style={inputStyle} />
                                </div>
                                {/* Domain */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <Building2 size={14} /> Domain
                                    </label>
                                    <select value={filters.domain} onChange={e => updateFilter('domain', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">All Domains</option>
                                        {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                {/* Advanced toggle */}
                                <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
                                    width: '100%', padding: '8px', background: 'transparent',
                                    border: '1px solid #334155', borderRadius: '6px', color: 'var(--text-muted)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '6px', fontSize: '0.8rem', marginBottom: '12px'
                                }}>
                                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {showAdvanced ? 'Less Filters' : 'Advanced Filters'}
                                </button>

                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            {/* Ontologies */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                                                    <FileCode size={14} /> Ontologies
                                                </label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {ONTOLOGY_OPTIONS.map(ont => (
                                                        <span key={ont} onClick={() => toggleOntology(ont)} style={chipStyle(filters.ontologies.includes(ont))}>{ont}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Tags */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                                    <Tag size={14} /> Tags
                                                </label>
                                                <input type="text" value={filters.tags} onChange={e => updateFilter('tags', e.target.value)} placeholder="e.g. BIM, IFC" style={inputStyle} />
                                            </div>
                                            {/* Trust Level */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                                                    <Shield size={14} /> Trust-Level
                                                </label>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => updateFilter('trustLevel', '')} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid', borderColor: !filters.trustLevel ? '#3b82f6' : '#334155', background: !filters.trustLevel ? 'rgba(59,130,246,0.2)' : 'transparent', color: !filters.trustLevel ? '#93c5fd' : '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}>All</button>
                                                    {TRUST_LEVELS.map(level => (
                                                        <button key={level} onClick={() => updateFilter('trustLevel', level)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid', borderColor: filters.trustLevel === level ? getTrustColor(level) : '#334155', background: filters.trustLevel === level ? `${getTrustColor(level)}33` : 'transparent', color: filters.trustLevel === level ? getTrustColor(level) : '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}>{level}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={clearFilters} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Reset</button>
                                    <button onClick={handleSearch} disabled={isSearching} style={{ flex: 1, padding: '10px 16px', background: isSearching ? '#1e40af' : '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', cursor: isSearching ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Search size={16} />
                                        {isSearching ? 'Searching...' : 'Search Providers'}
                                    </button>
                                </div>
                            </div>

                            {/* Browse results */}
                            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Found Providers</span>
                                    <span style={{ color: '#3b82f6' }}>{searchResults?.length || 0}</span>
                                </div>
                                {searchResults && searchResults.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {searchResults.map(provider => (
                                            <motion.div key={provider.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{provider.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{provider.bpn}</div>
                                                    </div>
                                                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '600', background: `${getTrustColor(provider.trustLevel)}22`, color: getTrustColor(provider.trustLevel), border: `1px solid ${getTrustColor(provider.trustLevel)}44` }}>{provider.trustLevel}</span>
                                                </div>
                                                {provider.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}><MapPin size={12} />{provider.location}</div>}
                                                {provider.domain && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}><Building2 size={12} />{provider.domain}</div>}
                                                <button onClick={() => onViewCatalog(provider)} style={{ width: '100%', padding: '8px', background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', borderRadius: '6px', color: '#93c5fd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    <Eye size={14} /> View Catalog
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : searchResults ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                                        <Server size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <div>No Providers found</div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                                        <Search size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <div>Use the filters above and click "Search Providers"</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ── SEMANTIC SEARCH TAB ── */}
                    {tab === 'semantic' && (
                        <>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        value={semanticQuery}
                                        onChange={e => setSemanticQuery(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSemanticSearch(); }}
                                        placeholder="e.g. concrete delivery data, BIM models Germany..."
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                    <button
                                        onClick={handleSemanticSearch}
                                        disabled={semanticLoading || !semanticQuery.trim()}
                                        style={{ padding: '8px 14px', background: semanticLoading ? '#5b21b6' : '#7c3aed', border: 'none', borderRadius: '6px', color: 'white', cursor: semanticLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                                    >
                                        <Sparkles size={14} />
                                        {semanticLoading ? '…' : 'Search'}
                                    </button>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                                    Searches all assets across the dataspace via SPARQL / Fuseki.
                                </p>
                            </div>

                            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                                {semanticError && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '14px', color: '#ef4444', fontSize: '0.82rem' }}>
                                        <AlertCircle size={14} /> {semanticError}
                                    </div>
                                )}

                                {sparqlQuery && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <button onClick={() => setShowSparql(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: 0, fontSize: '0.75rem', fontWeight: 500, marginBottom: showSparql ? '8px' : 0 }}>
                                            {showSparql ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Generated SPARQL Query
                                        </button>
                                        {showSparql && (
                                            <pre style={{ background: 'var(--bg-card)', border: '1px solid #334155', borderRadius: '6px', padding: '10px', fontSize: '0.7rem', color: '#c4b5fd', overflowX: 'auto', margin: 0 }}>{sparqlQuery}</pre>
                                        )}
                                    </div>
                                )}

                                {semanticResults === null && !semanticLoading && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                        <Sparkles size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <div style={{ fontSize: '0.85rem' }}>Enter a query to discover assets</div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '6px' }}>Natural language or keywords</div>
                                    </div>
                                )}

                                {semanticResults !== null && semanticResults.length === 0 && !semanticLoading && !semanticError && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                                        <Search size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                        <div>No matching assets found</div>
                                    </div>
                                )}

                                {semanticResults && semanticResults.length > 0 && (
                                    <>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Results</span>
                                            <span style={{ color: '#7c3aed' }}>{semanticResults.length}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {semanticResults.map((result, i) => {
                                                const key = result.datasetId || `r${i}`;
                                                const isExpanded = expandedResult === key;
                                                return (
                                                    <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ background: 'var(--bg-card)', border: `1px solid ${isExpanded ? '#7c3aed' : '#334155'}`, borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div onClick={() => setExpandedResult(isExpanded ? null : key)} style={{ padding: '12px', cursor: 'pointer' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', flex: 1, paddingRight: '8px' }}>{result.title || result.datasetId}</div>
                                                                {result.policyName && (
                                                                    <span style={{ padding: '2px 7px', borderRadius: '8px', fontSize: '0.63rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', whiteSpace: 'nowrap' }}>{result.policyName}</span>
                                                                )}
                                                            </div>
                                                            {result.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{result.description.substring(0, 80)}{result.description.length > 80 ? '…' : ''}</div>}
                                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>by {result.publisherName || result.publisherNodeId || 'Unknown'}</div>
                                                        </div>
                                                        {isExpanded && (
                                                            <div style={{ borderTop: '1px solid #334155', padding: '12px', background: 'rgba(124,58,237,0.05)' }}>
                                                                {result.keywords && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Keywords:</strong> {result.keywords}</div>}
                                                                {result.themes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Themes:</strong> {result.themes}</div>}
                                                                {result.spatial && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Region:</strong> {Array.isArray(result.spatial) ? result.spatial.join(', ') : result.spatial}</div>}
                                                                {result.temporalCoverage && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}><strong>Period:</strong> {result.temporalCoverage}</div>}
                                                                <button
                                                                    onClick={() => {
                                                                        const providerId = result.publisherNodeId || result.publisherBpn;
                                                                        if (!providerId) return;
                                                                        onViewCatalog({ id: providerId, bpn: result.publisherBpn || providerId, name: result.publisherName || providerId });
                                                                    }}
                                                                    style={{ width: '100%', padding: '8px', background: 'rgba(124,58,237,0.2)', border: '1px solid #7c3aed', borderRadius: '6px', color: '#c4b5fd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                                >
                                                                    <ArrowRight size={13} /> View Provider Catalog
                                                                </button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-color)', background: tab === 'semantic' ? 'rgba(124,58,237,0.05)' : 'rgba(59,130,246,0.05)', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tab === 'semantic' ? '#7c3aed' : '#3b82f6' }} />
                        <span>{tab === 'semantic' ? 'Fuseki SPARQL – searches across all published assets' : 'Discovery – connector metadata only, no assets'}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BrowseDataspacePanel;
