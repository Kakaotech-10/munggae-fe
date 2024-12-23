import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Comment from "../component/Comment";
import CommentInput from "../component/CommentInput";
import { useCreateComment } from "../hooks/useComment";
import useEducation from "../api/useEducation";
import Hearticon from "../image/Hearticon.svg";
import Commenticon from "../image/Commenticon.svg";
import { getPostComments } from "../api/useGetComment";
import api from "../api/config";
import Profileimg from "../image/logo_black.png";
import CustomAlert from "../component/CustomAlert";
import "./styles/StudyViewForm.scss";
import FilteredContent from "../component/FilteredContent";

const StudyViewForm = () => {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 커스텀 훅들
  const { handleCreateComment, isCreating, createError } = useCreateComment();
  const {
    getEducationPost,
    isLoading: postLoading,
    error: postError,
  } = useEducation();

  // 알림 메시지 표시 함수
  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // 사용자 ID 로딩
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  // 게시글 및 댓글 데이터 로딩
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // 게시글과 댓글 병렬 로딩
        const [postData, commentsData] = await Promise.all([
          getEducationPost(postId),
          getPostComments(postId),
        ]);

        console.log("Fetched Post Data:", postData);

        // 게시글이 없는 경우 에러 처리
        if (!postData) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }

        // 게시글 데이터 설정
        setPost(postData);

        // 댓글 데이터 처리
        if (commentsData.error) {
          setCommentError(commentsData.error);
          setComments([]);
        } else {
          const commentsArray = commentsData.comments?.content || [];
          setComments(commentsArray);
        }

        // 작성자 정보 로딩
        if (postData?.member?.id) {
          try {
            const authorResponse = await api.get(
              `/api/v1/members/${postData.member.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );
            setAuthorData(authorResponse.data);
          } catch (error) {
            console.error("작성자 정보 로딩 중 오류:", error);
            showAlertMessage("작성자 정보를 불러오는데 실패했습니다.");
          }
        }
      } catch (error) {
        console.error("게시글 상세 정보 로딩 중 오류:", error);
        showAlertMessage(error.message || "게시물을 불러오는데 실패했습니다.");
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId, getEducationPost]);

  // 작성자 프로필 이미지 가져오기
  const getAuthorImage = () => {
    if (authorData?.imageUrl?.path) return authorData.imageUrl.path;
    if (authorData?.imageUrl) return authorData.imageUrl;
    if (post?.member?.imageUrl?.path) return post.member.imageUrl.path;
    if (post?.member?.imageUrl) return post.member.imageUrl;
    return Profileimg;
  };

  // 댓글 업데이트 핸들러
  const handleCommentUpdate = (updatedComment, deletedCommentId = null) => {
    let updatedComments = [...comments];

    if (deletedCommentId) {
      // 댓글 삭제 로직
      updatedComments = updatedComments.filter((comment) => {
        if (comment.id === deletedCommentId) return false;
        if (comment.replies) {
          comment.replies = comment.replies.filter(
            (reply) => reply.id !== deletedCommentId
          );
        }
        return true;
      });
    } else if (updatedComment) {
      const parentId = updatedComment.parentId;

      if (parentId) {
        // 답글 추가 로직
        updatedComments = updatedComments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), updatedComment].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              ),
            };
          }
          return comment;
        });
      } else {
        // 댓글 수정/추가 로직
        const existingCommentIndex = updatedComments.findIndex(
          (comment) => comment.id === updatedComment.id
        );

        if (existingCommentIndex !== -1) {
          updatedComments[existingCommentIndex] = {
            ...updatedComments[existingCommentIndex],
            ...updatedComment,
          };
        } else {
          updatedComments = [
            {
              ...updatedComment,
              replies: [],
            },
            ...updatedComments,
          ];
        }
      }
    }

    setComments(updatedComments);
  };

  // 새 댓글 생성 핸들러
  const handleNewComment = async (content, parentId = null, depth = 0) => {
    try {
      // 댓글 유효성 검사
      if (!content?.trim()) {
        showAlertMessage("댓글 내용을 입력해주세요.");
        return;
      }

      if (!currentUserId) {
        showAlertMessage("로그인이 필요합니다.");
        return;
      }

      if (!postId) {
        showAlertMessage("게시글 정보가 없습니다.");
        return;
      }

      // 댓글 생성
      const newComment = await handleCreateComment(
        postId,
        currentUserId,
        content.trim(),
        parentId,
        depth
      );

      if (newComment) {
        handleCommentUpdate(newComment);
        showAlertMessage("댓글이 작성되었습니다.");
      }
    } catch (error) {
      console.error("댓글 생성 실패:", error);
      showAlertMessage(error.message || "댓글 작성에 실패했습니다.");
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = (e) => {
    if (e.target.classList.contains("image-modal-overlay")) {
      setSelectedImage(null);
    }
  };

  // 로딩 상태 처리
  if (postLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  // 에러 상태 처리
  if (postError) {
    return <div className="error-message">{postError}</div>;
  }

  // 게시글 없음 처리
  if (!post) {
    return <div className="error-message">게시글을 찾을 수 없습니다.</div>;
  }

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
          <div className="profile-section">
            <img
              src={getAuthorImage()}
              alt="프로필"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = Profileimg;
              }}
            />
            <div className="profile-info">
              <span className="profile-name">
                {post?.member &&
                  `${post.member.name}(${post.member.nameEnglish})`}
              </span>
              <span className="upload-time">{formatDate(post?.updatedAt)}</span>
            </div>
          </div>

          <div className="title-section">
            <FilteredContent
              title={post.title}
              content={post.content}
              codeArea={post.codeArea}
              clean={post.isClean}
            />
            <div className="image-preview-container">
              {post?.imageUrls?.map((url, index) => (
                <div
                  key={index}
                  className="preview-box"
                  onClick={() => handleImageClick(url.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageClick(url.path);
                    }
                  }}
                >
                  <img src={url.path} alt={`Preview ${index + 1}`} />
                </div>
              ))}
            </div>
            <div className="reaction">
              <img className="hearts" src={Hearticon} alt="하트 아이콘" />
              <span>{post?.likes || 0}</span>
              <div className="divider"></div>
              <img className="comments" src={Commenticon} alt="댓글 아이콘" />
              <span>{comments.length}</span>
            </div>
          </div>

          <hr className="comment-divider" />

          <div className="comment-section">
            <h3>댓글</h3>
            <div className="comment-input-area">
              <CommentInput
                onSubmit={handleNewComment}
                placeholder="댓글을 입력하세요"
                isSubmitting={isCreating}
                depth={0}
              />
              {createError && (
                <div className="error-message">{createError}</div>
              )}
            </div>
            <div className="comments-list">
              {commentError ? (
                <div className="error-message">{commentError}</div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment
                    key={`comment-${comment.id}`}
                    comment={comment}
                    depth={0}
                    currentUserId={currentUserId}
                    postId={parseInt(postId)}
                    onCommentUpdate={handleCommentUpdate}
                  />
                ))
              ) : (
                <div className="no-comments">댓글이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="image-modal-content">
            <img src={selectedImage} alt="확대된 이미지" />
            <button
              className="close-button"
              onClick={() => setSelectedImage(null)}
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      {showAlert && (
        <CustomAlert
          title="알림"
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

// PropTypes 정의
FilteredContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  codeArea: PropTypes.string,
  clean: PropTypes.bool.isRequired,
};

FilteredContent.defaultProps = {
  codeArea: "",
};

export default StudyViewForm;
