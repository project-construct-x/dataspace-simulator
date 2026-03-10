/**
 * state-machine.js — Negotiation and Transfer state machine for local simulator
 *
 * Uses node IDs (canvas node identifiers) instead of network BPNs.
 * All state is persisted in SQLite via db.js.
 *
 * Negotiation states: REQUESTED → OFFERED → AGREED | TERMINATED
 * Transfer states:    STARTED → COMPLETED | TERMINATED
 *
 * AUTO_ACCEPT_NEGOTIATIONS=true (default): negotiations resolve automatically.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { evaluatePolicyAgainstClaims } = require('./policy');

const AUTO_ACCEPT = process.env.AUTO_ACCEPT_NEGOTIATIONS !== 'false';
const DELAY_MS = 1200;

/**
 * Start a negotiation between two nodes for an asset.
 * Runs policy check immediately. If blocked → status = TERMINATED.
 */
function initiateNegotiation({ consumerNodeId, providerNodeId, assetId }) {
    const asset = db.getAsset(assetId);
    if (!asset) return { error: 'Asset not found' };

    const consumer = db.getNode(consumerNodeId);
    const consumerClaims = consumer?.metadata || {};

    let status = 'REQUESTED';
    let denialReason = null;

    if (asset.policy_id) {
        const policy = db.getPolicy(asset.policy_id);
        if (policy) {
            const result = evaluatePolicyAgainstClaims(policy, consumerClaims);
            if (!result.allowed) {
                status = 'TERMINATED';
                denialReason = result.reason;
            }
        }
    }

    const now = new Date().toISOString();
    const negotiationId = uuidv4();

    db.insertNegotiation({
        negotiation_id: negotiationId,
        consumer_node_id: consumerNodeId,
        provider_node_id: providerNodeId,
        asset_id: assetId,
        policy_id: asset.policy_id || '',
        status,
        denial_reason: denialReason,
        created_at: now,
        updated_at: now,
    });

    if (status !== 'TERMINATED' && AUTO_ACCEPT) {
        // Simulate async provider response: REQUESTED → OFFERED → AGREED
        setTimeout(() => {
            const ts = new Date().toISOString();
            db.updateNegotiationStatus(negotiationId, 'OFFERED', null, ts);
            setTimeout(() => {
                db.updateNegotiationStatus(negotiationId, 'AGREED', null, new Date().toISOString());
            }, DELAY_MS);
        }, DELAY_MS);
    }

    return { negotiationId, status, denialReason };
}

/**
 * Manual advance (when AUTO_ACCEPT is off or for demo UI control).
 * action: 'accept' | 'reject'
 */
function advanceNegotiation(negotiationId, action) {
    const neg = db.getNegotiation(negotiationId);
    if (!neg) return { error: 'Not found' };
    if (neg.status === 'AGREED' || neg.status === 'TERMINATED') {
        return { error: `Cannot advance from ${neg.status}` };
    }

    const ts = new Date().toISOString();
    if (action === 'reject') {
        db.updateNegotiationStatus(negotiationId, 'TERMINATED', 'Rejected by provider', ts);
        return { status: 'TERMINATED' };
    }

    const next = neg.status === 'REQUESTED' ? 'OFFERED' : 'AGREED';
    db.updateNegotiationStatus(negotiationId, next, null, ts);
    return { status: next };
}

/**
 * Initiate a transfer. Requires negotiation to be in AGREED state.
 * "Transfer" in the simulator: copies asset record to receiver's received_data.
 */
function initiateTransfer({ negotiationId, consumerNodeId }) {
    const neg = db.getNegotiation(negotiationId);
    if (!neg) return { error: 'Negotiation not found' };
    if (neg.status !== 'AGREED') return { error: `Transfer requires AGREED, current: ${neg.status}` };
    if (neg.consumer_node_id !== consumerNodeId) return { error: 'Node ID mismatch' };

    const asset = db.getAsset(neg.asset_id);
    if (!asset) return { error: 'Asset not found' };

    const now = new Date().toISOString();
    const transferId = uuidv4();

    db.insertTransfer({
        transfer_id: transferId,
        negotiation_id: negotiationId,
        consumer_node_id: consumerNodeId,
        provider_node_id: neg.provider_node_id,
        asset_id: neg.asset_id,
        status: 'STARTED',
        created_at: now,
        updated_at: now,
    });

    // Copy asset into consumer's received store
    db.insertReceivedData({
        record_id: uuidv4(),
        receiver_node_id: consumerNodeId,
        provider_node_id: neg.provider_node_id,
        asset_id: neg.asset_id,
        asset_name: asset.name,
        asset_content: asset.asset_content || '',
        transfer_id: transferId,
        received_at: now,
    });

    db.updateTransferStatus(transferId, 'COMPLETED', new Date().toISOString());

    return { transferId, status: 'COMPLETED' };
}

module.exports = { initiateNegotiation, advanceNegotiation, initiateTransfer };
