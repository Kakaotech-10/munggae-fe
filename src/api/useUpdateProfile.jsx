import { useState } from "react";
import api from "../api/config";

export const useUpdateProfile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // 공통 함수: Presigned URL 가져오기
  const getPresignedUrl = async (memberId, file) => {
    const response = await api.post(
      `/api/v1/members/${memberId}/images/presigned-url`,
      {
        fileName: file.name,
        contentType: file.type,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    const { urls } = response.data;
    if (!urls || !urls.url) {
      throw new Error("Invalid presigned URL response");
    }

    return urls;
  };

  // 공통 함수: S3에 이미지 업로드
  const uploadToS3 = async (presignedUrl, file) => {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  };

  // 공통 함수: localStorage 업데이트
  const updateLocalStorage = (imageUrl) => {
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
    memberInfo.imageUrl = imageUrl;
    localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
  };

  const uploadNewImage = async (memberId, file) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!memberId || !file) {
        throw new Error("Member ID and file are required");
      }

      // 1. Presigned URL 가져오기
      const { url: presignedUrl, fileName: serverFileName } =
        await getPresignedUrl(memberId, file);

      // 2. S3에 업로드
      await uploadToS3(presignedUrl, file);

      // 3. 이미지 URL 저장
      const imageUrl = presignedUrl.split("?")[0];
      const saveImageResponse = await api.post(
        `/api/v1/members/${memberId}/images`,
        {
          urls: {
            fileName: serverFileName,
            url: imageUrl,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (saveImageResponse.data) {
        updateLocalStorage(imageUrl);
      }

      return {
        imageUrl,
        fileName: serverFileName,
      };
    } catch (error) {
      console.error("Image upload error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setUploadError(error.message || "이미지 업로드 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updateExistingImage = async (memberId, imageId, file) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!memberId || !imageId || !file) {
        throw new Error("Member ID, Image ID, and file are required");
      }

      // 1. Presigned URL 가져오기
      const { url: presignedUrl, fileName: serverFileName } =
        await getPresignedUrl(memberId, file);

      // 2. S3에 업로드
      await uploadToS3(presignedUrl, file);

      // 3. 이미지 정보 업데이트
      const imageUrl = presignedUrl.split("?")[0];
      const updateResponse = await api.put(
        `/api/v1/members/${memberId}/images/${imageId}`,
        {
          imageInfo: {
            fileName: serverFileName,
            url: imageUrl,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (updateResponse.data) {
        updateLocalStorage(updateResponse.data.s3ImagePath);
      }

      return {
        imageUrl: updateResponse.data.s3ImagePath,
        fileName: updateResponse.data.storedName,
      };
    } catch (error) {
      console.error("Image update error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setUploadError(error.message || "이미지 수정 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadNewImage,
    updateExistingImage,
    isUploading,
    uploadError,
  };
};
