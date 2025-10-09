"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipArrow = TooltipPrimitive.Arrow

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, children, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "relative z-50 overflow-visible rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 px-4 py-3 text-sm shadow-2xl",
      "animate-in fade-in-50 zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3 data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
      "duration-200",
      className
    )}
    {...props}
  >
    {children}
    {/* Border arrow (larger, behind) */}
    <TooltipPrimitive.Arrow
      className="fill-indigo-200"
      width={18}
      height={9}
    />
    {/* Fill arrow (smaller, in front) */}
    <TooltipPrimitive.Arrow
      className="fill-white"
      width={14}
      height={7}
    />
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow }
