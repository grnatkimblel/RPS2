import apiRoutes from "./apiRoutes";
import pages from "./enums/pages";

// async function login(navigate, credentials) {
//   // console.log("Login Attempt");
//   // console.log(credentials);
//   let res = await fetch(apiRoutes.login, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     method: "POST",
//     body: JSON.stringify(credentials),
//   });
//   let body = await res.json();
//   //console.log(body);
//   // return body;
//   setAccessToken(body.accessToken);
//   setRefreshToken(body.refreshToken);
//   setUserInfo({ username: credentials.username });
//   navigate(`/${pages.MAIN_MENU}`);
// }

async function getNewAccessToken(refreshToken, refreshTokenHook) {
  let res = await fetch(apiRoutes.refreshAccessToken, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshToken }),
  });
  let body = await res.json();
  return body.accessToken;
}

export { getNewAccessToken };
