import React from 'react';
import { motion } from 'framer-motion';

/**
 * SVG-Beam für Datentransfer-Animation zwischen Nodes
 */
const TransferBeam = ({ fromNode, toNode, isActive }) => {
    if (!isActive) return null;

    return (
        <svg style={{ 
            position: 'absolute', 
            top: -1000, 
            left: -1000, 
            width: 2000, 
            height: 2000, 
            pointerEvents: 'none', 
            zIndex: 0 
        }}>
            <motion.path
                d={`M ${fromNode.x} ${fromNode.y} L 0 0 L ${toNode.x} ${toNode.y}`}
                stroke="#f97316"
                strokeWidth="10"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
        </svg>
    );
};

export default TransferBeam;
