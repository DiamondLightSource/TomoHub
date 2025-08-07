import { useState } from 'react';
import { useSweep } from '../contexts/SweepContext';

export const useSweepConfiguration = (methodId: string, paramName: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [values, setValues] = useState<string>('');

  const { activeSweep, setActiveSweep, clearActiveSweep } = useSweep();

  const isSweepActiveForOtherParam = activeSweep && 
    (activeSweep.methodId !== methodId || activeSweep.paramName !== paramName);
  const isSweepActiveForThisParam = 
    activeSweep?.methodId === methodId && activeSweep?.paramName === paramName;

  const isFormValid = () => {
    if (activeTab === 0) {
      return start !== null && stop !== null && step !== null;
    }
    return values.trim() !== '';
  };

  const getSweepDisplayText = () => {
    if (activeTab === 0) {
      return `RangeSweep start:${start ?? 'null'} stop:${stop ?? 'null'} step:${step ?? 'null'}`;
    }
    return `Sweep ${values}`;
  };

  const getSweepValue = () => {
    if (activeTab === 0) {
      return { start, stop, step };
    }
    return values
      .split(',')
      .map(val => val.trim())
      .map(val => val.includes('.') ? parseFloat(val) : parseInt(val, 10));
  };

  const handleSweepDone = (onChange: (value: any) => void) => {
    const sweepValue = getSweepValue();
    const sweepType = activeTab === 0 ? 'range' : 'values';
    
    onChange(sweepValue);
    setActiveSweep(methodId, paramName, sweepType);
    setIsModalOpen(false);
  };

  const handleCancelSweep = (onChange: (value: any) => void) => {
    clearActiveSweep();
    setStart(null);
    setStop(null);
    setStep(null);
    setValues('');
    onChange(null);
  };

  const resetSweepState = () => {
    setStart(null);
    setStop(null);
    setStep(null);
    setValues('');
  };

  return {
    isModalOpen,
    setIsModalOpen,
    activeTab,
    setActiveTab,
    start,
    setStart,
    stop,
    setStop,
    step,
    setStep,
    values,
    setValues,
    isSweepActiveForOtherParam,
    isSweepActiveForThisParam,
    isFormValid,
    getSweepDisplayText,
    handleSweepDone,
    handleCancelSweep,
    resetSweepState,
  };
};