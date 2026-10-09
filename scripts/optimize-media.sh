#!/usr/bin/env bash
# Generates responsive WebP images + video poster frames into img/opt/.
# Originals in img/ are left untouched. Requires ffmpeg (with libwebp).
# Usage: bash scripts/optimize-media.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=img/opt
mkdir -p "$OUT"

# name:source  (widths below are generated for each)
PHOTOS=(
  "1:img/1.jpg" "2:img/2.jpg" "3:img/3.jpg" "4:img/4.jpg"
  "5:img/5.jpeg" "6:img/6.jpeg" "7:img/7.jpeg" "8:img/8.jpeg"
)
WIDTHS=(360 640 960 1400)

for entry in "${PHOTOS[@]}"; do
  name="${entry%%:*}"; src="${entry#*:}"
  srcw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src")
  sizes=("${WIDTHS[@]}")
  # small sources: also emit one file at their native width (never upscale)
  [ "$srcw" -lt "${WIDTHS[-1]}" ] && sizes+=("$srcw")
  for w in "${sizes[@]}"; do
    [ "$w" -gt "$srcw" ] && continue
    ffmpeg -y -v error -i "$src" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 78 -compression_level 6 "$OUT/$name-$w.webp"
  done
done

# Video posters (real frame from each clip, shown instead of loading the video)
declare -A POSTER_AT=( [1]=2.0 [2]=1.5 [3]=15 [4]=15 [5]=15 )
for n in 1 2 3 4 5; do
  ffmpeg -y -v error -ss "${POSTER_AT[$n]}" -i "img/video$n.mp4" -frames:v 1 \
    -vf "scale=540:-2:flags=lanczos" -c:v libwebp -quality 74 "$OUT/video$n-poster.webp"
done
for w in 96; do ffmpeg -y -v error -i img/logo.jpeg -vf "scale=$w:$w:flags=lanczos" -c:v libwebp -quality 85 "$OUT/logo-$w.webp"; done
echo "done"; ls -la "$OUT" | head -60
