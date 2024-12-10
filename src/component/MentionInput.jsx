import PropTypes from "prop-types";
import { MentionsInput, Mention } from "react-mentions";
import useMentionApi from "../api/useMentionApi";
import "./styles/MentionInput.scss";

const MentionInput = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  customStyle = {},
}) => {
  const { fetchUsers, isLoading } = useMentionApi();

  const handleChange = (event, newValue, newPlainTextValue, mentions) => {
    // 정규식을 사용하여 중복된 멘션 텍스트 제거
    const cleanedValue = newValue.replace(
      /@\[(.*?)\]\((.*?)\)/g,
      (match, name) => `@${name}`
    );

    onChange(cleanedValue, {
      plainText: newPlainTextValue,
      mentions: mentions,
    });
  };

  const defaultStyle = {
    control: {
      backgroundColor: "#fff",
      fontSize: 16,
      fontWeight: "normal",
    },
    input: {
      margin: "-9px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      width: "100%",
    },
    suggestions: {
      list: {
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      item: {
        padding: "8px 10px",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        "&focused": {
          backgroundColor: "#f0f0f0",
        },
      },
    },
  };

  const mentionInputStyle = {
    ...defaultStyle,
    ...customStyle,
  };

  return (
    <div className="custom-mention-input">
      <MentionsInput
        value={value}
        onChange={handleChange}
        style={mentionInputStyle}
        placeholder={placeholder}
        className={`mention-input ${className || ""} ${isLoading ? "is-loading" : ""}`}
        disabled={disabled}
      >
        <Mention
          trigger="@"
          data={fetchUsers}
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`user-suggestion ${focused ? "focused" : ""}`}>
              <div className="user-name">{highlightedDisplay}</div>
            </div>
          )}
          appendSpaceOnAdd={true}
          displayTransform={(id) => `@${id}`}
          markup="@[__display__]"
        />
      </MentionsInput>
    </div>
  );
};

MentionInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  customStyle: PropTypes.object,
};

MentionInput.defaultProps = {
  disabled: false,
  customStyle: {},
  className: "",
  placeholder: "@를 입력하여 멘션하세요",
};

export default MentionInput;
