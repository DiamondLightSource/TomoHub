declare module "tiff.js" {
    class Tiff {
      constructor(options?: { buffer?: ArrayBuffer });
  
      setDirectory(index: number): void;
      countDirectory(): number;
      toCanvas(): HTMLCanvasElement;
      toDataURL(): string;
      toBlob(): Blob;
      width(): number;
      height(): number;
      static initialize({ TOTAL_MEMORY }: { TOTAL_MEMORY: number }): void;
    }
  
    export default Tiff;
  } 