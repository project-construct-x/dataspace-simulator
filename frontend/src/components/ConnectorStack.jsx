import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Activity, Server } from 'lucide-react';

/**
 * Der Connector-Stack mit Control Plane und Data Plane
 * controlPlaneGlow: 0-1 für Glow-Intensität bei Catalog-Anfragen
 */
const ConnectorStack = ({ rotation, contentRotation, isBroadcasting, isNegotiating, isTransferring, controlPlaneGlow = 0, dataPlaneGlow = 0 }) => {
    const isControlPlaneActive = isBroadcasting || isNegotiating || controlPlaneGlow > 0;
    const isDataPlaneActive = isTransferring || dataPlaneGlow > 0;

    // Animation Controls für manuelles Triggern
    const controlPlaneControls = useAnimation();
    const dataPlaneControls = useAnimation();

    // Control Plane Glow Animation - direkt starten wenn controlPlaneGlow > 0
    useEffect(() => {
        if (controlPlaneGlow > 0) {
            // Glow Animation starten
            controlPlaneControls.start({
                boxShadow: [
                    'none',
                    `0 0 20px rgba(147, 197, 253, 1), 0 0 8px rgba(59, 130, 246, 1), inset 0 0 8px rgba(147, 197, 253, 0.8)`,
                    `0 0 12px rgba(96, 165, 250, 0.9), inset 0 0 6px rgba(59, 130, 246, 0.6)`,
                    'none'
                ],
                scale: [1, 1.06, 1],
                transition: { duration: 0.5, ease: "easeOut" }
            });
        }
    }, [controlPlaneGlow, controlPlaneControls]);

    // Data Plane Glow Animation
    useEffect(() => {
        if (dataPlaneGlow > 0) {
            dataPlaneControls.start({
                boxShadow: [
                    `0 0 10px rgba(251, 191, 36, 0.6), 0 0 5px rgba(249, 115, 22, 0.5), inset 0 0 5px rgba(251, 191, 36, 0.4)`,
                    `0 0 20px rgba(251, 191, 36, 0.9), 0 0 10px rgba(249, 115, 22, 0.8), inset 0 0 8px rgba(251, 191, 36, 0.6)`,
                    `0 0 10px rgba(251, 191, 36, 0.6), 0 0 5px rgba(249, 115, 22, 0.5), inset 0 0 5px rgba(251, 191, 36, 0.4)`
                ],
                scale: [1, 1.04, 1],
                transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            });
        } else {
            // Animation stoppen wenn Glow auf 0 geht
            dataPlaneControls.stop();
            dataPlaneControls.set({
                boxShadow: 'none',
                scale: 1
            });
        }
    }, [dataPlaneGlow, dataPlaneControls]);

    return (
        <div
            className="schematic-connector"
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '120px',
                height: '100px',
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: 2,
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '2px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
            }}
        >
            <div style={{
                transform: `rotate(${contentRotation}deg)`,
                transition: 'transform 0.3s',
                width: '100%',
                textAlign: 'center'
            }}>
                <div className="schematic-title">CONNECTOR</div>

                <motion.div
                    className={`schematic-box control ${isControlPlaneActive ? 'active' : ''}`}
                    style={{
                        margin: '2px auto',
                        width: '90%',
                        boxShadow: controlPlaneGlow > 0
                            ? `0 0 20px rgba(147, 197, 253, 1), 0 0 8px rgba(59, 130, 246, 1), inset 0 0 8px rgba(147, 197, 253, 0.8)`
                            : 'none',
                        scale: controlPlaneGlow > 0 ? 1.06 : 1,
                        transition: 'box-shadow 0.3s, scale 0.3s'
                    }}
                    animate={controlPlaneControls}
                >
                    <Activity size={12} /> Control Plane
                </motion.div>

                <motion.div
                    className={`schematic-box data ${isDataPlaneActive ? 'active' : ''}`}
                    style={{
                        margin: '2px auto',
                        width: '90%',
                        boxShadow: dataPlaneGlow > 0
                            ? `0 0 10px rgba(251, 191, 36, 0.6), 0 0 5px rgba(249, 115, 22, 0.5), inset 0 0 5px rgba(251, 191, 36, 0.4)`
                            : 'none'
                    }}
                    animate={dataPlaneControls}
                >
                    <Server size={12} /> Data Plane
                </motion.div>
            </div>
        </div>
    );
};

export default ConnectorStack;
