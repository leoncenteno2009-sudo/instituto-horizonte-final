"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type StageTheme = "light" | "blue" | "dark";

interface StoryStage {
  id: string;
  number: string;
  label: string;
  title: string;
  accent: string;
  description: string;
  video: string;
  videoClass: string;
  theme: StageTheme;
  start: number;
  end: number;
  cta?: { label: string; href?: string; visit?: boolean };
}

const stages: StoryStage[] = [
  {
    id: "crear",
    number: "01",
    label: "Crear",
    title: "El conocimiento cobra vida",
    accent: "cuando lo pones en práctica.",
    description: "Retos, laboratorios y proyectos conectan cada materia con el mundo que quieres transformar.",
    video: "/media/horizonte-learning.mp4",
    videoClass: "recording-media learning-media",
    theme: "light",
    start: 0.15,
    end: 7.7,
    cta: { label: "Ver áreas de aprendizaje", href: "#areas" },
  },
  {
    id: "conectar",
    number: "02",
    label: "Conectar",
    title: "Las mejores ideas también",
    accent: "se construyen en equipo.",
    description: "Docentes que acompañan, grupos que colaboran y conversaciones que llevan cada proyecto más lejos.",
    video: "/media/horizonte-classroom.mp4",
    videoClass: "recording-media classroom-media",
    theme: "light",
    start: 0.15,
    end: 7.7,
    cta: { label: "Conocer nuestra comunidad", href: "#vida" },
  },
  {
    id: "vivir",
    number: "03",
    label: "Vivir",
    title: "Una escuela que también sucede",
    accent: "fuera del salón.",
    description: "Proyectos, clubes, cultura y una comunidad que te impulsa a participar.",
    video: "/media/horizonte-community.mp4",
    videoClass: "recording-media community-media",
    theme: "blue",
    start: 0.1,
    end: 3.65,
    cta: { label: "Conoce la vida estudiantil", href: "#vida" },
  },
  {
    id: "descubrir",
    number: "04",
    label: "Descubrir",
    title: "Tu curiosidad tiene",
    accent: "un lugar para crecer.",
    description: "Una formación cercana que convierte preguntas, ideas y talento en posibilidades reales.",
    video: "/media/horizonte-core.mp4",
    videoClass: "clean-media core-media",
    theme: "light",
    start: 0.08,
    end: 7.85,
    cta: { label: "Conoce Horizonte", href: "#modelo" },
  },
  {
    id: "explorar",
    number: "05",
    label: "Explorar",
    title: "Aprender empieza cuando",
    accent: "te atreves a mirar distinto.",
    description: "Ciencia, diseño, tecnología y cultura se encuentran en experiencias que despiertan nuevas rutas.",
    video: "/media/horizonte-orbit.mp4",
    videoClass: "clean-media orbit-media",
    theme: "light",
    start: 0.08,
    end: 7.85,
    cta: { label: "Explorar el modelo", href: "#modelo" },
  },
  {
    id: "imaginar",
    number: "06",
    label: "Imaginar",
    title: "Cada proyecto abre",
    accent: "una nueva perspectiva.",
    description: "Ideas que toman forma, se prueban, evolucionan y encuentran un espacio para ser compartidas.",
    video: "/media/horizonte-frames.mp4",
    videoClass: "clean-media frames-media",
    theme: "light",
    start: 0.08,
    end: 7.85,
    cta: { label: "Descubrir proyectos", href: "#areas" },
  },
  {
    id: "avanzar",
    number: "07",
    label: "Avanzar",
    title: "Conoce el lugar donde empieza",
    accent: "tu siguiente versión.",
    description: "Visita el campus, conversa con nuestro equipo y descubre si Horizonte es para ti.",
    video: "/media/horizonte-future.mp4",
    videoClass: "clean-media future-media",
    theme: "dark",
    start: 0.08,
    end: 7.85,
    cta: { label: "Agendar una visita", visit: true },
  },
];

const areas = [
  { number: "01", title: "Ciencia y tecnología", text: "Investiga, construye prototipos y aprende a resolver problemas con método y creatividad." },
  { number: "02", title: "Creatividad y medios", text: "Convierte ideas en historias, imágenes, objetos y experiencias que comuniquen con intención." },
  { number: "03", title: "Comunidad y mundo", text: "Comprende tu contexto, colabora con otros y participa en proyectos con impacto cercano." },
  { number: "04", title: "Liderazgo personal", text: "Reconoce tus fortalezas, toma decisiones y diseña un camino académico que se sienta propio." },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function stageOpacity(progress: number, index: number) {
  const length = 1 / stages.length;
  const transition = 0.032;
  const start = index * length;
  const end = start + length;
  const fadeIn = index === 0 ? 1 : smoothstep((progress - (start - transition)) / (transition * 2));
  const fadeOut = index === stages.length - 1 ? 1 : 1 - smoothstep((progress - (end - transition)) / (transition * 2));
  return Math.min(fadeIn, fadeOut);
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const story = storyRef.current;
      if (!story) return;
      const total = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = clamp(-story.getBoundingClientRect().top / total);
      const nextStage = Math.min(stages.length - 1, Math.floor(progress * stages.length));
      setActiveStage((previous) => previous === nextStage ? previous : nextStage);

      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        const opacity = stageOpacity(progress, index);
        video.style.opacity = opacity.toFixed(3);
        const shouldPlay = opacity > 0.025;
        if (shouldPlay && video.paused) void video.play().catch(() => undefined);
        if (!shouldPlay && !video.paused) video.pause();
      });

      const pageMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty("--page-progress", (window.scrollY / pageMax).toFixed(4));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", visitOpen || menuOpen);
    return () => document.body.classList.remove("modal-open");
  }, [visitOpen, menuOpen]);

  function submitVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestSent(true);
  }

  const current = stages[activeStage];

  return (
    <>
      <div className="page-progress" aria-hidden="true"><span /></div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Instituto Horizonte, ir al inicio">
          <span className="brand-mark">H</span>
          <span className="brand-name">INSTITUTO HORIZONTE</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#modelo">Modelo</a>
          <a href="#areas">Aprendizaje</a>
          <a href="#vida">Vida estudiantil</a>
          <a href="#admisiones">Admisiones</a>
        </nav>
        <button className="header-cta" type="button" onClick={() => setVisitOpen(true)}>
          Agenda tu visita <Arrow />
        </button>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i /><i />
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Navegación móvil">
          {["modelo", "areas", "vida", "admisiones"].map((id, index) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{["Modelo", "Aprendizaje", "Vida estudiantil", "Admisiones"][index]}
            </a>
          ))}
          <button type="button" onClick={() => { setMenuOpen(false); setVisitOpen(true); }}>Agenda tu visita <Arrow /></button>
        </nav>
      )}

      <main>
        <section id="inicio" ref={storyRef} className="scroll-story" aria-label="Recorrido por Instituto Horizonte">
          <div className={`story-sticky theme-${current.theme}`}>
            <div className="story-media" aria-hidden="true">
              {stages.map((stage, index) => (
                <video
                  key={stage.id}
                  ref={(node) => { videoRefs.current[index] = node; }}
                  className={stage.videoClass}
                  muted
                  playsInline
                  preload={index < 2 ? "auto" : "metadata"}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                  onLoadedMetadata={(event) => { event.currentTarget.currentTime = stage.start; }}
                  onTimeUpdate={(event) => {
                    if (event.currentTarget.currentTime >= stage.end) event.currentTarget.currentTime = stage.start;
                  }}
                >
                  <source src={stage.video} type="video/mp4" />
                </video>
              ))}
              <div className="story-shade" />
              <div className="story-grid" />
            </div>

            <div key={current.id} className="story-copy">
              <p className="story-chapter"><span>{current.number}</span><i />{current.label}</p>
              {activeStage === 0 ? (
                <h1>{current.title} <em>{current.accent}</em></h1>
              ) : (
                <h2>{current.title} <em>{current.accent}</em></h2>
              )}
              <p className="story-description">{current.description}</p>
              {current.cta && (current.cta.visit ? (
                <button className="primary-button" type="button" onClick={() => setVisitOpen(true)}>{current.cta.label}<Arrow /></button>
              ) : (
                <a className="primary-button" href={current.cta.href}>{current.cta.label}<Arrow /></a>
              ))}
            </div>

            <nav className="story-index" aria-label="Etapas del recorrido">
              <div className="story-index-track"><span style={{ height: `${((activeStage + 1) / stages.length) * 100}%` }} /></div>
              <ol>
                {stages.map((stage, index) => (
                  <li key={stage.id} className={activeStage === index ? "active" : ""}>
                    <span>{stage.number}</span><strong>{stage.label}</strong>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="scroll-hint" aria-hidden="true"><span>Desliza para explorar</span><i>↓</i></div>
          </div>
        </section>

        <section id="modelo" className="model-section">
          <div className="section-heading">
            <p className="section-kicker">NUESTRO MODELO</p>
            <h2>Aprender no es repetir.<br /><em>Es descubrir de qué eres capaz.</em></h2>
          </div>
          <div className="model-statement">
            <p>En Horizonte, cada estudiante aprende haciendo, preguntando y colaborando. El acompañamiento académico convive con proyectos que conectan distintas áreas y dan sentido a lo aprendido.</p>
            <div className="model-stats">
              <span><strong>1:12</strong>acompañamiento cercano</span>
              <span><strong>4</strong>rutas de aprendizaje</span>
              <span><strong>100%</strong>proyectos con propósito</span>
            </div>
          </div>
        </section>

        <section id="areas" className="areas-section">
          <div className="section-heading light-heading">
            <p className="section-kicker">ÁREAS DE APRENDIZAJE</p>
            <h2>Una formación que conecta<br /><em>ideas, habilidades y mundo.</em></h2>
          </div>
          <div className="area-grid">
            {areas.map((area) => (
              <article key={area.number}>
                <span>{area.number}</span>
                <h3>{area.title}</h3>
                <p>{area.text}</p>
                <i aria-hidden="true">↗</i>
              </article>
            ))}
          </div>
        </section>

        <section id="vida" className="life-section">
          <div className="life-image">
            <img src="/images/student-life.jpg" alt="Estudiantes colaborando en un proyecto de diseño" />
          </div>
          <div className="life-copy">
            <p className="section-kicker">VIDA HORIZONTE</p>
            <h2>También se aprende<br /><em>cuando participas.</em></h2>
            <p>Clubes, encuentros, proyectos interdisciplinarios y experiencias culturales hacen que cada estudiante encuentre una manera propia de aportar.</p>
            <ul>
              <li>Laboratorios creativos</li>
              <li>Clubes dirigidos por estudiantes</li>
              <li>Proyectos con impacto comunitario</li>
              <li>Encuentros culturales y deportivos</li>
            </ul>
          </div>
        </section>

        <section id="admisiones" className="admissions-section">
          <div className="admissions-visual">
            <img src="/images/future-campus.jpg" alt="Estudiantes caminando por el campus de Instituto Horizonte" />
          </div>
          <div className="admissions-copy">
            <p className="section-kicker">ADMISIONES</p>
            <h2>Tu siguiente etapa<br /><em>puede comenzar aquí.</em></h2>
            <p>Conoce el campus, nuestro modelo y a las personas que acompañarán tu proceso.</p>
            <div>
              <button className="primary-button primary-button-light" type="button" onClick={() => setVisitOpen(true)}>Agenda tu visita <Arrow /></button>
              <a className="text-button" href="#modelo">Explora nuestro modelo</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><span>H</span><strong>INSTITUTO HORIZONTE</strong></div>
        <p>Aprender. Crear. Conectar. Avanzar.</p>
        <nav aria-label="Enlaces de pie de página"><a href="#modelo">Modelo</a><a href="#vida">Comunidad</a><a href="#admisiones">Admisiones</a></nav>
        <a className="back-top" href="#inicio">Volver arriba ↑</a>
      </footer>

      <a
        href="https://wa.me/5215531001296?text=Hola!%20Me%20interesa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20Instituto%20Horizonte."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-button"
        aria-label="Contactar por WhatsApp"
      >
        <span className="whatsapp-pulse-ring" aria-hidden="true" />
        <svg className="whatsapp-float-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 1a11 11 0 0 0-9.43 16.63L1 23l5.54-1.45A11 11 0 1 0 12 1zm0 20a8.96 8.96 0 0 1-4.57-1.25l-.33-.19-3.39.89.9-3.3-.21-.34A8.97 8.97 0 1 1 12 21z"/>
        </svg>
        <span className="whatsapp-float-label">Enviar mensaje ↗</span>
      </a>

      {visitOpen && (
        <div className="visit-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVisitOpen(false); }}>
          <section className="visit-panel" role="dialog" aria-modal="true" aria-labelledby="visit-title">
            <button className="visit-close" type="button" aria-label="Cerrar formulario" onClick={() => setVisitOpen(false)}>×</button>
            <p className="section-kicker">CONOCE HORIZONTE</p>
            <h2 id="visit-title">Agenda una visita.</h2>
            <p>Déjanos tus datos y nuestro equipo de admisiones continuará la conversación.</p>
            {requestSent ? (
              <div className="visit-success" role="status"><span>✓</span><h3>Solicitud preparada</h3><p>Gracias. Esta demostración muestra el flujo que recibiría el equipo de admisiones.</p></div>
            ) : (
              <form onSubmit={submitVisit}>
                <label>Nombre completo<input name="name" type="text" autoComplete="name" required /></label>
                <label>Correo<input name="email" type="email" autoComplete="email" required /></label>
                <label>Teléfono<input name="phone" type="tel" autoComplete="tel" required /></label>
                <label>Nivel de interés<select name="level" defaultValue=""><option value="" disabled>Selecciona una opción</option><option>Bachillerato</option><option>Secundaria</option><option>Visita informativa</option></select></label>
                <button className="primary-button" type="submit">Enviar solicitud <Arrow /></button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
