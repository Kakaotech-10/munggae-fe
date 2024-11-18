import { useState } from "react";
import api from "../api/config";

export const useUpdateProfile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadNewImage = async (memberId, file) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!memberId || !file) {
        throw new Error("Member ID and file are required");
      }

      // 1. Get presigned URL
      const presignedUrlResponse = await api.post(
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

      const { urls } = presignedUrlResponse.data;
      if (!urls || !urls.url) {
        throw new Error("Invalid presigned URL response");
      }

      const { url: presignedUrl, fileName: serverFileName } = urls;

      // 2. Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // 3. Save image URL
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
        // Update memberInfo in localStorage
        const memberInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );
        memberInfo.imageUrl = imageUrl;
        localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
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

      // 1. Get presigned URL for the new image
      const presignedUrlResponse = await api.post(
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

      const { urls } = presignedUrlResponse.data;
      if (!urls || !urls.url) {
        throw new Error("Invalid presigned URL response");
      }

      const { url: presignedUrl, fileName: serverFileName } = urls;

      // 2. Upload new image to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // 3. Update image information
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
        // Update memberInfo in localStorage
        const memberInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );
        memberInfo.imageUrl = updateResponse.data.s3ImagePath;
        localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
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
