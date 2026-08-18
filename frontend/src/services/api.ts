import axios from "axios";

/**
 * Single shared axios instance for the whole app.
 *
 * Why ONE instance instead of one per feature?
 * The access token (Bearer) is stored once in `defaults.headers.common`, so
 * every feature (auth, interview, ...) automatically sends it on protected
 * calls. If each feature created its own instance (like interview.api.ts used
 * to), the token set during login would never reach the other instances and
 * every protected request would fail with 401.
 */
const api = axios.create({
    // Backend is served from the same origin in production; in dev it runs on localhost:3000.
    baseURL: "/api",
    // Send cookies (the httpOnly refresh token) along with requests so the
    // backend can validate / rotate the refresh token.
    withCredentials: true,
});

/**
 * Set or remove the access token on the shared instance.
 *
 * Call this after login/signup and after every refresh-token response,
 * and pass `null` on logout so later requests stop authenticating.
 *
 * Once set, every api.get/post/put/delete from any feature carries
 * `Authorization: Bearer <token>` automatically.
 */
export const setAccessToken = (accessToken: string | null) => {
    if (accessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

export default api;
