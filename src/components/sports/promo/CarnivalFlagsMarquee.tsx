/**
 * Horizontal infinite marquee of host/participating country flags.
 * Pure visual ornament for the World Cup Carnival hub — non-interactive.
 * Duplicated track so the translateX loop is seamless.
 */
const FLAG_CODES = [
  "us", "ca", "mx", "br", "ar", "fr", "de", "es", "pt", "nl",
  "it", "be", "hr", "ch", "dk", "uy", "co", "ec", "jp", "kr",
  "au", "sn", "ma", "tn", "eg", "cm", "gh", "ng", "no", "at",
  "tr", "cz",
];

export function CarnivalFlagsMarquee({
  reverse = false,
  opacity = 0.45,
  height = 20,
}: {
  reverse?: boolean;
  opacity?: number;
  height?: number;
}) {
  const track = [...FLAG_CODES, ...FLAG_CODES];
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{ height, opacity }}
    >
      <div
        className={
          "flex w-max items-center gap-2 " +
          (reverse ? "animate-flag-marquee-reverse" : "animate-flag-marquee")
        }
        style={{ willChange: "transform" }}
      >
        {track.map((code, i) => (
          <img
            key={`${code}-${i}`}
            src={`https://flagcdn.com/w40/${code}.png`}
            alt=""
            className="block shrink-0 rounded-[2px]"
            style={{ height, width: "auto" }}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}