import "../styles/buttonStyles.css";
import "../styles/texts.css";
import "../styles/elementSpecific.css";

import pages from "../enums/pages";
import apiRoutes from "../enums/apiRoutes";

import { useEffect, useState } from "react";

function Account({ navigate, userInfo, authHelper }) {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    let ignore = false;

    authHelper(apiRoutes.getUsers, "GET").then(
      (res) => {
        if (res == undefined) return;
        if (!ignore) {
          // console.log(res);
          res.json().then((body) => {
            // console.log(body);
            setUsers(body);
          });
        }
        return () => {
          ignore = true;
        };
      },
      (error) => {
        console.error("AuthHelper failed");
      }
    );
  }, [authHelper]);

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
          }}
        >
          {/* leftSide */}
          <div className="notInteractableColor account-username">
            {userInfo.username}
          </div>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-evenly",
              fontSize: "20px",
            }}
            // className="notInteractableColor flex-container"
            className="notInteractableColor "
          >
            {users != null ? (
              users.map((user) => (
                <div key={user.id}>
                  <div>{`Username: ${user.username}`}</div>
                  <div>{`userId: ${user.id}`}</div>
                  <div>{`emoji: ${user.player_emoji}`}</div>
                </div>
              ))
            ) : (
              <></>
            )}

            {/* <div>Win/Loss: {0.0}</div>
            <div>Rock: {0.0}%</div>
            <div>Paper: {0.0}%</div>
            <div>Scissors: {0.0}%</div> */}
          </div>
        </div>

        {/* rightSide */}
        <button
          style={{ flex: 1 }}
          className="defaultColor leftBorder"
          onClick={() => navigate(`/${pages.MAIN_MENU}`)}
        >
          Back
        </button>
      </div>

      <div className="title">RPS</div>
    </>
  );
}

export default Account;
