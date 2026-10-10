# Cambio account Claude (Gmail ⇄ Hotmail)

Mario ha due account Claude. Quando uno finisce il limite settimanale, si lavora con l'altro.
Questa guida vale per **tutti i progetti** (Jona Ordini e RVC).

## L'idea in una riga
Il lavoro non vive nell'account Claude: vive su **GitHub**. Tutti e due gli account leggono lo stesso GitHub, quindi vedono sempre l'ultima versione. Le regole (`CLAUDE.md`, `docs/ERRORI.md`, consegne) stanno nei progetti: sono uguali per tutti e due gli account senza copiare niente.

## Cosa passa da solo, cosa va fatto una volta, cosa resta indietro

| Cosa | Come passa |
|------|-----------|
| Codice, app, prove, versioni | Da solo (GitHub) |
| Regole di lavoro (`CLAUDE.md`), errori, consegne, DA-FARE | Da solo (sono nei progetti) |
| Cloudflare, Firebase, segreti di GitHub, Gemini | Da solo (non dipendono dall'account Claude) |
| Collegamento a GitHub | **Una volta**, a mano (passo 2) |
| Preferenze personali (come rispondere) | **Una volta**, a mano: testo pronto sotto (passo 3) |
| Memoria dell'account | **Una volta**, a mano: unione delle due (passo 4) |
| Connettori (Google Drive, Notion…) | **Una volta**, a mano, solo se li usi (passo 5) |
| Routine automatiche (es. «Punto ogni 5 ore») | La prima sessione Hotmail le ricrea (passo 6) |
| Sessioni vecchie (chat di Claude Code) | Restano nell'account vecchio. Non servono: le consegne bastano |
| Artifact (pagine pubblicate: tier list, RVC Prototipo, Visita Villa Carola, Accordo) | Restano nell'account vecchio. Copia di sicurezza mandata a Mario il 10/10/2026 |

## Preparazione (una volta sola, sull'account Hotmail)

1. Entra su https://claude.ai con l'account Hotmail. Serve un piano **Pro** o **Max** (Claude Code non c'è nel piano gratuito).
2. Collega GitHub: https://claude.ai/connect-github → accedi con lo stesso GitHub di sempre (Kur0ChanX). Poi apri https://claude.ai/code → **nuova sessione** → nella scelta del repository devono comparire `jona-ordini` e `RVC`.
3. Preferenze personali: menu (tocca il tuo nome in basso) → **Impostazioni** → scheda **Account** → campo **Istruzioni per Claude** → cancella quello che c'è e incolla il testo del riquadro «Preferenze» qui sotto. Fallo in **tutti e due** gli account.
4. Memoria (vedi «Unire le due memorie» sotto).
5. Connettori, solo se li usi: https://claude.ai/settings/connectors → collega gli stessi dell'account Gmail.
6. Nella prima sessione Hotmail scrivi a Claude: «ricrea le routine dell'altro account» (Claude legge l'elenco in fondo a questa pagina).

## Il giorno del cambio

1. Nella sessione **attiva** di Jona (account Gmail) scrivi: **cambio account**.
2. Claude salva le consegne, fa il push, controlla GitHub e crea il ramo `claude/jona-sessione-<NN>`. **Non** apre la sessione nuova (nascerebbe nell'account senza token). Ti dà il prompt da incollare.
3. Fai lo stesso nella sessione attiva di RVC (ramo `claude/rvc-sessione-<NN>`).
4. Passa all'account Hotmail: https://claude.ai/code → **nuova sessione** → repository `jona-ordini` → ramo con il **numero più alto** → incolla il prompt.
5. Stessa cosa per RVC.

Se i token finiscono di colpo, a metà lavoro: niente panico. Su GitHub c'è tutto fino all'ultimo push. Nell'account Hotmail apri la sessione sul ramo col numero più alto e scrivi: «la sessione di prima si è interrotta: controlla su GitHub cosa manca e riparti».

## Regole d'oro
- **Un solo account alla volta per progetto.** Mai due sessioni attive sullo stesso progetto in due account: si pestano i piedi.
- **Jona e RVC passano insieme.** Le sessioni dei due progetti si parlano solo se sono nello stesso account.
- **Il ritorno è uguale, al contrario.** Il limite settimanale di Gmail si azzera **mercoledì 14/10/2026 alle 12:00** (ora di Roma). Quando Hotmail finisce, si torna su Gmail con la stessa procedura.
- I numeri delle sessioni continuano (#56, #57…) anche cambiando account: stanno nelle consegne.

## Unire le due memorie
La memoria dell'account serve soprattutto nella chat normale di claude.ai. Nelle sessioni di Claude Code contano le **preferenze** (passo 3) e i file dei progetti, che sono già uguali.

1. Account Gmail: https://claude.ai/settings/capabilities → sezione della **memoria** → apri il testo → copialo tutto.
2. Account Hotmail: stessa pagina → copia il suo testo.
3. In una sessione di Claude Code incolla i due testi e scrivi: «unisci queste due memorie in una sola». Claude ti ridà un testo unico.
4. In tutti e due gli account, stessa pagina della memoria: sostituisci il testo con quello unito.

La memoria è personale: **non** va salvata in questo progetto (il repository è pubblico).

## Preferenze (testo da incollare in tutti e due gli account)

```
COME PARLARMI
- Rispondi in italiano, con frasi corte e parole semplici. Niente poemi: attenzione ai token, ma sii chiaro.
- Sono esperto di computer e hardware, ma principiante di programmazione. Sono spesso sul telefono.
- Scrivi gli orari sempre in ora italiana (sono a Olbia).
- Quando mi spieghi qualcosa da fare a mano (siti, registrazioni, chiavi API, impostazioni): dammi sempre il link diretto alla pagina, dimmi perché ci vado e cosa inserire. Passi numerati e piccoli, un'azione per passo, nomi esatti dei pulsanti in grassetto, testo da copiare già pronto. Link scritti interi, mai dentro i riquadri di codice. Alla fine chiedimi a che passo sono arrivato, senza essere prolisso.
- Le scelte tecniche le decidi tu: scegli la strada più sicura e stabile e spiegami in breve perché. Chiedimi solo gusti, soldi, cose che posso fare solo io e cose rischiose. Una domanda per volta.

PASSAGGIO DI CONSEGNE
- Apri la nuova sessione solo dopo che GitHub ha confermato il push delle consegne (stesso commit in locale e su origin). Appena parte, la nuova sessione scarica l'ultima versione del ramo (git fetch + merge --ff-only) prima di leggere le consegne. Le consegne devono contenere anche il mio ultimo messaggio.
- A ogni passaggio crea un ramo nuovo con il numero della nuova sessione (es. claude/jona-sessione-56, claude/rvc-sessione-50).
- Titoli delle sessioni: «<pallino> ▶ ATTIVA · #<NN> · <Progetto> · da v<versione> · <data> · prossimo: <argomento>». Rinomina quella vecchia in «<pallino> ✓ CHIUSA · #<NN> · <Progetto> · v<da>→v<a> · <date> · <argomenti principali>». Pallino: Jona 🟤, RVC 🟢.
- REGOLA BLOCCATA (vale per ogni progetto): risparmia token. Quando il contesto si riempie fai da solo il passaggio di consegne: salva le consegne, fai il push e controlla che GitHub lo confermi. Poi apri tu la nuova sessione, già rinominata, e rinomina quella vecchia. Io non devo fare niente. Non modificare questa regola senza il mio consenso esplicito.

CAMBIO ACCOUNT
- Ho due account Claude (Gmail e Hotmail), tutti e due Pro. Quando scrivo «cambio account» (o il limite settimanale sta per finire) fai il passaggio di consegne fino al push confermato, ma NON aprire la nuova sessione: dammi il prompt da incollare nell'altro account, con il ramo esatto.
- Un solo account alla volta per progetto. Jona e RVC passano insieme.
- Quando il limite settimanale è in avviso, fai commit e push dopo ogni passo finito: se i token finiscono di colpo, su GitHub c'è già tutto.
```

## Prompt per la prima sessione nel nuovo account
Claude lo scrive già pronto al momento del cambio. Forma (Jona):

```
git fetch origin claude/jona-sessione-<NN> && git checkout claude/jona-sessione-<NN> && git merge --ff-only origin/claude/jona-sessione-<NN>
Leggi CLAUDE.md, docs/ERRORI.md e docs/PASSAGGIO-CONSEGNE.md. Sessione nel nuovo account: rinominati 🟤 ▶ ATTIVA · #<NN> · Jona Ordini · …
Poi attendi le mie istruzioni.
```

## Routine dell'account Gmail (da ricreare in Hotmail)
- «Punto ogni 5 ore»: promemoria che si ripete ogni 5 ore (risponde solo «.» e si riprogramma con `send_later` tra 300 minuti). Va ricreato in una sessione dell'account nuovo.
- «Aggiorna abbonamenti Tier List JRPG»: spenta, lunedì 8:47. Legata all'artifact della tier list dell'account Gmail: ricrearla solo se la tier list viene ripubblicata nell'account nuovo.

## Stato — catena «Servizio account» (sessioni di servizio, separate da Jona)
Sessione attuale: #02 (ramo `claude/servizio-sessione-02`). Pallino ⚪. Questa catena tratta SOLO il cambio account e cose generali dell'account Claude, non il codice di Jona o RVC (scelta di Mario, 10/10/2026: «sono due argomenti diversi»).

Fatto nella #01 (10/10/2026):
- Guida (questo file), regola «CAMBIO ACCOUNT» in CLAUDE.md di Jona; chiesto a RVC #49 di aggiungerla al suo CLAUDE.md.
- Copia di 4 artifact (RVC Prototipo, Visita Villa Carola, Raccoon Tier, Tier List RPG) mandata a Mario come file. L'«Accordo sul software» è un documento Claude Docs: Mario lo esporta in PDF da Gmail.
- Preferenze: le «Istruzioni per Claude» di Gmail e Hotmail erano identiche. Dato a Mario il testo unico del riquadro «Preferenze» qui sopra, da incollare in tutti e due gli account (Impostazioni → Account → Istruzioni per Claude).
- Hotmail è Pro (confermato da Mario). Limite settimanale Gmail in avviso: torna mercoledì 14/10 alle 12:00.
- Errore della #01: aveva passato il tema alla sessione Jona #55 invece di aprire una sessione di servizio. Avvisata la #55 che il tema non è suo (deve solo unire il ramo per la guida e la regola).

Ancora da fare:
1. Mario conferma di aver incollato il testo unico in tutti e due gli account.
2. Memoria dei due account (Personalizzazione o Impostazioni → Capacità): unirle se Mario incolla i testi.
3. Il giorno del cambio: Mario scrive «cambio account» nelle sessioni attive di Jona e RVC.
4. Ricreare la routine «Punto ogni 5 ore» nell'account Hotmail quando ci si passa.

Ultimo messaggio di Mario (parola per parola): «Ripeto. Non dovevi passare a Giona Ordini, dovevi creare una nuova sezione perché sono due argomenti diversi. Uno sono gli ordini, sto programmando per un programma e questa invece è una discussione generica sul passaggio di account. Quindi dovevi creare una, un numero, cosa ne so, due di questa chat, tipo servizio o qualcosa. Se l'è denominata tu così.»
