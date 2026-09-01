# Psicoeducando

Sito vetrina statico/PHP pronto per hosting Linux Aruba.

## Pubblicazione

Caricare nella cartella pubblica del dominio tutti i file e le cartelle presenti in questa directory:

- `index.html`
- `contact.php`
- `.htaccess`
- `assets/`

Il modulo contatti usa la funzione `mail()` di PHP e invia a `elena.mascolo@psicoeducando.it`.
Prima della pubblicazione verificare che la funzione `mail()` e il mittente `noreply@psicoeducando.it` siano abilitati sul piano hosting Aruba.

## Verifiche obbligatorie prima della pubblicazione

Le finestre Privacy Policy e Cookie Policy sono già integrate nel sito, ma alcuni dati non erano presenti nei materiali forniti. Prima della messa online occorre:

- completare nell'informativa privacy codice fiscale o partita IVA del titolare ed eventuale PEC;
- verificare i fornitori effettivi di hosting, posta elettronica e relativi tempi di conservazione;
- verificare con il consulente privacy la versione finale delle informative in base ai servizi realmente attivati;
- se vengono aggiunti analytics, pixel, video o contenuti social incorporati, implementare un sistema di consenso preventivo e aggiornare la Cookie Policy.
