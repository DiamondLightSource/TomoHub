import React from 'react';
import { Grid } from '@mui/material';
import { MethodParameterProps } from '../../../types';
import { useSweepConfiguration } from '../../../hooks/useSweepConfiguration';
import { ParameterInputFactory } from '../../../components/methods/config/ParameterInputFactory';
import { SweepModal } from '../../../components/methods/config/SweepModal';

export const MethodParameter: React.FC<MethodParameterProps> = ({
  methodId,
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
}) => {
  const sweepConfig = useSweepConfiguration(methodId, paramName);

  const canHaveSweep = ['int', 'float'].some(type =>
    paramDetails.type.includes(type)
  );

  const sweepProps = canHaveSweep
    ? {
        onSweepOpen: () => sweepConfig.setIsModalOpen(true),
        onSweepCancel: () => sweepConfig.handleCancelSweep(onChange),
        sweepDisplayText: sweepConfig.getSweepDisplayText(),
        isSweepActive: sweepConfig.isSweepActiveForThisParam,
        isSweepDisabled: !!sweepConfig.isSweepActiveForOtherParam, // Convert to boolean
      }
    : undefined;

  return (
    <Grid item xs={6}>
      <ParameterInputFactory
        paramName={paramName}
        paramDetails={paramDetails}
        value={value}
        isEnabled={isEnabled}
        onChange={onChange}
        sweepProps={sweepProps}
      />

      {canHaveSweep && (
        <SweepModal
          isOpen={sweepConfig.isModalOpen}
          onClose={() => sweepConfig.setIsModalOpen(false)}
          paramName={paramName}
          activeTab={sweepConfig.activeTab}
          onTabChange={(_, newValue) => sweepConfig.setActiveTab(newValue)}
          start={sweepConfig.start}
          stop={sweepConfig.stop}
          step={sweepConfig.step}
          values={sweepConfig.values}
          onStartChange={sweepConfig.setStart}
          onStopChange={sweepConfig.setStop}
          onStepChange={sweepConfig.setStep}
          onValuesChange={sweepConfig.setValues}
          onDone={() => sweepConfig.handleSweepDone(onChange)}
          isFormValid={sweepConfig.isFormValid()}
        />
      )}
    </Grid>
  );
};
