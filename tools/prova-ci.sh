#!/bin/bash
# Prove su GitHub (workflow .github/workflows/prove.yml). Uso: bash tools/prova-ci.sh veloce|tutto [cartella]
# «veloce»: le prove legate alle parti più delicate + giro di tutte le schede (~15 min, a ogni PR).
# «tutto»: tutte le prove come tools/prova-tutto.sh (~1 ora, una volta a settimana).
cd "$(dirname "$0")/.."
M=${1:-veloce}; S=${2:-/tmp/jona-prove}; mkdir -p "$S"
VELOCI="test-gemini-server test-virgolette test-fatture test-listini-doppi test-listini-prova test-firebase-provavia test-apertura-v62 test-barra test-agenda-v58 test-agenda-v59 test-agenda-v61 test-demo-invito test-richieste-gestite test-errori test-errori-server test-falsi-ok test-firebase-telefoni test-v35 test-v40 test-firebase-flow test-news test-demo test-testbar test-agenda test-responsabile test-giro"
(python3 -m http.server 8765 >/dev/null 2>&1 &)
(npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona > $S/emu.log 2>&1 &)
for i in $(seq 1 120); do curl -s http://127.0.0.1:8080 >/dev/null && curl -s http://127.0.0.1:9099 >/dev/null && curl -s http://127.0.0.1:8765 >/dev/null && break; sleep 2; done
[ -f /tmp/xlsx.full.min.js ] || curl -s -o /tmp/xlsx.full.min.js https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
if [ "$M" = tutto ]; then L=$(ls tools/test-*.mjs | xargs -n1 basename | sed 's/\.mjs$//'); else L=$VELOCI; fi
: > $S/risultati.txt
for t in $L; do
  for p in demo-jona jona-ordini; do
    curl -s -X DELETE "http://127.0.0.1:8080/emulator/v1/projects/$p/databases/(default)/documents" >/dev/null
    curl -s -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/$p/accounts" >/dev/null
  done
  timeout 600 node tools/$t.mjs > $S/log-$t.txt 2>&1
  r=$?; echo "$r $t" >> $S/risultati.txt; echo "$r $t"
  [ $r -ne 0 ] && grep -m5 '^FAIL' $S/log-$t.txt
done
grep -v "^0 " $S/risultati.txt && { echo "PROVE FALLITE"; exit 1; } || echo "TUTTE RIUSCITE"
