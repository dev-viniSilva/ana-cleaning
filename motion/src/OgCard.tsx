import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { AbsoluteFill, Img, staticFile } from "remotion";

const cormorant = loadCormorant("normal", { weights: ["300", "600"] });
const cormorantItalic = loadCormorant("italic", { weights: ["300"] });
const outfit = loadOutfit("normal", { weights: ["400", "500"] });

// 1200x630 social-share card (Open Graph / Twitter). Same palette + type as the site hero.
export const OgCard: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0e1f2d",
        backgroundImage:
          "radial-gradient(ellipse 60% 80% at 80% 40%, rgba(79,168,208,0.28) 0%, transparent 70%), radial-gradient(ellipse 45% 60% at 5% 100%, rgba(198,152,74,0.16) 0%, transparent 70%)",
        fontFamily: outfit.fontFamily,
        color: "#fff",
      }}
    >
      {/* photo panel bleeding off the right edge, like the site hero */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 470,
          borderRadius: "56px 0 0 56px",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("3-1400.webp")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "42% 50%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 60%, rgba(14,31,45,0.45) 100%)",
          }}
        />
      </div>

      <div style={{ position: "absolute", left: 76, top: 64, display: "flex", alignItems: "center", gap: 20 }}>
        <Img
          src={staticFile("logo-96.webp")}
          style={{ width: 84, height: 84, borderRadius: 20, objectFit: "contain", background: "#fff" }}
        />
        <div style={{ fontFamily: cormorant.fontFamily, fontWeight: 600, fontSize: 44, letterSpacing: 0.5 }}>
          Ana's Care Cleaning
        </div>
      </div>

      <div style={{ position: "absolute", left: 76, top: 206, width: 640 }}>
        <div
          style={{
            fontFamily: cormorant.fontFamily,
            fontWeight: 300,
            fontSize: 84,
            lineHeight: 1.04,
          }}
        >
          House cleaning in{" "}
          <span style={{ fontFamily: cormorantItalic.fontFamily, fontStyle: "italic", color: "#b6dff0" }}>
            Monmouth &amp; Ocean County
          </span>
          , NJ
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 76,
          bottom: 62,
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 28,
          fontWeight: 500,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        <span style={{ width: 44, height: 2, background: "#c6984a" }} />
        anascarecleaning.com
      </div>
    </AbsoluteFill>
  );
};
