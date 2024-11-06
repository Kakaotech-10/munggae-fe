// useSaveImage.jsx
import api from "./config";

export const saveImages = async (postId, imageUrls) => {
  try {
    console.log("Saving images to backend:", { postId, imageUrls });

    const response = await api.post(`/api/v1/posts/${postId}/images`, {
      urls: imageUrls.map((url) => ({
        fileName: url.fileName,
        url: url.url,
      })),
    });

    console.log("Backend save response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to save image URLs:", error);
    throw new Error("이미지 URL 저장 중 오류가 발생했습니다.");
  }
};
