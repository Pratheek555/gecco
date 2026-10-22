/** Local design previews never bypass authentication in a production build. */
export const isSampleMode = process.env.ADMIN_SAMPLE_DATA === "1" && process.env.NODE_ENV !== "production";
