// Pagination.jsx
import PropTypes from "prop-types";
import "./styles/Pagination.scss";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(currentPage - 2, 0);
    let endPage = Math.min(startPage + 4, totalPages - 1);

    // 끝부분에 도달했을 때 시작 페이지 조정
    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 0);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  const showPrevButton = currentPage > 0;
  const showNextButton = currentPage < totalPages - 1;

  return (
    <div className="pagination">
      {showPrevButton && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="nav-button"
        >
          &lt;
        </button>
      )}

      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={currentPage === pageNum ? "active" : ""}
        >
          {pageNum + 1}
        </button>
      ))}

      {showNextButton && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="nav-button"
        >
          &gt;
        </button>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
