import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import "./styles/StudyViewForm.scss";

const StudyViewForm = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    // 여기에서 초기 게시글과 댓글 데이터를 불러올 수 있습니다
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // API 호출 로직
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      // API 호출 로직
      setCommentContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="study-content-wrapper">
        <div className="study-search-area">
          <Search />
        </div>

        <div className="study-header">
          <h2>학습게시판</h2>
        </div>

        <hr className="divider" />

        <div className="view-content-area">
          {isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            <>
              <div className="title-section">
                <h3>제목</h3>
                <div className="image-preview-container">
                  <div className="preview-box"></div>
                  <div className="preview-box"></div>
                </div>
                <div className="content-box"></div>
              </div>

              <div className="comment-section">
                <h3>댓글</h3>
                <div className="comment-input-area">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="댓글을 입력하세요"
                  />
                  <button className="send-button" onClick={handleCommentSubmit}>
                    SEND
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyViewForm;
