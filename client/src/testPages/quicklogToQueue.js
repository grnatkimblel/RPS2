import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";
import QuickLogButton from "./quickLogButton";

function QuickLogToQueue({ navigate, login, authHelper, userInfo, gameInfoSetter }) {
  const GRANT_CREDENTIALS = {
    username: "grant",
    password: "123123",
  };
  const RHETT_CREDENTIALS = {
    username: "rhett",
    password: "123123",
  };
  const ZACH_CREDENTIALS = {
    username: "zach",
    password: "123123",
  };
  const JAKE_CREDENTIALS = {
    username: "jake",
    password: "123123",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }} className=" bottomBorder">
        <QuickLogButton
          navigate={navigate}
          login={login}
          authHelper={authHelper}
          userInfo={userInfo}
          gameInfoSetter={gameInfoSetter}
          credential={GRANT_CREDENTIALS}
        />
        <QuickLogButton
          navigate={navigate}
          login={login}
          authHelper={authHelper}
          userInfo={userInfo}
          gameInfoSetter={gameInfoSetter}
          credential={RHETT_CREDENTIALS}
        />
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }} className=" bottomBorder leftBorder">
        <QuickLogButton
          navigate={navigate}
          login={login}
          authHelper={authHelper}
          userInfo={userInfo}
          gameInfoSetter={gameInfoSetter}
          credential={ZACH_CREDENTIALS}
        />
        <QuickLogButton
          navigate={navigate}
          login={login}
          authHelper={authHelper}
          userInfo={userInfo}
          gameInfoSetter={gameInfoSetter}
          credential={JAKE_CREDENTIALS}
        />
      </div>
      <div className="title">RPS</div>
    </div>
  );
}

export default QuickLogToQueue;
