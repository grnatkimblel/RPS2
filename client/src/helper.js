import apiRoutes from "./enums/apiRoutes";

async function getNewAccessToken(refreshToken) {
  try {
    let res = await fetch(apiRoutes.refreshAccessToken, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
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
