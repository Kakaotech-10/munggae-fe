import PropTypes from "prop-types";
import { useState } from "react";

const CommentInput = ({
  onSubmit,
  placeholder = "댓글을 입력해주세요",
  isSubmitting,
  parentId,
  postId,
  currentUserId,
  depth = 0,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      // 모든 필요한 파라미터를 명시적으로 전달
      await onSubmit(postId, currentUserId, content.trim(), parentId, depth);
      setContent(""); // 입력 성공 시 초기화
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  return (
    <form className="comment-input-container" onSubmit={handleSubmit}>
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
        className="send-button"
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
  postId: PropTypes.number.isRequired,
  currentUserId: PropTypes.number.isRequired,
  depth: PropTypes.number,
};

export default CommentInput;
