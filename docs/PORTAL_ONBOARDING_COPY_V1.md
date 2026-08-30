# Portal onboarding and copy contract V1

Status: active product contract.

This contract locks the client onboarding language and the six clarification prompts in `Forløpet`. It supersedes older wording that presents the product itself as an `Utviklingsplan`.

## Product naming

- Login and browser title: `Ræder& utviklingsportal`
- Client workspace kicker: `Din utviklingsportal`
- Coach/admin client workspace kicker: `Klientforløp`
- `Utviklingsplan` remains valid only when it denotes the client's actual plan, not the whole product.

## First client invitation

The first client invitation is sent from the version-controlled `invite-user` function. The Supabase default invitation template must not be used for clients.

Subject: `Velkommen til din personlige utviklingsportal`

Body:

> Hei {{fornavn}},
>
> Du har fått tilgang til din personlige utviklingsportal hos Ræder&.
>
> Her samler du det som gir retning i utviklingsløpet ditt: mål og rammer, utviklingsfokus, samtaler, egne refleksjoner og ressurser fra coachen din.
>
> Portalen er din. Du eier utviklingsløpet og velger selv hva du vil arbeide med, og hvilke refleksjoner du eventuelt vil dele med coachen.
>
> Opprett passord og åpne portalen
>
> Lenken er personlig og utløper av sikkerhetshensyn. Hvis du ikke forventet denne e-posten, kan du se bort fra den.
>
> Hilsen Ræder&

The resend email remains a separate, already approved access-link message. Coach invitation copy is outside this contract and must not inherit the client wording.

## First activation

- First activation: `Velkommen, {{fornavn}}`
- Later sessions: `Velkommen tilbake, {{fornavn}}`
- This distinction uses the existing `clients.account_activated_at`; it must not introduce a parallel onboarding field.

## Client workspace

Portal subtitle:

`Hold oversikt over det du jobber med nå, følg utviklingen din og forbered deg til neste samtale.`

`Akkurat nå` introduction:

`Se hvor du står, hva du jobber med og hva som venter.`

`Forløpet` introduction:

- Title: `Mål og rammer for utviklingsforløpet`
- Text: `Avklar hvorfor forløpet er viktig, hva som skal bli annerledes, hvordan du vil merke fremgang og hvordan du og ledercoachen din skal samarbeide.`

`Utviklingsfokus` introduction:

- Title: `Fra ambisjon til praksis`
- Text: `Ta utgangspunkt i det du må lykkes med i din lederjobb, velg hva du trenger å utvikle, og planlegg hva du konkret vil prøve i praksis.`

## Six clarifications

Examples are available only while a clarification is empty. They are disclosed through `Se eksempel`, are never prefilled, and are never saved as client content.

1. `Hva vil du oppnå?`

   Example: `Jeg vil lukke de viktigste utviklingsgapene som 360-evalueringen og medarbeiderundersøkelsen har synliggjort, slik at måten jeg leder på i større grad samsvarer med det medarbeiderne og virksomheten trenger.`

2. `Hvordan vil du merke fremgang?`

   Example: `Jeg vil merke fremgang ved at medarbeiderne opplever tydeligere retning, bedre støtte og større handlingsrom, tar mer ansvar og får brukt kompetansen sin bedre. Det bør etter hvert også vise seg i tilbakemeldinger, samarbeid og resultater.`

3. `Hvordan vil du holde fokus mellom samtalene?`

   Example: `Jeg setter av 20 minutter hver fredag til å stoppe opp, notere hva jeg har lagt merke til og forberede det jeg vil ta med inn i neste samtale.`

4. `Hva trenger du fra ledercoachen din?`

   Example: `Jeg trenger at ledercoachen min utfordrer antakelsene mine, hjelper meg å se mønstre og følger opp det vi blir enige om.`

5. `Rammer for samarbeidet`

   Practical example: `Vi møtes hver tredje uke i 60 minutter, og jeg setter av tid før samtalene til å samle det jeg vil arbeide med.`

   Confidentiality example: `Det som deles i samtalene er konfidensielt. Eventuell deling med arbeidsgiver avtales med meg på forhånd.`

6. `Hvem og hva påvirker forløpet?`

   Example: `Min leder forventer raskere fremdrift, ledergruppen må samle seg om tydeligere prioriteringer, og teamet trenger mer forutsigbarhet.`

## Experiment creation

Creation remains in the established drawer. A new experiment starts as `planned`; status is shown only when editing an existing experiment. The optional development-work context remains collapsed by default.
