"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return <DayPicker showOutsideDays={showOutsideDays} className={cn("p-2", className)} classNames={{ months: "flex flex-col gap-4", month: "space-y-3", month_caption: "relative flex items-center justify-center pt-1", caption_label: "text-sm font-medium", nav: "flex items-center gap-1", button_previous: "absolute left-1 inline-flex size-7 items-center justify-center rounded-md hover:bg-muted", button_next: "absolute right-1 inline-flex size-7 items-center justify-center rounded-md hover:bg-muted", month_grid: "w-full border-collapse", weekdays: "flex", weekday: "w-9 text-center text-xs font-normal text-muted-foreground", week: "mt-1 flex w-full", day: "relative size-9 p-0 text-center text-sm", day_button: "inline-flex size-9 items-center justify-center rounded-md hover:bg-muted aria-selected:bg-primary aria-selected:text-primary-foreground", selected: "bg-primary text-primary-foreground", range_start: "rounded-l-md", range_end: "rounded-r-md", range_middle: "bg-muted", today: "font-semibold", outside: "text-muted-foreground opacity-50", disabled: "text-muted-foreground opacity-50", hidden: "invisible", ...classNames }} components={{ Chevron: ({ orientation, ...iconProps }) => orientation === "left" ? <ChevronLeftIcon className="size-4" {...iconProps} /> : <ChevronRightIcon className="size-4" {...iconProps} /> }} {...props} />
}

export { Calendar }
