for X in *.jpg; do magick "$X" -resize 840x -strip -quality 86 "$X"; done
