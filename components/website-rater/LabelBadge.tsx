import { LABEL_STYLES, type Label } from "../../lib/scoring";

export default function LabelBadge({ label }: { label: Label }) {
  const style = LABEL_STYLES[label];

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
      style={{ backgroundColor: style.bg, color: style.badge }}
    >
      {label}
    </span>
  );
}
