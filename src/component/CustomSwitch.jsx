// src/components/CustomSwitch.jsx
import PropTypes from "prop-types";
import "./styles/CustomComponent.scss";

export const CustomSwitch = ({ id, label, checked, onChange }) => (
  <div className="custom-switch-group">
    {label && <label htmlFor={id}>{label}</label>}
    <label className="custom-switch">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider" />
    </label>
  </div>
);

CustomSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
