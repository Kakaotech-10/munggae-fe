import api from "./config";

export const createPost = async (postData) => {
  // channelId가 제공되었는지 확인
  if (!postData.channelId) {
    throw new Error("게시글을 생성하기 위해서는 channelId가 필요합니다");
  }

  try {
    // 예약 시간이 설정된 경우 ISO 형식으로 변환
    const reservationTime =
      postData.uploadDate && postData.uploadTime
        ? `${postData.uploadDate}T${postData.uploadTime}:00`
        : null;

    // 마감 시간이 설정된 경우 ISO 형식으로 변환
    const deadLine =
      postData.deadlineDate && postData.deadlineTime
        ? `${postData.deadlineDate}T${postData.deadlineTime}:00`
        : null;

    const response = await api.post(
      "/api/v1/posts",
      {
        title: postData.title, // 게시글 제목
        content: postData.content, // 게시글 내용
        reservationTime, // 게시글 업로드 예약 시간
        deadLine, // 게시글 마감 시간
      },
      {
        params: {
          channelId: postData.channelId, // 필수 채널 ID
          memberId: postData.memberId, // 회원 ID
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("게시글 생성 중 오류 발생:", error);
    throw error;
  }
};
