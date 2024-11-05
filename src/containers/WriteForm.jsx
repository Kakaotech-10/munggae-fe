//WriteForm.jsx
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./styles/WriteForm.scss";
import Uploadicon from "../image/Uploadicon.svg";
import { createPost } from "../api/useCreatePost";
import { uploadAttachments } from "../api/useAttachment";
import { editPost } from "../api/useEditPost";

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

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const memberName = localStorage.getItem("memberName");
    const memberNameEnglish = localStorage.getItem("memberNameEnglish");
    setUserInfo({
      memberName: memberName || "",
      memberNameEnglish: memberNameEnglish || "",
    });
  }, []);

  // 사용자 이름을 표시하는 함수
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

      let updatedPost;
      if (editMode) {
        // 수정 모드일 때
        updatedPost = await editPost(initialPost.id, initialPost.author.id, {
          title,
          content,
        });
      } else {
        // 새 게시글 작성 모드일 때
        const memberId = localStorage.getItem("userId");
        const postData = {
          title,
          content,
          memberId: parseInt(memberId),
        };
        updatedPost = await createPost(postData);
      }

      if (files.length > 0) {
        await uploadAttachments(updatedPost.id, files);
      }

      onPostCreated(updatedPost);
    } catch (error) {
      console.error("Error submitting post:", error);
      alert(
        editMode
          ? "게시글 수정 중 오류가 발생했습니다."
          : "게시글 작성 중 오류가 발생했습니다."
      );
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
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
              {files.length > 0 && <p>{files.length}개의 파일이 선택됨</p>}
            </div>
          </div>
          <div className="right-section">
            <div className="profile-section">
              <img
                src="/path-to-profile-image.jpg"
                alt="프로필"
                className="profile-image"
              />
              <span className="profile-name">{displayName()}</span>
              <img
                src={Uploadicon}
                alt={editMode ? "수정" : "업로드"}
                className="upload-icon"
                onClick={handleSubmit}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                required
              />
            </div>
            <div className="form-group">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
              />
            </div>
            <div className="time-settings">
              <div className="form-group">
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
              <div className="form-group">
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
    }),
  }),
};
export default WriteForm;
