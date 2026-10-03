// Skisser for steg 10 i docs/DESIGNSYSTEM_PLAN_DEL2.md: dialogene, velgeren for lederkompetanser,
// innlogging og samtykke bygget med byggeklossene i design-system.css. Portalen startes med fiktive
// data av boot.js, og deretter vises skissen. Knappene gjør ingenting. Alle byggeklossene er nå i
// portalen (steg 11–13). Se docs/DESIGNSKISSER_STEG10.md. Skissene for steg 14 ligger i
// sketches-coach.js.
//
// Bruk: sketches.html?sketch=<navn>&scene=rich[&role=coach]
//
// Filen ligger i et eget skop, fordi app.js er et vanlig skript med globale funksjoner.

(() => {
  const noop = () => {};

  function sketchData() {
    return state.programCache[state.selectedClientId];
  }

  function closeButton(label) {
    return el("button", { class: "ds-icon-button", type: "button", "aria-label": label, title: label }, [icon("x")]);
  }

  function dialog({ variant, kicker = "", title, lead = "", body = [], foot = [], closeLabel = "Lukk" }) {
    const node = el("dialog", { class: `ds-dialog ds-dialog--${variant}`, "aria-label": title }, [
      el("div", { class: "ds-dialog-panel" }, [
        el("header", { class: "ds-dialog-head" }, [
          el("div", {}, [
            kicker ? el("p", { class: "ds-object-kicker", text: kicker }) : null,
            el("h2", { class: "ds-dialog-title", text: title }),
            lead ? el("p", { class: "ds-dialog-lead", text: lead }) : null
          ]),
          closeLabel ? closeButton(closeLabel) : null
        ]),
        el("div", { class: "ds-dialog-body" }, body),
        foot.length ? el("footer", { class: "ds-dialog-foot" }, foot) : null
      ])
    ]);
    document.body.append(node);
    node.showModal();
    node.querySelector(".ds-dialog-body")?.scrollTo(0, 0);
    return node;
  }

  function smallDialog({ kicker = "", title, text, foot }) {
    const node = el("dialog", { class: "ds-dialog ds-dialog--small", "aria-label": title }, [
      el("div", { class: "ds-dialog-panel" }, [
        el("div", { class: "ds-dialog-body" }, [
          kicker ? el("p", { class: "ds-object-kicker", text: kicker }) : null,
          el("h2", { class: "ds-dialog-title", text: title }),
          el("p", { class: "ds-dialog-text", text })
        ]),
        el("footer", { class: "ds-dialog-foot" }, foot)
      ])
    ]);
    document.body.append(node);
    node.showModal();
    return node;
  }

  function formField({ label, help = "", control, className = "" }) {
    return el("label", { class: dsClass("ds-form-field", className) }, [
      el("span", { class: "ds-form-label", text: label }),
      help ? el("span", { class: "ds-form-help", text: help }) : null,
      control
    ]);
  }

  function input(value = "", placeholder = "", type = "text") {
    const node = el("input", { class: "ds-input", type, placeholder });
    node.value = value;
    return node;
  }

  function textarea(value = "", placeholder = "", rows = 3) {
    const node = el("textarea", { class: "ds-qa-field", rows, placeholder });
    node.value = value;
    return node;
  }

  function select(options, value = "") {
    return el("select", { class: "ds-select" }, options.map(([key, text]) => el("option", { value: key, text, selected: key === value })));
  }

  function check(text, checked = false) {
    return el("label", { class: "ds-check" }, [
      el("input", { type: "checkbox", checked }),
      el("span", { text })
    ]);
  }

  function disclosureBlock(title, hint, children, open = false) {
    return el("details", { class: "ds-disclosure ds-disclosure--block ds-form-disclosure", open }, [
      el("summary", {}, [
        el("span", {}, [
          el("span", { class: "ds-disclosure-title", text: title }),
          el("span", { class: "ds-disclosure-hint", text: hint })
        ])
      ]),
      el("div", { class: "ds-disclosure-body" }, children)
    ]);
  }

  // Eksperiment

  function experimentFields({ edit = false, review = false } = {}) {
    const data = sketchData();
    const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active");
    const connection = edit ? (activeCompetencies[0]?.title || "") : "";
    return [
      formField({ label: "Navn på eksperimentet", control: input(edit ? "Innled med hovedbudskapet" : "", "Et kort navn du kjenner igjen") }),
      formField({
        label: "Hva vil du prøve?",
        help: "Gjør forsøket lite nok til å prøve i en faktisk situasjon.",
        control: textarea(edit ? "Starte ledermøtet med de tre viktigste sakene." : "", "Én konkret atferd eller handling...")
      }),
      el("div", { class: "ds-form-row" }, [
        formField({ label: "Hvor skal du prøve det?", control: input("", "Et møte eller en samtale") }),
        formField({ label: "Når vil du se tilbake?", control: input("", "", "date") })
      ]),
      edit ? el("div", { class: "ds-form-row" }, [formField({ label: "Status", control: select(EXPERIMENT_STATUS_OPTIONS, "active") })]) : null,
      formField({ label: "Hva skal du se etter?", control: textarea("", "Et observerbart tegn på effekt eller respons...") }),
      disclosureBlock(connection ? "Knyttet til utviklingsarbeidet" : "Knytt til utviklingsarbeidet", connection || "Valgfritt", [
        el("div", { class: "ds-link-fields" }, [
          formField({ label: "Fokusoppdrag", control: select([["", "Ikke knyttet til fokusoppdrag"], ...data.areas.map((area) => [area.id, area.title])]) }),
          formField({
            label: "Lederkompetanse",
            control: select([["", "Ikke knyttet til lederkompetanse"], ...activeCompetencies.map((item) => [item.id, `${Number(item.priority) === 1 ? "Prioritert nå" : "Aktiv"}: ${item.title}`])], edit ? activeCompetencies[0]?.id : "")
          })
        ])
      ]),
      edit ? disclosureBlock("Se tilbake og juster", review ? "Observasjon, læring og neste justering" : "Åpne når du har prøvd", [
        formField({ label: "Hva observerte du?", control: textarea(review ? "To av lederne tok ordet tidligere enn vanlig." : "", "Hva skjedde, og hvordan responderte andre?") }),
        formField({ label: "Hvilken effekt la du merke til?", control: select([["", "Ikke vurdert"], ["low", "Lite"], ["some", "Noe"], ["clear", "Tydelig"]], review ? "some" : "") }),
        formField({ label: "Hva lærte du?", control: textarea("", "Hva forstår du bedre nå?") }),
        formField({ label: "Hva vil du justere neste gang?", control: textarea("", "Behold, endre eller prøv noe nytt...") }),
        el("div", {}, [dsButton("Avslutt eksperiment", { variant: "text", onClick: noop })])
      ], review) : null
    ].filter(Boolean);
  }

  function experimentDialog({ edit = false, review = false } = {}) {
    const node = dialog({
      variant: "side",
      kicker: edit ? "Eksperiment" : "Prøv i arbeidet",
      title: edit ? "Rediger eksperiment" : "Nytt eksperiment",
      body: [el("div", { class: "ds-form" }, experimentFields({ edit, review }))],
      foot: [
        dsButton("Avbryt", { onClick: noop }),
        dsButton(edit ? "Lagre og fortsett" : "Opprett eksperiment", { variant: "primary", onClick: noop })
      ]
    });
    if (review) node.querySelector(".ds-form-disclosure[open]")?.scrollIntoView({ block: "start" });
  }

  // Skjemavindu for coach og admin

  function inviteDialog() {
    dialog({
      variant: "center",
      kicker: "Tilgang",
      title: "Inviter klient",
      body: [el("div", { class: "ds-form" }, [
        formField({ label: "Navn", control: input() }),
        formField({ label: "E-post", control: input("", "", "email") }),
        el("div", { class: "ds-form-row" }, [
          formField({ label: "Stilling", control: input() }),
          formField({ label: "Arbeidsgiver", control: input() })
        ]),
        el("fieldset", { class: "ds-form-field ds-form-fieldset" }, [
          el("legend", { class: "ds-form-label", text: "Coach(er)" }),
          el("div", { class: "ds-check-list" }, [
            check("Ola Coach", true),
            check("Siri Coach")
          ])
        ])
      ])],
      foot: [
        dsButton("Avbryt", { onClick: noop }),
        dsButton("Lagre", { variant: "primary", onClick: noop })
      ]
    });
  }

  // Bekreft og melding

  function confirmSketch() {
    smallDialog({
      kicker: "Eksperiment",
      title: "Avslutt eksperiment?",
      text: "Eksperimentet blir liggende i historikken sammen med observasjonene og læringen din.",
      foot: [dsButton("Avbryt", { onClick: noop }), dsButton("Avslutt", { variant: "primary", onClick: noop })]
    });
  }

  function confirmRemoveSketch() {
    smallDialog({
      title: "Er du sikker?",
      text: "Fjerne \"Kontrollsirkelen.pdf\" fra ressursen?",
      foot: [dsButton("Avbryt", { onClick: noop }), dsButton("Slett", { variant: "primary", className: "ds-button--danger", onClick: noop })]
    });
  }

  function messageSketch() {
    smallDialog({
      title: "Kunne ikke lagre refleksjonen",
      text: "Prøv igjen.",
      foot: [dsButton("OK", { variant: "primary", onClick: noop })]
    });
  }

  // Velgeren for lederkompetanser

  function chooserStatus(programCompetency) {
    if (!programCompetency) return null;
    if (programCompetency.status === "suggested") return dsStatus("Foreslått av coach");
    if (programCompetency.status !== "active") return null;
    return dsStatus(Number(programCompetency.priority) === 1 ? "Prioritert nå" : "Aktiv");
  }

  function chooserRow(competency, programCompetency, selected) {
    return el("button", { class: "ds-row ds-chooser-row", type: "button", "aria-current": selected ? "true" : undefined }, [
      el("span", { class: "ds-chooser-row-head" }, [
        el("span", { class: "ds-row-title", text: competency.title }),
        chooserStatus(programCompetency)
      ]),
      el("span", { class: "ds-row-meta ds-chooser-row-text", text: competency.summary })
    ]);
  }

  function chooserDetail(competency, compact) {
    const content = competency.content || {};
    return el("div", { class: "ds-detail ds-chooser-detail" }, [
      compact ? dsButton("Til biblioteket", { variant: "text", iconName: "arrow-left", className: "ds-back", onClick: noop }) : null,
      dsObjectHead({ kicker: competency.categoryLabel, title: competency.title }),
      competency.title_en ? el("p", { class: "ds-chooser-english", text: competency.title_en }) : null,
      competency.summary ? el("p", { class: "ds-object-lead", text: competency.summary }) : null,
      el("div", { class: "ds-chooser-facts" }, [
        content.choose_when ? el("section", {}, [el("h3", { class: "ds-guidance-title", text: "Relevant når" }), el("p", { text: content.choose_when })]) : null,
        content.distinction ? el("section", {}, [el("h3", { class: "ds-guidance-title", text: "Skille mot nærliggende kompetanser" }), el("p", {}, competencyNameNodes(content.distinction, sketchData().leadershipCompetencies))]) : null
      ]),
      el("details", { class: "ds-disclosure ds-disclosure--block" }, [
        el("summary", {}, [el("span", {}, [
          el("span", { class: "ds-disclosure-title", text: "Se mer" }),
          el("span", { class: "ds-disclosure-hint", text: "Gode grep, mulige feilgrep og barrierer" })
        ])]),
        el("div", { class: "ds-disclosure-body" })
      ])
    ].filter(Boolean));
  }

  function chooserSketch({ preview = false } = {}) {
    const data = sketchData();
    const compact = window.matchMedia("(max-width: 700px)").matches;
    const competencies = data.leadershipCompetencies;
    const programCompetencyFor = (id) => (data.programCompetencies || []).find((item) => item.competency_id === id);
    const current = competencies.find((item) => item.title === "Påvirkning") || competencies[1];
    const active = (data.programCompetencies || []).filter((item) => item.status === "active");
    const groups = new Map();
    competencies.forEach((competency) => {
      if (!groups.has(competency.categoryLabel)) groups.set(competency.categoryLabel, []);
      groups.get(competency.categoryLabel).push(competency);
    });
    const list = el("div", { class: "ds-chooser-list" }, [
      el("div", { class: "ds-chooser-tools" }, [
        el("input", { class: "ds-search", type: "search", placeholder: "Søk etter lederkompetanse", "aria-label": "Søk i biblioteket for lederkompetanser" }),
        select([["all", "Alle utviklingsområder"], ...Array.from(groups.keys()).map((label) => [label, label])], "all"),
        el("p", { class: "ds-list-note", text: `${competencies.length} av ${competencies.length} lederkompetanser · ${active.length} aktive · én prioritert nå` })
      ]),
      ...Array.from(groups.entries()).map(([label, items]) => el("section", { class: "ds-chooser-group" }, [
        el("h3", { class: "ds-list-title", text: label }),
        ...items.map((competency) => chooserRow(competency, programCompetencyFor(competency.id), competency.id === current.id))
      ]))
    ]);
    const body = compact
      ? (preview ? chooserDetail(current, true) : list)
      : el("div", { class: "ds-chooser" }, [list, chooserDetail(current, false)]);
    dialog({
      variant: "wide",
      kicker: "Bibliotek for lederkompetanser",
      title: "Utforsk før du velger",
      lead: compact && preview ? "" : "Søk i hele biblioteket, sammenlign nærliggende lederkompetanser og velg det som passer situasjonen din.",
      closeLabel: "Lukk biblioteket for lederkompetanser",
      body: [body],
      foot: compact && !preview ? [] : [
        el("p", { class: "ds-dialog-note", text: "Valget kan endres senere." }),
        dsButton("Velg denne kompetansen", { variant: "primary", onClick: noop })
      ]
    });
  }

  // Innlogging

  function authScreen(children) {
    document.querySelectorAll("[data-screen]").forEach((screen) => screen.classList.add("hidden"));
    document.body.classList.add("ds-auth-body");
    $("#root").append(el("section", { class: "ds-auth" }, [
      el("img", { class: "ds-auth-logo", src: "./raeder-logo.svg", alt: "Ræder&" }),
      el("div", { class: "ds-auth-sheet" }, children)
    ]));
  }

  function loginSketch() {
    authScreen([
      el("h1", { class: "ds-auth-title", text: "Ræder& utviklingsportal" }),
      el("p", { class: "ds-auth-lead", text: "Logg inn for å fortsette arbeidet mellom samtalene." }),
      el("div", { class: "ds-form" }, [
        formField({ label: "E-post", control: input("", "din@epost.no", "email") }),
        formField({ label: "Passord", control: input("", "Passord", "password") })
      ]),
      dsButton("Logg inn", { variant: "primary", className: "ds-button--block", onClick: noop }),
      dsButton("Glemt passord?", { variant: "text", onClick: noop }),
      el("div", { class: "ds-context ds-context--note ds-auth-note" }, [el("div", {}, [
        el("p", { class: "ds-context-label", text: "Personvern" }),
        el("p", { class: "ds-context-text", text: "Innholdet behandles konfidensielt og lagres i EU. Du kan be coachen din om innsyn, retting eller sletting." })
      ])])
    ]);
  }

  function passwordSketch() {
    authScreen([
      el("p", { class: "ds-object-kicker", text: "Invitasjon" }),
      el("h1", { class: "ds-auth-title", text: "Sett passord" }),
      el("p", { class: "ds-auth-lead", text: "Velg et passord for å aktivere kontoen." }),
      el("div", { class: "ds-form" }, [
        formField({ label: "Nytt passord", control: input("", "Minst 8 tegn", "password") }),
        formField({ label: "Bekreft passord", control: input("", "Gjenta passordet", "password") })
      ]),
      dsButton("Aktiver konto", { variant: "primary", className: "ds-button--block", onClick: noop })
    ]);
  }

  function reconnectSketch() {
    authScreen([
      el("p", { class: "ds-object-kicker", text: "Forbindelse" }),
      el("h1", { class: "ds-auth-title", text: "Portalen kunne ikke åpnes" }),
      el("p", { class: "ds-auth-lead", text: "Innloggingen din er bevart. Prøv å koble til på nytt." }),
      el("div", { class: "ds-auth-actions" }, [
        dsButton("Prøv igjen", { variant: "primary", onClick: noop }),
        dsButton("Logg ut", { onClick: noop })
      ])
    ]);
  }

  // Samtykke

  function consentSketch() {
    const points = [
      ["Konfidensielt", "Innholdet brukes i coachingforløpet og behandles konfidensielt."],
      ["Tilgang for coach", "Coachen kan lese og arbeide med planen. Private refleksjoner deles bare når du velger det."],
      ["Lagret trygt", "Data lagres i EU med tilgangsstyring. Du kan be coachen om innsyn, retting eller sletting."]
    ];
    $(".topline").style.display = "none";
    $("#content").replaceChildren(dsPage({ title: "Før vi starter", read: true }, [
      dsSheet([
        dsObjectHead({
          kicker: "Samtykke",
          title: "Slik brukes innholdet i portalen",
          lead: "Før du starter, bekrefter du hvem som kan lese det du skriver, og hvordan innholdet lagres."
        }),
        el("dl", { class: "ds-facts" }, points.flatMap(([title, text]) => [el("dt", { text: title }), el("dd", { text })])),
        check("Jeg forstår rammene og samtykker til at portalen brukes som arbeidsflate i coachingforløpet."),
        el("div", { class: "ds-section-foot" }, [
          dsButton("Samtykk og åpne portalen", { variant: "primary", disabled: true, onClick: noop })
        ])
      ])
    ]));
  }

  const sketches = {
    "eksperiment-ny": () => experimentDialog(),
    "eksperiment-rediger": () => experimentDialog({ edit: true }),
    "eksperiment-se-tilbake": () => experimentDialog({ edit: true, review: true }),
    "inviter-klient": inviteDialog,
    bekreft: confirmSketch,
    "bekreft-slett": confirmRemoveSketch,
    melding: messageSketch,
    bibliotek: () => chooserSketch(),
    "bibliotek-kompetanse": () => chooserSketch({ preview: true }),
    innlogging: loginSketch,
    "nytt-passord": passwordSketch,
    "ny-tilkobling": reconnectSketch,
    samtykke: consentSketch
  };

  window.sketchKit = { noop, dialog, formField, input, textarea, select, check, disclosureBlock };

  window.visualCheckAfterBoot = async (params) => {
    const name = params.get("sketch");
    await (sketches[name] || window.coachSketches?.[name])?.(params);
    refreshIcons();
  };
})();
