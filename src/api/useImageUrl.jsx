import axios from "axios";
import api from "./config";

export const uploadToS3 = async (presignedUrl, file, onProgress = () => {}) => {
  try {
    console.log("Upload details:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      presignedUrlLength: presignedUrl.length,
    });

    if (!presignedUrl) {
      throw new Error("유효하지 않은 사전 서명된 URL입니다.");
    }

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
      // 타임아웃 추가 (기본 10초에서 30초로 연장)
      timeout: 30000,
    });

    console.log("S3 Upload response status:", response.status);

    // 성공 시 S3 URL 반환 (쿼리 파라미터 제거)
    const s3Url = presignedUrl.split("?")[0];
    return s3Url;
  } catch (error) {
    console.error("S3 Upload error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.code === "ECONNABORTED") {
      throw new Error("파일 업로드 시간이 초과되었습니다.");
    }

    throw new Error(`파일 업로드 실패: ${error.message}`);
  }
};

export const getPresignedUrl = async (postId, fileNames) => {
  try {
    if (!postId || !fileNames || fileNames.length === 0) {
      throw new Error("유효하지 않은 입력 파라미터입니다.");
    }

    const response = await api.post(
      `/api/v1/posts/${postId}/images/presigned-url`,
      { fileNames }
    );

    console.log("Presigned URL Response:", {
      urls: response.data?.urls?.length,
      fileNames: fileNames,
    });

    return response.data;
  } catch (error) {
    console.error("Presigned URL 에러 상세:", {
      message: error.message,
      response: error.response?.data,
    });

    throw new Error("사전 서명된 URL을 가져오는데 실패했습니다.");
  }
};
