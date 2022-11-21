for file in *.jpg; do cwebp "$file" -o "${file%.*}.webp"; done
