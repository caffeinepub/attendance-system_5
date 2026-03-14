import { useEffect, useState } from "react";

export default function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center py-6 px-8 rounded-2xl bg-primary/8 dark:bg-primary/10 border border-primary/20 mb-6">
      <div className="font-mono text-5xl font-bold tracking-tight text-foreground tabular-nums">
        {timeStr}
      </div>
      <div className="mt-2 text-sm font-medium text-muted-foreground font-display tracking-wide">
        {dateStr}
      </div>
    </div>
  );
}
