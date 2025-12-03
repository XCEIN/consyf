import { NextResponse, NextRequest } from "next/server";

const authPaths = ["/register", "/login"];
const privatePaths = ["/me"];

function checkInclude(list: string[], pathname: string) {
  return list.some((path) => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  if (sessionToken && sessionToken.trim().length === 0) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  const checkIncludePrivate = checkInclude(privatePaths, pathname);
  if (checkIncludePrivate && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  const checkIncludeAuth = checkInclude(authPaths, pathname);
  if (checkIncludeAuth && sessionToken) {
    return NextResponse.redirect(new URL("/me", request.nextUrl));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/me/:path*", "/register", "/login"],
};
