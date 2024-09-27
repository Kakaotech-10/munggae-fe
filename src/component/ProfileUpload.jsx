import { useState } from "react";
import "./styles/ProfileUpload.scss";

const ProfileUpload = () => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-upload">
      <label className="upload-label">
        {preview ? (
          <img src={preview} alt="Profile preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">+</div>
        )}
        <input type="file" onChange={handleFileChange} accept="image/*" />
      </label>
      <span>프로필 업로드</span>
    </div>
  );
};

export default ProfileUpload;
