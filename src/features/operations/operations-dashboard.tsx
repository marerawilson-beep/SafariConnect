import Link from "next/link";

type Card = { id: string; title: string; detail: string; status?: string };
export function OperationsDashboard({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: { title: string; cards: Card[] }[] }) {
  return <main className="dashboard-page"><nav className="dashboard-nav container"><Link href="/" className="brand"><span>SC</span>SafariConnect</Link><Link href="/dashboard" className="text-link">Traveller space</Link></nav><div className="container dashboard-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="dashboard-request-grid">{sections.map((section) => <section className="dashboard-section" key={section.title}><div className="dashboard-heading"><h2>{section.title}</h2><span>{section.cards.length}</span></div>{section.cards.length ? <div className="dashboard-list">{section.cards.map((card) => <article className="dashboard-card" key={card.id}><div><p className="card-type">{card.status ?? "In review"}</p><h3>{card.title}</h3><p className="muted">{card.detail}</p></div></article>)}</div> : <p className="dashboard-empty">Nothing needs attention.</p>}</section>)}</div></div></main>;
}
