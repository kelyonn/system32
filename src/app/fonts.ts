import {
  Silkscreen,
  VT323,
  Space_Grotesk,
  JetBrains_Mono,
  Pixelify_Sans,
  Instrument_Serif,
} from "next/font/google";

export const silkscreen = Silkscreen({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-silkscreen" });
export const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--f-vt323" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--f-grotesk" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--f-jetbrains" });
export const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--f-pixelify" });
export const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--f-serif" });

export const fontVars = [silkscreen, vt323, spaceGrotesk, jetbrains, pixelify, instrumentSerif]
  .map((f) => f.variable)
  .join(" ");
