// Skisser for steg 14 i docs/DESIGNSYSTEM_PLAN_DEL2.md: klientlisten, admin, ressursbiblioteket,
// ressursredigering og «Del ressurs» bygget med byggeklossene i design-system.css.
// Boot.js starter siden med fiktive data (page=clients|admin|resources), og deretter vises skissen.
// Knappene gjør ingenting. Se docs/DESIGNSKISSER_STEG14.md.
//
// Bruk: sketches.html?page=clients&role=coach&sketch=klienter

(() => {
  const kit = () => window.sketchKit;
  const noop = () => {};
  const compact = () => window.matchMedia("(max-width: 700px)").matches;

  function page({ title, intro = "", actions = [] }, children) {
    $("#content").replaceChildren(el("section", { class: "ds-page ds-coach-page" }, [
      el("header", { class: "ds-page-head ds-page-head--actions" }, [
        el("div", {}, [
          el("h1", { class: "ds-page-title", text: title }),
          intro ? el("p", { class: "ds-page-intro", text: intro }) : null
        ]),
        actions.length ? el("div", { class: "ds-object-actions" }, actions) : null
      ]),
      ...children
    ]));
  }

  function figures(items) {
    return el("div", { class: "ds-figures", role: "list", "aria-label": "Nøkkeltall" }, items.map(([value, label, hint]) => el("p", { class: "ds-figure", role: "listitem" }, [
      el("span", { class: "ds-figure-value", text: value }),
      el("span", { class: "ds-figure-label", text: label }),
      hint ? el("span", { class: "ds-figure-hint", text: hint }) : null
    ])));
  }

  function tools(children) {
    return el("div", { class: "ds-tools" }, children);
  }

  function search(placeholder) {
    return el("input", { class: "ds-search", type: "search", placeholder, "aria-label": placeholder });
  }

  function table({ columns, head, rows }) {
    return el("div", { class: "ds-table", role: "table", style: `--ds-table-columns: ${columns}` }, [
      el("div", { class: "ds-table-head", role: "row" }, head.map((text) => el("span", { role: "columnheader", text }))),
      ...rows
    ]);
  }

  function tableRow(cells, { link = false, muted = false } = {}) {
    return el("div", { class: dsClass("ds-table-row", link && "is-link", muted && "is-muted"), role: "row" }, cells);
  }

  function cell(children, { label = "", extra = false } = {}) {
    return el("div", { class: dsClass("ds-table-cell", extra && "is-extra"), role: "cell" }, [
      label ? el("span", { class: "ds-table-label", text: label }) : null,
      ...children
    ]);
  }

  function personCell(title, meta) {
    return cell([el("span", { class: "ds-row-title", text: title }), meta ? el("span", { class: "ds-row-meta", text: meta }) : null]);
  }

  function textCell(label, value, extra = false) {
    return cell([el("span", { text: value })], { label, extra });
  }

  function rowMenu(items, label) {
    return dsMenu(items.map((text) => ({ label: text, onClick: noop })), { label });
  }

  // Klienter

  function clientStatus(client) {
    const ready = isClientActivated(client) && hasClientConsent(client);
    const text = isClientActivated(client) ? (hasClientConsent(client) ? "Klar" : "Mangler samtykke") : "Venter på aktivering";
    return dsStatus(text, ready ? "done" : "neutral");
  }

  function employerLine(client) {
    return [client.employer, client.role].filter(Boolean).join(" · ") || "Arbeidsgiver ikke satt";
  }

  function clientsSketch() {
    const clients = sortClients(getVisibleClients(), "name");
    const activity = clientActivityItems(clients);
    const upcoming = clients.filter((client) => state.programSummaries[client.id]?.nextSessionDate).length;
    const summary = (client) => state.programSummaries[client.id];
    const nextSession = (client) => summary(client)?.nextSessionDate ? formatDate(summary(client).nextSessionDate) : "Ikke planlagt";
    page({
      title: "Klienter",
      intro: "Se status, siste aktivitet og åpne klientplaner når du trenger kontekst.",
      actions: [dsButton("Inviter klient", { variant: "primary", onClick: noop })]
    }, [dsSheet([
      figures([
        [String(activity.length), "Nylig aktivitet", "siste 14 dager"],
        [String(clients.length), "Klienter", "aktive i oversikten"],
        [String(upcoming), "Kommende samtaler", "dato satt i planen"]
      ]),
      activity.length ? dsSection({ title: "Nylige oppdateringer", intro: "Klienter der noe er lagt til eller endret de siste 14 dagene." }, [
        table({
          columns: "minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr)",
          head: ["Klient", "Sist aktivitet", "Neste samtale"],
          rows: activity.slice(0, 4).map(({ client, activity: signal }) => tableRow([
            personCell(client.name, employerLine(client)),
            cell([el("span", { class: "ds-row-title", text: signal.label }), el("span", { class: "ds-row-meta", text: signal.detail })], { label: "Sist aktivitet" }),
            textCell("Neste samtale", nextSession(client), true)
          ], { link: true }))
        })
      ]) : null,
      dsSection({ title: "Klientoversikt", intro: "Åpne en klient for å se mål og rammer for forløpet, utviklingsfokus, samtaler, refleksjoner og ressurser." }, [
        tools([
          search("Søk etter navn, e-post, coach eller arbeidsgiver"),
          kit().select([["all", "Alle coacher"], ["coach1", "Ola Coach"]], "all"),
          kit().select([["name", "Navn A-Å"], ["recent-activity", "Sist aktivitet"], ["next-session", "Neste samtale"], ["created-desc", "Opprettet nyest"], ["created-asc", "Opprettet eldst"]], "name")
        ]),
        table({
          columns: "minmax(0, 2fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.2fr)",
          head: ["Klient", "Sist aktivitet", "Neste samtale", "Status"],
          rows: clients.map((client) => {
            const program = summary(client);
            const sessions = program?.sessionCount === 1 ? "1 samtale" : `${program?.sessionCount || 0} samtaler`;
            return tableRow([
              personCell(client.name, employerLine(client)),
              textCell("Sist aktivitet", program?.lastActivityAt ? formatRelativeDate(program.lastActivityAt) : "Ingen aktivitet", true),
              textCell("Neste samtale", nextSession(client), true),
              cell([clientStatus(client), el("span", { class: "ds-row-meta", text: sessions })])
            ], { link: true });
          })
        })
      ])
    ])]);
  }

  function clientsEmptySketch() {
    page({
      title: "Klienter",
      intro: "Se status, siste aktivitet og åpne klientplaner når du trenger kontekst.",
      actions: [dsButton("Inviter klient", { variant: "primary", onClick: noop })]
    }, [dsSheet([
      dsObjectHead({
        kicker: "Kom i gang",
        title: "Klienten eier utviklingsløpet",
        lead: "Portalen skal hjelpe klienten å samle og følge egen utvikling. Som coach støtter du med samtaler, spørsmål og relevante ressurser uten å overta arbeidet."
      }),
      dsSection({ title: "Klientoversikt", intro: "Åpne en klient for å se mål og rammer for forløpet, utviklingsfokus, samtaler, refleksjoner og ressurser." }, [
        table({
          columns: "minmax(0, 2fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.2fr)",
          head: ["Klient", "Sist aktivitet", "Neste samtale", "Status"],
          rows: getVisibleClients().map((client) => tableRow([
            personCell(client.name, employerLine(client)),
            textCell("Sist aktivitet", "Ingen aktivitet", true),
            textCell("Neste samtale", "Ikke planlagt", true),
            cell([clientStatus(client), el("span", { class: "ds-row-meta", text: "0 samtaler" })])
          ], { link: true }))
        })
      ])
    ])]);
  }

  // Admin

  function readiness(resource) {
    const missing = resourceReadinessItems(resource).filter((item) => item.group === "minimum" && !item.done).length;
    return missing
      ? dsStatus(`${missing} obligatoriske felt mangler`, "next")
      : dsStatus("Klar til publisering", "done");
  }

  async function adminSketch() {
    const resources = await window.RaederResourceLibrary.getAdminResources(state.sb);
    page({
      title: "Administrasjon",
      intro: "Administrer mennesker, tilganger og innhold uten å åpne fortrolig klientarbeid."
    }, [dsSheet([
      figures([
        [String(state.coaches.length), "Coacher", "med plattformtilgang"],
        [String(state.clients.length), "Klienter", "registrert"]
      ]),
      dsSection({ title: "Coacher", actions: [dsButton("Inviter coach", { onClick: noop })] }, [
        tools([search("Søk coach")]),
        table({
          columns: "minmax(0, 1.4fr) minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, .6fr) 112px",
          head: ["Navn", "E-post", "Status", "Klienter", ""],
          rows: state.coaches.map((coach) => tableRow([
            personCell(coach.name, ""),
            textCell("E-post", coach.email || "Ikke registrert"),
            cell([dsStatus(coach.user_id ? "Innlogget" : "Ikke innlogget", coach.user_id ? "done" : "neutral")]),
            textCell("Klienter", String(state.clients.filter((client) => (client.coach_ids || []).includes(coach.id)).length), true),
            el("div", { class: "ds-table-actions" }, [rowMenu(["Rediger", "Arkiver"], `Valg for ${coach.name}`)])
          ]))
        })
      ]),
      dsSection({
        title: "Klienter",
        intro: "Admin viser tilgang og status. Forløpsinnhold, notater og refleksjoner kan bare åpnes når du selv er coach for klienten.",
        actions: [dsButton("Inviter klient", { onClick: noop })]
      }, [
        tools([
          search("Søk klient, coach eller arbeidsgiver"),
          kit().select([["all", "Alle coacher"], ...state.coaches.map((coach) => [coach.id, coach.name])], "all"),
          kit().select([["name", "Navn A-Å"], ["next-session", "Neste samtale"], ["created-desc", "Opprettet nyest"], ["created-asc", "Opprettet eldst"]], "name")
        ]),
        table({
          columns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr) 112px",
          head: ["Navn", "Coach", "Status", "Tilgang", ""],
          rows: sortClients(state.clients, "name").map((client) => tableRow([
            personCell(client.name, ""),
            textCell("Coach", coachNames(client) || "-"),
            textCell("Status", clientStatusLabel(client), true),
            textCell("Tilgang", canOpenClient(client) ? "Kan åpnes" : "Kun oversikt", true),
            el("div", { class: "ds-table-actions" }, [
              canOpenClient(client) ? dsButton("Åpne", { variant: "text", onClick: noop }) : null,
              rowMenu(["Rediger", "Arkiver"], `Valg for ${client.name}`)
            ])
          ], { muted: !canOpenClient(client) }))
        })
      ]),
      dsSection({
        title: "Ressurser",
        intro: "Opprett, kvalitetssikre og publiser innhold som coacher kan dele med klienter.",
        actions: [dsButton("Ny ressurs", { onClick: noop })]
      }, [
        tools([
          search("Søk ressurs, område eller type"),
          kit().select([["all", "Alle statuser"], ...RESOURCE_STATUS_OPTIONS], "all")
        ]),
        table({
          columns: "minmax(0, 2.4fr) minmax(0, 1.2fr) 160px",
          head: ["Ressurs", "Før publisering", ""],
          rows: resources.map((resource) => tableRow([
            cell([
              el("span", { class: "ds-row-title", text: resource.title }),
              el("span", { class: "ds-row-meta", text: [resourceLabel(RESOURCE_STATUS_OPTIONS, resource.status), resourceLabel(RESOURCE_TYPE_OPTIONS, resource.type), resource.development_area_label].join(" · ") }),
              compact() ? null : el("span", { class: "ds-table-text", text: resource.introduction || "Kort introduksjon mangler." })
            ]),
            cell([readiness(resource)]),
            el("div", { class: "ds-table-actions" }, [
              resource.status === "draft" ? dsButton("Publiser", { onClick: noop }) : null,
              dsButton(resource.status === "archived" ? "Reaktiver" : "Arkiver", { variant: "text", onClick: noop })
            ])
          ], { link: true, muted: resource.status === "archived" }))
        })
      ])
    ])]);
  }

  // Ressursbiblioteket

  function resourceKicker(resource) {
    return [resourceLabel(RESOURCE_TYPE_OPTIONS, resource.type), resource.estimated_duration ? `${resource.estimated_duration} min` : ""].filter(Boolean).join(" · ");
  }

  function guidanceList(title, items) {
    if (!items?.length) return null;
    return el("section", { class: "ds-guidance-group" }, [
      el("h3", { class: "ds-guidance-title", text: title }),
      el("ul", { class: "ds-guidance-list" }, items.map((item) => el("li", { text: item })))
    ]);
  }

  function guidanceText(title, text) {
    return el("section", { class: "ds-guidance-group" }, [
      el("h3", { class: "ds-guidance-title", text: title }),
      el("p", { text: text || "Ikke definert ennå." })
    ]);
  }

  function resourceContent(resource) {
    const library = window.RaederResourceLibrary;
    const printable = (resource.files || []).find((file) => file.file_type === "printable");
    return el("div", { class: "ds-content ds-resource-content" }, [
      printable ? dsButton("Last ned PDF", { iconName: "download", onClick: noop }) : null,
      ...library.renderResourceContentBlocks(resource.content_json || [], { createElement: el, createIcon: icon, resourceFiles: resource.files || [] }),
      resource.next_step_prompt ? el("h4", { class: "ds-content-heading", text: "Neste steg" }) : null,
      resource.next_step_prompt ? el("p", { text: resource.next_step_prompt }) : null
    ]);
  }

  function resourceDetail(resource, { admin = false, back = false, guidanceOpen = false } = {}) {
    return el("article", { class: "ds-detail" }, [
      back ? dsButton("Til biblioteket", { variant: "text", iconName: "arrow-left", className: "ds-back", onClick: noop }) : null,
      dsObjectHead({
        kicker: resourceKicker(resource),
        title: resource.title,
        lead: resource.introduction,
        actions: [
          admin ? dsButton("Rediger ressurs", { onClick: noop }) : null,
          dsButton("Send ressurs", { variant: "primary", onClick: noop })
        ].filter(Boolean)
      }),
      el("p", { class: "ds-library-help", text: "Velg Send ressurs når du har vurdert at den passer klienten." }),
      el("details", { class: "ds-disclosure ds-disclosure--block", open: guidanceOpen }, [
        el("summary", {}, [el("span", {}, [
          el("span", { class: "ds-disclosure-title", text: "Før du deler" }),
          el("span", { class: "ds-disclosure-hint", text: "Vurdering og veiledning for coach" })
        ])]),
        el("div", { class: "ds-disclosure-body ds-guidance-grid" }, [
          guidanceText("Hva ressursen skal hjelpe med", resource.intended_outcome),
          guidanceList("Best brukt når", resource.best_used_when),
          guidanceText("Veiledning til coach", resource.coach_guidance),
          guidanceList("Ikke egnet når", resource.not_for)
        ].filter(Boolean))
      ]),
      dsSection({ title: "Dette ser klienten" }, [resourceContent(resource)])
    ]);
  }

  async function librarySketch(params) {
    const library = window.RaederResourceLibrary;
    const resources = await library.getPublishedResources(state.sb);
    const selected = resources[0];
    const admin = state.profile.role === "admin";
    const mobileDetail = compact() && params.get("mobilepreview");
    const groups = library.groupResourcesByDevelopmentArea(resources);
    const list = el("nav", { class: "ds-list ds-chooser-list", "aria-label": "Ressurser" }, [
      el("div", { class: "ds-chooser-tools" }, [
        el("input", { class: "ds-search", type: "search", placeholder: "Søk etter tema eller ressurs", "aria-label": "Søk etter tema eller ressurs" }),
        kit().select([["all", "Alle utviklingsområder"], ...library.RESOURCE_DEVELOPMENT_AREA_OPTIONS, ["uncategorized", "Ikke kategorisert"]], "all"),
        kit().select([["all", "Alle typer"], ["framework", "Rammeverk"], ["guided_session", "Veiledet økt"], ["exercise", "Øvelse"], ["worksheet", "Arbeidsark"]], "all"),
        el("p", { class: "ds-list-note", text: `${resources.length} ressurser tilgjengelig for vurdering og deling.` })
      ]),
      ...groups.map((group) => el("section", { class: "ds-chooser-group" }, [
        el("p", { class: "ds-list-title", text: group.label }),
        ...group.resources.map((resource) => dsRow({ title: resource.title, meta: resourceKicker(resource), selected: !compact() && resource.slug === selected.slug, onClick: noop }))
      ]))
    ]);
    const body = compact()
      ? (mobileDetail ? el("div", { class: "ds-sheet-body" }, [resourceDetail(selected, { admin, back: true })]) : list)
      : el("div", { class: "ds-sheet-body" }, [resourceDetail(selected, { admin, guidanceOpen: params.get("guidance") === "1" })]);
    page({
      title: "Ressurser",
      intro: "Finn, vurder og del faglige ressurser som støtter arbeidet mellom samtalene."
    }, [el("div", { class: dsClass("ds-sheet ds-library", !compact() && "ds-sheet--split") }, compact() ? [body] : [list, body])]);
  }

  // Ressursredigering

  function blockEditor(block, index, total) {
    const { formField, input, textarea } = kit();
    const label = RESOURCE_BLOCK_TYPE_LABELS[block.type] || block.type;
    const toolButton = (iconName, text, disabled = false) => el("button", { class: "ds-icon-button", type: "button", "aria-label": text, title: text, disabled }, [icon(iconName)]);
    const fields = [];
    if (block.type === "intro") fields.push(textarea(block.content || "", "Kort intro til ressursen", 3));
    if (block.type === "text") fields.push(input(block.heading || "", "Overskrift"), textarea(block.content || "", "Tekst", 3));
    if (block.type === "worksheet") fields.push(input(block.heading || "", "Overskrift, f.eks. Arbeidsark"), textarea((block.fields || []).join("\n"), "Ett felt per linje", 3));
    if (block.type === "reflection_questions") fields.push(input(block.heading || "Refleksjonsspørsmål", "Overskrift"), textarea((block.questions || []).join("\n"), "Ett spørsmål per linje", 3));
    return el("section", { class: "ds-block" }, [
      el("div", { class: "ds-block-head" }, [
        el("h4", { class: "ds-block-title", text: label }),
        el("div", { class: "ds-block-tools" }, [
          toolButton("arrow-up", "Flytt opp", index === 0),
          toolButton("arrow-down", "Flytt ned", index === total - 1),
          toolButton("trash-2", "Slett blokk")
        ])
      ]),
      ...fields,
      el("div", {}, [dsButton("Legg til under", { variant: "text", iconName: "plus", onClick: noop })])
    ]);
  }

  async function editorSketch(params) {
    const { dialog, formField, input, textarea, select, check } = kit();
    await librarySketch(params);
    const resources = await window.RaederResourceLibrary.getAdminResources(state.sb);
    const resource = resources[0];
    const missing = resourceReadinessItems(resource).filter((item) => item.group !== "minimum" && !item.done).slice(0, 6);
    const blocks = resource.content_json || [];
    const form = el("div", { class: "ds-editor-form ds-form" }, [
      el("section", { class: "ds-ready" }, [
        el("div", { class: "ds-context ds-context--note" }, [el("div", {}, [
          el("p", { class: "ds-context-label", text: "Før publisering" }),
          el("p", { class: "ds-context-text", text: "Kan publiseres. Dette kan styrke kvaliteten før deling." }),
          el("ul", { class: "ds-ready-list" }, missing.map((item) => el("li", {}, [dsStatus(`Anbefalt: ${item.label}`, "next")])))
        ])])
      ]),
      el("section", { class: "ds-form-section" }, [
        el("h3", { class: "ds-form-section-title", text: "Start her" }),
        el("p", { class: "ds-form-help", text: "Gi ressursen en tydelig tittel, inngang og anbefalt neste steg." })
      ]),
      formField({ label: "Tittel", control: input(resource.title) }),
      formField({ label: "Kort introduksjon", control: textarea(resource.introduction, "Hva er ressursen, og hvorfor er den relevant? Vises i biblioteket og øverst i ressursen.", 3) }),
      formField({ label: "Anbefalt neste steg", control: textarea(resource.next_step_prompt || "", "Hva kan klienten gjøre etter å ha brukt ressursen?", 2) }),
      el("section", { class: "ds-form-section" }, [
        el("h3", { class: "ds-form-section-title", text: "Faglig plassering" }),
        el("p", { class: "ds-form-help", text: "Gjør ressursen enkel å finne og vurdere i biblioteket." })
      ]),
      el("div", { class: "ds-form-row" }, [
        formField({ label: "Utviklingsområde", control: select([["", "Velg utviklingsområde"], ...window.RaederResourceLibrary.RESOURCE_DEVELOPMENT_AREA_OPTIONS], resource.development_area) }),
        formField({ label: "Ressurstype", control: select(RESOURCE_TYPE_OPTIONS, resource.type) })
      ]),
      el("div", { class: "ds-form-row" }, [
        formField({ label: "Tidsbruk i minutter", control: input(String(resource.estimated_duration || ""), "", "number") }),
        formField({ label: "Brukes typisk i", control: select(RESOURCE_PHASE_OPTIONS, resource.phase) })
      ]),
      el("section", { class: "ds-form-section", id: "sketch-blocks" }, [
        el("h3", { class: "ds-form-section-title", text: "Innhold" }),
        el("p", { class: "ds-form-help", text: "Bygg opp leseflyten med korte, tydelige innholdsblokker." }),
        el("details", { class: "ds-disclosure" }, [el("summary", { text: "Hva blokkene brukes til" }), el("div", { class: "ds-disclosure-body" })])
      ]),
      el("div", {}, blocks.map((block, index) => blockEditor(block, index, blocks.length))),
      el("div", { class: "ds-block-add" }, [
        select(RESOURCE_BLOCK_ADD_TYPES.map((type) => [type, RESOURCE_BLOCK_TYPE_LABELS[type]]), "text"),
        dsButton("Legg til nederst", { iconName: "plus", onClick: noop })
      ]),
      el("section", { class: "ds-form-section" }, [
        el("h3", { class: "ds-form-section-title", text: "Filer og bilder" }),
        el("p", { class: "ds-form-help", text: "Filer lagres privat og blir bare tilgjengelige for brukere med riktig tilgang. Ressursen fungerer også uten filer." }),
        el("p", { class: "ds-empty-text", text: "Ingen filer lagt til ennå." })
      ]),
      el("div", { class: "ds-form-row" }, [
        formField({ label: "Fil", control: el("input", { class: "ds-input", type: "file" }) }),
        formField({ label: "Filtype", control: select(RESOURCE_FILE_TYPE_OPTIONS, "attachment") })
      ]),
      el("div", { class: "ds-form-row" }, [
        formField({ label: "Visningsnavn", control: input("", "Visningsnavn, valgfritt") }),
        el("div", { class: "ds-form-field", style: "align-self: end" }, [dsButton("Last opp", { iconName: "upload", onClick: noop })])
      ]),
      kit().disclosureBlock("For coach og deling", "Hjelper coachen å vurdere når ressursen passer og hva som bør sendes med.", [
        formField({ label: "Hva ressursen skal hjelpe med", control: textarea(resource.intended_outcome || "", "", 3) }),
        formField({ label: "Best brukt når", help: "Ett punkt per linje", control: textarea((resource.best_used_when || []).join("\n"), "", 3) }),
        formField({ label: "Ikke egnet når", help: "Ett punkt per linje", control: textarea((resource.not_for || []).join("\n"), "", 3) }),
        formField({ label: "Veiledning til coach", control: textarea(resource.coach_guidance || "", "", 4) }),
        formField({ label: "Forslag til sendemelding", control: textarea("", "Coachen kan redigere teksten før sending.", 3) }),
        el("fieldset", { class: "ds-form-field ds-form-fieldset" }, [
          el("legend", { class: "ds-form-label", text: "Kan knyttes til" }),
          el("div", { class: "ds-check-list" }, RESOURCE_CONTEXT_OPTIONS.map(([key, text]) => check(text, key === "program")))
        ])
      ], true),
      kit().disclosureBlock("Publisering og kvalitet", "Styr synlighet og dokumenter faglig kvalitetssikring.", [
        el("div", { class: "ds-form-row" }, [
          formField({ label: "Status", control: select(RESOURCE_STATUS_OPTIONS, resource.status) }),
          formField({ label: "Synlighet", control: select(RESOURCE_VISIBILITY_OPTIONS, resource.visibility) })
        ]),
        formField({ label: "Faglig vurdering", control: select(RESOURCE_REVIEW_STATUS_OPTIONS, "draft") }),
        formField({ label: "Faglig grunnlag", control: textarea("", "", 3) })
      ])
    ]);
    const preview = el("aside", { class: "ds-editor-preview" }, [
      el("div", { class: "ds-editor-preview-head" }, [
        el("div", {}, [
          el("p", { class: "ds-form-section-title", text: "Forhåndsvisning" }),
          el("p", { class: "ds-form-help", text: "Viser ressursen med samme design som klient og coach møter." })
        ]),
        dsButton("Oppdater", { variant: "text", onClick: noop })
      ]),
      dsSheet([el("article", { class: "ds-detail" }, [
        dsObjectHead({ kicker: resourceKicker(resource), title: resource.title, lead: resource.introduction }),
        dsSection({ title: "Innhold" }, [resourceContent(resource)])
      ])])
    ]);
    const node = dialog({
      variant: "side ds-dialog--workspace",
      kicker: "Fagbibliotek",
      title: resource.title,
      body: [el("div", { class: "ds-editor" }, [form, preview])],
      foot: [
        el("div", { class: "ds-dialog-foot-start" }, [
          dsButton("Arkiver", { onClick: noop }),
          dsButton("Dupliser", { variant: "text", onClick: noop })
        ]),
        dsButton("Avbryt", { onClick: noop }),
        dsButton("Lagre endringer", { variant: "primary", onClick: noop })
      ]
    });
    if (params.get("part") === "innhold") node.querySelector("#sketch-blocks")?.scrollIntoView({ block: "start" });
  }

  // Del ressurs

  async function sendSketch(params) {
    const { dialog, formField, textarea, select } = kit();
    await librarySketch(params);
    const resources = await window.RaederResourceLibrary.getPublishedResources(state.sb);
    const resource = resources[0];
    const data = state.programCache[state.selectedClientId];
    dialog({
      variant: "side",
      kicker: "Fagbibliotek",
      title: "Del ressurs",
      body: [el("div", { class: "ds-form" }, [
        el("div", { class: "ds-context ds-context--note" }, [el("div", {}, [
          el("p", { class: "ds-context-label", text: "Ressursen klienten mottar" }),
          el("p", { class: "ds-form-label", text: resource.title }),
          el("p", { class: "ds-context-text", text: resource.introduction })
        ])]),
        kit().disclosureBlock("Vurdering for coach", "Når ressursen passer og ikke passer", [
          el("p", { text: resource.intended_outcome }),
          guidanceList("Best brukt når", resource.best_used_when),
          guidanceList("Ikke egnet når", resource.not_for)
        ].filter(Boolean)),
        el("section", { class: "ds-form-section" }, [
          el("h3", { class: "ds-form-section-title", text: "Mottaker og plassering" }),
          el("p", { class: "ds-form-help", text: "Velg hvem som skal få ressursen og hvor den hører hjemme i forløpet." })
        ]),
        formField({ label: "Klient", control: select(getVisibleClients().filter((client) => isClientActivated(client)).map((client) => [client.id, client.name]), state.selectedClientId) }),
        formField({
          label: "Hvor skal ressursen ligge?",
          help: "Velg en konkret plassering hvis det gjør ressursen lettere å forstå for klienten.",
          control: select([["", "Hele forløpet"], ...(data?.areas || []).map((area) => [area.id, `Fokusoppdrag: ${area.title}`])], "")
        }),
        el("p", { class: "ds-form-help", text: "Det sendes også en e-post til klientens registrerte adresse." }),
        el("section", { class: "ds-form-section" }, [
          el("h3", { class: "ds-form-section-title", text: "Personlig melding" }),
          el("p", { class: "ds-form-help", text: "Forklar kort hvorfor du sender ressursen. Denne teksten vises tydelig for klienten." })
        ]),
        formField({ label: "Melding fra deg", control: textarea("", "Skriv kort hvorfor du sender ressursen, og hva klienten bør bruke den til.", 4) })
      ])],
      foot: [
        dsButton("Avbryt", { onClick: noop }),
        dsButton("Send ressurs", { variant: "primary", onClick: noop })
      ]
    });
  }

  window.coachSketches = {
    klienter: clientsSketch,
    "klienter-tom": clientsEmptySketch,
    admin: adminSketch,
    ressursbibliotek: librarySketch,
    "ressurs-rediger": editorSketch,
    "ressurs-del": sendSketch
  };
})();
