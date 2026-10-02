// Oversikt over byggeklossene i design-system.css, laget med hjelpefunksjonene i app.js.
// Bare fiktive data og ord som allerede finnes i portalen. Ingen kobling til databasen.

async function loadApp() {
  const html = await fetch("index.html", { cache: "no-store" }).then((response) => response.text());
  const portal = new DOMParser().parseFromString(html, "text/html");
  const hidden = document.createElement("div");
  hidden.hidden = true;
  [...portal.body.children]
    .filter((node) => node.tagName !== "SCRIPT")
    .forEach((node) => hidden.appendChild(document.importNode(node, true)));
  document.body.appendChild(hidden);

  const source = await fetch("app.js", { cache: "no-store" }).then((response) => response.text());
  const app = document.createElement("script");
  app.textContent = source.replace(/\ninit\(\);\s*$/, "\n");
  document.body.appendChild(app);
}

function label(text) {
  return el("p", { class: "catalog-label", text });
}

async function render() {
  await loadApp();
  const noop = () => {};

  const rows = [
    dsRow({ title: "Kommunikasjon", meta: "Prioritert nå", selected: true, onClick: noop }),
    dsRow({ title: "Delegering", meta: "Aktiv", onClick: noop }),
    dsRow({ title: "Inkluderende ledelse", meta: "Foreslått av coach", onClick: noop })
  ];
  const saved = dsSaved();
  setDsSaved(saved, "saved", "Lagret");

  const detail = [
    dsObjectHead({
      kicker: "Indre prosjekt · Prioritert nå",
      title: "Kommunikasjon",
      lead: "Gjør budskap, retning og forventninger forståelige for bestemte mottakere, og bruker lytting til å sikre felles forståelse.",
      menu: dsMenu([
        { label: "Rediger tittel", iconName: "pencil", onClick: noop },
        { label: "Arkiver", iconName: "archive", danger: true, onClick: noop }
      ], { label: "Flere valg" })
    }),
    dsContext({
      label: "Forløpets mål",
      text: "Bli en tydeligere leder for ledergruppen i en periode med endring.",
      action: dsButton("Åpne forløpet", { variant: "text", onClick: noop })
    }),
    dsNext({
      label: "Anbefalt neste steg",
      title: "Hva vil du prøve i praksis?",
      action: dsButton("Legg til eksperiment", { variant: "primary", iconName: "plus", onClick: noop })
    }),
    el("div", {}, [
      dsQuestion({ question: "Hvorfor nå?", answer: "Budskapet mitt blir tolket ulikt i ledergruppen.", done: true }),
      dsQuestion({
        question: "Hva vil du gjøre annerledes?",
        number: 2,
        field: dsField({ placeholder: "Beskriv konkret, observerbar lederatferd.", label: "Hva vil du gjøre annerledes?" }),
        foot: [dsButton("Se eksempel", { variant: "text", onClick: noop }), saved]
      }),
      dsQuestion({
        question: "Hva gjør du i dag?",
        number: 3,
        field: dsField({ placeholder: "Beskriv den typiske responsen eller vanen du vil undersøke.", label: "Hva gjør du i dag?" })
      })
    ]),
    dsSection({ title: "Prøv i praksis · Eksperiment", actions: [dsButton("Legg til eksperiment", { iconName: "plus", onClick: noop })] }, [
      dsEmpty("Ingen åpne eksperimenter.")
    ]),
    dsDisclosure("Se mer", [el("p", { text: "Gode grep, mulige feilgrep og barrierer for kommunikasjon." })])
  ];

  document.body.append(
    dsPage({
      title: "Utviklingsfokus",
      intro: "Ta utgangspunkt i det du må lykkes med i din lederjobb, velg hva du trenger å utvikle, og planlegg hva du konkret vil prøve i praksis."
    }, [
      dsSteps([
        { id: "outer", title: "Ytre prosjekt", hint: "Hva er viktigst å lykkes med i jobben nå?", onClick: noop },
        { id: "inner", title: "Indre prosjekt", hint: "Hva må du utvikle for å lykkes bedre med det?", current: true, onClick: noop },
        { id: "practice", title: "Prøv i praksis", hint: "Hva vil du prøve i praksis?", onClick: noop }
      ], { label: "Utviklingsfokus" }),
      dsSheet(detail, { list: dsList({ title: "Lederkompetanser", rows }) }),
      label("Status"),
      el("div", { style: "display:flex;gap:24px;flex-wrap:wrap" }, [
        dsStatus("Planlagt"),
        dsStatus("Prøves ut"),
        dsStatus("Prøvd og reflektert", "done"),
        dsStatus("Anbefalt neste steg", "next")
      ]),
      label("Knapper"),
      el("div", { style: "display:flex;gap:16px;flex-wrap:wrap;align-items:center" }, [
        dsButton("Legg til eksperiment", { variant: "primary", iconName: "plus" }),
        dsButton("Arkiver"),
        dsButton("Se eksempel", { variant: "text" })
      ])
    ])
  );

  refreshIcons();
  if (document.fonts?.ready) await document.fonts.ready;
  document.body.dataset.ready = "1";
}

render().catch((error) => {
  document.body.dataset.ready = "error";
  console.error(error);
});
