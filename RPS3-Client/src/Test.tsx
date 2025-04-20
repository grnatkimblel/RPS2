import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './styles/styles.css'; // For styling

const Test = () => {
  // State to control which containers are visible
  const [stage, setStage] = useState(1); // 1: first container, 2: first + second, 3: all three

  // Container data
  const containers = [
    { id: 1, color: '#ff6b6b', content: 'Container 1' },
    { id: 2, color: '#4ecdc4', content: 'Container 2' },
    { id: 3, color: '#45b7d1', content: 'Container 3' },
  ];

  // Animation variants for containers
  const containerVariants = {
    initial: (index) => ({
      opacity: 0,
      x: index === 0 ? 0 : 100, // First container: no x movement; others: from right
      y: index === 0 ? 100 : 0, // First container: from bottom; others: no y movement
    }),
    animate: (index) => {
      // Calculate x position based on stage and index
      let xOffset;
      if (stage === 1) {
        xOffset = 0; // First container centered
      } else if (stage === 2) {
        xOffset = index === 0 ? -110 : 110; // First left, second right
      } else {
        xOffset = index === 0 ? -220 : index === 1 ? 0 : 220; // First far left, second center, third right
      }
      return {
        opacity: 1,
        x: xOffset,
        y: 0,
        transition: {
          opacity: { duration: 0.5 },
          x: { duration: 0.5, ease: 'easeOut' },
          y: { duration: 0.5, ease: 'easeOut' },
        },
      };
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        opacity: { duration: 0.5 },
        x: { duration: 0.5, ease: 'easeIn' },
      },
    },
  };

  return (
    <div className="containers-wrapper">
      {/* Controls to change stage */}
      <div className="controls">
        <button onClick={() => setStage(1)}>Show 1</button>
        <button onClick={() => setStage(2)}>Show 2</button>
        <button onClick={() => setStage(3)}>Show 3</button>
      </div>

      {/* Animated containers */}
      <div className="containers-container">
        <AnimatePresence>
          {containers.slice(0, stage).map((container, index) => (
            <motion.div
              key={container.id}
              className="container"
              style={{ backgroundColor: container.color }}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={index} // Pass index to variants for custom animations
            >
              {container.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Test;