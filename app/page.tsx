"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [sent, setSent] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeMethod, setActiveMethod] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y); c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const baseY = H * 0.70;
      const slopeStartX = W * 0.20;
      const slopeEndX = W * 0.55;
      const topY = H * 0.25;

      // Soil fill
      ctx.beginPath();
      ctx.moveTo(0, baseY); ctx.lineTo(slopeStartX, baseY);
      ctx.lineTo(slopeEndX, topY); ctx.lineTo(W, topY);
      ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = "rgba(170,140,90,0.10)";
      ctx.fill();

      // Slope outline
      ctx.beginPath();
      ctx.moveTo(W * 0.02, baseY); ctx.lineTo(slopeStartX, baseY);
      ctx.lineTo(slopeEndX, topY); ctx.lineTo(W * 0.98, topY);
      ctx.strokeStyle = "rgba(100,75,40,0.4)";
      ctx.lineWidth = 2; ctx.stroke();

      // Water table
      const nf = 0.42;
      const hwY = baseY - (baseY - topY) * nf;
      ctx.beginPath();
      ctx.moveTo(W * 0.02, hwY);
      ctx.lineTo(slopeStartX + (slopeEndX - slopeStartX) * nf * 0.9, hwY);
      ctx.strokeStyle = "rgba(37,99,168,0.45)";
      ctx.lineWidth = 1.5; ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(37,99,168,0.55)";
      ctx.font = "10px 'DM Mono', monospace";
      ctx.fillText("NF", slopeStartX + (slopeEndX - slopeStartX) * nf * 0.9 + 6, hwY + 4);

      // Failure arc animated
      const phase = Math.sin(t * 0.008) * 0.018;
      const arcCx = slopeStartX * 0.5;
      const arcCy = baseY + H * 0.58;
      const arcR = H * 0.78;
      ctx.beginPath();
      ctx.arc(arcCx, arcCy, arcR, -Math.PI * (0.70 + phase), -Math.PI * 0.30, false);
      ctx.strokeStyle = `rgba(192,57,43,${0.22 + Math.sin(t * 0.018) * 0.07})`;
      ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.stroke(); ctx.setLineDash([]);

      // H dimension
      ctx.strokeStyle = "rgba(100,75,40,0.22)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(slopeStartX - 18, baseY); ctx.lineTo(slopeStartX - 18, topY); ctx.stroke();
      ctx.fillStyle = "rgba(100,75,40,0.55)";
      ctx.font = "11px 'DM Mono', monospace";
      ctx.fillText("H", slopeStartX - 34, (baseY + topY) / 2 + 4);

      // FS badge animated
      const fsVal = (1.44 + Math.sin(t * 0.016) * 0.05).toFixed(2);
      const badgeX = W * 0.60, badgeY = H * 0.34;
      ctx.fillStyle = "rgba(255,255,255,0.93)";
      roundRect(ctx, badgeX, badgeY, 128, 50, 6); ctx.fill();
      ctx.strokeStyle = "rgba(184,154,48,0.5)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#9a7e1a";
      ctx.font = "500 10px 'DM Mono', monospace";
      ctx.fillText("FS CONSERVADOR", badgeX + 10, badgeY + 17);
      ctx.fillStyle = "#1c1917";
      ctx.font = "bold 22px 'Bebas Neue', sans-serif";
      ctx.fillText(fsVal, badgeX + 10, badgeY + 40);
      ctx.fillStyle = "rgba(138,112,0,0.75)";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillText("MARGINAL", badgeX + 72, badgeY + 40);

      t++;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  const methods = [
    {
      id: "01",
      name: "Talud Infinito",
      short: "Para roturas planares y taludes largos",
      teaser: "El punto de partida de cualquier análisis. Rápido, directo, con presión de poros.",
      what: "Calcula el FS sobre un plano de rotura paralelo al talud, incorporando el nivel freático como fracción de la altura saturada. Esfuerzos efectivos según Mohr-Coulomb.",
      when: "Taludes de gran longitud, suelos homogéneos, primer diagnóstico rápido.",
      validated: "Das, 9ª ed. · Coduto · Eurocode 7",
    },
    {
      id: "02",
      name: "Bishop Simplificado",
      short: "Para superficies circulares — el estándar en minería",
      teaser: "Superficies circulares, dovelas verticales, iteración convergente. El método que piden los proyectos.",
      what: "Divide la masa deslizante en dovelas verticales y resuelve el equilibrio iterativamente hasta convergencia. Incorpora presión de poros en la base de cada dovela.",
      when: "Taludes en minería a cielo abierto, taludes de presa, cualquier geometría compleja.",
      validated: "Bishop, 1955 · Morgenstern · ISRM",
    },
    {
      id: "03",
      name: "Análisis Sísmico",
      short: "Pseudoestático — para zonas con riesgo sísmico",
      teaser: "Un coeficiente. Una fuerza horizontal. El FS que cambia todo en zona sísmica.",
      what: "Añade la componente horizontal de la aceleración sísmica como fracción del peso del suelo (kh·W). Evalúa la reducción del FS ante evento sísmico de diseño.",
      when: "Proyectos en zona sísmica, evaluación de seguridad ante sismo, cumplimiento NCSE-02.",
      validated: "Seed & Goodman, 1964 · NCSE-02 · IBC",
    },
  ];

  const workflow = [
    { n: "01", icon: "🎛️", title: "Introduce los datos", desc: "Geometría, suelo, agua, sismo. Sliders en tiempo real — el resultado aparece al instante." },
    { n: "02", icon: "⚡", title: "El motor calcula solo", desc: "Tres métodos a la vez. FS determinista, conservador, Bishop y sísmico en milisegundos." },
    { n: "03", icon: "📊", title: "Detecta lo crítico", desc: "¿Qué parámetro tiene más impacto? La sensibilidad lo muestra en un gráfico al instante." },
    { n: "04", icon: "📄", title: "Exporta el informe", desc: "PDF profesional listo para entregar. Clasificación EC7 y recomendación automática incluidas." },
  ];

  const plans = [
    { name: "FREE", price: "0€", per: "siempre", color: "#64748b", highlight: false, cta: "Empezar gratis", items: ["1 proyecto guardado", "Talud infinito", "Valores críticos"] },
    { name: "PRO", price: "39€", per: "/mes", color: "#b89a30", highlight: true, cta: "Empezar prueba →", items: ["Proyectos ilimitados", "Bishop + Sísmico", "Exportación PDF EC7", "Historial completo", "Sensibilidad avanzada"] },
    { name: "EQUIPO", price: "149€", per: "/mes", color: "#2d7d5a", highlight: false, cta: "Contactar", items: ["Hasta 5 usuarios", "Proyectos compartidos", "PDF con logo propio", "Soporte prioritario"] },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg:#faf9f6; --bg2:#f3f1ec; --bg3:#ebe8e0;
          --text:#1c1917; --text2:#44403c; --text3:#78716c;
          --border:#ddd9d0;
          --accent:#b89a30; --accent-bg:#fdf8e7; --accent-bd:#e8d580;
          --red:#c0392b; --green:#2d7d5a; --blue:#2563a8;
        }
        html { scroll-behavior:smooth; }
        body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; overflow-x:hidden; line-height:1.6; }

        /* ── NAV ── */
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 56px; height:64px; background:rgba(250,249,246,0.93); backdrop-filter:blur(10px); border-bottom:1px solid transparent; transition:border-color .3s,box-shadow .3s; }
        nav.scrolled { border-bottom-color:var(--border); box-shadow:0 1px 12px rgba(0,0,0,.06); }
        .nl { display:flex; align-items:baseline; gap:10px; }
        .logo { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; letter-spacing:4px; color:var(--text); }
        .logo-v { font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:2px; color:var(--text3); }
        .nlinks { display:flex; gap:32px; }
        .nlinks a { font-size:.85rem; color:var(--text2); text-decoration:none; transition:color .15s; }
        .nlinks a:hover { color:var(--text); }
        .ncta { font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:1.5px; padding:9px 20px; border-radius:4px; background:var(--text); color:var(--bg); text-decoration:none; text-transform:uppercase; transition:background .15s; }
        .ncta:hover { background:#333; }

        /* ── HERO ── */
        .hero { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; padding-top:64px; }
        .hero-l { display:flex; flex-direction:column; justify-content:center; padding:80px 64px 80px 80px; border-right:1px solid var(--border); }
        .eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:1.5px; color:var(--accent); background:var(--accent-bg); border:1px solid var(--accent-bd); padding:5px 12px; border-radius:3px; margin-bottom:24px; width:fit-content; text-transform:uppercase; }
        .edot { width:5px; height:5px; border-radius:50%; background:var(--accent); animation:pulse 2.2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.2;} }
        h1 { font-family:'Lora',serif; font-size:clamp(2.2rem,3.5vw,3.4rem); font-weight:600; line-height:1.18; color:var(--text); margin-bottom:20px; letter-spacing:-.4px; }
        h1 em { font-style:italic; color:var(--accent); }
        .hdesc { font-size:1rem; color:var(--text2); line-height:1.75; max-width:460px; margin-bottom:36px; font-weight:300; }
        .hbtns { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:48px; }
        .btn-d { font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:1.5px; padding:13px 28px; border-radius:4px; background:var(--text); color:var(--bg); text-decoration:none; text-transform:uppercase; border:none; cursor:pointer; transition:background .15s,transform .15s; display:inline-block; }
        .btn-d:hover { background:#333; transform:translateY(-1px); }
        .btn-o { font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:1.5px; padding:13px 28px; border-radius:4px; background:transparent; color:var(--text); text-decoration:none; text-transform:uppercase; border:1px solid var(--border); cursor:pointer; transition:border-color .15s; display:inline-block; }
        .btn-o:hover { border-color:var(--text); }
        .hstats { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid var(--border); border-radius:6px; overflow:hidden; }
        .hstat { padding:16px 20px; background:var(--bg2); border-right:1px solid var(--border); }
        .hstat:last-child { border-right:none; }
        .hstat-v { font-family:'Bebas Neue',sans-serif; font-size:2rem; letter-spacing:2px; color:var(--text); line-height:1; }
        .hstat-l { font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:1.5px; color:var(--text3); text-transform:uppercase; margin-top:3px; }
        .hero-r { position:relative; background:var(--bg2); overflow:hidden; }
        .hcanvas { position:absolute; inset:0; width:100%; height:100%; }
        .hrlabel { position:absolute; bottom:20px; left:20px; font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:1.5px; color:var(--text3); text-transform:uppercase; }

        /* ── SECTIONS ── */
        .sec { padding:96px 80px; }
        .sec-alt { background:var(--bg2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .sec-in { max-width:1080px; margin:0 auto; }
        .stag { font-family:'DM Mono',monospace; font-size:.53rem; letter-spacing:3px; color:var(--text3); text-transform:uppercase; margin-bottom:12px; }
        h2 { font-family:'Lora',serif; font-size:clamp(1.7rem,2.8vw,2.5rem); font-weight:600; color:var(--text); line-height:1.2; letter-spacing:-.3px; margin-bottom:10px; }
        .sdesc { font-size:.93rem; color:var(--text2); line-height:1.7; max-width:520px; font-weight:300; }

        /* ── PROBLEM SECTION ── */
        .problem-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-top:48px; }
        .prob-col { padding:40px 44px; }
        .prob-col.old { background:var(--bg3); border-right:1px solid var(--border); }
        .prob-col.new { background:var(--bg); }
        .prob-head { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
        .prob-label { font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:2px; text-transform:uppercase; padding:4px 10px; border-radius:2px; }
        .prob-label.old-l { background:#f5eeee; color:#a03030; border:1px solid #e8cccc; }
        .prob-label.new-l { background:var(--accent-bg); color:var(--accent); border:1px solid var(--accent-bd); }
        .prob-items { list-style:none; display:flex; flex-direction:column; gap:12px; }
        .prob-item { display:flex; align-items:flex-start; gap:10px; font-size:.88rem; color:var(--text2); line-height:1.5; font-weight:300; }
        .prob-ico { font-size:1rem; flex-shrink:0; margin-top:1px; }

        /* ── METHODS INTERACTIVE ── */
        .methods-wrap { margin-top:52px; display:grid; grid-template-columns:280px 1fr; gap:0; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
        .method-tabs { background:var(--bg2); border-right:1px solid var(--border); }
        .method-tab { padding:20px 24px; cursor:pointer; border-bottom:1px solid var(--border); transition:background .15s; display:flex; flex-direction:column; gap:4px; }
        .method-tab:last-child { border-bottom:none; }
        .method-tab:hover { background:var(--bg3); }
        .method-tab.active { background:var(--bg); border-left:3px solid var(--accent); }
        .mt-id { font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:2px; color:var(--text3); text-transform:uppercase; }
        .mt-name { font-family:'Lora',serif; font-size:.95rem; font-weight:600; color:var(--text); }
        .mt-short { font-size:.78rem; color:var(--text3); font-weight:300; }
        .method-panel { padding:40px 44px; background:var(--bg); }
        .mp-teaser { font-family:'Lora',serif; font-size:1.15rem; font-style:italic; color:var(--text2); margin-bottom:28px; line-height:1.6; }
        .mp-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .mp-card { background:var(--bg2); border:1px solid var(--border); border-radius:6px; padding:20px; }
        .mp-card-label { font-family:'DM Mono',monospace; font-size:.52rem; letter-spacing:2px; color:var(--accent); text-transform:uppercase; margin-bottom:8px; }
        .mp-card-text { font-size:.84rem; color:var(--text2); line-height:1.6; font-weight:300; }
        .mp-validated { margin-top:20px; display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:.55rem; letter-spacing:1px; color:var(--text3); }
        .mp-val-dot { width:6px; height:6px; border-radius:50%; background:var(--green); flex-shrink:0; }

        /* ── WORKFLOW ── */
        .wf-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-top:48px; }
        .wf-card { padding:32px 28px; border-right:1px solid var(--border); position:relative; background:var(--bg); transition:background .2s; }
        .wf-card:last-child { border-right:none; }
        .wf-card:hover { background:var(--accent-bg); }
        .wf-n { font-family:'Bebas Neue',sans-serif; font-size:3.5rem; color:rgba(0,0,0,.05); position:absolute; top:16px; right:20px; line-height:1; }
        .wf-icon { font-size:1.5rem; margin-bottom:14px; }
        .wf-title { font-family:'Lora',serif; font-size:.95rem; font-weight:600; color:var(--text); margin-bottom:8px; }
        .wf-desc { font-size:.8rem; color:var(--text2); line-height:1.6; font-weight:300; }

        /* ── COMPARISON ── */
        .comp-grid { display:grid; grid-template-columns:1fr 48px 1fr; align-items:center; gap:0; margin-top:40px; margin-bottom:40px; }
        .comp-card { border:1px solid var(--border); border-radius:8px; padding:32px 28px; }
        .comp-them { background:var(--bg3); }
        .comp-us { background:var(--bg); border-color:var(--accent); box-shadow:0 4px 24px rgba(184,154,48,.12); }
        .comp-vs { display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:3px; color:var(--text3); }
        .comp-head { margin-bottom:24px; }
        .comp-label { display:inline-block; font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:2px; text-transform:uppercase; padding:3px 10px; border-radius:2px; margin-bottom:10px; }
        .them-l { background:#f5eeee; color:#a03030; border:1px solid #e8cccc; }
        .us-l { background:var(--accent-bg); color:var(--accent); border:1px solid var(--accent-bd); }
        .comp-price-big { font-family:'Lora',serif; font-size:2.2rem; font-weight:600; color:var(--text3); line-height:1; }
        .comp-price-big span { font-size:1rem; font-weight:400; color:var(--text3); margin-left:3px; }
        .comp-price-big.accent { color:var(--accent); }
        .comp-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
        .comp-list li { display:flex; align-items:flex-start; gap:10px; font-size:.85rem; color:var(--text2); line-height:1.5; font-weight:300; }
        .comp-list li span { flex-shrink:0; font-size:.95rem; }
        .savings-row { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
        .saving-item { padding:24px 20px; border-right:1px solid var(--border); background:var(--bg); text-align:center; }
        .saving-item:last-child { border-right:none; }
        .saving-val { font-family:'Bebas Neue',sans-serif; font-size:2.2rem; letter-spacing:2px; color:var(--accent); line-height:1; }
        .saving-lbl { font-family:'DM Mono',monospace; font-size:.52rem; letter-spacing:1.5px; color:var(--text3); text-transform:uppercase; margin-top:6px; line-height:1.4; }

        /* ── PRICING ── */
        .pgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:48px; }
        .pcard { background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:32px 28px; position:relative; transition:box-shadow .2s,transform .2s; }
        .pcard:hover { box-shadow:0 8px 32px rgba(0,0,0,.08); transform:translateY(-2px); }
        .pcard.hl { border-color:var(--accent); box-shadow:0 4px 20px rgba(184,154,48,.12); }
        .ppop { position:absolute; top:-11px; left:50%; transform:translateX(-50%); font-family:'DM Mono',monospace; font-size:.5rem; letter-spacing:2px; padding:3px 14px; border-radius:10px; text-transform:uppercase; background:var(--accent); color:white; white-space:nowrap; }
        .pname { font-family:'Bebas Neue',sans-serif; font-size:1.3rem; letter-spacing:3px; margin-bottom:6px; }
        .pprice { display:flex; align-items:baseline; gap:4px; margin-bottom:6px; }
        .pamount { font-family:'Lora',serif; font-size:2.3rem; font-weight:600; color:var(--text); }
        .pper { font-size:.82rem; color:var(--text3); }
        .pdiv { border:none; border-top:1px solid var(--border); margin:18px 0; }
        .pfeatures { list-style:none; margin-bottom:28px; }
        .pfeatures li { font-size:.84rem; color:var(--text2); padding:7px 0; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; font-weight:300; }
        .pfeatures li:last-child { border-bottom:none; }
        .pfeatures li::before { content:"✓"; color:var(--green); font-weight:600; font-size:.8rem; flex-shrink:0; }
        .pbtn { width:100%; padding:12px; border-radius:4px; font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:all .15s; border:1px solid var(--border); background:var(--bg); color:var(--text); }
        .pbtn:hover { border-color:var(--text); }
        .pbtn.dark { background:var(--text); color:var(--bg); border-color:var(--text); }
        .pbtn.dark:hover { background:#333; }

        /* ── WAITLIST ── */
        .wl-inner { max-width:580px; margin:0 auto; text-align:center; }
        .wl-form { display:flex; gap:10px; margin-top:28px; flex-wrap:wrap; justify-content:center; }
        .wl-inp { flex:1; min-width:260px; padding:13px 18px; background:var(--bg); border:1px solid var(--border); border-radius:4px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:.9rem; outline:none; transition:border-color .15s; }
        .wl-inp:focus { border-color:var(--accent); }
        .wl-inp::placeholder { color:var(--text3); }
        .sent { margin-top:20px; font-family:'DM Mono',monospace; font-size:.62rem; letter-spacing:2px; color:var(--green); text-transform:uppercase; }
        .wl-note { font-size:.78rem; color:var(--text3); margin-top:14px; }

        /* ── FOOTER ── */
        footer { border-top:1px solid var(--border); padding:36px 80px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; background:var(--bg2); }
        .flogo { font-family:'Bebas Neue',sans-serif; font-size:1.1rem; letter-spacing:3px; color:var(--text); }
        .ftext { font-size:.78rem; color:var(--text3); }
        .flinks { display:flex; gap:24px; }
        .flinks a { font-size:.78rem; color:var(--text3); text-decoration:none; transition:color .15s; }
        .flinks a:hover { color:var(--text); }

        @media(max-width:900px) {
          .hero { grid-template-columns:1fr; }
          .hero-r { height:300px; }
          .hero-l { padding:60px 28px; }
          .sec { padding:72px 28px; }
          nav { padding:0 24px; }
          .nlinks { display:none; }
          .problem-grid { grid-template-columns:1fr; }
          .methods-wrap { grid-template-columns:1fr; }
          .mp-grid { grid-template-columns:1fr; }
          .wf-grid { grid-template-columns:repeat(2,1fr); }
          .sp-grid { grid-template-columns:1fr; }
          .pgrid { grid-template-columns:1fr; }
          footer { padding:32px 24px; flex-direction:column; }
        }
      `}</style>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nl">
          <div className="logo">SLOPEMIND</div>
          <div className="logo-v">v2.0</div>
        </div>
        <div className="nlinks">
          <a href="#problem">El problema</a>
          <a href="#metodos">Métodos</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a href="#waitlist" className="ncta">Acceso anticipado</a>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-l">
          <div className="eyebrow"><div className="edot" />Beta — Primeros 50 usuarios: Pro gratis 3 meses</div>
          <h1>Análisis de taludes,<br /><em>sin perder tiempo</em><br />en Excel.</h1>
          <p className="hdesc">
            SlopeMind calcula el Factor de Seguridad con los métodos estándar de la industria,
            detecta condiciones críticas y genera informes PDF conformes a Eurocode 7 —
            desde el navegador, en segundos.
          </p>
          <div className="hbtns">
            <a href="#waitlist" className="btn-d">Solicitar acceso →</a>
            <a href="#metodos" className="btn-o">Ver métodos</a>
            <a href="/calculador" className="btn-o">Probar calculador →</a>
          </div>
          <div className="hstats">
            <div className="hstat"><div className="hstat-v">3</div><div className="hstat-l">Métodos</div></div>
            <div className="hstat"><div className="hstat-v">EC7</div><div className="hstat-l">Normativa</div></div>
            <div className="hstat"><div className="hstat-v">0€</div><div className="hstat-l">Para empezar</div></div>
          </div>
        </div>
        <div className="hero-r">
          <canvas ref={canvasRef} className="hcanvas" />
          <div className="hrlabel">Sección transversal — análisis en tiempo real</div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="sec" id="problem">
        <div className="sec-in">
          <div className="stag">El problema</div>
          <h2>¿Cuánto tiempo pierdes<br />en cada análisis?</h2>
          <p className="sdesc" style={{marginTop:10}}>La mayoría de ingenieros siguen usando hojas de Excel de hace diez años. SlopeMind nació para cambiar eso.</p>
          <div className="problem-grid">
            <div className="prob-col old">
              <div className="prob-head"><div className="prob-label old-l">Sin SlopeMind</div></div>
              <ul className="prob-items">
                {[
                  ["😩", "Actualizar la hoja Excel cada vez que cambia un parámetro"],
                  ["🔁", "Recalcular manualmente la sensibilidad uno por uno"],
                  ["📋", "Copiar resultados a Word para hacer el informe"],
                  ["🤔", "No saber si el formato del informe cumple con EC7"],
                  ["💾", "Buscar el archivo entre 50 versiones del mismo proyecto"],
                ].map(([ico, txt], i) => (
                  <li className="prob-item" key={i}><span className="prob-ico">{ico}</span>{txt}</li>
                ))}
              </ul>
            </div>
            <div className="prob-col new">
              <div className="prob-head"><div className="prob-label new-l">Con SlopeMind</div></div>
              <ul className="prob-items">
                {[
                  ["✅", "El FS se recalcula en tiempo real con cada slider"],
                  ["✅", "Análisis de sensibilidad automático en 4 parámetros"],
                  ["✅", "Informe PDF profesional generado con un clic"],
                  ["✅", "Clasificación EC7 automática con recomendación incluida"],
                  ["✅", "Todos los proyectos guardados y accesibles siempre"],
                ].map(([ico, txt], i) => (
                  <li className="prob-item" key={i}><span className="prob-ico">{ico}</span>{txt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* METHODS */}
      <section className="sec sec-alt" id="metodos">
        <div className="sec-in">
          <div className="stag">Métodos de cálculo</div>
          <h2>Tres métodos. Un solo sitio.<br />Siempre actualizado.</h2>
          <p className="sdesc" style={{marginTop:10}}>Selecciona cada método para ver cuándo usarlo y qué resuelve exactamente.</p>
          <div className="methods-wrap">
            <div className="method-tabs">
              {methods.map((m, i) => (
                <div
                  key={i}
                  className={`method-tab ${activeMethod === i ? "active" : ""}`}
                  onClick={() => setActiveMethod(i)}
                >
                  <div className="mt-id">{m.id}</div>
                  <div className="mt-name">{m.name}</div>
                  <div className="mt-short">{m.short}</div>
                </div>
              ))}
            </div>
            <div className="method-panel">
              <div className="mp-teaser">"{methods[activeMethod].teaser}"</div>
              <div className="mp-grid">
                <div className="mp-card">
                  <div className="mp-card-label">Qué calcula</div>
                  <div className="mp-card-text">{methods[activeMethod].what}</div>
                </div>
                <div className="mp-card">
                  <div className="mp-card-label">Cuándo usarlo</div>
                  <div className="mp-card-text">{methods[activeMethod].when}</div>
                </div>
              </div>
              <div className="mp-validated">
                <div className="mp-val-dot" />
                Validado contra: {methods[activeMethod].validated}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="sec">
        <div className="sec-in">
          <div className="stag">Flujo de trabajo</div>
          <h2>De los datos al informe<br />en cuatro pasos.</h2>
          <div className="wf-grid">
            {workflow.map((w, i) => (
              <div className="wf-card" key={i}>
                <div className="wf-n">{w.n}</div>
                <div className="wf-icon">{w.icon}</div>
                <div className="wf-title">{w.title}</div>
                <p className="wf-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE vs COMPETITION */}
      <section className="sec sec-alt">
        <div className="sec-in">
          <div className="stag">¿Por qué SlopeMind?</div>
          <h2>El software de referencia<br />cuesta 5.000€/año. Nosotros, 39€/mes.</h2>
          <p className="sdesc" style={{marginTop:10}}>GeoStudio y SLOPE/W son herramientas potentes — y carísimas, lentas de aprender y difíciles de justificar en una consultora pequeña. SlopeMind cubre el 80% de los casos reales al 2% del precio.</p>
          <div className="comp-grid">
            <div className="comp-card comp-them">
              <div className="comp-head">
                <div className="comp-label them-l">Software tradicional</div>
                <div className="comp-price-big">~5.000€<span>/año</span></div>
              </div>
              <ul className="comp-list">
                {[
                  ["❌","Licencia de escritorio — solo en tu ordenador"],
                  ["❌","Semanas para aprender a usarlo"],
                  ["❌","Actualización = nueva licencia"],
                  ["❌","Sin informe automático EC7"],
                  ["❌","No accesible desde obra o campo"],
                ].map(([ico,txt],i)=>(<li key={i}><span>{ico}</span>{txt}</li>))}
              </ul>
            </div>
            <div className="comp-vs">VS</div>
            <div className="comp-card comp-us">
              <div className="comp-head">
                <div className="comp-label us-l">SlopeMind Pro</div>
                <div className="comp-price-big accent">39€<span>/mes</span></div>
              </div>
              <ul className="comp-list">
                {[
                  ["✅","100% web — funciona desde cualquier dispositivo"],
                  ["✅","Listo para usar en menos de 5 minutos"],
                  ["✅","Siempre actualizado, sin coste adicional"],
                  ["✅","Informe PDF con clasificación EC7 automática"],
                  ["✅","Accesible desde obra, oficina o casa"],
                ].map(([ico,txt],i)=>(<li key={i}><span>{ico}</span>{txt}</li>))}
              </ul>
            </div>
          </div>
          <div className="savings-row">
            {[
              {val:"97%",   lbl:"Menos coste anual vs GeoStudio"},
              {val:"< 5min",lbl:"Para generar un informe completo"},
              {val:"3",     lbl:"Métodos validados en un solo lugar"},
              {val:"0€",    lbl:"Para empezar hoy mismo"},
            ].map((s,i)=>(
              <div className="saving-item" key={i}>
                <div className="saving-val">{s.val}</div>
                <div className="saving-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing">
        <div className="sec-in">
          <div className="stag">Pricing</div>
          <h2>Empieza gratis.<br />Escala cuando lo necesites.</h2>
          <p className="sdesc" style={{marginTop:10}}>Sin contratos anuales. Sin sorpresas. Cancela cuando quieras.</p>
          <div className="pgrid">
            {plans.map((p, i) => (
              <div className={`pcard ${p.highlight ? "hl" : ""}`} key={i}>
                {p.highlight && <div className="ppop">Más popular</div>}
                <div className="pname" style={{color:p.color}}>{p.name}</div>
                <div className="pprice">
                  <div className="pamount">{p.price}</div>
                  <div className="pper">{p.per}</div>
                </div>
                <hr className="pdiv" />
                <ul className="pfeatures">{p.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                <button className={`pbtn ${p.highlight ? "dark" : ""}`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="sec sec-alt" id="waitlist">
        <div className="sec-in">
          <div className="wl-inner">
            <div className="stag" style={{textAlign:"center"}}>Acceso anticipado</div>
            <h2 style={{textAlign:"center"}}>Únete a la lista de espera.</h2>
            <p className="sdesc" style={{margin:"10px auto 0",textAlign:"center"}}>
              Los primeros 50 registros reciben 3 meses de acceso Pro completamente gratuito. Sin tarjeta de crédito.
            </p>
            {!sent ? (
              <form className="wl-form" onSubmit={handleSubmit}>
                <input className="wl-inp" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" className="btn-d">Apuntarme →</button>
              </form>
            ) : (
              <div className="sent">✓ Anotado — te avisamos cuando abramos</div>
            )}
            <p className="wl-note">Sin spam. Solo un email cuando lancemos el acceso completo.</p>
          </div>
        </div>
      </section>

      <footer>
        <div><div className="flogo">SLOPEMIND</div><div className="ftext" style={{marginTop:3}}>Stability &amp; Risk Engine — Mining Slopes</div></div>
        <div className="ftext">© 2026 Oriol Devesa. Todos los derechos reservados.</div>
        <div className="flinks"><a href="#metodos">Métodos</a><a href="#pricing">Pricing</a><a href="mailto:hola@slopemind.com">Contacto</a></div>
      </footer>
    </>
  );
}