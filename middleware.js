import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req){
    const role = req.cookies.get("role")?.value;

    if(req.nextUrl.pathname.startsWith("/admin") && role !== "admin"){
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if(req.nextUrl.pathname.startsWith("/employee") && role !== "employee"){
        return NextResponse.redirect(new URL("/login", req.url));
    }
}