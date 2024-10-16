import React from 'react';
import styles from './FlowStepper.module.scss';

interface FlowStepperProps {
  activeStep: number;
  steps: string[];
  showLabels?: boolean;
  onStepClick?: (index: number) => void;
}

const FlowStepper: React.FC<FlowStepperProps> = ({ activeStep, steps, showLabels, onStepClick  }) => {
  return (
    <div className={styles.stepperContainer}>
      {steps.map((label, index) => (
        <div
          key={index}
          className={`${styles.step} ${activeStep === index ? styles.active : ''} ${activeStep > index ? styles.completed : ''}`}
          onClick={() => onStepClick && onStepClick(index)}
        >
          <div className={styles.circle}>{index + 1}</div>
          {showLabels && <span className={styles.label}>{label}</span>}
          {index !== steps.length - 1 && <div className={styles.line}></div>}
        </div>
      ))}
    </div>
  );
};

export default FlowStepper;
