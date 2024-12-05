import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import SideForm from "./SideForm";
import "./styles/StudyWriteForm.scss";

const StudyWriteForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [images, setImages] = useState([]);
  const imageInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, content, codeContent, images });
  };

  const handleCodeEditorToggle = () => {
    setShowCodeEditor(!showCodeEditor);
  };

  const handleCodeChange = (value) => {
    setCodeContent(value || "");
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
              <textarea
                placeholder="내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
