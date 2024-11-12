import { useState } from "react";
import api from "../api/config";

export const useUpdateProfile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const updateProfileImage = async (memberId, file) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!memberId) {
        throw new Error("Member ID is required");
      }

      if (!file) {
        throw new Error("File is required");
      }

      console.log("Starting image upload process:", {
        memberId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 1. Get presigned URL
      console.log("Requesting presigned URL...");
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

      console.log("Presigned URL response:", presignedUrlResponse);

      if (!presignedUrlResponse?.data?.urls) {
        throw new Error("No presigned URL data received from server");
      }

      const { url: presignedUrl, fileName: serverFileName } =
        presignedUrlResponse.data.urls;

      if (!presignedUrl) {
        throw new Error("Presigned URL is missing from response");
      }

      // 2. Upload to S3 using presigned URL
      console.log("Uploading to S3...", {
        url: presignedUrl,
        fileType: file.type,
        fileName: serverFileName,
      });

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          response: errorText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
        });
        throw new Error(
          `S3 upload failed: ${uploadResponse.statusText} - ${errorText}`
        );
      }

      console.log("S3 upload successful");

      // Extract the base URL (S3 object URL without the presigned parameters)
      const baseUrl = presignedUrl.split("?")[0];

      // 3. Save image information to backend
      console.log("Saving image information to backend...", {
        fileName: serverFileName,
        url: baseUrl,
      });

      const saveImageResponse = await api.post(
        `/api/v1/members/${memberId}/images`,
        {
          urls: {
            fileName: serverFileName,
            url: baseUrl,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("Save image response:", saveImageResponse);

      if (!saveImageResponse?.data) {
        throw new Error("Failed to save image information to server");
      }

      return saveImageResponse.data;
    } catch (error) {
      console.error("Profile image upload error:", {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          response: error.response?.data,
          status: error.response?.status,
        },
        context: {
          memberId,
          fileName: file?.name,
          fileType: file?.type,
          fileSize: file?.size,
          accessToken: localStorage.getItem("accessToken")
            ? "Present"
            : "Missing",
        },
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload profile image";

      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    updateProfileImage,
    isUploading,
    uploadError,
  };
};
