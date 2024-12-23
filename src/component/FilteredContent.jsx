import { useState } from "react";
import PropTypes from "prop-types";
import "./styles/FilteredContent.scss";

const FilteredContent = ({ title, content, codeArea, clean = true }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (clean) {
    return (
      <div className="filtered-content">
        <h4 className="title">{title}</h4>

        {/* 일반 텍스트 영역 */}
        <div className="content-text">{content}</div>

        {/* 코드 영역이 있는 경우에만 표시 */}
        {codeArea && codeArea.trim() !== "" && (
          <div className="code-area">
            <pre>
              <code>{codeArea}</code>
            </pre>
          </div>
        )}
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
          <h4 className="title">{title}</h4>

          {/* 일반 텍스트 영역 */}
          <div className="content-text">{content}</div>

          {/* 코드 영역이 있는 경우에만 표시 */}
          {codeArea && codeArea.trim() !== "" && (
            <div className="code-area">
              <pre>
                <code>{codeArea}</code>
              </pre>
            </div>
          )}
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
