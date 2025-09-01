// src/api/services/someService.ts
import apiClient from "./client";
import type {
  ApiMethodsSchema,
  ApiFullPipelineSchema,
} from "../types/APIresponse";

// Add interface for TIFF metadata
interface TiffMetadata {
  page_count: number;
  width: number;
  height: number;
  format: string;
  mode: string;
}

export const methodsService = {
  getAllMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods");
    return response.data;
  },
  getLoaderMethod: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/loaders");
    return response.data;
  },
  getImageDenoiseArtifactRemoval: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/denoising-artefactsremoval");
    return response.data;
  },
  getCORmethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/rotation-center");
    return response.data;
  },
  getImageSavingMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/image-saving");
    return response.data;
  },
  getPhaseRetrievalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/phase-retrieval");
    return response.data;
  },
  getSegmentationMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/segmentation");
    return response.data;
  },
  getMorphologicalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/morphological");
    return response.data;
  },
  getNormalizationMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/normalization");
    return response.data;
  },
  getStripeRemovalMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/stripe-removal");
    return response.data;
  },
  getDistortionCorrectionMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/distortion-correction");
    return response.data;
  },
  getReconstructionMethods: async (): Promise<ApiMethodsSchema> => {
    const response = await apiClient.get("/methods/reconstruction");
    return response.data;
  },
};

export const fullpipelinesService = {
  getFullPipelines: async (): Promise<ApiFullPipelineSchema> => {
    const response = await apiClient.get("/methods/fullpipelines");
    return response.data;
  },
};

export const yamlService = {
  generateYaml: async (requestData: any): Promise<Blob> => {
    const response = await apiClient.post("/yaml/generate", requestData, {
      responseType: "blob",
    });
    return response.data;
  },
};

export const proxyService = {
  getTiffFile: async (tiffUrl: string): Promise<ArrayBuffer> => {
    const response = await apiClient.get(
      `/proxy/tiff?url=${encodeURIComponent(tiffUrl)}`,
      {
        responseType: "arraybuffer",
      }
    );
    return response.data;
  },

  getTiffMetadata: async (tiffUrl: string): Promise<TiffMetadata> => {
    const response = await apiClient.get(
      `/proxy/tiff-pages?url=${encodeURIComponent(tiffUrl)}`
    );
    return response.data;
  },

  getTiffPage: async (tiffUrl: string, page: number): Promise<string> => {
    const response = await apiClient.get(
      `/proxy/tiff-pages?url=${encodeURIComponent(tiffUrl)}&page=${page}`,
      {
        responseType: "arraybuffer",
      }
    );

    // Convert ArrayBuffer to base64 data URL instead of blob URL
    const base64 = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return `data:image/png;base64,${base64}`;
  },
};
