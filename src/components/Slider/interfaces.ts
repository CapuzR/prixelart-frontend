export interface UseIndicators {
    type: 'dots' | 'thumbnails';
    position: 'over' | 'below';
    color: {
      active: 'primary' | 'secondary' | 'tertiary' | 'white';
      inactive: 'primary' | 'secondary' | 'tertiary' | 'white';
    };
  }

export type UseIndicatorsType = false | UseIndicators;