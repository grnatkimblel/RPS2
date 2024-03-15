import { useState, useEffect, useRef } from "react";
import { getNewAccessToken } from "../helper";
import API_ROUTES from "./enums/apiRoutes";

export default function useApi(url, requestType, body) {
  const [accessToken, setAccessToken] = useState("");

  useEffect(
    async (url, requestType, body) => {
      try {
        if (url === API_ROUTES.LOGIN) {
          let res = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
            },
            method: requestType,
            body: JSON.stringify(body),
          });
          if (res.status == 200) {
            let body = await res.json();
            setAccessToken(body.accessToken);
          }
          return {
            username: body.user.username,
            userId: body.user.userId,
            emoji: body.user.emoji,
          };
          //throw new Error("No AccessToken to authorize against");
          //setAccessToken(res.json().accessToken);
        }

        if (accessToken === "") {
          throw new Error("No AccessToken to authorize against");
        }

        let res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
          credentials: "include",
          method: requestType,
          body: JSON.stringify(body),
        });

        if (res.status === 403) {
          // Refresh Token
          const newAccessToken = await getNewAccessToken();
          setAccessToken(newAccessToken);
        }

        if (res.status === 200) return res;
      } catch (error) {
        console.error("Error authorizing call to:" + url);
        console.error(error);
        throw new Error(error); // to make the promise get rejected
      }
    },
    [url, requestType, body]
  );
}
