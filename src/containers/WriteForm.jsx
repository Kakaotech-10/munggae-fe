//WriteForm.jsx

import { useState } from "react";
import "./styles/WriteForm.scss";
import Uploadicon from "../image/Uploadicon.svg";

const WriteForm = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showUploadTime, setShowUploadTime] = useState(false);
  const [showDeadlineTime, setShowDeadlineTime] = useState(false);
  const [uploadDate, setUploadDate] = useState("");
  const [uploadTime, setUploadTime] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [files, setFiles] = useState([]);

  const handleSubmit = async () => {
    try {
      // 게시글을 생성합니다.
      const postResponse = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          memberId: 1, // 실제 멤버 ID로 교체해야 합니다.
        }),
      });

      if (!postResponse.ok) {
        throw new Error("게시글 생성에 실패했습니다.");
      }

      const postData = await postResponse.json();

      // 파일이 있다면 업로드합니다.
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const fileResponse = await fetch(
          `/api/v1/posts/${postData.id}/attachments`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!fileResponse.ok) {
          throw new Error("파일 업로드에 실패했습니다.");
        }
      }

      // 게시글 생성 완료 후 콜백 함수 호출
      onPostCreated(postData);
      onClose();
    } catch (error) {
      console.error("게시글 제출 오류:", error);
      // 여기에 사용자에게 오류 메시지를 표시하는 로직을 추가할 수 있습니다.
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
              <span className="profile-name">Mae.park(박세영)</span>
              <img
                src={Uploadicon}
                alt="업로드"
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

export default WriteForm;
