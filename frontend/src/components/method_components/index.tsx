// src/components/method_components/index.ts
import { createMethodComponent } from '../../contexts/createMethodComponent';
import { methodsService } from '../../api/services';

export const Normalisation = createMethodComponent({
  methodType: 'Normalisation',
  fetchMethod: methodsService.getNormalizationMethods
});

export const PhaseRetrieval  = createMethodComponent({
    methodType: 'Phase Retrieval',
    fetchMethod: methodsService.getPhaseRetrievalMethods
  });
export const ImageDenoiseArtefactRemoval = createMethodComponent({
    methodType: 'Image denoising / Aretefacts Removal',
    fetchMethod: methodsService.getImageDenoiseArtifactRemoval
});  
export const RotationCenterFinding = createMethodComponent({
  methodType: 'Rotation Center Finding',
  fetchMethod: methodsService.getCORmethods
});

export const ImageSaving = createMethodComponent({
  methodType: 'Image Saving',
  fetchMethod: methodsService.getImageSavingMethods
});

export const Segmentation = createMethodComponent({
  methodType: 'Segmentation',
  fetchMethod: methodsService.getSegmentationMethods
});

export const Morphological = createMethodComponent({
  methodType: 'Morphological Operations',
  fetchMethod: methodsService.getMorphologicalMethods
});

export const StripeRemoval = createMethodComponent({
  methodType: 'Stripe Removal',
  fetchMethod: methodsService.getStripeRemovalMethods
});

export const DistortionCorrection = createMethodComponent({
  methodType: 'Distortion Correction',
  fetchMethod: methodsService.getDistortionCorrectionMethods
});

export const Reconstruction = createMethodComponent({
  methodType: 'Algorithms',
  fetchMethod: methodsService.getReconstructionMethods
});