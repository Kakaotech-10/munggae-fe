import PropTypes from "prop-types";
import "./styles/Input.scss";

const Input = ({ ...props }) => {
  return (
    <div className="input-container">
      <input className="input-field" {...props} />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
};

export default Input;
