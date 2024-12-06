// src/components/CustomModal.jsx
import PropTypes from "prop-types";
import "./styles/CustomModal.scss";

const CustomModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {description && <p className="modal-description">{description}</p>}
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

CustomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
};

export default CustomModal;
