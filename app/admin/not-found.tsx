import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="a-login">
      <div className="a-login-card">
        <h1>Not found</h1>
        <p className="a-muted">That admin page or item does not exist, or it was deleted.</p>
        <Link className="a-btn" href="/admin">
          Back to the dashboard
        </Link>
      </div>
    </main>
  );
}
