"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReleaseGroup {
  heading: string;
  items: string[];
}

interface Release {
  date: string;
  title: string;
  groups: ReleaseGroup[];
}

const RELEASES: Release[] = [
  {
    date: "1 april 2026",
    title: "Mobiel startscherm, navigatie en releasenotes",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Mobiel startscherm met kaartnavigatie naar alle secties. Planningkaart als hero met merkkleurgradient, overige secties in 2-koloms raster.",
          "Terugknop op alle mobiele subpagina\u2019s om terug te keren naar het startscherm. Hamburger-menu en sidebar-slideout op mobiel verwijderd.",
          "Documentatiepagina vervangen door een chronologisch releasenotes-overzicht met inklapbare secties per dag.",
          "Maandkalender op mobiel: maandnavigatie met vorige/volgende, weeknummers, statuskleurdots per dag, dagdetailpaneel met status en notities. Vandaag gemarkeerd met blauwe cirkel.",
          "Zoekicoon-uitlijning in zoekbalken verbeterd.",
        ],
      },
      {
        heading: "Bugfixes",
        items: [
          "Mobiele sidebar opende niet betrouwbaar: z-index conflict en useEffect mount-bug opgelost met mount-guard.",
        ],
      },
      {
        heading: "Onderhoud",
        items: [
          "resolveUserId en validateApiFields geconsolideerd naar gedeelde modules.",
        ],
      },
    ],
  },
  {
    date: "31 maart 2026",
    title: "API-connecties, audittrail, beveiliging en mobiele navigatie",
    groups: [
      {
        heading: "UX / design",
        items: [
          "API-bron configuratie: brontype-kiezer (CSV/API), URL, HTTP-methode, headers, authenticatietype met credential-velden.",
          "Verbinding testen met inline succes/fout-feedback.",
          "Response-structuur ontdekking na verbindingstest met interactieve padkeuze en autocomplete.",
          "Auditlog viewer in instellingen met filters, expandeerbare rijen en paginering.",
          "Planningsrooster werkbalk herstructurering naar vier zones: Periode, Filter, Weergave, Status.",
          "Capaciteitspagina KPI-samenvattingsmodule met vijf kernmetrieken.",
          "Chauffeurspagina: ge\u00efntegreerde zoekbalk en tonale rijafwisseling.",
          "Mobiele navigatie met hamburger-menu en slide-over sidebar.",
          "Mobiele chauffeurlijst met kaartweergave, zoekbalk en vereenvoudigde paginering.",
        ],
      },
      {
        heading: "Functioneel",
        items: [
          "API-bron uitvoering: server-side HTTP-request met authenticatie, JSON-veldmappings en automatische data-array detectie.",
          "Volledige audittrail op alle mutaties (planning-entries uitgezonderd).",
          "Per-gebruiker actief scenario.",
          "Server-foutmeldingen zichtbaar in toastmeldingen.",
        ],
      },
      {
        heading: "Beveiliging",
        items: [
          "Importbron endpoints beveiligd (ADMIN-rol vereist).",
          "Afdelingsfilter op planning DELETE- en schrijfroutes.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Snellere sub-record aanmaak: ~3 roundtrips bespaard per wijziging.",
        ],
      },
    ],
  },
  {
    date: "30 maart 2026",
    title: "Gebruikersgroepen autorisatie compleet",
    groups: [
      {
        heading: "Beveiliging",
        items: [
          "Gebruikersgroepen op alle lees- en schrijfendpoints met afdelingsfiltering.",
          "Individuele routes beveiligd: 404 voor chauffeurs buiten gebruikersgroep.",
          "Voorkeuren per gebruiker: 401-fout voor niet-ingelogde gebruikers.",
          "Alleen vooraf aangemaakte gebruikers kunnen inloggen via OAuth.",
          "Rolhandhaving op alle schrijfroutes (Admin/Planner/Viewer).",
        ],
      },
      {
        heading: "Functioneel",
        items: [
          "Gebruikersgroepen beheer met afdelingskoppeling en ledenbeheer.",
          "CSV-import upsert modus: keuze tussen aanmaken en bijwerken.",
          "Gebruikersbeheer met roloverzicht en rolbeheer.",
          "Inlogpagina met Google OAuth.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Capaciteitsendpoint geoptimaliseerd.",
          "Snellere CSV-import met batch-lookups en createMany.",
          "Virtual scrolling planningsrooster: soepel bij 1000+ chauffeurs.",
          "Server-side paginering op planningsrooster en chauffeurspagina.",
        ],
      },
    ],
  },
  {
    date: "29 maart 2026",
    title: "Ontwerp, connectiviteit en prestaties",
    groups: [
      {
        heading: "UX / design",
        items: [
          "Planningsrooster herontwerp: tonale lagen, statuscellen met kleurindicatorstippen.",
          "Koptekst met contextuele informatie per pagina.",
          "Chauffeurspagina herontwerp: samengestelde paginakop met contextbeschrijving.",
          "Instellingenpagina herontwerp: tabnavigatie met secties.",
          "Capaciteitspagina: statuschips met kleurindicatorstippen.",
          "Gestylede datuminvoer met kalenderknop.",
          "Gestylede verwijderbevestigingsdialogen.",
          "Manrope lettertype voor paginatitels.",
        ],
      },
      {
        heading: "Connectiviteit",
        items: [
          "Importbronnen: datamodel, CRUD API en beheerscherm met visuele veldkoppelingseditor.",
          "CSV-upload met kolomdetectie en voorbeeldrijen.",
        ],
      },
      {
        heading: "Prestaties",
        items: [
          "Map-gebaseerde lookups voor O(1) toegang in het planningsrooster.",
        ],
      },
      {
        heading: "Bugfixes",
        items: [
          "Chauffeurs zonder actief dienstverband nu zichtbaar in het planningsscherm.",
        ],
      },
    ],
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  "UX / design": "bg-brand-50 text-brand-700",
  "Functioneel": "bg-success-50 text-success-700",
  "Beveiliging": "bg-danger-50 text-danger-600",
  "Prestaties": "bg-warning-50 text-warning-700",
  "Bugfixes": "bg-danger-50 text-danger-600",
  "Onderhoud": "bg-surface-tertiary text-text-secondary",
  "Connectiviteit": "bg-brand-50 text-brand-700",
};

export default function ReleasenotesPage() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <p className="text-sm text-text-secondary mt-1">
          Overzicht van alle wijzigingen en verbeteringen in CapPlan.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {RELEASES.map((release, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={release.date}
              className="bg-surface-primary rounded-lg shadow-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                className="w-full text-left px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 hover:bg-surface-secondary transition-colors"
              >
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-tertiary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {release.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mt-1 truncate">
                    {release.title}
                  </h3>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 ml-7 border-t border-border-subtle">
                  {release.groups.map((group) => (
                    <div key={group.heading} className="mt-3 first:mt-3">
                      <span
                        className={cn(
                          "inline-block text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full mb-1.5",
                          CATEGORY_STYLES[group.heading] ?? "bg-surface-tertiary text-text-secondary"
                        )}
                      >
                        {group.heading}
                      </span>
                      <ul className="space-y-1">
                        {group.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-[0.8125rem] text-text-secondary leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-border-strong"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
