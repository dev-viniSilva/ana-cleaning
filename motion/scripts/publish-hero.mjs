// Moves the rendered loop into the site as a web-optimised mp4 (faststart).
// No poster file: the page already shows the static hero photo underneath until the loop is playing.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("../img/hero", { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", "out/hero-loop.mp4", "-c", "copy", "-an", "-movflags", "+faststart", "../img/hero/hero-loop.mp4"], { stdio: "inherit" });
console.log("Published ../img/hero/hero-loop.mp4");
