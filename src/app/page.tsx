"use client";

import { FormEvent, useState } from "react";

const destinations = [
  ["Maasai Mara", "Untamed safari country", "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80"],
  ["Diani Beach", "Indian Ocean ease", "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80"],
  ["Amboseli", "Elephants & Kilimanjaro", "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=80"],
  ["Nairobi", "A city with a wild side", "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=900&q=80"],
];

const experiences = [
  ["Safari", "Mara Horizon Camp", "Maasai Mara · 3 nights", "KSh 38,500", "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=900&q=80"],
  ["Coast stay", "The Sands, Diani", "Diani Beach · 2 guests", "KSh 22,000", "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80"],
  ["Culture", "Nairobi Food & Stories", "Nairobi · 4 hours", "KSh 6,800", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"],
];

const Arrow = () => <span className="arrow" aria-hidden="true">↗</span>;

export default function Home() {
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [menu, setMenu] = useState(false);
  const search = (event: FormEvent) => { event.preventDefault(); setMessage(destination ? `Exploring ${destination} — search will be connected to the marketplace data next.` : "Choose a destination to begin."); };

  return <main>
    <section className="hero" id="top">
      <nav className="nav container" aria-label="Main navigation">
        <a href="#top" className="brand"><span>SC</span>SafariConnect</a>
        <div className="nav-links"><a href="#explore">Explore</a><a href="#stays">Stays</a><a href="#safaris">Safaris</a><a href="#guides">Guides</a><a href="#ai">Safari AI</a></div>
        <div className="nav-actions"><a className="vendor-link" href="#vendor">List your business</a><a href="#login">Log in</a><a className="button button-light" href="#signup">Sign up</a></div>
        <button className="menu" aria-label="Open navigation" onClick={() => setMenu(!menu)}>☰</button>
      </nav>
      {menu && <div className="mobile-menu"><a href="#explore">Explore</a><a href="#stays">Stays</a><a href="#safaris">Safaris</a><a href="#ai">Safari AI</a><a href="#vendor">List your business</a></div>}
      <div className="hero-copy container">
        <p className="eyebrow light">KENYA, MADE PERSONAL</p><h1>Find the stories<br />worth travelling for.</h1>
        <p className="hero-text">A considered collection of stays, safaris and local experiences from people who know Kenya best.</p>
        <form className="search-card" onSubmit={search}>
          <label><span>Where to?</span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Try Maasai Mara" /></label>
          <label className="date"><span>When</span><input placeholder="Add dates" /></label><label className="guests"><span>Travellers</span><input placeholder="2 guests" /></label>
          <button className="search-button" aria-label="Explore Kenya">⌕</button>
        </form>
        {message && <p className="search-notice" role="status">{message}</p>}
        <div className="hero-foot"><span>Trusted local hosts</span><i /><span>Thoughtful journeys</span><i /><span>Direct connection</span></div>
      </div>
    </section>

    <section className="section container" id="explore"><div className="section-heading"><div><p className="eyebrow">START SOMEWHERE REMARKABLE</p><h2>Places that stay with you.</h2></div><a className="text-link" href="#destinations">See all destinations <Arrow /></a></div>
      <div className="destination-grid">{destinations.map(([name, detail, image], index) => <a className={`destination destination-${index}`} href="#destinations" key={name} style={{backgroundImage:`linear-gradient(180deg, transparent 42%, rgba(12,26,21,.72)),url(${image})`}}><div><p>{detail}</p><h3>{name}</h3></div><Arrow /></a>)}</div>
    </section>

    <section className="category-band" id="stays"><div className="container"><p className="eyebrow">CURATED FOR HOW YOU WANT TO GO</p><div className="categories">{[["⌂","Beautiful stays"],["◌","Wild safaris"],["⌁","Local experiences"],["⌑","Food & culture"],["✦","Private guides"]].map(([icon,label]) => <a key={label} href="#safaris"><span>{icon}</span>{label}<Arrow /></a>)}</div></div></section>

    <section className="section container" id="safaris"><div className="section-heading"><div><p className="eyebrow">HANDPICKED BY THE PEOPLE WHO LIVE IT</p><h2>Made for your kind of escape.</h2></div><a className="text-link" href="#explore">Discover more <Arrow /></a></div>
      <div className="experience-grid">{experiences.map(([type,name,place,price,image]) => <article className="experience-card" key={name}><div className="experience-image" style={{backgroundImage:`url(${image})`}}><button aria-label={`Save ${name}`}>♡</button><span>Verified host</span></div><div className="experience-body"><p className="card-type">{type}</p><h3>{name}</h3><p className="muted">{place}</p><div className="price"><strong>From {price}</strong><span>per person</span></div></div></article>)}</div>
    </section>

    <section className="ai-section" id="ai"><div className="container ai-layout"><div className="ai-copy"><p className="eyebrow light">MEET YOUR TRIP COPILOT</p><h2>Tell us your dream.<br /><em>We’ll find the way.</em></h2><p>Safari AI turns a few good instincts into a journey built around you — using real experiences from trusted local businesses.</p><a className="button button-sand" href="#start-ai">Plan with Safari AI <Arrow /></a><small>Recommendations only. You always arrange payment directly with your host.</small></div>
      <div className="ai-chat"><div className="chat-top"><span className="ai-mark">✦</span><div><strong>Safari AI</strong><small>Ready to plan your Kenya</small></div><span className="online">●</span></div><div className="bubble assistant">I&apos;d love to help. What kind of trip are you imagining?</div><div className="bubble user">Four days with wildlife, great food, and somewhere beautiful to sleep.</div><div className="bubble assistant">That sounds like a wonderful balance. Shall we start with your dates and budget?</div><div className="chat-input">Tell Safari AI about your trip <span>↑</span></div></div></div>
    </section>

    <section className="how-section container"><div className="how-intro"><p className="eyebrow">TRAVEL WITH CONFIDENCE</p><h2>Better journeys begin with better connections.</h2></div><div className="steps">{[["01","Explore thoughtfully","Find experiences that feel right, not just results that rank."],["02","Connect directly","Ask questions, shape the details, and get to know your host."],["03","Travel your way","Request your place, then arrange the rest directly with the vendor."]].map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="vendor-section" id="vendor"><div className="container vendor-layout"><div><p className="eyebrow">FOR THE PEOPLE WHO MAKE KENYA UNFORGETTABLE</p><h2>Your story deserves to be discovered.</h2><p>Join a growing community of exceptional local hosts and put your business in front of travellers looking for something real.</p></div><a className="button button-dark" href="#signup">Become a verified host <Arrow /></a></div></section>
    <section className="newsletter" id="guides"><div className="container"><p className="eyebrow">A LITTLE INSPIRATION, OCCASIONALLY</p><h2>The good kind of travel mail.</h2><form onSubmit={(event) => { event.preventDefault(); setMessage("You’re on the list — karibu!"); }}><input required type="email" placeholder="Your email address" aria-label="Email address" /><button>Join us <Arrow /></button></form></div></section>
    <footer><div className="container footer-grid"><div><a className="brand footer-brand" href="#top"><span>SC</span>SafariConnect</a><p>Travel closer to the places<br />and people that move you.</p></div><div><h4>Explore</h4><a href="#stays">Stays</a><a href="#safaris">Safaris</a><a href="#explore">Experiences</a><a href="#destinations">Destinations</a></div><div><h4>For hosts</h4><a href="#vendor">Become a host</a><a href="#login">Host login</a><a href="#guides">Host resources</a></div><div><h4>Company</h4><a href="#about">Our story</a><a href="#guides">Travel journal</a><a href="#contact">Contact</a><a href="#safety">Safety</a></div></div><div className="container footer-bottom"><span>© 2026 SafariConnect. Built in Kenya.</span><span>Privacy · Terms · Cookies</span></div></footer>
  </main>;
}
