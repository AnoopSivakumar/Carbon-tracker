import React from 'react';
import { Link } from 'react-router-dom';

const principles = [
  { number: '01', title: 'Notice the everyday', text: 'Turn commutes, energy, water, and waste into a clear picture of your impact.' },
  { number: '02', title: 'Make one better choice', text: 'Small changes become visible when you can see the difference they make.' },
  { number: '03', title: 'Bring people with you', text: 'Verified activity and shared rewards make progress feel collective.' }
];

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link to="/" className="brand-mark" aria-label="Carbon Circle home">
          <span className="brand-dot" />
          <span>carbon<span>circle</span></span>
        </Link>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#impact">Impact</a>
          <Link to="/login" className="nav-login">Sign in <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> A clearer way to live lighter</p>
            <h1>Leave a<br /><em>lighter</em> trace.</h1>
            <p className="hero-description">
              Carbon Circle turns daily choices into momentum you can feel, measure, and share.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="button button-primary">Start your circle <span aria-hidden="true">↗</span></Link>
              <a href="#approach" className="text-link">See how it works <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-art" aria-label="A green hillside at sunrise">
            <div className="art-label">FIELD NOTE <strong>NO. 04</strong></div>
            <div className="art-caption"><span>01</span> The future is<br />built in the ordinary.</div>
            <div className="sun" />
            <div className="hill hill-back" />
            <div className="hill hill-front" />
            <div className="art-stamp">GOOD<br /><span>GROUND</span></div>
          </div>
        </section>

        <section className="impact-strip" id="impact">
          <p>Progress is more powerful when it is visible.</p>
          <div className="impact-stat"><strong>01</strong><span>daily choices,<br />made countable</span></div>
          <div className="impact-stat"><strong>04</strong><span>ways to lower<br />your footprint</span></div>
          <div className="impact-stat"><strong>∞</strong><span>reasons to<br />start today</span></div>
        </section>

        <section className="approach-section" id="approach">
          <div className="section-heading">
            <p className="eyebrow"><span /> The Carbon Circle method</p>
            <h2>Good habits<br /><em>grow</em> together.</h2>
          </div>
          <div className="principles-list">
            {principles.map((principle) => (
              <article className="principle" key={principle.number}>
                <span className="principle-number">{principle.number}</span>
                <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
                <span className="principle-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <p className="eyebrow"><span /> Your next small choice</p>
          <h2>Start where<br /><em>you are.</em></h2>
          <Link to="/register" className="button button-dark">Create a free account <span aria-hidden="true">↗</span></Link>
        </section>
      </main>

      <footer className="landing-footer"><span>carboncircle © 2026</span><span>Measure less. Matter more.</span></footer>
    </div>
  );
}