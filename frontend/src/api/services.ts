// src/api/services/someService.ts
import apiClient from './client'
import type { ApiMethodsSchema,ApiFullPipelineSchema } from '../types/APIresponse';

export const methodsService = {
  getAllMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods');
    return response.data;
  },
  getLoaderMethod: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/loaders');
    return response.data;
  },
  getImageDenoiseArtifactRemoval: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/denoising-artefactsremoval');
    return response.data;
  },
  getCORmethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/rotation-center');
    return response.data;
  },
  getImageSavingMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/image-saving');
    return response.data;
  },
  getPhaseRetrievalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/phase-retrieval');
    return response.data;
  },
  getSegmentationMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/segmentation');
    return response.data;
  },
  getMorphologicalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/morphological');
    return response.data;
  },
  getNormalizationMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/normalization');
    return response.data;
  },
  getStripeRemovalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/stripe-removal');
    return response.data;
  },
  getDistortionCorrectionMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/distortion-correction');
    return response.data;
  },
  getReconstructionMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get('/methods/reconstruction');
    return response.data;
  },

};
export const fullpipelinesService = {
  getFullPipelines: async (): Promise<ApiFullPipelineSchema> => {
    const response = await apiClient.get('/fullpipelines');
    return response.data;
  },
}