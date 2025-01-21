// src/api/services/someService.ts
import apiClient from './client'
import type { ApiSchema } from '../types/APIresponse';

export const methodsService = {
  getAllMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods');
    return response.data;
  },
  getLoaderMethod: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/loaders');
    return response.data;
  },
  getImageDenoiseArtifactRemoval: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/denoising-artefactsremoval');
    return response.data;
  },
  getCORmethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/rotation-center');
    return response.data;
  },
  getImageSavingMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/image-saving');
    return response.data;
  },
  getPhaseRetrievalMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/phase-retrieval');
    return response.data;
  },
  getSegmentationMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/segmentation');
    return response.data;
  },
  getMorphologicalMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/morphological');
    return response.data;
  },
  getNormalizationMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/normalization');
    return response.data;
  },
  getStripeRemovalMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/stripe-removal');
    return response.data;
  },
  getDistortionCorrectionMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/distortion-correction');
    return response.data;
  },
  getReconstructionMethods: async (): Promise<ApiSchema> => {
    const response = await apiClient.get('/methods/reconstruction');
    return response.data;
  },

};