import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import PAGES from "../enums/pages";

function MainMenu({ navigate, userInfo, onLogout }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          height: "12%",
        }}
      >
        <button
          style={{ flex: 1 }}
          className={"defaultColor bottomBorder"}
          onClick={() => navigate(`/${PAGES.ACCOUNT}`)}
        >
          {userInfo.username}
        </button>
        <button
          style={{ flex: 1 }}
          className={"defaultColor bottomBorder leftBorder"}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
      <div
        style={{
          display: "flex",
          height: "88%",
        }}
      >
        <button style={{ flex: 1 }} className="notInteractableColor">
          Local
        </button>
        <button
          style={{ flex: 1 }}
          className="defaultColor leftBorder"
          onClick={() => navigate(`/${PAGES.ONLINE.INITIAL}`)}
        >
          Online
        </button>
      </div>
      <div className="title">RPS</div>
    </>
  );
}

export default MainMenu;
