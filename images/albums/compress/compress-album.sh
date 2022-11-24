for X in *.jpg; do convert "$X" -resize 840x -strip -quality 86 "$X"; done
