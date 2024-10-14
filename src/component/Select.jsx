//Select.jsx

import PropTypes from "prop-types";
import "./styles/Select.scss";

const Select = ({ options, onChange, placeholder }) => {
  return (
    <select className="custom-select" onChange={onChange} defaultValue="">
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

export default Select;
