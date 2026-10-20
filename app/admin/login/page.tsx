import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { dbConfigured } from "@/lib/server/db";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (dbConfigured() && (await currentUser())) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="a-login">
      <LoginForm next={next || ""} dbReady={dbConfigured()} />
    </main>
  );
}
