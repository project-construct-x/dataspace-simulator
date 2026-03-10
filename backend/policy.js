/**
 * policy.js — Policy constraint evaluator for the Dataspace Simulator
 *
 * Evaluates ODRL-style policy constraints against participant claims.
 * This module is designed to be directly portable to the real EDC participant app.
 *
 * Supported claim keys:
 *   cx-policy:orgRole       e.g. "contractor", "manufacturer"
 *   cx-policy:industry      e.g. "construction", "automotive"
 *   cx-policy:consumerBpn   the consumer's BPN (exact match)
 *   cx-policy:consumerDid   the consumer's DID
 *   Any other key           looked up directly in claims object
 *
 * Supported operators:
 *   Equals   (default) — claim must contain the single expected value
 *   In       — claim must contain at least one value from the expected list
 *
 * Policy operand (for multiple constraints):
 *   And (default) — all constraints must pass
 *   Or  — at least one constraint must pass
 */

function normalizeList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
    return String(value).split(',').map(v => v.trim()).filter(Boolean);
}

function normalizeLower(value) {
    return String(value || '').toLowerCase().trim();
}

/**
 * Resolve the claim values for a given policy key from the consumer's claims object.
 */
function getClaimValuesForKey(claims, key) {
    if (!claims || !key) return [];

    switch (key) {
        case 'cx-policy:orgRole':
            return normalizeList(claims.orgRole);
        case 'cx-policy:industry':
            return normalizeList(claims.industry || claims.industries);
        case 'cx-policy:consumerBpn':
            return normalizeList(claims.bpn);
        case 'cx-policy:consumerDid':
            // DID may be stored as `did` or as `bpn` (simulator stores DID in bpn field)
            return normalizeList(claims.did || claims.bpn);

        default:
            return normalizeList(claims[key]);
    }
}

/**
 * Evaluate a single constraint against consumer claims.
 * Returns { matched: boolean, reason?: string }
 */
function evaluateConstraint(constraint, claims) {
    const key = constraint?.key;
    const operator = constraint?.operator || 'Equals';
    const expectedRaw = constraint?.value;

    const claimValues = getClaimValuesForKey(claims, key);
    const expectedValues = operator === 'In'
        ? normalizeList(expectedRaw)
        : [String(expectedRaw || '').trim()].filter(Boolean);

    const claimValuesLower = claimValues.map(normalizeLower);
    const expectedValuesLower = expectedValues.map(normalizeLower);

    let matched = false;
    if (operator === 'In') {
        matched = expectedValuesLower.some(v => claimValuesLower.includes(v));
    } else {
        const expected = expectedValuesLower[0];
        matched = !!expected && claimValuesLower.includes(expected);
    }

    if (matched) return { matched: true };

    return {
        matched: false,
        reason: `Required ${key} (${operator}) = ${expectedValues.join(', ') || 'n/a'}, provided = ${claimValues.join(', ') || 'n/a'}`
    };
}

/**
 * Evaluate a full policy template against consumer claims.
 * policyTemplate: { constraintOperand: 'And'|'Or', constraints: [...] }
 * claims: { orgRole, industry, bpn, did, ... }
 * Returns { allowed: boolean, reason?: string }
 */
function evaluatePolicyAgainstClaims(policyTemplate, claims) {
    const constraints = Array.isArray(policyTemplate?.constraints)
        ? policyTemplate.constraints.filter(c => c?.key && c?.operator)
        : [];

    // No constraints = open access
    if (constraints.length === 0) {
        return { allowed: true };
    }

    const operand = policyTemplate?.constraintOperand === 'Or' ? 'Or' : 'And';
    const evaluations = constraints.map(c => evaluateConstraint(c, claims));

    if (operand === 'Or') {
        const anyMatch = evaluations.some(e => e.matched);
        if (anyMatch) return { allowed: true };
        const reasons = evaluations.map(e => e.reason).filter(Boolean);
        return { allowed: false, reason: reasons[0] || 'No OR constraint matched' };
    }

    // And: all must match
    const firstFailed = evaluations.find(e => !e.matched);
    if (firstFailed) {
        return { allowed: false, reason: firstFailed.reason || 'Constraint mismatch' };
    }

    return { allowed: true };
}

/**
 * Filter a list of assets by policy against a consumer's claims.
 * Returns only assets that the consumer is allowed to see.
 *
 * assets: array from db.getAssetsBySession()
 * policies: Map<policyId, policyTemplate>
 * consumerClaims: { orgRole, industry, bpn, did, ... }
 */
function filterAssetsByClaims(assets, policies, consumerClaims) {
    return assets.filter(asset => {
        if (!asset.policy_id) return true;  // no policy = open

        const policy = policies.get(asset.policy_id);
        if (!policy) return true;            // unknown policy = open (fail-open for demo)

        const result = evaluatePolicyAgainstClaims(policy, consumerClaims);
        return result.allowed;
    });
}

module.exports = {
    evaluateConstraint,
    evaluatePolicyAgainstClaims,
    filterAssetsByClaims,
};
