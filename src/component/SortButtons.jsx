//SortButton.jsx

import "./styles/SortButtons.scss";

const SortButtons = ({ onSort }) => {
  return (
    <div className="sort-buttons">
      <button onClick={() => onSort("latest")}>최신순</button>
      <button onClick={() => onSort("oldest")}>오래된 순</button>
      <button onClick={() => onSort("popular")}>인기순</button>
    </div>
  );
};

export default SortButtons;
