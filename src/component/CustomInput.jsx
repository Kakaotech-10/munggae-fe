import PropTypes from "prop-types";
import "./styles/CustomComponent.scss";

export const CustomInput = ({ id, label, value, onChange, type = "text" }) => (
  <div className="custom-input-group">
    {label && <label htmlFor={id}>{label}</label>}
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      className="custom-input"
    />
  </div>
);

CustomInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
};
