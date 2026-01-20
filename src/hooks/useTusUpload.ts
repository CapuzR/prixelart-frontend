import { useState } from "react";
import * as tus from "tus-js-client";
import { BACKEND_URL } from "@api/utils.api";

interface UseTusUploadResult {
  uploadProgress: number;
  isUploading: boolean;
  uploadedUrl: string | null;
  error: string | null;
  uploadFile: (file: File, context?: string) => void;
  resetUpload: () => void;
}

export const useTusUpload = (): UseTusUploadResult => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = (file: File, context: string = "general") => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        context: context,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
        setUploadProgress(percentage);
      },
      onSuccess: () => {
        const tusUploadInstance = upload as any;
        let finalS3Url: string | null = null;
        
        if (tusUploadInstance._req?._xhr?.getResponseHeader) {
          finalS3Url = tusUploadInstance._req._xhr.getResponseHeader("x-final-url") ||
                       tusUploadInstance._req._xhr.getResponseHeader("X-Final-URL");
        } else if (tusUploadInstance.xhr?.getResponseHeader) {
          finalS3Url = tusUploadInstance.xhr.getResponseHeader("x-final-url") ||
                       tusUploadInstance.xhr.getResponseHeader("X-Final-URL");
        }

        if (finalS3Url && finalS3Url.startsWith("https://https//")) {
          finalS3Url = finalS3Url.replace("https://https//", "https://");
        }

        const imageUrl = finalS3Url || upload.url;
        setUploadedUrl(imageUrl);
        setIsUploading(false);
        setUploadProgress(100);
      },
      onError: (err) => {
        setError(err.message);
        setIsUploading(false);
      },
    });

    upload.start();
  };

  const resetUpload = () => {
    setUploadProgress(0);
    setUploadedUrl(null);
    setError(null);
    setIsUploading(false);
  };

  return { uploadProgress, isUploading, uploadedUrl, error, uploadFile, resetUpload };
};