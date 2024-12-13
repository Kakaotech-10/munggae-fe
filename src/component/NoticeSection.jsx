// src/components/NoticeSection.jsx
import { useDeadlineNotice } from "../api/useDeadlineNotice";
import Noticeicon_black from "../image/Noticeicon_black.svg";

const NoticeSection = () => {
  const { notices, isLoading, error } = useDeadlineNotice();

  const calculateDday = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    return `D-${diffDays}`;
  };

  return (
    <div className="right-section task-list">
      <h3>
        <div className="title-container">
          <img className="noticeicon" src={Noticeicon_black} alt="공지사항" />
          <span>공지사항</span>
        </div>
      </h3>
      <div className="section-content">
        <div className="notice-list">
          {isLoading ? (
            <div>Loading notices...</div>
          ) : error ? (
            <div>Error loading notices: {error}</div>
          ) : notices && notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice.id}
                className={`notice-item ${notice.important ? "important" : ""}`}
              >
                <span className="notice-title">{notice.title}</span>
                <span className="notice-dday">
                  {calculateDday(notice.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div>공지사항이 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeSection;
