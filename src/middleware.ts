export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/planning/:path*",
    "/capacity/:path*",
    "/drivers/:path*",
    "/settings/:path*",
    "/documentatie/:path*",
  ],
};
