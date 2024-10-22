import PropTypes from "prop-types";
import "./styles/Button.scss";

const Button = ({ text, backgroundColor, color, className, onClick }) => {
  const buttonStyle = {
    backgroundColor: backgroundColor || "#A9C1E5",
    color: color || "white",
  };

  return (
    <button
      className={`custom-button ${className || ""}`}
      style={buttonStyle}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
