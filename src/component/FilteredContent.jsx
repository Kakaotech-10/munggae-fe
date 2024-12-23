import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/FilteredContent.scss";

const FilteredContent = ({ title, content, codeArea, clean, isSimpleView }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Explicitly check if clean is false
  const shouldFilter = clean === false;

  // 리스트 뷰용 심플 스타일 적용
  if (isSimpleView && shouldFilter) {
    return (
      <div className="simple-filtered-content">
        <span className="warning-text">
          [구름봇에 의해 가려진 게시물입니다]
        </span>
      </div>
    );
  }

  // If content should be filtered but not yet revealed
  if (shouldFilter && !isRevealed) {
    return (
      <div className="filtered-content">
        <div className="filtered-message">
          <span className="warning-text">
            [구름봇에 의해 가려진 게시물입니다]
          </span>
          <button
            onClick={() => setIsRevealed(true)}
            className="reveal-button"
            aria-label="필터링된 콘텐츠 확인하기"
          >
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
  isSimpleView: PropTypes.bool,
};

FilteredContent.defaultProps = {
  codeArea: "",
  clean: true,
  isSimpleView: false,
};

export default FilteredContent;
