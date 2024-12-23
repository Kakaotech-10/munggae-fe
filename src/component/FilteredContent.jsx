import PropTypes from "prop-types";
import "./styles/FilteredContent.scss";

const FilteredContent = ({ title, content, codeArea }) => {
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
};

FilteredContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  codeArea: PropTypes.string,
};

FilteredContent.defaultProps = {
  codeArea: "",
};

export default FilteredContent;
