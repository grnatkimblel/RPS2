import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import pages from "../enums/pages";

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
        className="defaultColor redTextBorder smooth-16"
        onClick={() => navigate(`/${pages.LOGIN}`)}
      >
        Login
      </button>
      <button
        style={{ flex: 1 }}
        className="defaultColor leftBorder redTextBorder smooth-16"
        onClick={() => navigate(`/${pages.CREATE_ACCOUNT}`)}
      >
        Create Account
      </button>
      <div className="title">RPS</div>
    </div>
  );
}

export default Root;
