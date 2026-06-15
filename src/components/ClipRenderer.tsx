import React from "react";
import type { Clip } from "../types";
import { TitleClip } from "./clips/TitleClip";
import { StatClip } from "./clips/StatClip";
import { BarsClip } from "./clips/BarsClip";
import { PieClip } from "./clips/PieClip";
import { ComparisonClip } from "./clips/ComparisonClip";
import { RankingClip } from "./clips/RankingClip";
import { OutroClip } from "./clips/OutroClip";

export const ClipRenderer: React.FC<{ clip: Clip }> = ({ clip }) => {
  switch (clip.type) {
    case "title":
      return <TitleClip {...clip} />;
    case "stat":
      return <StatClip {...clip} />;
    case "bars":
      return <BarsClip {...clip} />;
    case "pie":
      return <PieClip {...clip} />;
    case "comparison":
      return <ComparisonClip {...clip} />;
    case "ranking":
      return <RankingClip {...clip} />;
    case "outro":
      return <OutroClip {...clip} />;
    default: {
      // Exhaustiveness check: adding a new clip type without handling it
      // here becomes a TypeScript error.
      const _never: never = clip;
      return _never;
    }
  }
};
