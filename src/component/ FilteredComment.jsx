import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/FilteredComment.scss";

const FilteredCommentContent = ({ content, clean = true }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (clean) {
    return <div className="comment-content">{content}</div>;
  }

  return (
    <div className="filtered-comment">
      {!isRevealed ? (
        <div className="filtered-message">
          <span className="warning-text">
            [구름봇에 의해 가려진 댓글입니다]
          </span>
          <button onClick={() => setIsRevealed(true)} className="reveal-button">
            확인하기
          </button>
        </div>
      ) : (
        <div className="comment-content">{content}</div>
      )}
    </div>
  );
};

FilteredCommentContent.propTypes = {
  content: PropTypes.string.isRequired,
  clean: PropTypes.bool,
};

export default FilteredCommentContent;
