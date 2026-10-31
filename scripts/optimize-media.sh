#!/usr/bin/env bash
# Generates the responsive WebP photos, video poster frames and logo icons that the
# site actually serves, into img/opt/. Originals in img/ are never modified.
# Requires ffmpeg (with libwebp).    Usage: bash scripts/optimize-media.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=img/opt
rm -rf "$OUT" && mkdir -p "$OUT"

# photos used on the page (name:source)
PHOTOS=("1:img/1.jpg" "3:img/3.jpg" "5:img/5.jpeg" "7:img/7.jpeg" "8:img/8.jpeg"
        "9:img/WhatsApp Image 2026-10-27 at 9.23.14 PM.jpeg"
        "10:img/WhatsApp Image 2026-10-27 at 9.39.02 PM.jpeg")
WIDTHS=(360 520 720 960 1400)

for entry in "${PHOTOS[@]}"; do
  name="${entry%%:*}"; src="${entry#*:}"
  srcw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src")
  sizes=("${WIDTHS[@]}")
  # small sources: also emit one file at their native width (never upscale)
  [ "$srcw" -lt "${WIDTHS[-1]}" ] && sizes+=("$srcw")
  for w in "${sizes[@]}"; do
    [ "$w" -gt "$srcw" ] && continue
    ffmpeg -y -v error -i "$src" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 72 -compression_level 6 "$OUT/$name-$w.webp"
  done
done

# one real frame from each clip, shown on the tile instead of loading the video (name:second)
POSTERS=("1:2" "2:1.5" "3:15" "4:15" "5:15")
for entry in "${POSTERS[@]}"; do
  n="${entry%%:*}"; at="${entry#*:}"
  ffmpeg -y -v error -ss "$at" -i "img/video$n.mp4" -frames:v 1 \
    -vf "scale=720:1280:flags=lanczos" -c:v libwebp -quality 72 "$OUT/video$n-poster.webp"
done

# logo for nav / badges / footer
ffmpeg -y -v error -i img/logo.jpeg -vf "scale=96:96:flags=lanczos" -c:v libwebp -quality 85 "$OUT/logo-96.webp"

# favicon + home-screen icons (square logo)
mkdir -p icons
ffmpeg -y -v error -i img/logo.jpeg -vf "scale=180:180:flags=lanczos" icons/apple-touch-icon.png
ffmpeg -y -v error -i img/logo.jpeg -vf "scale=192:192:flags=lanczos" icons/icon-192.png
ffmpeg -y -v error -i img/logo.jpeg -vf "scale=512:512:flags=lanczos" icons/icon-512.png
ffmpeg -y -v error -i img/logo.jpeg -vf "scale=48:48:flags=lanczos" favicon.ico

echo "done"; du -sh "$OUT"; ls "$OUT" | wc -l
