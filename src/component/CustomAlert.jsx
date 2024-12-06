// src/components/CustomAlert.jsx
import PropTypes from "prop-types";
import { useEffect } from "react";
import "./styles/CustomAlert.scss";

const CustomAlert = ({ title, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="custom-alert">
      {title && <h4 className="alert-title">{title}</h4>}
      <p className="alert-message">{message}</p>
    </div>
  );
};

CustomAlert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default CustomAlert;
