import React, { useEffect, useRef, useState } from "react";

// ------------------ PRESETS ---------------------
const PRESETS = {
  amo: {
    name: "Amo-style",
    fontFamily: "Impact, Arial Black, sans-serif",
    fill: "#FFFFFF",
    stroke: "#FF3B30",
    strokeWidth: 8,
    letterSpacing: 3,
  },

  amo_strong: {
    name: "Amo Strong",
    fontFamily: "Impact, Arial Black, sans-serif",
    fill: "#FFFFFF",
    stroke: "#FF0000",
    strokeWidth: 10,
    shadowStroke: "#000000",
    shadowStrokeWidth: 20,
    letterSpacing: 3,
  },

  breaking: {
    name: "Breaking",
    fontFamily: "Anton, sans-serif",
    fill: "#FFFFFF",
    stroke: "#000000",
    strokeWidth: 8,
    letterSpacing: 2,
  },

  simple: {
    name: "Simple white",
    fontFamily: "system-ui, sans-serif",
    fill: "#FFFFFF",
    stroke: "transparent",
    strokeWidth: 0,
  },

  labelbox: {
    name: "Label box",
    fontFamily: "Arial, Helvetica, sans-serif",
    fill: "#000000",
    stroke: "transparent",
    strokeWidth: 0,
    box: {
      paddingX: 40,
      paddingY: 30,
      borderColor: "#000000",
      borderWidth: 6,
      backgroundColor: "#ffffff",
      shadowOffset: 40,
    },
  },

  none: { name: "None" },
};

export default function App() {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  // TEXT BLOCKS
  const [texts, setTexts] = useState([
    { id: 1, text: "FIRST\nTEXT", x: 500, y: 500, preset: "amo", fontSize: 70 },
    { id: 2, text: "", x: 300, y: 380, preset: "none", fontSize: 0 },
  ]);

  // LOGO BLOCK
  const [logoEnabled, setLogoEnabled] = useState(true);
  const [logoColor, setLogoColor] = useState("black");
  const [logoScale, setLogoScale] = useState(0.5);
  const [logoPos, setLogoPos] = useState({ x: 200, y: 200 });

  const logoDrag = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  // TEXT DRAG
  const dragState = useRef({
    dragging: false,
    targetId: null,
    offsetX: 0,
    offsetY: 0,
  });

  const [hoverId, setHoverId] = useState(null);

  // -------------------------------------------------------------------
  // CUSTOM LETTER SPACING DRAW
  function drawTextWithSpacing(ctx, text, centerX, y, spacing, strokeStyle, strokeWidth, fillStyle) {
    if (!text) return;

    let totalWidth = 0;
    for (let ch of text) totalWidth += ctx.measureText(ch).width;
    totalWidth += spacing * (text.length - 1);

    let x = centerX - totalWidth / 2;

    for (let ch of text) {
      const w = ctx.measureText(ch).width;

      if (strokeWidth > 0 && strokeStyle) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.strokeText(ch, x + w / 2, y);
      }

      ctx.fillStyle = fillStyle;
      ctx.fillText(ch, x + w / 2, y);

      x += w + spacing;
    }
  }
  // -------------------------------------------------------------------

  function handleImageUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => setImageUrl(e.target.result);
    r.readAsDataURL(f);
  }

  useEffect(() => {
    if (!imageUrl) return;
    renderCanvas();
  }, [imageUrl, texts, logoEnabled, logoColor, logoScale, logoPos, hoverId]);

  // --------------------- HIGHLIGHT BOX ---------------------
  function drawHighlight(ctx, block) {
    if (hoverId !== block.id) return;

    const preset = PRESETS[block.preset];
    const lines = block.text.split("\n");
    const lh = block.fontSize * 1.2;

    ctx.font = `bold ${block.fontSize}px ${preset.fontFamily}`;

    const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const textHeight = lines.length * lh;

    let L, R, T, B;

    if (preset.box) {
      const padX = preset.box.paddingX;
      const padY = preset.box.paddingY;

      L = block.x - textWidth / 2 - padX;
      R = block.x + textWidth / 2 + padX;
      T = block.y - textHeight / 2 - padY;
      B = block.y + textHeight / 2 + padY + preset.box.shadowOffset;
    } else {
      const EXTRA = 20;

      L = block.x - textWidth / 2 - EXTRA;
      R = block.x + textWidth / 2 + EXTRA;
      T = block.y - textHeight / 2 - EXTRA;
      B = block.y + textHeight / 2 + EXTRA;
    }

    ctx.fillStyle = "rgba(255,255,0,0.25)";
    ctx.fillRect(L, T, R - L, B - T);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,0,0.6)";
    ctx.strokeRect(L, T, R - L, B - T);
  }

  function drawLogoHighlight(ctx) {
    if (hoverId !== "logo") return;

    const img = new Image();
    img.onload = () => {
      const w = img.width * logoScale;
      const h = img.height * logoScale;

      const L = logoPos.x - w / 2 - 10;
      const T = logoPos.y - h / 2 - 10;

      ctx.fillStyle = "rgba(0,150,255,0.25)";
      ctx.fillRect(L, T, w + 20, h + 20);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,150,255,0.6)";
      ctx.strokeRect(L, T, w + 20, h + 20);
    };
    img.src =
      logoColor === "black"
        ? "/image-text-overlay/logo-black.png"
        : "/image-text-overlay/logo-white.png";
  }

  // ----------------- DRAW TEXT BLOCK ---------------------
  function drawBlock(ctx, block) {
    const preset = PRESETS[block.preset];
    const lines = block.text.split("\n");
    const lh = block.fontSize * 1.2;

    ctx.font = `bold ${block.fontSize}px ${preset.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // BOX (Labelbox)
    if (preset.box) {
      const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const textHeight = lines.length * lh;

      const padX = preset.box.paddingX;
      const padY = preset.box.paddingY;

      const L = block.x - textWidth / 2 - padX;
      const R = block.x + textWidth / 2 + padX;
      const T = block.y - textHeight / 2 - padY;
      const B = block.y + textHeight / 2 + padY;

      // shadow bottom-right
      ctx.fillStyle = "#E87561";
      ctx.beginPath();
      ctx.moveTo(L, B);
      ctx.lineTo(R, B);
      ctx.lineTo(R - preset.box.shadowOffset, B + preset.box.shadowOffset);
      ctx.lineTo(L - preset.box.shadowOffset, B + preset.box.shadowOffset);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = preset.box.backgroundColor;
      ctx.fillRect(L, T, R - L, B - T);

      ctx.lineWidth = preset.box.borderWidth;
      ctx.strokeStyle = preset.box.borderColor;
      ctx.strokeRect(L, T, R - L, B - T);
    }

    // TEXT LINES
    lines.forEach((line, i) => {
      const y = block.y + (i - (lines.length - 1) / 2) * lh;

      // Custom letter spacing?
      if (preset.letterSpacing && preset.letterSpacing > 0) {
        drawTextWithSpacing(
          ctx,
          line,
          block.x,
          y,
          preset.letterSpacing,
          preset.stroke,
          preset.strokeWidth,
          preset.fill
        );
      } else {
        if (!preset.box && preset.strokeWidth > 0) {
          ctx.lineWidth = preset.strokeWidth;
          ctx.strokeStyle = preset.stroke;
          ctx.strokeText(line, block.x, y);
        }

        ctx.fillStyle = preset.fill;
        ctx.fillText(line, block.x, y);
      }
    });
  }

  // ----------------- DRAW LOGO ---------------------
  function drawLogo(ctx) {
    if (!logoEnabled) return;

    const img = new Image();
    img.onload = () => {
      const w = img.width * logoScale;
      const h = img.height * logoScale;
      ctx.drawImage(img, logoPos.x - w / 2, logoPos.y - h / 2, w, h);
    };
    img.src =
      logoColor === "black"
        ? "/image-text-overlay/logo-black.png"
        : "/image-text-overlay/logo-white.png";
  }

  // ---------------- RENDER CANVAS -----------------
  function renderCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const max = 900;
      const scale = img.width > max ? max / img.width : 1;

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      texts.forEach((b) => drawHighlight(ctx, b));
      if (logoEnabled) drawLogoHighlight(ctx);

      texts.forEach((b) => drawBlock(ctx, b));
      drawLogo(ctx);
    };

    img.src = imageUrl;
  }

  // ---------------- HIT AREAS --------------------
  function hitLogo(x, y) {
    if (!logoEnabled) return false;

    const img = new Image();
    img.src =
      logoColor === "black"
        ? "/image-text-overlay/logo-black.png"
        : "/image-text-overlay/logo-white.png";

    const w = img.width * logoScale;
    const h = img.height * logoScale;

    return (
      x >= logoPos.x - w / 2 - 10 &&
      x <= logoPos.x + w / 2 + 10 &&
      y >= logoPos.y - h / 2 - 10 &&
      y <= logoPos.y + h / 2 + 10
    );
  }

  function findTextHit(x, y) {
    const ctx = canvasRef.current.getContext("2d");

    for (let block of [...texts].reverse()) {
      const preset = PRESETS[block.preset];
      const lines = block.text.split("\n");
      const lh = block.fontSize * 1.2;

      ctx.font = `bold ${block.fontSize}px ${preset.fontFamily}`;

      if (preset.box) {
        const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
        const textHeight = lines.length * lh;

        const padX = preset.box.paddingX;
        const padY = preset.box.paddingY;

        const L = block.x - textWidth / 2 - padX;
        const R = block.x + textWidth / 2 + padX;
        const T = block.y - textHeight / 2 - padY;
        let B = block.y + textHeight / 2 + padY;

        B += preset.box.shadowOffset;

        if (x >= L && x <= R && y >= T && y <= B) return block.id;
      } else {
        const HIT = 20;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const w = ctx.measureText(line).width;
          const h = block.fontSize;
          const cy = block.y + (i - (lines.length - 1) / 2) * lh;

          if (
            x >= block.x - w / 2 - HIT &&
            x <= block.x + w / 2 + HIT &&
            y >= cy - h / 2 - HIT &&
            y <= cy + h / 2 + HIT
          ) {
            return block.id;
          }
        }
      }
    }

    return null;
  }

  // ---------------- MOUSE -----------------------
  function handleHover(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (hitLogo(mx, my)) {
      setHoverId("logo");
      return;
    }

    const id = findTextHit(mx, my);
    setHoverId(id);
  }

  function onMouseDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (hitLogo(mx, my)) {
      logoDrag.current = {
        dragging: true,
        offsetX: mx - logoPos.x,
        offsetY: my - logoPos.y,
      };
      return;
    }

    const id = findTextHit(mx, my);
    if (!id) return;

    const t = texts.find((x) => x.id === id);

    dragState.current = {
      dragging: true,
      targetId: id,
      offsetX: mx - t.x,
      offsetY: my - t.y,
    };
  }

  function onMouseMove(e) {
    handleHover(e);

    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (logoDrag.current.dragging) {
      setLogoPos({
        x: mx - logoDrag.current.offsetX,
        y: my - logoDrag.current.offsetY,
      });
      return;
    }

    if (!dragState.current.dragging) return;

    setTexts((p) =>
      p.map((t) =>
        t.id === dragState.current.targetId
          ? { ...t, x: mx - dragState.current.offsetX, y: my - dragState.current.offsetY }
          : t
      )
    );
  }

  function onMouseUp() {
    dragState.current.dragging = false;
    dragState.current.targetId = null;
    logoDrag.current.dragging = false;
  }

  // ---------------- DOWNLOAD ----------------------
  function download() {
    const c = canvasRef.current;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "edited.png";
    a.click();
  }

  // ---------------- RENDER ------------------------
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white" }}>
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: "340px",
          background: "#111827",
          padding: 20,
          borderRight: "1px solid #1f2937",
          overflowY: "auto",
        }}
      >
        <h2>Налаштування</h2>

        <div style={{ marginBottom: 20 }}>
          <label>Фото</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <hr style={{ borderColor: "#374151" }} />

        <h3>Логотип</h3>

        <label>
          <input
            type="checkbox"
            checked={logoEnabled}
            onChange={(e) => setLogoEnabled(e.target.checked)}
          />{" "}
          Увімкнути логотип
        </label>

        {logoEnabled && (
          <>
            <label style={{ display: "block", marginTop: 10 }}>Колір</label>
            <select
              value={logoColor}
              onChange={(e) => setLogoColor(e.target.value)}
              style={{ width: "100%", padding: 6, marginBottom: 10 }}
            >
              <option value="black">Black</option>
              <option value="white">White</option>
            </select>

            <label>Розмір</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={logoScale}
              onChange={(e) => setLogoScale(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </>
        )}

        <hr style={{ borderColor: "#374151", margin: "20px 0" }} />

        <h3>Текстові блоки</h3>

        {texts.map((t) => (
          <div key={t.id} style={{ background: "#1f2937", padding: 12, marginBottom: 12 }}>
            <label>Текст #{t.id}</label>
            <textarea
              rows={3}
              value={t.text}
              onChange={(e) =>
                setTexts((p) =>
                  p.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x))
                )
              }
              style={{
                width: "100%",
                background: "#000",
                color: "white",
                marginTop: 6,
              }}
            />

            <label>Розмір</label>
            <input
              type="range"
              min="20"
              max="200"
              value={t.fontSize}
              onChange={(e) =>
                setTexts((p) =>
                  p.map((x) =>
                    x.id === t.id ? { ...x, fontSize: Number(e.target.value) } : x
                  )
                )
              }
              style={{ width: "100%" }}
            />

            <label>Стиль</label>
            <select
              value={t.preset}
              onChange={(e) =>
                setTexts((p) =>
                  p.map((x) => (x.id === t.id ? { ...x, preset: e.target.value } : x))
                )
              }
              style={{
                width: "100%",
                background: "#000",
                color: "white",
                marginTop: 6,
              }}
            >
              {Object.entries(PRESETS).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={download}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "#ef4444",
            borderRadius: 8,
          }}
        >
          Завантажити PNG
        </button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!imageUrl ? (
          <p style={{ opacity: 0.5 }}>Завантаж фото…</p>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ maxWidth: "100%", maxHeight: "100%", cursor: "move" }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseUp}
          />
        )}
      </div>
    </div>
  );
}
