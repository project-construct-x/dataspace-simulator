import React from 'react';
import { motion } from 'framer-motion';

/**
 * SVG-Wire zwischen Connector und vereinigter Balloon-Box
 * Einzelner neutraler Draht mit animiertem Licht für beide Planes
 * controlPlanePulse: 'toConnector' | 'toUI' | false - für blaues Control Plane Signal
 * dataPlanePulse: 'toConnector' | 'toStorage' | false - für oranges Data Plane Signal
 */
const WireSVG = ({ wire1Path, wire2Path, isConnected, controlPlanePulse = false, dataPlanePulse = false }) => {
    // Verwende wire1Path als den primären Draht (wire2Path ist identisch im neuen System)
    const wirePath = wire1Path;

    // Control Plane Animation Richtung: toConnector = 0->1, toUI = 1->0
    const isToConnector = controlPlanePulse === 'toConnector';
    const isToUI = controlPlanePulse === 'toUI';
    const isAnimating = isToConnector || isToUI;

    // Data Plane Animation Richtung: toConnector = Storage->Connector, toStorage = Connector->Storage
    const isDataToConnector = dataPlanePulse === 'toConnector';
    const isDataToStorage = dataPlanePulse === 'toStorage';
    const isDataAnimating = isDataToConnector || isDataToStorage;

    return (
        <svg
            style={{
                position: 'absolute',
                top: -1000,
                left: -1000,
                width: 2000,
                height: 2000,
                pointerEvents: 'none',
                zIndex: 0
            }}
        >
            <g transform="translate(1000, 1000)">
                {/* Einzelner neutraler Draht (dunkelgrau/slate) */}
                <motion.path
                    d={wirePath}
                    fill="none"
                    stroke={isConnected ? "#475569" : "#334155"}
                    strokeWidth="5"
                />

                {/* Animiertes blaues Licht für Control Plane Signale */}
                {isAnimating && isConnected && (
                    <>
                        {/* Äußerer Glow */}
                        <motion.path
                            key={`outer-${controlPlanePulse}`}
                            d={wirePath}
                            fill="none"
                            stroke="#93c5fd"
                            strokeWidth="16"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.15,
                                pathOffset: isToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.15,
                                pathOffset: isToConnector ? 0 : 1,
                                opacity: [0, 0.7, 0.7, 0.7, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            style={{ filter: 'blur(10px)' }}
                        />
                        {/* Innerer Glow */}
                        <motion.path
                            key={controlPlanePulse}
                            d={wirePath}
                            fill="none"
                            stroke="#bfdbfe"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.12,
                                pathOffset: isToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.12,
                                pathOffset: isToConnector ? 0 : 1,
                                opacity: [0, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            style={{ filter: 'blur(3px)' }}
                        />
                        {/* Heller Kern */}
                        <motion.path
                            key={`core-${controlPlanePulse}`}
                            d={wirePath}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.08,
                                pathOffset: isToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.08,
                                pathOffset: isToConnector ? 0 : 1,
                                opacity: [0, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                        />
                    </>
                )}

                {/* Animiertes oranges Licht für Data Plane Signale */}
                {isDataAnimating && isConnected && (
                    <>
                        {/* Äußerer Glow - orange */}
                        <motion.path
                            key={`data-outer-${dataPlanePulse}`}
                            d={wirePath}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="24"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.02,
                                pathOffset: isDataToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.02,
                                pathOffset: isDataToConnector ? 0 : 1,
                                opacity: [0.3, 1, 1, 1, 0.3]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                            style={{ filter: 'blur(8px)' }}
                        />
                        {/* Innerer Glow */}
                        <motion.path
                            key={`data-inner-${dataPlanePulse}`}
                            d={wirePath}
                            fill="none"
                            stroke="#fde68a"
                            strokeWidth="16"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.015,
                                pathOffset: isDataToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.015,
                                pathOffset: isDataToConnector ? 0 : 1,
                                opacity: [0.4, 1, 1, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                            style={{ filter: 'blur(2px)' }}
                        />
                        {/* Heller Kern */}
                        <motion.path
                            key={`data-core-${dataPlanePulse}`}
                            d={wirePath}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="10"
                            strokeLinecap="round"
                            initial={{
                                pathLength: 0.01,
                                pathOffset: isDataToConnector ? 1 : 0,
                                opacity: 0
                            }}
                            animate={{
                                pathLength: 0.01,
                                pathOffset: isDataToConnector ? 0 : 1,
                                opacity: [0.5, 1, 1, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "linear"
                            }}
                        />
                    </>
                )}
            </g>
        </svg>
    );
};

export default WireSVG;

