import { useState } from 'react';

export type ModalStep =
  | null
  | 'selectOwner'
  | 'removeTeamMember'
  | 'areYouSure'
  | 'changeRole';

export const useMemberModals = () => {
  const [currentStep, setCurrentStep] = useState<ModalStep>(null);

  const nextStep = (step: ModalStep) => setCurrentStep(step);

  const resetSequence = () => setCurrentStep(null);

  return {
    currentStep,
    nextStep,
    resetSequence,
  };
};
