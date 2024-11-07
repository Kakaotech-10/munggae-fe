import PropTypes from "prop-types";

const SimpleFilteredContent = ({ content, clean = true }) => {
  if (clean) {
    return <div>{content}</div>;
  }

  return (
    <div className="simple-filtered-content">
      <span className="warning-text">[구름봇에 의해 가려졌습니다]</span>
    </div>
  );
};

SimpleFilteredContent.propTypes = {
  content: PropTypes.string.isRequired,
  clean: PropTypes.bool,
};

export default SimpleFilteredContent;
