import { Shield } from "lucide-react";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand${inverse ? " brand--inverse" : ""}`}>
      <span className="brand__symbol"><Shield size={17} strokeWidth={2.3} /></span>
      <span>ResQ<span>AI</span></span>
    </span>
  );
}
