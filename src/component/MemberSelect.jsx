import PropTypes from "prop-types";
import "./styles/MemberSelect.scss";

const MemberSelect = ({
  members,
  selectedMemberIds,
  onMemberToggle,
  onSelectAll,
}) => {
  // localStorage에서 현재 로그인한 사용자의 ID를 가져옴
  const currentUserId = localStorage.getItem("userId");

  // 디버깅을 위한 로그 추가
  console.log("Current User ID:", currentUserId);
  console.log("All Members:", members);

  // 현재 로그인한 사용자를 제외한 멤버 목록 필터링
  const filteredMembers = members.filter((member) => {
    console.log("Comparing:", {
      memberId: member.id,
      currentUserId: currentUserId,
      isEqual: member.id === currentUserId,
    });
    return String(member.id) !== String(currentUserId);
  });

  console.log("Filtered Members:", filteredMembers);

  const allSelected =
    filteredMembers.length > 0 &&
    selectedMemberIds.length === filteredMembers.length;
  const memberIds = filteredMembers.map((member) => member.id);

  return (
    <div className="member-select-container">
      <div className="member-select-header">
        <h4>멤버 접근 권한</h4>
        <span className="members-count">전체 {filteredMembers.length}명</span>
        <label className="select-all-checkbox">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onSelectAll(memberIds)}
          />
          <span className="checkbox-label">전체 선택</span>
        </label>
      </div>
      <div className="member-select-list">
        {filteredMembers.map((member) => (
          <div key={member.id} className="member-select-item">
            <label className="member-checkbox">
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(member.id)}
                onChange={() => onMemberToggle(member.id)}
              />
              <span className="checkbox-label">
                <span className="member-name">{member.displayName}</span>
                <span className={`member-role ${member.role.toLowerCase()}`}>
                  {member.role === "MANAGER" ? "관리자" : "일반 사용자"}
                </span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

MemberSelect.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedMemberIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onMemberToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
};

export default MemberSelect;
