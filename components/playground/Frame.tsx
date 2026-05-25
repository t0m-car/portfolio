import type { ReactNode } from "react";

export function PlaygroundFrame({
  children,
  foot,
  topRight,
}: {
  children: ReactNode;
  foot?: ReactNode;
  topRight?: ReactNode;
}) {
  return (
    <div className="playground">
      <div className="pg-stage">
        {children}
        {topRight && <div className="pg-toolbar pg-toolbar--tr">{topRight}</div>}
      </div>
      {foot && <div className="pg-foot">{foot}</div>}
    </div>
  );
}
