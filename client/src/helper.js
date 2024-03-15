import API_ROUTES from "./enums/apiRoutes";

async function getNewAccessToken(refreshToken) {
  try {
    let res = await fetch(API_ROUTES.REFRESH_ACCESS_TOKEN, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      //credentials: "include",
      body: JSON.stringify({ refreshToken: refreshToken }),
    });
    let body = await res.json();
    return body.accessToken;
  } catch (error) {
    console.error("Failed to get Access Token\\/");
    console.error(error);
  }
}

export { getNewAccessToken };
