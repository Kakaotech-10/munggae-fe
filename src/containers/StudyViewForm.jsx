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

const FilteredContent = ({ title, content, codeArea, clean }) => {
  if (clean) {
    return <div className="filtered-content">비공개 처리된 게시글입니다.</div>;
  }

  return (
    <div className="filtered-content">
      <h1 className="title">{title}</h1>

      {/* 일반 텍스트 영역 */}
      <div className="content-text">{content}</div>

      {/* 코드 영역이 있는 경우에만 표시 */}
      {codeArea && codeArea.trim() !== "" && (
        <div className="code-area">
          <pre>
            <code>{codeArea}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { handleCreateComment, isCreating, createError } = useCreateComment();
  const { getEducationPost } = useEducation();

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [postData, commentsData] = await Promise.all([
          getEducationPost(postId),
          getPostComments(postId),
        ]);

        console.log("Fetched Post Data:", postData);

        if (!postData) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }

        // post 데이터 설정
        setPost({
          id: postData.id,
          title: postData.title || "",
          content: postData.content || "",
          codeArea: postData.codeArea || "",
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          likes: postData.likes || 0,
          clean: postData.clean || false,
          imageUrls: Array.isArray(postData.imageUrls)
            ? postData.imageUrls.map((img) => img.path || img)
            : [],
          author: postData.member && {
            id: postData.member.id,
            role: postData.member.role || "STUDENT",
            course: postData.member.course || "",
            name: postData.member.name || "",
            nameEnglish: postData.member.nameEnglish || "",
            profileImage:
              postData.member.imageUrl?.path || postData.member.imageUrl || "",
          },
        });

        if (commentsData.error) {
          setCommentError(commentsData.error);
          setComments([]);
        } else {
          const commentsArray = commentsData.comments?.content || [];
          setComments(commentsArray);
        }

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
            console.error("Error fetching author data:", error);
            showAlertMessage("작성자 정보를 불러오는데 실패했습니다.");
          }
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
        setError(error.message || "게시물을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId, getEducationPost]);

  const getAuthorImage = () => {
    if (authorData?.imageUrl?.path) return authorData.imageUrl.path;
    if (authorData?.imageUrl) return authorData.imageUrl;
    if (post?.author?.profileImage?.path) return post.author.profileImage.path;
    if (post?.author?.profileImage) return post.author.profileImage;
    return Profileimg;
  };

  const handleCommentUpdate = (updatedComment, deletedCommentId = null) => {
    let updatedComments = [...comments];

    if (deletedCommentId) {
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

  const handleNewComment = async (content, parentId = null, depth = 0) => {
    try {
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

  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains("image-modal-overlay")) {
      setSelectedImage(null);
    }
  };

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

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
                {post?.author &&
                  `${post.author.name}(${post.author.nameEnglish})`}
              </span>
              <span className="upload-time">{formatDate(post?.updatedAt)}</span>
            </div>
          </div>

          <div className="title-section">
            <FilteredContent
              title={post.title}
              content={post.content}
              codeArea={post.codeArea}
              clean={post.clean}
            />
            <div className="image-preview-container">
              {post?.imageUrls?.map((url, index) => (
                <div
                  key={index}
                  className="preview-box"
                  onClick={() => handleImageClick(url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageClick(url);
                    }
                  }}
                >
                  <img src={url} alt={`Preview ${index + 1}`} />
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
                    postId={postId}
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
