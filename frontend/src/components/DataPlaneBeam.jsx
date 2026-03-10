import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SVG_SIZE = 2000;
const SVG_OFFSET = SVG_SIZE / 2;

// ConnectorStack: 120×100px, centred at node (x,y), rotated by `rotation` degrees.
// Half-extents of the connector box IN LOCAL (rotated) space:
const BOX_HW = 60; // half-width  (120/2)
const BOX_HH = 50; // half-height (100/2)

/**
 * Given a unit direction vector (ux, uy) pointing FROM the box outward,
 * return the distance t from the box centre to where the ray exits the AABB.
 *
 * This is the standard slab intersection: t = min(hw/|ux|, hh/|uy|)
 * We then push the start point outward by t so the line begins ON the border.
 */
function edgeDistAABB(ux, uy) {
    const tx = Math.abs(ux) > 1e-9 ? BOX_HW / Math.abs(ux) : Infinity;
    const ty = Math.abs(uy) > 1e-9 ? BOX_HH / Math.abs(uy) : Infinity;
    return Math.min(tx, ty);
}

/**
 * Rotate a vector (dx, dy) by -angleDeg to convert from world space → local box space.
 * We need this because the AABB test must be done in the box's local (unrotated) frame.
 */
function rotateVec(dx, dy, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        x: dx * cos + dy * sin,
        y: -dx * sin + dy * cos,
    };
}

/**
 * DataPlaneBeam
 *
 * Draws the orange line between two connector boxes.
 * The line starts and ends EXACTLY at the border of each 120×100px box.
 *
 * fromNode / toNode: { x, y }  — canvas-space centre of the connectors
 * fromRotation / toRotation     — degrees the connector box is rotated
 */
const DataPlaneBeam = ({ fromNode, toNode, connection, transfer, fromRotation = 0, toRotation = 0 }) => {

    const pathData = useMemo(() => {
        if (!fromNode || !toNode) return null;

        const fx = fromNode.x;
        const fy = fromNode.y;
        const tx = toNode.x;
        const ty = toNode.y;

        const rawDx = tx - fx;
        const rawDy = ty - fy;
        const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
        if (dist < 1) return null;

        // World-space unit vector from→to
        const ux = rawDx / dist;
        const uy = rawDy / dist;

        // ── FROM end ──────────────────────────────────────────────────────────
        // Rotate direction into from-box local space (undo the box rotation)
        const fromLocal = rotateVec(ux, uy, fromRotation);
        // Compute how far to push out from centre along this local direction
        const tFrom = edgeDistAABB(fromLocal.x, fromLocal.y);
        // The world-space start point is: fromCentre + ux * tFrom
        const startX = fx + ux * tFrom + SVG_OFFSET;
        const startY = fy + uy * tFrom + SVG_OFFSET;

        // ── TO end ───────────────────────────────────────────────────────────
        // Direction is reversed (pointing from to→from)
        const toLocal = rotateVec(-ux, -uy, toRotation);
        const tTo = edgeDistAABB(toLocal.x, toLocal.y);
        // Push end outward from the TO centre along the reversed direction
        const endX = tx - ux * tTo + SVG_OFFSET;
        const endY = ty - uy * tTo + SVG_OFFSET;

        const path = `M ${startX} ${startY} L ${endX} ${endY}`;
        return { path, startX, startY, endX, endY };
    }, [fromNode, toNode, fromRotation, toRotation]);

    const [transferKey, setTransferKey] = useState(0);
    const [buildKey, setBuildKey] = useState(0);

    useEffect(() => {
        if (transfer?.active) setTransferKey(prev => prev + 1);
    }, [transfer?.active]);

    useEffect(() => {
        if (connection?.building) setBuildKey(prev => prev + 1);
    }, [connection?.building]);

    if (!pathData) return null;

    const isBuilding = connection?.building;
    const isEstablished = connection?.established;
    const isTransferring = transfer?.active;

    return (
        <svg
            style={{
                position: 'absolute',
                top: -SVG_OFFSET, left: -SVG_OFFSET,
                width: SVG_SIZE, height: SVG_SIZE,
                overflow: 'visible', pointerEvents: 'none', zIndex: 1,
            }}
        >
            {/* Build-up animation */}
            {isBuilding && (
                <g key={`build-${buildKey}`}>
                    <motion.path d={pathData.path} fill="none" stroke="#fdba74" strokeWidth="14" strokeLinecap="round"
                        style={{ filter: 'blur(8px)' }}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2.4, ease: 'linear' }} opacity={0.6} />
                    <motion.path d={pathData.path} fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2.4, ease: 'linear' }} />
                    <motion.circle r="8" fill="#fbbf24" opacity="0.3" style={{ filter: 'blur(3px)' }}
                        initial={{ cx: pathData.startX, cy: pathData.startY }}
                        animate={{ cx: pathData.endX, cy: pathData.endY }}
                        transition={{ duration: 2.4, ease: 'linear' }} />
                    <motion.circle r="4" fill="#ffffff" opacity="0.5"
                        initial={{ cx: pathData.startX, cy: pathData.startY }}
                        animate={{ cx: pathData.endX, cy: pathData.endY }}
                        transition={{ duration: 2.4, ease: 'linear' }} />
                </g>
            )}

            {/* Established static line */}
            {isEstablished && !isBuilding && !isTransferring && (
                <g>
                    <path d={pathData.path} fill="none" stroke="#fdba74" strokeWidth="12" strokeLinecap="round"
                        style={{ filter: 'blur(6px)' }} opacity="0.5" />
                    <path d={pathData.path} fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
                </g>
            )}

            {/* Transfer blob */}
            {isTransferring && (
                <g key={`transfer-${transferKey}`}>
                    <path d={pathData.path} fill="none" stroke="#fdba74" strokeWidth="12" strokeLinecap="round"
                        style={{ filter: 'blur(6px)' }} opacity="0.5" />
                    <path d={pathData.path} fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
                    <motion.ellipse rx="22" ry="22" fill="#fbbf24" style={{ filter: 'blur(8px)' }}
                        initial={{ cx: pathData.startX, cy: pathData.startY, opacity: 0.3 }}
                        animate={{ cx: pathData.endX, cy: pathData.endY, opacity: [0.3, 1, 1, 1, 0.3] }}
                        transition={{ duration: 2.8, ease: 'linear' }} />
                    <motion.ellipse rx="14" ry="14" fill="#fde68a" style={{ filter: 'blur(2px)' }}
                        initial={{ cx: pathData.startX, cy: pathData.startY, opacity: 0.4 }}
                        animate={{ cx: pathData.endX, cy: pathData.endY, opacity: [0.4, 1, 1, 1, 0.4] }}
                        transition={{ duration: 2.8, ease: 'linear' }} />
                    <motion.ellipse rx="8" ry="8" fill="#ffffff"
                        initial={{ cx: pathData.startX, cy: pathData.startY, opacity: 0.5 }}
                        animate={{ cx: pathData.endX, cy: pathData.endY, opacity: [0.5, 1, 1, 1, 0.5] }}
                        transition={{ duration: 2.8, ease: 'linear' }} />
                </g>
            )}
        </svg>
    );
};

export default DataPlaneBeam;
