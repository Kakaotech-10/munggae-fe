// ChannelForm.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import ViewPage from "../component/ViewPage";
import { CustomButton } from "../component/CustomButton";
import CustomModal from "../component/CustomModal";
import CustomAlert from "../component/CustomAlert";
import MemberSelect from "../component/MemberSelect";
import useGetMembers from "../api/useGetMembers";
import api from "../api/config";
import "./styles/ChannelForm.scss";

// role 확인을 위한 함수
const getUserRole = () => {
  try {
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo"));
    return memberInfo?.role;
  } catch {
    return null;
  }
};

const ChannelForm = () => {
  const { channelId } = useParams();
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberPermissions, setMemberPermissions] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const isManager = getUserRole() === "MANAGER";
  const pageSize = 5;

  const {
    members,
    loading: membersLoading,
    error: membersError,
    loadMembers,
  } = useGetMembers();

  const loadChannelInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          Accept: "application/json;charset=UTF-8",
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const channelData = {
        ...response.data,
        name: response.data.channel_name || "채널", // 여기를 channel_name으로 수정
        members: (response.data.members || []).map((member) => ({
          ...member,
          // canPost 값을 명확히 변환 (1 또는 true일 경우 true로 설정)
          canPost: member.canPost === 1 || member.canPost === true,
        })),
        managerOnlyPost: response.data.managerOnlyPost || false,
      };

      // localStorage에 채널 정보 저장 (직렬화)
      localStorage.setItem("channelInfo", JSON.stringify(channelData));

      setChannelInfo(channelData);
      setError(null);
    } catch (error) {
      console.error("Failed to load channel info:", error);
      setError("채널 정보를 불러오는데 실패했습니다.");

      // 로컬 스토리지에서 채널 정보 제거
      localStorage.removeItem("channelInfo");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/v1/posts", {
        params: {
          channelId,
          pageNo: currentPage,
          size: pageSize,
          sort: sortBy,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = response.data || {};
      const content = Array.isArray(data.content) ? data.content : [];

      let sortedPosts = content.map((post) => ({
        post_id: post.id,
        post_title: post.title,
        post_content: post.content,
        post_likes: post.likes || 0,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
        clean: post.clean ?? true,
        imageUrls: Array.isArray(post.imageUrls) ? post.imageUrls : [],
        member: post.member || {},
      }));

      if (sortBy === "oldest") {
        sortedPosts.sort(
          (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
        );
      } else if (sortBy === "latest") {
        sortedPosts.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      } else {
        sortedPosts.sort((a, b) => (b.post_likes || 0) - (a.post_likes || 0));
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(data.totalPages || 1));
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("게시물을 불러오는데 실패했습니다.");
      setPosts([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 멤버 선택/해제 핸들러
  const handleMemberToggle = (memberId) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  // 전체 선택/해제 핸들러
  const handleSelectAllMembers = (memberIds) => {
    setSelectedMemberIds((prev) =>
      prev.length === memberIds.length ? [] : memberIds
    );
  };

  const handleAddMember = async () => {
    try {
      if (selectedMemberIds.length === 0) {
        showAlertMessage("멤버를 선택해주세요.");
        return;
      }

      // 권한 제한 체크박스에 따라 canPost 값 결정
      const canPost = !selectedMemberIds.some((id) => memberPermissions[id]);

      await api.post(
        `/api/v1/channels/${channelId}/members`,
        {
          canPost: canPost, // 모든 선택된 멤버에 대해 동일한 권한 적용
          memberIds: selectedMemberIds.map((id) => parseInt(id)),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            Accept: "application/json;charset=UTF-8",
          },
        }
      );

      setShowAddMemberModal(false);
      setSelectedMemberIds([]);
      setMemberPermissions({});
      showAlertMessage("멤버가 추가되었습니다.");

      // 채널 정보 다시 불러오기
      await loadChannelInfo();
    } catch (error) {
      console.error("Failed to add members:", error);
      showAlertMessage(
        error.response?.data?.message || "멤버 추가에 실패했습니다."
      );
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const checkWritePermission = () => {
    const role = getUserRole();

    if (role === "MANAGER") {
      return true;
    }

    const userId = parseInt(localStorage.getItem("userId"));
    const channelMember = channelInfo?.members?.find(
      (member) => member.memberId === userId
    );

    if (channelInfo?.managerOnlyPost) {
      return role === "MANAGER";
    }

    return channelMember?.canPost ?? false;
  };

  useEffect(() => {
    loadChannelInfo();
    fetchPosts();
  }, [channelId, currentPage, sortBy]);

  // 모달이 열릴 때 멤버 목록 로드
  useEffect(() => {
    if (showAddMemberModal) {
      loadMembers();
    }
  }, [showAddMemberModal]);

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handleWriteClick = () => {
    if (checkWritePermission()) {
      setShowWriteForm(true);
    } else {
      showAlertMessage("게시글 작성 권한이 없습니다.");
    }
  };

  const handlePostCreated = async (newPost) => {
    try {
      const formattedPost = {
        post_id: newPost.id,
        post_title: newPost.title,
        post_content: newPost.content,
        post_likes: 0,
        created_at: newPost.createdAt,
        updated_at: newPost.updatedAt,
        clean: newPost.clean,
        imageUrls: newPost.imageUrls || [],
        member: newPost.member,
      };

      setPosts((prevPosts) => [formattedPost, ...prevPosts]);
      setShowWriteForm(false);
      await fetchPosts();
      showAlertMessage("게시글이 작성되었습니다.");
    } catch (error) {
      console.error("Error handling new post:", error);
      showAlertMessage("게시글 작성에 실패했습니다.");
    }
  };

  const handlePostClick = async (postId) => {
    try {
      setIsLoading(true);
      setCommentError(null);

      const [postData, commentsData] = await Promise.all([
        api.get(`/api/v1/posts/${postId}`, {
          params: { channelId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
        api.get(`/api/v1/posts/${postId}/comments`, {
          params: { channelId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
      ]);

      const formattedPost = {
        id: postData.data.id,
        title: postData.data.title,
        content: postData.data.content,
        imageUrls: Array.isArray(postData.data.imageUrls)
          ? postData.data.imageUrls.map((img) => img?.path || "")
          : [],
        likes: String(postData.data.likes || 0),
        createdAt: postData.data.createdAt,
        updatedAt: postData.data.updatedAt,
        clean: postData.data.clean ?? true,
        author: {
          id: postData.data.member.id,
          role: postData.data.member.role,
          course: postData.data.member.course,
          name: postData.data.member.name,
          nameEnglish: postData.data.member.nameEnglish,
          profileImage: postData.data.member.imageUrl?.path || null,
        },
      };

      const formattedComments = commentsData.data?.content
        ? commentsData.data.content.map((comment) => ({
            id: comment.id,
            content: comment.content,
            parentId: comment.parentId || null,
            depth: comment.depth || 0,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            member: {
              id: comment.member.id,
              name: comment.member.name,
              nameEnglish: comment.member.nameEnglish,
              profileImage: comment.member.imageUrl?.path || null,
            },
            replies: comment.replies || [],
          }))
        : [];

      setSelectedPost(formattedPost);
      setComments(formattedComments);
    } catch (error) {
      console.error("Error fetching post details:", error);
      setSelectedPost(null);
      setCommentError("게시물을 불러오는데 실패했습니다.");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentsUpdate = async (updatedComments) => {
    try {
      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
      } else {
        const newComments = [...comments, updatedComments];
        setComments(newComments);
      }
    } catch (error) {
      console.error("Error updating comments:", error);
      setCommentError("댓글 업데이트에 실패했습니다.");
    }
  };

  const handlePostEdit = async (updatedPost) => {
    try {
      const formattedPost = {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        likes: String(updatedPost.likes || 0),
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        clean: updatedPost.clean,
        imageUrls: Array.isArray(updatedPost.imageUrls)
          ? updatedPost.imageUrls.map((img) => img?.path || "")
          : [],
        author: updatedPost.author || updatedPost.member,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === updatedPost.id ? formattedPost : post
        )
      );

      setSelectedPost(null);
      await fetchPosts();
      showAlertMessage("게시글이 수정되었습니다.");
    } catch (error) {
      console.error("Error updating post:", error);
      showAlertMessage("게시글 수정에 실패했습니다.");
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await api.delete(`/api/v1/posts/${postId}`, {
        params: { channelId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );
      setSelectedPost(null);
      setComments([]);
      await fetchPosts();
      showAlertMessage("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlertMessage("게시글 삭제에 실패했습니다.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 멤버 추가 모달
  const renderMemberAddModal = () => (
    <CustomModal
      isOpen={showAddMemberModal}
      onClose={() => {
        setShowAddMemberModal(false);
        setSelectedMemberIds([]);
        setMemberPermissions({});
      }}
      title="채널 멤버 추가"
      footer={
        <>
          <CustomButton
            variant="outline"
            onClick={() => {
              setShowAddMemberModal(false);
              setSelectedMemberIds([]);
              setMemberPermissions({});
            }}
          >
            취소
          </CustomButton>
          <CustomButton onClick={handleAddMember}>추가하기</CustomButton>
        </>
      }
    >
      <div className="member-form">
        {membersLoading ? (
          <div className="loading">멤버 목록을 불러오는 중...</div>
        ) : membersError ? (
          <div className="error">{membersError}</div>
        ) : (
          <div>
            <MemberSelect
              members={members}
              selectedMemberIds={selectedMemberIds}
              onMemberToggle={handleMemberToggle}
              onSelectAll={handleSelectAllMembers}
            />
            {selectedMemberIds.length > 0 && (
              <div className="permissions-section">
                <h4>선택된 멤버 권한 설정</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.some(
                      (id) => memberPermissions[id]
                    )}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      const newPermissions = {};
                      selectedMemberIds.forEach((id) => {
                        newPermissions[id] = newValue;
                      });
                      setMemberPermissions((prev) => ({
                        ...prev,
                        ...newPermissions,
                      }));
                    }}
                  />
                  선택된 멤버 게시글 작성 권한 제한
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomModal>
  );

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="commu-content-wrapper">
        <div className="commu-search-area">
          <Search />
        </div>

        <div className="community-header">
          <div className="header-left">
            <h2>{channelInfo?.name || "채널"}</h2>
            {isManager && (
              <CustomButton
                className="add-member-button"
                onClick={() => setShowAddMemberModal(true)}
              >
                멤버 추가
              </CustomButton>
            )}
          </div>
          <div className="header-right">
            <SortButtons onSort={handleSort} currentSort={sortBy} />
            <div className="button-group">
              <button
                className="write-button"
                onClick={handleWriteClick}
                disabled={isLoading}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="posts-area">
          {error ? (
            <div className="error-message">{error}</div>
          ) : isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            Array.isArray(posts) &&
            posts.map((post) => {
              const safePost = {
                post_id: post?.post_id || post?.id || 0,
                post_title: post?.post_title || post?.title || "",
                imageUrls: post?.imageUrls || [],
                post_likes: post?.post_likes ?? post?.likes ?? 0,
                clean: post?.clean ?? true,
              };

              return (
                <div
                  key={safePost.post_id}
                  onClick={() => handlePostClick(safePost.post_id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePostClick(safePost.post_id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="post-item"
                >
                  <Postlist
                    id={safePost.post_id}
                    title={safePost.post_title}
                    imageUrls={safePost.imageUrls}
                    likes={String(safePost.post_likes)}
                    clean={safePost.clean}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {showWriteForm && (
          <WriteForm
            onClose={() => setShowWriteForm(false)}
            onPostCreated={handlePostCreated}
            channelId={channelId}
          />
        )}

        {selectedPost && (
          <ViewPage
            post={selectedPost}
            comments={comments}
            commentError={commentError}
            onClose={() => setSelectedPost(null)}
            onPostDelete={handlePostDelete}
            onPostEdit={handlePostEdit}
            onCommentsUpdate={handleCommentsUpdate}
            channelId={channelId}
          />
        )}

        {renderMemberAddModal()}

        {showAlert && (
          <CustomAlert
            title="알림"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChannelForm;
