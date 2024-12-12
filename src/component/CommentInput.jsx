import PropTypes from "prop-types";
import { useState } from "react";
import MentionInput from "./MentionInput";
import useMentionApi from "../api/useMentionApi";
import "./styles/CommentInput.scss";

const CommentInput = ({
  onSubmit,
  placeholder = "댓글을 입력하세요",
  isSubmitting,
  parentId,
  depth,
}) => {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const { sendMentionNotification } = useMentionApi(); // fetchUsers 제거

  const handleMentionChange = (value, { mentions: newMentions }) => {
    setContent(value);
    setMentions(newMentions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || isSubmitting) return;

    try {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }

      // 댓글 업로드와 멘션 알림을 병렬로 처리
      const [uploadedComment] = await Promise.all([
        onSubmit(trimmedContent, parentId, depth),
        ...mentions.map((mention) =>
          sendMentionNotification(mention.id).catch((error) => {
            console.error(`멘션 알림 전송 실패 (${mention.id}):`, error);
            return null;
          })
        ),
      ]);

      // 입력창 초기화
      setContent("");
      setMentions([]);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert(error.message || "댓글 작성 중 오류가 발생했습니다.");
    }
  };

  const mentionInputStyle = {
    control: {
      fontSize: 14,
      fontWeight: "normal",
    },
    input: {
      margin: "-9px",
      padding: "8px 16px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      width: "100%",
      minHeight: "36px",
      height: "36px",
      lineHeight: "20px",
      resize: "none",
    },
    suggestions: {
      list: {
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
      item: {
        padding: "8px 12px",
        fontSize: "14px",
        color: "#1e293b",
        "&focused": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  };

  return (
    <form className="comment-input-form" onSubmit={handleSubmit}>
      <div className="mention-input-wrapper">
        <MentionInput
          value={content}
          onChange={handleMentionChange}
          placeholder={placeholder}
          disabled={isSubmitting}
          customStyle={mentionInputStyle}
        />
      </div>
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
  placeholder: "댓글을 입력하세요. '@'를 입력하여 멘션하세요.",
  isSubmitting: false,
  parentId: null,
  depth: 0,
};

export default CommentInput;
