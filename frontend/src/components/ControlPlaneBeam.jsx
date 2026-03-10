import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SVG_SIZE = 2000;
const SVG_OFFSET = SVG_SIZE / 2;
const CONNECTOR_FRONT_OFFSET = 50;

function inwardUnit(node, fallbackX, fallbackY) {
    const ix = -node.x;
    const iy = -node.y;
    const len = Math.sqrt(ix * ix + iy * iy);
    if (len > 1e-6) {
        return { x: ix / len, y: iy / len };
    }
    return { x: fallbackX, y: fallbackY };
}

/**
 * Control Plane Verbindung für Catalog-Anfragen
 * - Blaue Leitung vom Connector-Innenrand zum anderen Connector-Innenrand
 * - Licht wandert entlang der Leitung (hin und zurück)
 */
const ControlPlaneBeam = ({ fromNode, toNode, connection }) => {
    // Berechne gerade Linie zwischen den Connector-Innenrändern
    const pathData = useMemo(() => {
        if (!fromNode || !toNode) return null;

        // Node-Zentren
        const fromCenterX = fromNode.x;
        const fromCenterY = fromNode.y;
        const toCenterX = toNode.x;
        const toCenterY = toNode.y;

        // Richtung vom From-Node zum To-Node
        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return null;

        // Normalisierte Richtung
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Start-/Endpunkte an der inneren "Front" der Connectoren (zum Kreiszentrum)
        const fromInward = inwardUnit(fromNode, dirX, dirY);
        const toInward = inwardUnit(toNode, -dirX, -dirY);

        const startX = fromCenterX + fromInward.x * CONNECTOR_FRONT_OFFSET + SVG_OFFSET;
        const startY = fromCenterY + fromInward.y * CONNECTOR_FRONT_OFFSET + SVG_OFFSET;
        const endX = toCenterX + toInward.x * CONNECTOR_FRONT_OFFSET + SVG_OFFSET;
        const endY = toCenterY + toInward.y * CONNECTOR_FRONT_OFFSET + SVG_OFFSET;

        // Gerade Linie
        const path = `M ${startX} ${startY} L ${endX} ${endY}`;

        return { path, startX, startY, endX, endY };
    }, [fromNode, toNode]);

    // Key für Animation-Reset
    const [buildKey, setBuildKey] = useState(0);

    useEffect(() => {
        if (connection?.building) {
            setBuildKey(prev => prev + 1);
        }
    }, [connection?.building]);

    if (!pathData) return null;

    const isBuilding = connection?.building;
    const isEstablished = connection?.established;
    const isReturning = connection?.returning;

    return (
        <svg
            style={{
                position: 'absolute',
                top: -SVG_OFFSET,
                left: -SVG_OFFSET,
                width: SVG_SIZE,
                height: SVG_SIZE,
                overflow: 'visible',
                pointerEvents: 'none',
                zIndex: 1
            }}
        >
            {/* Linie baut sich auf (zum Provider) */}
            {isBuilding && (
                <g key={`build-${buildKey}`}>
                    {/* Äußerer Glow - baut sich auf */}
                    <motion.path
                        d={pathData.path}
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="14"
                        strokeLinecap="round"
                        style={{ filter: 'blur(8px)' }}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        opacity={0.6}
                    />
                    {/* Hauptlinie - baut sich auf */}
                    <motion.path
                        d={pathData.path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    {/* Kleines Licht am Kopf */}
                    <motion.circle
                        r="10"
                        fill="#60a5fa"
                        opacity="0.8"
                        style={{ filter: 'blur(3px)' }}
                        initial={{ cx: pathData.startX, cy: pathData.startY }}
                        animate={{ cx: pathData.endX, cy: pathData.endY }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <motion.circle
                        r="5"
                        fill="#ffffff"
                        opacity="0.9"
                        initial={{ cx: pathData.startX, cy: pathData.startY }}
                        animate={{ cx: pathData.endX, cy: pathData.endY }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </g>
            )}

            {/* Etablierte Verbindung - statisch sichtbar */}
            {isEstablished && !isBuilding && !isReturning && (
                <g>
                    {/* Statische blaue Linie mit Glow */}
                    <path
                        d={pathData.path}
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ filter: 'blur(6px)' }}
                        opacity="0.5"
                    />
                    <path
                        d={pathData.path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </g>
            )}

            {/* Rückkehr-Animation (Licht wandert zurück) */}
            {isReturning && (
                <g key={`return-${buildKey}`}>
                    {/* Statische Linie bleibt sichtbar */}
                    <path
                        d={pathData.path}
                        fill="none"
                        stroke="#93c5fd"
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ filter: 'blur(6px)' }}
                        opacity="0.5"
                    />
                    <path
                        d={pathData.path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* Licht wandert zurück */}
                    <motion.ellipse
                        rx="16"
                        ry="16"
                        fill="#60a5fa"
                        style={{ filter: 'blur(6px)' }}
                        initial={{
                            cx: pathData.endX,
                            cy: pathData.endY,
                            opacity: 0.4
                        }}
                        animate={{
                            cx: pathData.startX,
                            cy: pathData.startY,
                            opacity: [0.4, 1, 1, 1, 0.4]
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.ellipse
                        rx="10"
                        ry="10"
                        fill="#bfdbfe"
                        style={{ filter: 'blur(2px)' }}
                        initial={{
                            cx: pathData.endX,
                            cy: pathData.endY,
                            opacity: 0.5
                        }}
                        animate={{
                            cx: pathData.startX,
                            cy: pathData.startY,
                            opacity: [0.5, 1, 1, 1, 0.5]
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.ellipse
                        rx="5"
                        ry="5"
                        fill="#ffffff"
                        initial={{
                            cx: pathData.endX,
                            cy: pathData.endY,
                            opacity: 0.6
                        }}
                        animate={{
                            cx: pathData.startX,
                            cy: pathData.startY,
                            opacity: [0.6, 1, 1, 1, 0.6]
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </g>
            )}

            {/* Gradient Definition */}
            <defs>
                <radialGradient id="controlPlaneGradient">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </radialGradient>
            </defs>
        </svg>
    );
};

export default ControlPlaneBeam;
