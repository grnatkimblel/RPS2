import { useState } from "react";

function OpponentSelectButton({ opponentName, styles, classes }) {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <button
      style={styles}
      className={classes + (isSelected ? " submittable" : "  defaultColor")}
      onClick={(e) => {
        e.stopPropagation();
        isSelected ? setIsSelected(false) : setIsSelected(true);
      }}
    >
      {opponentName}
    </button>
  );
}

export default OpponentSelectButton;
