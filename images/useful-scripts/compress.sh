for X in *.jpg; do convert "$X" -resize 1920x -strip -quality 86 "$X"; done
