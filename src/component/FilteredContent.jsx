import { useState } from "react";
import PropTypes from "prop-types";

const FilteredContent = ({ title, content, codeArea, clean }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Explicitly check if clean is false
  const shouldFilter = clean === false;

  // If content should be filtered but not yet revealed
  if (shouldFilter && !isRevealed) {
    return (
      <div className="filtered-content">
        <div className="filtered-message">
          <span className="warning-text">
            [구름봇에 의해 가려진 게시물입니다]
          </span>
          <button onClick={() => setIsRevealed(true)} className="reveal-button">
            확인하기
          </button>
        </div>
      </div>
    );
  }

  // Show content if either clean=true or content has been revealed
  return (
    <div className="filtered-content">
      <h4 className="title">{title}</h4>
      <div className="content-text">{content}</div>
      {codeArea && codeArea.trim() !== "" && (
        <div className="code-area">
          <pre>
            <code>{codeArea}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

FilteredContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  codeArea: PropTypes.string,
  clean: PropTypes.bool,
};

FilteredContent.defaultProps = {
  codeArea: "",
  clean: true,
};

export default FilteredContent;
