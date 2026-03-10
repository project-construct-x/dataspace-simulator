import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DATASPACE_RADIUS = 550;
const CONNECTOR_OFFSET = 60;

/**
 * Der zentrale Dataspace-Kreis mit Glow-Effekt
 * Glow geht in beide Richtungen (innen und außen)
 */
const DataspaceCircle = ({ isSnapZone, glowOpacity, dragAngle, simulationState, discoveryPulse, ringLight, nodes, minimalView = false }) => {
    const isBroadcasting = simulationState === 'broadcasting';
    const isNegotiating = simulationState === 'negotiating';

    // Radius reduzieren im Minimal View
    const radius = minimalView ? DATASPACE_RADIUS * 0.6 : DATASPACE_RADIUS;

    // Ring-Licht Animation ist jetzt deaktiviert - wir nutzen ControlPlaneBeam stattdessen
    // Diese Logik bleibt nur für Legacy-Fälle mit direction property
    const ringLightAngles = useMemo(() => {
        // Deaktiviert: Ring-Animation wird nicht mehr verwendet
        // Wir nutzen jetzt ControlPlaneBeam für Catalog-Anfragen
        if (!ringLight || !nodes || !ringLight.direction) return null;

        const fromNode = nodes[ringLight.fromNodeId];
        const toNode = nodes[ringLight.toNodeId];

        if (!fromNode || !toNode) return null;

        // Berechne Winkel der Nodes (in Grad, 0° = rechts, gegen Uhrzeigersinn)
        let fromAngle = Math.atan2(fromNode.y, fromNode.x) * (180 / Math.PI);
        let toAngle = Math.atan2(toNode.y, toNode.x) * (180 / Math.PI);

        // Normalisiere auf 0-360
        fromAngle = ((fromAngle % 360) + 360) % 360;
        toAngle = ((toAngle % 360) + 360) % 360;

        // Berechne kürzesten Weg
        let diff = toAngle - fromAngle;
        if (diff > 180) {
            toAngle = toAngle - 360;
        } else if (diff < -180) {
            toAngle = toAngle + 360;
        }

        return { fromAngle, toAngle, direction: ringLight.direction };
    }, [ringLight, nodes]);

    return (
        <motion.div
            className="dataspace-circle"
            animate={{
                borderColor: discoveryPulse ? 'var(--ring-border-active)' : 'var(--ring-border)',
                scale: isSnapZone ? 1.01 : 1
            }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'absolute',
                left: -radius,
                top: -radius,
                width: radius * 2,
                height: radius * 2,
                border: '6px dashed var(--ring-border)',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 0,
                boxShadow: discoveryPulse
                    ? '0 0 40px 10px var(--ring-glow-active), inset 0 0 40px 10px var(--ring-glow-active)'
                    : '0 0 30px 5px var(--ring-glow), inset 0 0 30px 5px var(--ring-glow)'
            }}
        >
            {/* Directional Glow Overlay */}
            <div style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                border: '6px solid var(--ring-highlight)',
                filter: 'drop-shadow(0 0 40px var(--ring-accent))',
                opacity: glowOpacity,
                maskImage: `conic-gradient(from ${dragAngle - 30}deg at center, transparent 0deg, black 30deg, transparent 60deg)`,
                WebkitMaskImage: `conic-gradient(from ${dragAngle - 30}deg at center, transparent 0deg, black 30deg, transparent 60deg)`,
                pointerEvents: 'none',
                transition: 'opacity 0.1s'
            }} />



            {/* Discovery Pulse Animation - für Browse Dataspace */}
            <AnimatePresence>
                {discoveryPulse && (
                    <>
                        {/* Expanding ring 1 - dezenter */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0.4 }}
                            animate={{ scale: 1.08, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                inset: -20,
                                borderRadius: '50%',
                                border: '4px solid #3b82f6',
                                pointerEvents: 'none'
                            }}
                        />
                        {/* Expanding ring 2 - delayed, dezenter */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0.3 }}
                            animate={{ scale: 1.12, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                            style={{
                                position: 'absolute',
                                inset: -20,
                                borderRadius: '50%',
                                border: '3px solid #60a5fa',
                                pointerEvents: 'none'
                            }}
                        />
                        {/* Center glow - dezenter */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.3, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}
                        />
                        {/* Discovery Service Label */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'absolute',
                                top: '45%',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#60a5fa',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                textShadow: '0 0 20px rgba(59, 130, 246, 0.8)'
                            }}
                        >
                            Discovery Service
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Metadata Ring Animation */}
            {(isBroadcasting || isNegotiating) && (
                <motion.div
                    style={{
                        position: 'absolute', inset: -10, borderRadius: '50%',
                        border: '8px solid #3b82f6', opacity: 0.5
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.01, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Ring Light Animation - Licht wandert entlang des Kreises */}
            <AnimatePresence>
                {ringLightAngles && (
                    <svg
                        style={{
                            position: 'absolute',
                            width: radius * 2 + 40,
                            height: radius * 2 + 40,
                            left: -20,
                            top: -20,
                            pointerEvents: 'none',
                            overflow: 'visible'
                        }}
                    >
                        <defs>
                            {/* Gradient für das wandernde Licht */}
                            <linearGradient id="ringLightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                <stop offset="40%" stopColor="#60a5fa" stopOpacity="1" />
                                <stop offset="50%" stopColor="#93c5fd" stopOpacity="1" />
                                <stop offset="60%" stopColor="#60a5fa" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Kreis-Pfad für das Licht */}
                        <circle
                            cx={radius + 20}
                            cy={radius + 20}
                            r={radius}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="1"
                        />

                        {/* Animiertes Licht - Äußerer Glow */}
                        <motion.circle
                            key={`ring-outer-${ringLight?.fromNodeId}-${ringLight?.toNodeId}-${ringLight?.direction}`}
                            cx={radius + 20}
                            cy={radius + 20}
                            r={radius}
                            fill="none"
                            stroke="#93c5fd"
                            strokeWidth="16"
                            strokeLinecap="round"
                            style={{ filter: 'blur(10px)' }}
                            initial={{
                                pathLength: 0.015,
                                pathOffset: ringLightAngles.fromAngle / 360,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.015,
                                pathOffset: ringLightAngles.toAngle / 360,
                                opacity: [0, 0.7, 0.7, 0.7, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                        />

                        {/* Animiertes Licht - Innerer Glow */}
                        <motion.circle
                            key={`ring-glow-${ringLight?.fromNodeId}-${ringLight?.toNodeId}-${ringLight?.direction}`}
                            cx={radius + 20}
                            cy={radius + 20}
                            r={radius}
                            fill="none"
                            stroke="#bfdbfe"
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={{ filter: 'blur(3px)' }}
                            initial={{
                                pathLength: 0.01,
                                pathOffset: ringLightAngles.fromAngle / 360,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.01,
                                pathOffset: ringLightAngles.toAngle / 360,
                                opacity: [0, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                        />

                        {/* Animiertes Licht - Heller Kern (die Kugel) */}
                        <motion.circle
                            key={`ring-core-${ringLight?.fromNodeId}-${ringLight?.toNodeId}-${ringLight?.direction}`}
                            cx={radius + 20}
                            cy={radius + 20}
                            r={radius}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.006,
                                pathOffset: ringLightAngles.fromAngle / 360,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.006,
                                pathOffset: ringLightAngles.toAngle / 360,
                                opacity: [0, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                        />
                    </svg>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DataspaceCircle;
