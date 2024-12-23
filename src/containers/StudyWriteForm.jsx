import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import SideForm from "./SideForm";
import MentionInput from "../component/MentionInput";
import useMentionApi from "../api/useMentionApi";
import { createPost } from "../api/useCreatePost"; // Import the createPost function
import "./styles/StudyWriteForm.scss";

const StudyWriteForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [images, setImages] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const { sendMentionNotification } = useMentionApi();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Combine content and code content with ***** separator
      const combinedContent =
        showCodeEditor && codeContent
          ? `${content}\n*****\n${codeContent}`
          : content;

      // Get channelId from your application state or route params
      const channelId = 5;

      // Prepare post data
      const postData = {
        channelId,
        title: title,
        content: combinedContent,
        // Add these if your study board needs them
        reservationTime: null,
        deadLine: null,
      };

      // Create the post
      const response = await createPost(postData);

      // Send mention notifications after successful post creation
      for (const mention of mentions) {
        await sendMentionNotification(mention.id);
      }

      // Handle success (e.g., show success message, redirect)
      console.log("Post created successfully:", response);

      // Reset form or redirect
      setTitle("");
      setContent("");
      setCodeContent("");
      setShowCodeEditor(false);
      setImages([]);
      setMentions([]);
    } catch (error) {
      // Handle specific error cases
      let errorMessage = "게시글 작성에 실패했습니다.";

      if (error.message.includes("권한이 없습니다")) {
        errorMessage = "게시글을 작성할 수 있는 권한이 없습니다.";
      }

      // Show error message to user (implement your error display mechanism)
      console.error("Error creating post:", errorMessage);
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={handleImageButtonClick}
                disabled={isSubmitting}
              >
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
                      disabled={isSubmitting}
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
              disabled={isSubmitting}
            />

            <div className="editors-container">
              <MentionInput
                value={content}
                onChange={handleContentChange}
                placeholder="내용을 입력해주세요. '@'를 입력하여 다른 사용자를 멘션할 수 있습니다."
                className="content-textarea"
                disabled={isSubmitting}
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
                      readOnly: isSubmitting,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="submit-button-wrapper">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "업로드 중..." : "업로드 하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudyWriteForm;
