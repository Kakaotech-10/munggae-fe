import { useState, useEffect, useRef } from "react";
import { useUpdateProfile } from "../api/useUpdateProfile";
import Profileimg from "../image/logo_black.png";
import "./styles/ProfileUpload.scss";

const ProfileUpload = () => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { updateProfileImage, isUploading, uploadError } = useUpdateProfile();

  useEffect(() => {
    // Load initial profile image from localStorage
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
    if (memberInfo.imageUrl) {
      setPreview(memberInfo.imageUrl);
    }
  }, []);

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

      // Upload to S3
      const memberId = localStorage.getItem("userId");
      if (!memberId) {
        throw new Error("Login required");
      }

      const result = await updateProfileImage(memberId, file);

      if (result?.imageUrl) {
        // Update preview with CDN URL
        setPreview(result.imageUrl);

        // Notify other components
        window.dispatchEvent(new Event("profileImageUpdate"));
      }
    } catch (error) {
      console.error("Profile upload failed:", error);
      // Revert to previous image if upload fails
      const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
      setPreview(memberInfo.imageUrl || null);
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
            alt="Profile"
            className="preview-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = Profileimg;
            }}
          />
        ) : (
          <div className="upload-placeholder">
            <span>+</span>
          </div>
        )}
        {isUploading && <div className="upload-overlay">Uploading...</div>}
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

export default ProfileUpload;
