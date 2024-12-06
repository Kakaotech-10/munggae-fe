// src/components/CustomButton.jsx
import PropTypes from "prop-types";
import "./styles/CustomComponent.scss";

export const CustomButton = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
}) => (
  <button type={type} className={`custom-button ${variant}`} onClick={onClick}>
    {children}
  </button>
);

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "outline"]),
  onClick: PropTypes.func,
  type: PropTypes.string,
};
