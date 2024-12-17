import FirstIcon from "../image/1sticon.svg";
import SecondIcon from "../image/2ndicon.svg";
import ThirdIcon from "../image/3rdicon.svg";
import { useRanking } from "../api/useRanking";

const Ranking = () => {
  const {
    rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRanking();

  const getIconForRank = (rank) => {
    switch (rank) {
      case 1:
        return FirstIcon;
      case 2:
        return SecondIcon;
      case 3:
        return ThirdIcon;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (rankingsLoading) {
      return <div>Loading...</div>;
    }

    if (rankingsError) {
      return <div>Error loading rankings: {rankingsError}</div>;
    }

    if (!rankings || rankings.length === 0) {
      return <div>현재 표시할 랭킹 데이터가 없습니다.</div>;
    }

    return rankings
      .sort((a, b) => a.rank - b.rank)
      .map((topic) => (
        <div key={topic.rank} className={`topic-item rank-${topic.rank}`}>
          <img
            src={getIconForRank(topic.rank)}
            alt={`Rank ${topic.rank}`}
            className="rank-icon"
          />
          <div className="topic-bar" style={{ height: `${topic.count}%` }}>
            <span className="topic-name">{topic.topic}</span>
          </div>
        </div>
      ));
  };

  return (
    <div className="right-section top-topics">
      <h3>
        <div className="title-container">실시간 Top Topic</div>
      </h3>
      <div className="section-content">
        <p className="subtitle">현재 이슈가 되고 있는 내용은 무엇일까요?</p>
        <div className="topics-podium">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Ranking;
