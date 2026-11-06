import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 justify-between gap-2 font-normal", value.length && "border-primary/40")}>
          {label}
          {value.length > 0 && <span className="rounded bg-primary-soft px-1.5 text-xs text-primary-soft-foreground">{value.length}</span>}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}`} className="h-9 border-0 px-0 shadow-none focus-visible:ring-0" />
        </div>
        <ul className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 && <li className="px-2 py-6 text-center text-xs text-muted-foreground">No matches</li>}
          {filtered.map((o) => {
            const on = value.includes(o);
            return (
              <li key={o}>
                <button onClick={() => toggle(o)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
                  <span className={cn("grid size-4 place-items-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                    {on && <Check className="size-3" />}
                  </span>
                  <span className="truncate">{o}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {value.length > 0 && (
          <div className="border-t p-1">
            <button onClick={() => onChange([])} className="w-full rounded-md px-2 py-1.5 text-center text-xs text-muted-foreground hover:bg-accent">
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
