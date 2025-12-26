import Page from "../components/Page";
import Card from "../components/Card";
import { useLifeStore } from "../store/lifeStore";

export default function ConfigPage() {
  const cfg = useLifeStore((s) => s.config);
  const patchConfig = useLifeStore((s) => s.patchConfig);
  const exportConfig = useLifeStore((s) => s.exportConfig);

  return (
    <Page title="Config" subtitle="Assumptions are the product. Keep them explicit.">
      <div className="max-w-2xl">
        <Card title="Core assumptions" subtitle="Net cashflow, expense baseline, and returns.">
          <div className="grid gap-4">
            {/* inputs giữ nguyên như anh đang có */}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              className="h-11 rounded-xl bg-neutral-900 text-white px-4 text-sm"
              onClick={() => {
                navigator.clipboard.writeText(exportConfig());
                alert("Copied config JSON to clipboard");
              }}
            >
              Export JSON (copy)
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}