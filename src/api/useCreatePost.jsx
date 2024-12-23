import api from "./config";

export const createPost = async (postData) => {
  try {
    // channelId 유효성 검사
    if (!postData.channelId) {
      throw new Error("게시글을 생성하기 위해서는 채널 ID가 필요합니다");
    }

    // 채널 정보 확인
    const channelInfo = JSON.parse(localStorage.getItem("channelInfo") || "{}");
    const userId = localStorage.getItem("userId");
    const memberInfo = JSON.parse(localStorage.getItem("memberInfo") || "{}");

    // 관리자가 아닌 경우 권한 확인
    if (memberInfo.role !== "MANAGER") {
      // 채널의 managerOnlyPost 설정 확인
      if (channelInfo.managerOnlyPost) {
        throw new Error("관리자만 게시글을 작성할 수 있는 채널입니다.");
      }

      // 채널 멤버 확인
      const channelMembers = channelInfo.members || [];
      const currentUserInChannel = channelMembers.find(
        (member) => member.memberId === parseInt(userId)
      );

      // 게시글 작성 권한 확인 (canPost가 1 또는 true인 경우에만 허용)
      if (
        !currentUserInChannel ||
        (currentUserInChannel.canPost !== 1 &&
          currentUserInChannel.canPost !== true)
      ) {
        throw new Error("게시글을 작성할 수 있는 권한이 없습니다.");
      }
    }

    const response = await api.post(
      "/api/v1/posts",
      {
        title: postData.title.trim(),
        content: postData.content.trim(),
        reservationTime: postData.reservationTime,
        deadLine: postData.deadLine,
      },
      {
        params: {
          channelId: postData.channelId,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          Accept: "application/json;charset=UTF-8",
          "Content-Type": "application/json",
        },
      }
    );

    // 기존의 오류 처리 로직 유지
    if (response.data?.code === "COM_001") {
      console.error("서버 측 오류 상세:", response.data);
      throw new Error(response.data.message || "서버 측 오류가 발생했습니다.");
    }

    if (!response.data) {
      throw new Error("서버로부터 응답을 받지 못했습니다");
    }

    console.log("게시글 생성 성공:", response.data);
    return response.data;
  } catch (error) {
    // 기존의 오류 로깅 및 처리 로직 유지
    console.error("게시글 생성 중 전체 오류:", error);

    // 권한 없음 에러 처리
    if (
      error.response?.status === 403 ||
      error.response?.data?.message ===
        "게시글을 작성할 수 있는 권한이 없습니다."
    ) {
      throw new Error("게시글을 작성할 수 있는 권한이 없습니다.");
    }

    throw new Error(error.message || "게시글 생성에 실패했습니다");
  }
};
