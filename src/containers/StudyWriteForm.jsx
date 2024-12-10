import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import SideForm from "./SideForm";
import MentionInput from "../component/MentionInput";
import useMentionApi from "../api/useMentionApi";
import "./styles/StudyWriteForm.scss";

const StudyWriteForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [images, setImages] = useState([]);
  const [mentions, setMentions] = useState([]); // 멘션된 사용자들 관리
  const imageInputRef = useRef(null);
  const { sendMentionNotification } = useMentionApi();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 게시글 업로드 API 호출 (예시)
      // await submitPost({ title, content, codeContent, images });

      // 모든 멘션된 사용자에게 알림 전송
      for (const mention of mentions) {
        await sendMentionNotification(mention.id);
      }

      console.log({
        title,
        content,
        codeContent,
        images,
        mentionedUsers: mentions.map((mention) => mention.id),
      });

      // 성공 처리 (예: 목록 페이지로 이동)
    } catch (error) {
      console.error("게시글 업로드 중 오류 발생:", error);
      // 에러 처리 (예: 에러 메시지 표시)
    }
  };

  const handleCodeEditorToggle = () => {
    setShowCodeEditor(!showCodeEditor);
  };

  const handleCodeChange = (value) => {
    setCodeContent(value || "");
  };

  const handleContentChange = (value, { mentions: newMentions }) => {
    setContent(value);
    setMentions(newMentions);
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImages((prev) => [
          ...prev,
          {
            url: imageUrl,
            name: files[0].name,
          },
        ]);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="study-write-container">
      <div className="sidebar-area">
        <SideForm />
      </div>

      <div className="write-content-wrapper">
        <h1>학습게시판</h1>

        <div className="write-form-container">
          <form onSubmit={handleSubmit}>
            <div className="button-group">
              <button
                type="button"
                onClick={handleCodeEditorToggle}
                className={showCodeEditor ? "active" : ""}
              >
                &lt;/&gt;
              </button>
              <button type="button" onClick={handleImageButtonClick}>
                이미지
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            {images.length > 0 && (
              <div className="image-preview-container">
                {images.map((image, i) => (
                  <div key={`image-${i}`} className="image-preview-item">
                    <img src={image.url} alt={image.name} />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleRemoveImage(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />

            <div className="editors-container">
              <MentionInput
                value={content}
                onChange={handleContentChange}
                placeholder="내용을 입력해주세요. '@'를 입력하여 다른 사용자를 멘션할 수 있습니다."
                className="content-textarea"
              />

              {showCodeEditor && (
                <div className="code-editor-container">
                  <Editor
                    height="300px"
                    defaultLanguage="javascript"
                    value={codeContent}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="submit-button-wrapper">
              <button type="submit" className="submit-button">
                업로드 하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudyWriteForm;
