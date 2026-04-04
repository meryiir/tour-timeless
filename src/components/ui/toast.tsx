import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "pointer-events-none fixed inset-x-0 bottom-0 top-auto z-[11000] flex max-h-[min(100dvh,100vh)] w-full flex-col items-center gap-3 p-4",
      "pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:pb-4",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-[min(100%,min(26rem,calc(100vw-2rem)))] items-start justify-between gap-3 overflow-hidden rounded-2xl border p-4 pr-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.18),0_4px_14px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full sm:data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.55)] sm:max-w-[min(100vw-2rem,420px)]",
  {
    variants: {
      variant: {
        default:
          "border-border/70 bg-card/95 text-foreground ring-1 ring-black/[0.04] dark:ring-white/[0.08]",
        destructive:
          "border-red-200/90 bg-gradient-to-br from-red-50 to-card text-foreground ring-1 ring-red-500/10 dark:border-red-900/60 dark:from-red-950/50 dark:to-card dark:text-foreground",
        success:
          "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-card to-card text-foreground ring-1 ring-emerald-500/15 dark:border-emerald-800/70 dark:from-emerald-950/45 dark:via-card dark:to-card",
        warning:
          "border-amber-200/90 bg-gradient-to-br from-amber-50 to-card text-foreground ring-1 ring-amber-500/15 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-card",
        info: "border-sky-200/90 bg-gradient-to-br from-sky-50 to-card text-foreground ring-1 ring-sky-500/15 dark:border-sky-900/60 dark:from-sky-950/40 dark:to-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      data-variant={variant ?? "default"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2.5 top-2.5 rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
      "group-data-[variant=destructive]:text-red-600/80 group-data-[variant=destructive]:hover:bg-red-500/10 group-data-[variant=destructive]:hover:text-red-800 dark:group-data-[variant=destructive]:text-red-300/90",
      "group-data-[variant=success]:text-emerald-700/70 group-data-[variant=success]:hover:bg-emerald-500/10 group-data-[variant=success]:hover:text-emerald-900 dark:group-data-[variant=success]:text-emerald-400/80",
      "group-data-[variant=warning]:text-amber-800/70 group-data-[variant=warning]:hover:bg-amber-500/10 dark:group-data-[variant=warning]:text-amber-200/80",
      "group-data-[variant=info]:text-sky-700/70 group-data-[variant=info]:hover:bg-sky-500/10 dark:group-data-[variant=info]:text-sky-300/80",
      "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" strokeWidth={2} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-snug tracking-tight text-foreground", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-[13px] leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & VariantProps<typeof toastVariants>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
};
