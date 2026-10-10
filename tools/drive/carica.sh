#!/bin/bash
# Carica file nel Drive di Mario, cartella «Claude Code Lavoro» (script in tools/drive/Codice.gs).
# Uso: JONA_DRIVE_URL=… bash tools/drive/carica.sh <sottocartella> <file>...   (sottocartella es. "Jona/Loghi", "" = cartella principale)
set -e
[ -n "$JONA_DRIVE_URL" ] || { echo "Manca JONA_DRIVE_URL (indirizzo dell'app web dello script)"; exit 1; }
sotto="$1"; shift
for f in "$@"; do
  tipo=$(file -b --mime-type "$f")
  python3 -c 'import base64,json,os,sys; print(json.dumps({"nome":os.path.basename(sys.argv[1]),"tipo":sys.argv[2],"sotto":sys.argv[3],"dati":base64.b64encode(open(sys.argv[1],"rb").read()).decode()}))' "$f" "$tipo" "$sotto" \
    | curl -sS -L --max-time 120 -H 'content-type: application/json' --data-binary @- "$JONA_DRIVE_URL"
  echo
done
