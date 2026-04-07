"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RELEASES } from "@/domain/releases";

const CATEGORY_STYLES: Record<string, string> = {
  "UX / design": "bg-brand-50 text-brand-700",
  "Functioneel": "bg-success-50 text-success-700",
  "Beveiliging": "bg-danger-50 text-danger-600",
  "Prestaties": "bg-warning-50 text-warning-700",
  "Bugfixes": "bg-danger-50 text-danger-600",
  "Onderhoud": "bg-surface-tertiary text-text-secondary",
  "Connectiviteit": "bg-brand-50 text-brand-700",
  "Validatie": "bg-warning-50 text-warning-700",
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
              key={`${release.date}-${idx}`}
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
