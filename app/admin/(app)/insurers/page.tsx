import { Info, TriangleAlert } from "lucide-react";
import { InsurerPanel, type PanelRow } from "@/components/admin/insurer-panel";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { admin } from "@/lib/copy";
import { insurers } from "@/lib/data/insurers";
import { vehicleCategories } from "@/lib/data/motor";
import { getRepo } from "@/lib/data/repo";

export const metadata = { title: admin.nav.insurers };

/** The broker's insurer panel: who clients get instant quotes from. */
export default async function InsurersPage() {
  const { panel } = await getRepo().getSettings();
  const copy = admin.insurers;
  // Switched-on insurers first, so the panel reads at a glance.
  const rows: PanelRow[] = [...insurers]
    .sort((a, b) => Number(panel.includes(b.id)) - Number(panel.includes(a.id)) || a.name.localeCompare(b.name))
    .map((insurer) => ({
      id: insurer.id,
      name: insurer.name,
      legalName: insurer.legalName,
      logo: insurer.logo,
      terms: [
        insurer.accepts.length === vehicleCategories.length ? copy.allClasses : copy.noPsv,
        copy.ageLimit(insurer.maxAgeComprehensive),
      ].join(" · "),
      caution: insurer.caution ? copy.caution[insurer.caution] : undefined,
      on: panel.includes(insurer.id),
    }));

  return (
    <>
      <PageHeader title={copy.heading} description={copy.intro} />
      <Card className="gap-2">
        <p className="text-sm font-medium text-ink">{copy.onCount(panel.length, insurers.length)}</p>
        <p className="flex items-start gap-2 text-sm text-ink">
          <span className="flex h-5 shrink-0 items-center">
            <TriangleAlert className="size-4 text-warn" aria-hidden />
          </span>
          {copy.warning}
        </p>
        <p className="flex items-start gap-2 text-sm text-ink-quiet">
          <span className="flex h-5 shrink-0 items-center">
            <Info className="size-4" aria-hidden />
          </span>
          {copy.sampleNote}
        </p>
      </Card>
      <InsurerPanel rows={rows} />
    </>
  );
}
