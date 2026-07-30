export default function ScoreBar({ score, combo, current, total }) {
  return (
    <div className="score-bar">
      <span>คะแนน: {score}</span>
      <span>ข้อ {current}/{total}</span>
      {combo >= 2 && <span className="combo-badge">🔥 Combo x{combo}</span>}
    </div>
  );
}