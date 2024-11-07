// SortButtons.jsx
import PropTypes from "prop-types";
import "./styles/SortButtons.scss";

const SortButtons = ({ onSort, currentSort }) => {
  return (
    <div className="sort-buttons">
      <button
        onClick={() => onSort("latest")}
        className={currentSort === "latest" ? "active" : ""}
      >
        최신순
      </button>
      <button
        onClick={() => onSort("oldest")}
        className={currentSort === "oldest" ? "active" : ""}
      >
        오래된 순
      </button>
      <button
        onClick={() => onSort("popular")}
        className={currentSort === "popular" ? "active" : ""}
      >
        인기순
      </button>
    </div>
  );
};

SortButtons.propTypes = {
  onSort: PropTypes.func.isRequired,
  currentSort: PropTypes.string.isRequired,
};

export default SortButtons;
