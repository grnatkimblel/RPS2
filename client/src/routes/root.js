import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";

function Root({ navigate }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <button
        style={{ flex: 1 }}
        className="defaultColor"
        onClick={() => navigate(`/${PAGES.LOGIN}`)}
      >
        Login
      </button>
      <button
        style={{ flex: 1 }}
        className="defaultColor leftBorder"
        onClick={() => navigate(`/${PAGES.CREATE_ACCOUNT}`)}
      >
        Create Account
      </button>
      <div className="title">RPS</div>
    </div>
  );
}

export default Root;
