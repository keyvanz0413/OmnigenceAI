import { API_CONFIG } from './apiConfig';

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  message?: string;
  data?: any;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  additionalFields?: Record<string, string>;
  headers?: Record<string, string>;
}

export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
  options?: UploadOptions
): Promise<FileUploadResult> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);

    if (options?.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            fileId: response.fileId || response.id,
            fileName: response.fileName || file.name,
            fileUrl: response.fileUrl || response.url,
            fileSize: response.fileSize || file.size,
            mimeType: response.mimeType || file.type,
            message: response.message || 'Upload successful',
            data: response
          });
        } catch {
          reject(new Error('Failed to parse server response'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error occurred during upload')));
    xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`);
    xhr.timeout = API_CONFIG.TIMEOUT;

    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // TODO

    xhr.send(formData);
  });
};

export const uploadMultipleFiles = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<FileUploadResult[]> => {
  const results: FileUploadResult[] = [];
  let completedCount = 0;

  for (const file of files) {
    try {
      const result = await uploadFile(file, (fileProgress) => {
        if (onProgress) {
          onProgress(Math.round(((completedCount + fileProgress / 100) / files.length) * 100));
        }
      });
      results.push(result);
    } catch (error: any) {
      results.push({
        success: false,
        fileName: file.name,
        message: error.message
      });
    }
    completedCount++;
  }

  return results;
};

export const getFileBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file as base64'));
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
