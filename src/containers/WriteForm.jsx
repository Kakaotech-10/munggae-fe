import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./styles/WriteForm.scss";
import Uploadicon from "../image/Uploadicon.svg";
import { createPost } from "../api/useCreatePost";
import { editPost } from "../api/useEditPost";
import { useImageUpload } from "../api/useImageUpload";
import Profileimg from "../image/logo_black.png";

const WriteForm = ({
  onClose,
  onPostCreated,
  editMode = false,
  initialPost = null,
}) => {
  const [title, setTitle] = useState(
    editMode && initialPost ? initialPost.title : ""
  );
  const [content, setContent] = useState(
    editMode && initialPost ? initialPost.content : ""
  );
  const [showUploadTime, setShowUploadTime] = useState(false);
  const [showDeadlineTime, setShowDeadlineTime] = useState(false);
  const [uploadDate, setUploadDate] = useState("");
  const [uploadTime, setUploadTime] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [files, setFiles] = useState([]);
  const [userInfo, setUserInfo] = useState({
    memberName: "",
    memberNameEnglish: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { handleImageUpload } = useImageUpload();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");
    setUserInfo({
      memberName: memberInfo.name || "",
      memberNameEnglish: memberInfo.nameEnglish || "",
    });

    // 프로필 이미지 설정
    const imageUrl =
      memberInfo.imageUrl?.path || memberInfo.imageUrl || Profileimg;
    setProfileImage(imageUrl);
  }, []);

  const displayName = () => {
    if (editMode && initialPost) {
      return `${initialPost.author.nameEnglish}(${initialPost.author.name})`;
    }
    return `${userInfo.memberNameEnglish}(${userInfo.memberName})`;
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      setIsUploading(true);
      setUploadStatus("게시글 저장 중...");

      const memberId = localStorage.getItem("userId");
      const postData = {
        title,
        content,
        memberId: parseInt(memberId),
      };

      let updatedPost = editMode
        ? await editPost(initialPost.id, initialPost.author.id, postData)
        : await createPost(postData);

      if (files.length > 0) {
        try {
          setUploadStatus("이미지 업로드 중...");

          const images = await handleImageUpload(
            updatedPost.id,
            files,
            (progress) => {
              setUploadProgress(progress);
              setUploadStatus(`이미지 업로드 중... ${Math.round(progress)}%`);
            }
          );

          updatedPost = { ...updatedPost, images };
          setUploadStatus("업로드 완료!");
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          const shouldProceed = window.confirm(
            `이미지 업로드 실패: ${uploadError.message}\n\n이미지 없이 게시글을 저장하시겠습니까?`
          );
          if (!shouldProceed) {
            throw new Error("사용자가 게시글 저장을 취소했습니다.");
          }
        }
      }

      onPostCreated(updatedPost);
      onClose();
    } catch (error) {
      console.error("Post submission failed:", error);
      alert(error.message || "게시글 저장 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validTypes = ["image/jpeg", "image/png", "image/gif"];

      if (file.size > maxSize) {
        alert(`${file.name}의 크기가 5MB를 초과합니다.`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        alert(
          `${file.name}은(는) 지원하지 않는 파일 형식입니다. (지원 형식: JPG, PNG, GIF)`
        );
        return false;
      }
      return true;
    });

    setFiles(validFiles);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "write-form-overlay") {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="write-form-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
    >
      <div className="write-form-container">
        <div className="form-layout">
          <div className="left-section">
            <div className="image-upload-area">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-button">
                사진 업로드
              </label>
              {files.length > 0 && (
                <div className="file-list">
                  <p>{files.length}개의 파일이 선택됨</p>
                  <ul>
                    {Array.from(files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {isUploading && uploadProgress > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="progress-text">{uploadStatus}</span>
                </div>
              )}
            </div>
          </div>
          <div className="right-section">
            <div className="profile-section">
              <img
                src={profileImage}
                alt="프로필"
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = Profileimg;
                }}
              />
              <span className="profile-name">{displayName()}</span>
              <img
                src={Uploadicon}
                alt={editMode ? "수정" : "업로드"}
                className="upload-icon"
                onClick={handleSubmit}
                style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
                disabled={isUploading}
              />
            </div>
            <div className="write-form-group">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                required
                disabled={isUploading}
              />
            </div>
            <div className="write-form-group">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
                disabled={isUploading}
              />
            </div>
            <div className="time-settings">
              <div className="write-form-group">
                <button
                  type="button"
                  onClick={() => setShowUploadTime(!showUploadTime)}
                  className={`time-toggle-button ${showUploadTime ? "active" : ""}`}
                >
                  업로드 시간 설정
                </button>
                {showUploadTime && (
                  <div className="time-inputs">
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                    />
                    <input
                      type="time"
                      value={uploadTime}
                      onChange={(e) => setUploadTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="write-form-group">
                <button
                  type="button"
                  onClick={() => setShowDeadlineTime(!showDeadlineTime)}
                  className={`time-toggle-button ${showDeadlineTime ? "active" : ""}`}
                >
                  마감 시간 설정
                </button>
                {showDeadlineTime && (
                  <div className="time-inputs">
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                    />
                    <input
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WriteForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPostCreated: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  initialPost: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string,
    author: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      nameEnglish: PropTypes.string,
    }),
  }),
};

export default WriteForm;
