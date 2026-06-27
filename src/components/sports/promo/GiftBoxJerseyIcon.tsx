/**
 * Animated gift-box → jersey reveal icon. Source SVG + keyframes provided
 * by design (sports页面homepage小图标入口.html). Class names are `cb-*`
 * scoped; matching keyframes live in src/styles.css.
 */
export function GiftBoxJerseyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`cb-svg ${className ?? ""}`}
      viewBox="0 0 200 210"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cbHalo">
          <stop offset="0" stopColor="#fff0c0" stopOpacity=".9" />
          <stop offset="55%" stopColor="#ffd76a" stopOpacity=".3" />
          <stop offset="100%" stopColor="#ffd76a" stopOpacity="0" />
        </radialGradient>
        <path
          id="cbjb"
          d="M34 30 L47 24 Q60 34 73 24 L86 30 L109 47 L94 66 L86 58 L86 105 L34 105 L34 58 L26 66 L11 47 Z"
        />
        <clipPath id="cbcp">
          <use href="#cbjb" />
        </clipPath>
      </defs>

      <ellipse className="cb-halo" cx="100" cy="92" rx="72" ry="70" fill="url(#cbHalo)" />

      <g className="cb-jvis">
        <g className="cb-rise">
          <g className="cb-wob">
            <g className="cb-grow">
              <g className="cb-jpop">
                <g transform="translate(100,92) translate(-60,-64.5)">
                  <use href="#cbjb" fill="#39a8f0" />
                  <g clipPath="url(#cbcp)">
                    <rect x="20" y="0" width="11" height="140" fill="#2389d2" />
                    <rect x="42" y="0" width="11" height="140" fill="#2389d2" />
                    <rect x="64" y="0" width="11" height="140" fill="#2389d2" />
                    <rect x="86" y="0" width="11" height="140" fill="#2389d2" />
                    <path d="M11 47 L26 66 L30 61 L15 42 Z" fill="#ffd76a" />
                    <path d="M109 47 L94 66 L90 61 L105 42 Z" fill="#ffd76a" />
                    <rect x="31" y="99" width="58" height="5" fill="#ffd76a" />
                  </g>
                  <use href="#cbjb" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M47 24 Q60 34 73 24" fill="none" stroke="#ffd76a" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M47 24 Q60 34 73 24" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="45" cy="48" r="7" fill="#ffd76a" stroke="#e0a93a" strokeWidth="1" />
                  <path
                    d="M45 44 l1.4 2.9 3.2.4 -2.3 2.2 .6 3.1 -2.9-1.5 -2.9 1.5 .6-3.1 -2.3-2.2 3.2-.4 z"
                    fill="#6c4a08"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      <g className="cb-boxvis">
        <g className="cb-rock">
          <g className="cb-squat">
            <rect x="52" y="122" width="96" height="64" rx="7" fill="#ffc23a" stroke="#e89a14" strokeWidth="2" />
            <rect x="52" y="124" width="96" height="9" rx="4" fill="#e89a14" opacity=".22" />
            <rect x="94" y="122" width="12" height="64" fill="#ff9e2c" />
          </g>
          <g className="cb-lidvis">
            <g className="cb-lid">
              <rect x="46" y="106" width="108" height="21" rx="6" fill="#ffd24d" stroke="#e89a14" strokeWidth="2" />
              <rect x="49" y="108" width="102" height="6" rx="3" fill="#ffe089" />
              <rect x="94" y="106" width="12" height="21" fill="#ff9e2c" />
              <path d="M100 103 Q85 92 83 105 Q85 114 100 105 Z" fill="#ff9e2c" />
              <path d="M100 103 Q115 92 117 105 Q115 114 100 105 Z" fill="#ff9e2c" />
              <rect x="95" y="100" width="10" height="10" rx="2.5" fill="#ff8a12" />
            </g>
          </g>
        </g>
      </g>

      <g transform="translate(100,112)">
        {([
          ["rect", 4, 6, "#ffd24d", "-54px", "-34px", "-40deg"],
          ["rect", 4, 6, "#ff6f9c", "-34px", "-60px", "60deg"],
          ["sq", 3, 3, "#39a8f0", "-10px", "-70px", "-20deg"],
          ["rect", 4, 6, "#ffffff", "14px", "-66px", "30deg"],
          ["rect", 4, 6, "#ff9e2c", "38px", "-54px", "-50deg"],
          ["rect", 4, 6, "#ffd24d", "58px", "-30px", "70deg"],
          ["sq", 3, 3, "#ff6f9c", "-64px", "-8px", "20deg"],
          ["rect", 4, 6, "#39a8f0", "64px", "-4px", "-30deg"],
          ["sq", 3, 3, "#ffffff", "-24px", "-50px", "80deg"],
          ["rect", 4, 6, "#ffd24d", "24px", "-58px", "-60deg"],
          ["rect", 4, 6, "#ff9e2c", "-44px", "-50px", "45deg"],
          ["sq", 3, 3, "#39a8f0", "46px", "-44px", "-70deg"],
          ["sq", 3, 3, "#ffd24d", "8px", "-78px", "50deg"],
          ["rect", 4, 6, "#ff6f9c", "-72px", "-26px", "-55deg"],
        ] as const).map(([kind, w, h, fill, tx, ty, r], i) => (
          <rect
            key={i}
            className="cb-conf"
            x={kind === "rect" ? -2 : -1.5}
            y={kind === "rect" ? -3 : -1.5}
            width={w}
            height={h}
            rx={kind === "rect" ? 1 : undefined}
            fill={fill}
            style={{ ["--tx" as string]: tx, ["--ty" as string]: ty, ["--r" as string]: r } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}