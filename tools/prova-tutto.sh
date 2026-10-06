#!/bin/bash
# Fa girare TUTTE le prove (server locale + emulatore Firebase). Uso: bash tools/prova-tutto.sh [cartella dei risultati]
# Risultato in <cartella>/risultati.txt (0 = riuscita), un log per prova. Il server e l emulatore restano accesi alla fine.
cd "$(dirname "$0")/.."
S=${1:-/tmp/jona-prove}; mkdir -p "$S"
(python3 -m http.server 8765 >/dev/null 2>&1 &)
(npx --yes firebase-tools@13 emulators:start --only firestore,auth --project demo-jona > $S/emu.log 2>&1 &)
for i in $(seq 1 90); do curl -s http://127.0.0.1:8080 >/dev/null && curl -s http://127.0.0.1:9099 >/dev/null && break; sleep 2; done
[ -f /tmp/xlsx.full.min.js ] || curl -s -o /tmp/xlsx.full.min.js https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
: > $S/risultati.txt
for t in tools/test-*.mjs; do
  for p in demo-jona jona-ordini; do
    curl -s -X DELETE "http://127.0.0.1:8080/emulator/v1/projects/$p/databases/(default)/documents" >/dev/null
    curl -s -X DELETE "http://127.0.0.1:9099/emulator/v1/projects/$p/accounts" >/dev/null
  done
  timeout 600 node $t > $S/log-$(basename $t .mjs).txt 2>&1
  echo "$? $t" >> $S/risultati.txt
done
echo FINE >> $S/risultati.txt
grep -v "^0 " $S/risultati.txt | grep -v FINE && exit 1 || echo "TUTTE RIUSCITE"
