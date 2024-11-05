// CommentInput.jsx
import PropTypes from "prop-types";
import { useState } from "react";
import "./styles/CommentInput.scss";

const CommentInput = ({
  onSubmit,
  placeholder = "댓글을 입력하세요",
  isSubmitting,
  parentId,
  depth,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || isSubmitting) return;

    try {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }

      await onSubmit(trimmedContent, parentId, depth);
      setContent("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert(error.message || "댓글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <form className="comment-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="comment-input"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="comment-submit-button"
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? "..." : "SEND"}
      </button>
    </form>
  );
};

CommentInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isSubmitting: PropTypes.bool,
  parentId: PropTypes.number,
  depth: PropTypes.number,
};

CommentInput.defaultProps = {
  placeholder: "댓글을 입력하세요",
  isSubmitting: false,
  parentId: null,
  depth: 0,
};

export default CommentInput;
