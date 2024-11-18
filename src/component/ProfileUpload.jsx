import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useUpdateProfile } from "../api/useUpdateProfile";
import Profileimg from "../image/logo_black.png";
import "./styles/ProfileUpload.scss";

const ProfileUpload = ({ initialImage, onImageUpload }) => {
  const [preview, setPreview] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const fileInputRef = useRef(null);
  const { uploadNewImage, updateExistingImage, isUploading, uploadError } =
    useUpdateProfile();

  useEffect(() => {
    // initialImage prop이나 localStorage에서 이미지 정보 로드
    if (initialImage?.path) {
      setPreview(initialImage.path);
      setCurrentImageId(initialImage.imageId);
    } else {
      const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      if (memberInfo.imageUrl?.path) {
        setPreview(memberInfo.imageUrl.path);
        setCurrentImageId(memberInfo.imageUrl.imageId);
      }
    }
  }, [initialImage]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Get member ID
      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        throw new Error("로그인이 필요합니다.");
      }

      let result;

      // If we have an existing image, update it. Otherwise, upload new one
      if (currentImageId) {
        result = await updateExistingImage(memberId, currentImageId, file);
      } else {
        result = await uploadNewImage(memberId, file);
      }

      if (result?.imageUrl?.path) {
        // Update preview with CDN URL
        setPreview(result.imageUrl.path);

        // If this was a new upload, store the image ID
        if (result.imageUrl.imageId) {
          setCurrentImageId(result.imageUrl.imageId);

          // Update local storage with new image info
          const memberInfo = JSON.parse(
            localStorage.getItem("memberInfo") || "{}"
          );
          memberInfo.imageUrl = result.imageUrl;
          memberInfo.imageId = result.imageUrl.imageId;
          localStorage.setItem("memberInfo", JSON.stringify(memberInfo));
        }

        // Call the parent's callback with the new image URL
        if (onImageUpload) {
          onImageUpload(result.imageUrl);
        }

        // Notify other components about the update
        window.dispatchEvent(new Event("profileImageUpdate"));
      }
    } catch (error) {
      console.error("프로필 이미지 업로드/수정 실패:", error);
      // Revert to previous image if upload fails
      if (initialImage?.path) {
        setPreview(initialImage.path);
      } else {
        const memberInfo = JSON.parse(
          localStorage.getItem("memberInfo") || "{}"
        );
        setPreview(memberInfo.imageUrl?.path || null);
      }
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="profile-upload">
      <div
        className={`upload-area ${isUploading ? "uploading" : ""}`}
        onClick={handleClick}
      >
        {preview ? (
          <img
            src={preview}
            alt="프로필"
            className="preview-image"
            onError={(e) => {
              console.log("Image load error, using default image");
              e.target.onerror = null;
              e.target.src = Profileimg;
            }}
          />
        ) : (
          <div className="upload-placeholder">
            <span>+</span>
          </div>
        )}
        {isUploading && (
          <div className="upload-overlay">
            {currentImageId ? "이미지 수정 중..." : "이미지 업로드 중..."}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        disabled={isUploading}
      />
      {uploadError && <div className="error-message">{uploadError}</div>}
    </div>
  );
};

ProfileUpload.propTypes = {
  initialImage: PropTypes.shape({
    imageId: PropTypes.number,
    fileName: PropTypes.string,
    path: PropTypes.string,
  }),
  onImageUpload: PropTypes.func,
};

ProfileUpload.defaultProps = {
  initialImage: null,
  onImageUpload: null,
};

export default ProfileUpload;
