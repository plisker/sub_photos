for X in *.jpg; do magick "$X" -resize 1920x -strip -quality 86 "$X"; done
