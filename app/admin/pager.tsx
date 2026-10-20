import Link from "next/link";

export function Pager({ page, pages, total, makeHref }: { page: number; pages: number; total: number; makeHref: (p: number) => string }) {
  if (pages <= 1) return <div className="a-pager"><span>{total} {total === 1 ? "item" : "items"}</span></div>;
  return (
    <div className="a-pager">
      <span>
        Page {page} of {pages}, {total} items
      </span>
      <span className="links">
        {page > 1 && <Link className="a-btn secondary sm" href={makeHref(page - 1)}>Previous</Link>}
        {page < pages && <Link className="a-btn secondary sm" href={makeHref(page + 1)}>Next</Link>}
      </span>
    </div>
  );
}
