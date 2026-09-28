import { FileText } from "lucide-react";
import { AdminDetail, AnswerList } from "@/components/admin/admin-detail";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { admin } from "@/lib/copy";

// Stage 3 placeholder content inside the AdminDetail template.
// Real documents, answers and actions arrive in Stage 8.
export default async function AdminApplicationPage(props: PageProps<"/admin/[ref]">) {
  const { ref } = await props.params;
  const p = admin.placeholder.detail;

  return (
    <AdminDetail
      backHref="/admin"
      name={p.name}
      reference={ref}
      badges={<StatusBadge status="received" />}
      actions={
        <>
          <Button>{admin.actions.markVerified}</Button>
          <Button variant="secondary">{admin.actions.askReupload}</Button>
        </>
      }
      documents={
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {p.documents.map((doc) => (
            <li key={doc} className="flex flex-col gap-2">
              <div className="flex aspect-video items-center justify-center rounded-control border border-border bg-surface-alt text-ink-quiet">
                <FileText className="size-8" aria-hidden />
              </div>
              <p className="text-base font-medium">{doc}</p>
            </li>
          ))}
        </ul>
      }
      answers={<AnswerList items={p.answers} />}
    />
  );
}
