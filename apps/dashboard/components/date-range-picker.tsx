"use client"

import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange | undefined) => void;
};

function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const label = value.from ? value.to ? `${format(value.from, "d MMM")} – ${format(value.to, "d MMM")}` : format(value.from, "d MMM yyyy") : "Pick a date range";

  return <Popover><PopoverTrigger asChild><Button variant="ghost" className="h-8 gap-1.5 border border-border/60 px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"><CalendarDays className="size-3.5" /><span>{label}</span></Button></PopoverTrigger><PopoverContent align="end"><Calendar mode="range" selected={value} onSelect={onChange} numberOfMonths={2} /></PopoverContent></Popover>;
}

export { DateRangePicker }
