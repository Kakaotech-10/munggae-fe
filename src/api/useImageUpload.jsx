// useImageUpload.jsx
import api from "./config";
import { getPresignedUrl, uploadToS3 } from "./useImageUrl";

export const useImageUpload = () => {
  // validateFiles를 useImageUpload 함수 내부로 이동
  const validateFiles = (files) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ["image/jpeg", "image/png", "image/gif"];

    return Array.from(files).map((file) => {
      if (file.size > maxSize) {
        throw new Error(`${file.name}의 크기가 10MB를 초과합니다.`);
      }
      if (!validTypes.includes(file.type)) {
        throw new Error(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`);
      }
      return file;
    });
  };

  const handleImageUpload = async (postId, files, onProgress = () => {}) => {
    try {
      // 1. 파일 검증
      const validFiles = validateFiles(files);
      console.log(
        "Processing files:",
        validFiles.map((f) => f.name)
      );
      onProgress(5);

      // 2. Presigned URL 요청
      const presignedData = await getPresignedUrl(
        postId,
        validFiles.map((f) => f.name)
      );
      console.log("Received presigned URLs:", presignedData);

      if (!presignedData?.urls?.length) {
        throw new Error("업로드 URL을 받지 못했습니다.");
      }

      onProgress(10);

      // 3. S3 업로드
      const uploadResults = [];
      const totalFiles = presignedData.urls.length;
      const progressPerFile = 80 / totalFiles;

      for (let i = 0; i < totalFiles; i++) {
        const urlInfo = presignedData.urls[i];
        const file = validFiles[i];

        console.log(`Uploading file ${i + 1}/${totalFiles}: ${file.name}`);

        try {
          const s3Url = await uploadToS3(urlInfo.url, file, (progress) => {
            const overallProgress =
              10 + i * progressPerFile + (progress * progressPerFile) / 100;
            onProgress(Math.min(90, overallProgress));
          });

          // URL 정보 저장
          uploadResults.push({
            fileName: urlInfo.fileName, // 원본 파일명
            url: s3Url, // S3 URL
          });

          console.log(`Successfully uploaded ${file.name}`);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      }

      // 4. 이미지 URL 저장
      if (uploadResults.length > 0) {
        try {
          console.log("Saving image URLs:", { urls: uploadResults });

          // API 스펙에 맞게 요청 데이터 구성
          const response = await api.post(`/api/v1/posts/${postId}/images`, {
            urls: uploadResults,
          });

          console.log("Image save response:", response.data);
          onProgress(100);

          // 응답 데이터에서 이미지 정보 추출
          return response.data.images.map((image) => ({
            id: image.imageId,
            postId: image.postId,
            originalName: image.originalName,
            storedName: image.storedName,
            url: image.s3ImagePath,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
          }));
        } catch (error) {
          console.error("Failed to save image URLs:", error);
          throw new Error("이미지 URL 저장 중 오류가 발생했습니다.");
        }
      }

      return [];
    } catch (error) {
      console.error("Image upload process failed:", error);
      throw error;
    }
  };

  return { handleImageUpload };
};
