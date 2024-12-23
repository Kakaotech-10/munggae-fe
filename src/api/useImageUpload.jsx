import api from "./config";
import { getPresignedUrl, uploadToS3 } from "./useImageUrl";

export const useImageUpload = () => {
  const handleImageUpload = async (postId, files, onProgress = () => {}) => {
    try {
      // 1. 파일 검증 (기존 로직 유지)
      const validFiles = files.filter((file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        return file.size <= maxSize && validTypes.includes(file.type);
      });

      if (validFiles.length === 0) {
        throw new Error("업로드할 수 있는 파일이 없습니다.");
      }

      if (!postId) {
        console.error("게시물 ID가 없습니다.");
        throw new Error("게시물 ID가 없습니다. 게시글을 먼저 생성해주세요.");
      }

      // 3. Presigned URL 요청
      let presignedData;
      try {
        presignedData = await getPresignedUrl(
          postId,
          validFiles.map((f) => f.name)
        );
      } catch (urlError) {
        console.error("Presigned URL 요청 실패:", urlError);
        throw new Error("업로드 URL을 받지 못했습니다.");
      }

      if (!presignedData?.urls?.length) {
        console.error("유효한 업로드 URL을 받지 못했습니다.");
        throw new Error("유효한 업로드 URL을 받지 못했습니다.");
      }

      // 4. S3 업로드
      const uploadResults = [];
      const totalFiles = presignedData.urls.length;

      for (let i = 0; i < totalFiles; i++) {
        const urlInfo = presignedData.urls[i];
        const file = validFiles[i];

        if (!urlInfo || !file) {
          console.warn(`파일 ${i + 1}의 URL 정보가 없습니다.`);
          continue;
        }

        try {
          const s3Url = await uploadToS3(urlInfo.url, file, (progress) => {
            const totalProgress = (i * 100 + progress) / totalFiles;
            onProgress(totalProgress);
          });

          uploadResults.push({
            fileName: urlInfo.fileName,
            url: s3Url,
          });
        } catch (uploadError) {
          console.error(`파일 업로드 실패 (${file.name}):`, uploadError);
          // 하나의 파일 업로드 실패해도 전체 프로세스 중단하지 않음
        }
      }

      // 5. 업로드 결과 확인
      if (uploadResults.length === 0) {
        throw new Error("모든 파일 업로드에 실패했습니다.");
      }

      // 6. 이미지 URL 저장
      try {
        const response = await api.post(`/api/v1/posts/${postId}/images`, {
          urls: uploadResults,
        });

        return response.data.images;
      } catch (saveError) {
        console.error("이미지 URL 저장 실패:", saveError);
        throw new Error("이미지 정보를 서버에 저장하지 못했습니다.");
      }
    } catch (error) {
      console.error("Image upload process failed:", error);
      throw error;
    }
  };

  return { handleImageUpload };
};
