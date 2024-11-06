import api from "./config";

export const uploadToS3 = async (presignedUrl, file, onProgress = () => {}) => {
  try {
    console.log("Starting S3 upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      url: presignedUrl,
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // withCredentials를 false로 설정
      xhr.withCredentials = false;

      xhr.open("PUT", presignedUrl, true);

      // 필수 헤더만 설정
      xhr.setRequestHeader("Content-Type", file.type);

      // 타임아웃 설정
      xhr.timeout = 30000; // 30초

      // 업로드 진행률
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete}%`);
          onProgress(percentComplete);
        }
      };

      // 성공 처리
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const s3Url = presignedUrl.split("?")[0];
          console.log("Upload successful. S3 URL:", s3Url);
          resolve(s3Url);
        } else {
          console.error("Upload failed with status:", xhr.status);
          console.error("Response:", xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      // 에러 처리
      xhr.onerror = (event) => {
        console.error("XHR Error details:", {
          type: event.type,
          target: event.target,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
        });
        reject(new Error(`Network error during upload: ${xhr.statusText}`));
      };

      // 타임아웃 처리
      xhr.ontimeout = () => {
        reject(new Error("Upload timed out"));
      };

      // 업로드 취소 처리
      xhr.onabort = () => {
        reject(new Error("Upload was aborted"));
      };

      try {
        // 실제 전송
        xhr.send(file);
      } catch (sendError) {
        console.error("Error sending file:", sendError);
        reject(new Error(`Failed to send file: ${sendError.message}`));
      }
    });
  } catch (error) {
    console.error("S3 upload error:", {
      error,
      fileName: file.name,
      fileSize: file.size,
      url: presignedUrl,
    });
    throw error;
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
