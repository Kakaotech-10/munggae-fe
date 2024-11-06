// useImageUpload.jsx
import api from "./config";
import { getPresignedUrl, uploadToS3 } from "./useImageUrl";

export const useImageUpload = () => {
  const handleImageUpload = async (postId, files, onProgress = () => {}) => {
    try {
      // 1. 파일 검증
      const validFiles = files.filter((file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        return file.size <= maxSize && validTypes.includes(file.type);
      });

      if (validFiles.length === 0) {
        throw new Error("업로드할 수 있는 파일이 없습니다.");
      }

      // 2. Presigned URL 요청
      const presignedData = await getPresignedUrl(
        postId,
        validFiles.map((f) => f.name)
      );

      if (!presignedData?.urls?.length) {
        throw new Error("업로드 URL을 받지 못했습니다.");
      }

      // 3. S3 업로드
      const uploadResults = [];
      const totalFiles = presignedData.urls.length;

      for (let i = 0; i < totalFiles; i++) {
        const urlInfo = presignedData.urls[i];
        const file = validFiles[i];

        console.log(`Uploading file ${i + 1}/${totalFiles}: ${file.name}`);

        const s3Url = await uploadToS3(urlInfo.url, file, (progress) => {
          const totalProgress = (i * 100 + progress) / totalFiles;
          onProgress(totalProgress);
        });

        uploadResults.push({
          fileName: urlInfo.fileName,
          url: s3Url,
        });
      }

      // 4. 이미지 URL 저장
      const response = await api.post(`/api/v1/posts/${postId}/images`, {
        urls: uploadResults,
      });

      return response.data.images;
    } catch (error) {
      console.error("Image upload process failed:", error);
      throw error;
    }
  };

  return { handleImageUpload };
};
