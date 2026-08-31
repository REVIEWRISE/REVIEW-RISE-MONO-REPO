"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionType = "single" | "multiple"

type AccordionContextValue = {
  type: AccordionType
  value: string[]
  toggle: (itemValue: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error("Accordion components must be used within <Accordion>")
  return ctx
}

function Accordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  type?: AccordionType
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}) {
  const isControlled = value !== undefined

  const [internal, setInternal] = React.useState<string[]>(
    defaultValue === undefined
      ? []
      : Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue]
  )

  const current = React.useMemo(() => {
    if (!isControlled) return internal
    return Array.isArray(value) ? value : value ? [value] : []
  }, [internal, isControlled, value])

  const toggle = React.useCallback(
    (itemValue: string) => {
      const next =
        type === "single"
          ? current[0] === itemValue
            ? []
            : [itemValue]
          : current.includes(itemValue)
            ? current.filter((v) => v !== itemValue)
            : [...current, itemValue]

      if (!isControlled) setInternal(next)

      if (onValueChange) {
        onValueChange(type === "single" ? (next[0] ?? "") : next)
      }
    },
    [current, isControlled, onValueChange, type]
  )

  return (
    <AccordionContext.Provider value={{ type, value: current, toggle }}>
      <div data-slot="accordion" {...props} />
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = useAccordionContext()
  const isOpen = ctx.value.includes(value)

  return (
    <div
      data-slot="accordion-item"
      data-state={isOpen ? "open" : "closed"}
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = useAccordionContext()
  const isOpen = ctx.value.includes(value)

  return (
    <div className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={(e) => {
          props.onClick?.(e)
          if (!e.defaultPrevented) ctx.toggle(value)
        }}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </button>
    </div>
  )
}

function AccordionContent({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = useAccordionContext()
  const isOpen = ctx.value.includes(value)

  return (
    <div
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "grid text-sm transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("pt-0 pb-4", className)}>{children}</div>
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
