// src/api/useAttachment.jsx

import api from "./config";

export const uploadAttachments = async (postId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post(
      `/api/v1/posts/${postId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading attachments:", error);
    throw error;
  }
};
