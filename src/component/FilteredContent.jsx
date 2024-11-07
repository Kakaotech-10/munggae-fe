import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/FilteredContent.scss";

const FilteredContent = ({ title, content, clean = true }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (clean) {
    return (
      <div className="content-wrapper">
        <div className="title">{title}</div>
        <div className="content">{content}</div>
      </div>
    );
  }

  return (
    <div className="filtered-content">
      {!isRevealed ? (
        <div className="filtered-message">
          <span className="warning-text">
            [구름봇에 의해 가려진 게시물입니다]
          </span>
          <button onClick={() => setIsRevealed(true)} className="reveal-button">
            확인하기
          </button>
        </div>
      ) : (
        <div className="revealed-content">
          <div className="title">{title}</div>
          <div className="content">{content}</div>
        </div>
      )}
    </div>
  );
};

FilteredContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  clean: PropTypes.bool,
};

export default FilteredContent;
