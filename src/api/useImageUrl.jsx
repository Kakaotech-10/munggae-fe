import axios from "axios";
import api from "./config";

export const uploadToS3 = async (presignedUrl, file, onProgress = () => {}) => {
  try {
    console.log("Starting upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    const response = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    console.log("Upload response:", response);

    // 성공 시 S3 URL 반환
    const s3Url = presignedUrl.split("?")[0];
    return s3Url;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
};

export const getPresignedUrl = async (postId, fileNames) => {
  try {
    const response = await api.post(
      `/api/v1/posts/${postId}/images/presigned-url`,
      { fileNames }
    );
    console.log("Presigned URL Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw new Error("사전 서명된 URL을 가져오는데 실패했습니다.");
  }
};
