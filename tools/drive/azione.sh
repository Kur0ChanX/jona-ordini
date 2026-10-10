#!/bin/bash
# Mette in ordine il Drive di Mario (serve Codice.gs v2). Uso:
#   bash tools/drive/azione.sh elenco "Jona/Loghi"
#   bash tools/drive/azione.sh sposta "Jona/Loghi" "ynoy.png" "Jona/Loghi/Vecchi"        (file)
#   bash tools/drive/azione.sh sposta-cartella "Jona/Loghi" "Vecchia" "Jona/Archivio"     (cartella)
#   bash tools/drive/azione.sh cestina "Jona/Loghi" "file.png"
set -e
[ -n "$JONA_DRIVE_URL" ] || { echo "Manca JONA_DRIVE_URL (indirizzo dell'app web dello script)"; exit 1; }
a="$1"; c=false; [ "$a" = sposta-cartella ] && { a=sposta; c=true; }
python3 -c 'import json,sys; a,s,n,v,c=sys.argv[1:6]; print(json.dumps({"azione":a,"sotto":s,"nome":n,"verso":v,"cartella":c=="true"}))' "$a" "$2" "${3:-}" "${4:-}" "$c" \
  | curl -sS -L --max-time 120 -H 'content-type: application/json' --data-binary @- "$JONA_DRIVE_URL"
echo
