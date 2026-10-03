// Skisser for steg 8 i docs/DESIGNSYSTEM_PLAN_V1.md: Samtaler, Refleksjon og Ressurser bygget med
// byggeklossene i design-system.css. Portalen startes med fiktive data av boot.js, og innholdet i
// fanen byttes deretter ut med skissen. Knappene gjør ingenting. Nye ord er merket i
// docs/DESIGNSKISSER_STEG8.md.
//
// Bruk: sketches.html?sketch=<navn>&pane=<fane>&scene=now-active[&role=coach]
//
// Filen ligger i et eget skop, fordi app.js er et vanlig skript med globale funksjoner.

(() => {
  const noop = () => {};

  const sketchSessions = [
    { focus: "Prioriteringer i ledergruppen", date: "2099-01-15", status: "Under arbeid" },
    { focus: "Første samtale: Forventninger og rammer", date: "2099-01-02", status: "Samtalen er fulgt opp", ready: true },
    { focus: "Tilbakemelding fra ledergruppen", date: "2098-12-12", status: "Samtalen er fulgt opp", ready: true }
  ];

  const sketchReflections = [
    {
      body: "Møtet ble kortere da jeg startet med hovedbudskapet. To av lederne sa etterpå at de visste hva de skulle gjøre.",
      visibility: "shared_with_coach",
      date: "2026-09-30",
      link: "Lederkompetanse: Kommunikasjon"
    },
    {
      body: "Jeg merker at jeg tar over når noen nøler. Vil se om jeg kan vente litt lenger neste gang.",
      visibility: "private",
      date: "2026-09-24",
      link: "Lederkompetanse: Delegering"
    },
    {
      body: "Fikk spørsmål om prioriteringene i gangen. Klarte å svare kort.",
      visibility: "private",
      date: "2026-09-18",
      link: "Fokusoppdrag: Tydeligere prioritering i ledergruppen"
    }
  ];

  const sketchResources = [
    { title: "Kontrollsirkelen", meta: "Rammeverk · 15 min · Åpnet" },
    { title: "ABCDE-modellen", meta: "Øvelse · 20 min · Ny" },
    { title: "Å akseptere frykt", meta: "Refleksjon · 10 min · Refleksjon lagret" }
  ];

  function sketchData() {
    return state.programCache[state.selectedClientId];
  }

  function sessionMenu() {
    return dsMenu([
      { label: "Rediger tittel", iconName: "pencil", onClick: noop },
      { label: "Arkiver samtale", iconName: "archive", danger: true, onClick: noop }
    ], { label: "Flere valg" });
  }

  function sessionStep(number, eyebrow, label, value, emptyText, foot = []) {
    return dsAutoQuestion({ number, eyebrow, label, value, emptyText, editable: true, foot });
  }

  function sessionExperimentStep(data) {
    const action = {
      id: "sx1",
      title: "Innled med hovedbudskapet",
      status: "active",
      description: JSON.stringify({ action: "Starte ledermøtet med de tre viktigste sakene." }),
      program_competency_id: data.programCompetencies[0]?.id,
      development_area_id: null
    };
    return dsQuestion({
      eyebrow: "Eksperiment",
      question: "Eksperimenter fra samtalen",
      done: true,
      field: el("div", { class: "ds-entries" }, [dsExperimentRow(action, data, true)]),
      foot: [dsButton("Legg til eksperiment", { iconName: "plus", onClick: noop })]
    });
  }

  function sessionDetail(data, { showAdd = false } = {}) {
    const session = sketchSessions[0];
    return el("article", { class: "ds-detail" }, [
      dsObjectHead({
        kicker: `Samtale ${showAdd ? 1 : sketchSessions.length} · ${formatDate(session.date)}`,
        title: session.focus,
        actions: showAdd ? [dsButton("Opprett samtale", { variant: "text", iconName: "plus", onClick: noop })] : [],
        menu: sessionMenu()
      }),
      dsNext({
        label: "Anbefalt neste steg",
        title: "Noter det du vil huske",
        text: "Hva bør du vende tilbake til i neste samtale?",
        action: dsButton("Skriv det du vil huske", { variant: "primary", onClick: noop })
      }),
      dsPlanSection({
        title: "Samtaleplan",
        description: "Avklar hva samtalen skal hjelpe med. Etterpå samler du det som ble tydelig og det du vil prøve.",
        status: { label: session.status, ready: false },
        steps: [
          sessionStep(1, "Før samtalen", "Hva skal samtalen hjelpe med?", "Bli enig om hvilke tre saker ledergruppen skal prioritere dette halvåret.", "Hva håper dere å forstå, avklare eller komme videre på?"),
          sessionStep(2, "Etter samtalen", "Hva ble tydelig?", "Jeg bruker mye tid på å forklare bakgrunnen før jeg sier hva jeg vil. Ledergruppen trenger konklusjonen først.", "Noter det viktigste mens det er ferskt."),
          sessionStep(3, "Til neste gang", "Hva vil du prøve eller følge opp?", "Starte neste ledermøte med de tre viktigste sakene.", "Beskriv én konkret handling.", [
            dsButton("Gjør til eksperiment", { variant: "text", iconName: "flask-conical", onClick: noop })
          ]),
          sessionStep(4, "Ta med videre", "Hva vil du huske til neste samtale?", "", "Noter det du vil vende tilbake til."),
          sessionExperimentStep(data)
        ]
      })
    ]);
  }

  function sessionsSketch(data, { single = false, empty = false } = {}) {
    if (empty) {
      return dsPage({ title: "Forbered og følg opp", intro: "Samle det viktigste før, under og etter samtalene." }, [
        dsSheet([el("div", { class: "ds-detail" }, [
          dsObjectHead({
            kicker: "Samtaler",
            title: "Planlegg første coachingsamtale",
            lead: "Start med hva samtalen skal hjelpe med. Etterpå kan du samle det som ble tydelig og hva du vil prøve videre."
          }),
          el("div", { class: "ds-section-foot" }, [dsButton("Opprett samtale", { variant: "primary", iconName: "plus", onClick: noop })])
        ])])
      ]);
    }
    const list = single ? null : dsList({
      title: `Samtaler · ${sketchSessions.length}`,
      label: "Samtaler",
      rows: sketchSessions.map((session, index) => dsRow({
        title: session.focus,
        meta: `${formatDate(session.date)} · ${session.status}`,
        selected: index === 0,
        onClick: noop
      })),
      foot: dsButton("Opprett samtale", { variant: "text", iconName: "plus", onClick: noop })
    });
    return dsPage({ title: "Forbered og følg opp" }, [
      dsSheet([sessionDetail(data, { showAdd: single })], { list })
    ]);
  }

  function visibilityChoice(value = "private", help = "Bare du kan lese før du velger å dele.") {
    return el("div", { class: "ds-choice" }, [
      el("p", { class: "ds-choice-label", text: "Hvem kan lese?" }),
      el("div", { class: "ds-segmented", role: "radiogroup", "aria-label": "Hvem kan lese?" }, [
        ["private", "Privat"],
        ["shared_with_coach", "Del med coach"]
      ].map(([key, label]) => el("button", {
        class: "ds-segmented-option",
        type: "button",
        role: "radio",
        "aria-checked": key === value ? "true" : "false",
        "aria-selected": key === value ? "true" : "false",
        text: label,
        onclick: noop
      }))),
      help ? el("p", { class: "ds-choice-help", text: help }) : null
    ]);
  }

  function linkFields(data, { areaId = "", competencyId = "" } = {}) {
    const active = (data.programCompetencies || []).filter((item) => item.status === "active");
    return el("div", { class: "ds-link-fields" }, [
      el("label", { text: "Fokusoppdrag" }, [
        el("select", { class: "ds-select" }, [
          el("option", { value: "", text: "Ikke knyttet" }),
          ...data.areas.map((area) => el("option", { value: area.id, text: area.title, selected: area.id === areaId }))
        ])
      ]),
      el("label", { text: "Lederkompetanse" }, [
        el("select", { class: "ds-select" }, [
          el("option", { value: "", text: "Ikke knyttet" }),
          ...active.map((item) => el("option", { value: item.id, text: `${Number(item.priority) === 1 ? "Prioritert nå" : "Aktiv"}: ${item.title}`, selected: item.id === competencyId }))
        ])
      ])
    ]);
  }

  function reflectionComposer(data) {
    return dsSection({ title: "Hva vil du ta vare på?", headingLevel: 2 }, [
      el("p", { class: "ds-qa-help", text: "Hva skjedde? Hva overrasket deg? Hva vil du prøve videre?" }),
      dsField({ placeholder: "Skriv det du vil huske …", label: "Ny refleksjon", rows: 4 }),
      visibilityChoice(),
      dsDisclosure("Knytt refleksjonen til arbeidet · Valgfritt", [linkFields(data)]),
      el("div", { class: "ds-section-foot" }, [dsButton("Lagre refleksjon", { variant: "primary", disabled: true, onClick: noop })])
    ]);
  }

  function reflectionNote(reflection, { editable = true, editing = false, data = null } = {}) {
    const status = dsStatus(reflection.visibility === "private" ? "Privat" : "Delt med coach");
    const meta = el("p", { class: "ds-note-meta" }, [
      status,
      el("span", { class: "ds-note-date", text: [formatDate(reflection.date), reflection.link].filter(Boolean).join(" · ") })
    ]);
    if (editing) {
      return el("article", { class: "ds-note" }, [
        el("div", {}, [
          meta,
          dsField({ value: reflection.body, label: "Rediger refleksjon", rows: 3 }),
          visibilityChoice(reflection.visibility, "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet."),
          dsDisclosure("Knytt refleksjonen til arbeidet · Valgfritt", [linkFields(data, { competencyId: data.programCompetencies[1]?.id })], { open: true }),
          el("div", { class: "ds-section-foot" }, [
            dsButton("Avbryt", { onClick: noop }),
            dsButton("Lagre", { variant: "primary", onClick: noop })
          ])
        ])
      ]);
    }
    return el("article", { class: "ds-note" }, [
      el("div", {}, [meta, el("p", { class: "ds-note-text", text: reflection.body })]),
      editable ? dsMenu([{ label: "Rediger refleksjon", iconName: "pencil", onClick: noop }], { label: "Flere valg" }) : null
    ].filter(Boolean));
  }

  function reflectionsSketch(data, { coach = false, editIndex = -1, empty = false } = {}) {
    if (coach) {
      const shared = sketchReflections.filter((item) => item.visibility === "shared_with_coach");
      return dsPage({ title: "Det klienten har valgt å dele", intro: "Her vises bare refleksjoner klienten aktivt har delt i coachingforløpet." }, [
        dsSheet([dsSection({ title: `Delte refleksjoner · ${shared.length}`, headingLevel: 2 }, [
          el("div", { class: "ds-notes" }, shared.map((item) => reflectionNote(item, { editable: false })))
        ])])
      ]);
    }
    const history = empty
      ? dsSection({ title: "Dine refleksjoner", headingLevel: 2 }, [
        dsEmpty("Skriv når noe blir tydelig eller du vil huske det senere.")
      ])
      : dsSection({ title: `Dine refleksjoner · ${sketchReflections.length}`, headingLevel: 2 }, [
        el("div", { class: "ds-notes" }, sketchReflections.map((item, index) => reflectionNote(item, { editing: index === editIndex, data })))
      ]);
    return dsPage({ title: "Refleksjoner underveis", intro: empty ? "Ta vare på observasjoner og læring. Du bestemmer hva du deler." : "" }, [
      dsSheet([reflectionComposer(data), history])
    ]);
  }

  function resourceDetail({ coach = false } = {}) {
    return el("article", { class: "ds-detail" }, [
      dsObjectHead({
        kicker: "Ressurs fra coach · Rammeverk · 15 min",
        title: "Kontrollsirkelen",
        lead: "Mange bruker store mengder mental energi på forhold de verken kan kontrollere eller påvirke. Denne modellen hjelper deg å tydeliggjøre hvor innsatsen din faktisk kan gjøre en forskjell.",
        actions: [dsButton("Last ned PDF", { iconName: "download", onClick: noop })]
      }),
      el("div", { class: "ds-context ds-context--note" }, [
        el("div", {}, [
          el("p", { class: "ds-context-label", text: "Fra coach" }),
          el("p", { class: "ds-context-text", text: "Jeg vil at du bruker denne ressursen på noe som tar mye energi akkurat nå. Målet er ikke å \"slutte å bry seg\", men å bli tydeligere på hvor du faktisk har påvirkningskraft." })
        ])
      ]),
      dsSection({ title: "Innhold" }, [
        el("div", { class: "ds-content" }, [
          el("p", { text: "Kontrollsirkelen hjelper deg å skille mellom det du kan kontrollere, påvirke og ikke kontrollere." }),
          el("h4", { class: "ds-content-heading", text: "Steg 1: Identifiser energityver" }),
          el("p", { text: "Skriv ned tre ting som tar mye mental energi akkurat nå." }),
          el("ul", { class: "ds-content-list" }, ["Situasjon 1", "Situasjon 2", "Situasjon 3"].map((text) => el("li", { text }))),
          el("h4", { class: "ds-content-heading", text: "Refleksjonsspørsmål" }),
          el("ul", { class: "ds-content-list" }, [
            "Hvor bruker du mest energi i dag?",
            "Hva overrasker deg når du sorterer dette?",
            "Hva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?"
          ].map((text) => el("li", { text }))),
          el("h4", { class: "ds-content-heading", text: "Neste steg" }),
          el("p", { text: "Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel." })
        ])
      ]),
      coach
        ? dsSection({ title: "Klientens refleksjon" }, [
          dsEmpty("Klienten har lagret en privat refleksjon som ikke er delt med coach.")
        ])
        : dsSection({ title: "Din refleksjon" }, [
          dsField({ placeholder: "Hva vil du ta med deg?", label: "Din refleksjon", rows: 4 }),
          visibilityChoice("private", "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet."),
          el("div", { class: "ds-section-foot" }, [dsButton("Lagre refleksjon", { variant: "primary", disabled: true, onClick: noop })])
        ])
    ]);
  }

  function resourcesSketch({ coach = false, empty = false } = {}) {
    if (empty) {
      return dsPage({ title: "Dine ressurser", intro: "Her finner du ressursene coachen har valgt ut for deg." }, [
        dsSheet([el("div", { class: "ds-detail" }, [
          dsObjectHead({ kicker: "Ressurser", title: "Ingen ressurser ennå", lead: "Når coachen sender en ressurs, vises den her." })
        ])])
      ]);
    }
    const list = dsList({
      title: `${coach ? "Delt med klient" : "Delt med deg"} · ${sketchResources.length}`,
      label: "Ressurser",
      rows: sketchResources.map((item, index) => dsRow({
        title: item.title,
        meta: coach ? item.meta.replace("Ny", "Ikke åpnet") : item.meta,
        selected: index === 0,
        onClick: noop
      }))
    });
    return dsPage({ title: coach ? "Det som er delt i forløpet" : "Dine ressurser" }, [
      dsSheet([resourceDetail({ coach })], { list })
    ]);
  }

  const sketches = {
    samtaler: (data) => sessionsSketch(data),
    "samtaler-en": (data) => sessionsSketch(data, { single: true }),
    "samtaler-tom": (data) => sessionsSketch(data, { empty: true }),
    refleksjon: (data) => reflectionsSketch(data),
    "refleksjon-rediger": (data) => reflectionsSketch(data, { editIndex: 1 }),
    "refleksjon-tom": (data) => reflectionsSketch(data, { empty: true }),
    "refleksjon-coach": (data) => reflectionsSketch(data, { coach: true }),
    ressurser: () => resourcesSketch(),
    "ressurser-tom": () => resourcesSketch({ empty: true }),
    "ressurser-coach": () => resourcesSketch({ coach: true })
  };

  window.visualCheckAfterBoot = async (params) => {
    const build = sketches[params.get("sketch")];
    const pane = document.querySelector(`.workspace-pane[data-pane='${params.get("pane")}']`);
    if (!build || !pane) throw new Error("Ukjent skisse eller fane.");
    pane.replaceChildren(build(sketchData()));
  };
})();
