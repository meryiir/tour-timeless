import type { ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function iconShell(
  variant: string | undefined,
  node: ReactNode,
) {
  const styles: Record<string, string> = {
    success:
      "bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/25",
    destructive:
      "bg-red-500/12 text-red-600 ring-1 ring-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/25",
    warning:
      "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25",
    info: "bg-sky-500/12 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:ring-sky-500/25",
    default:
      "bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15 dark:text-primary",
  };
  const key = variant && styles[variant] ? variant : "default";
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&>svg]:h-[1.35rem] [&>svg]:w-[1.35rem]",
        styles[key],
      )}
    >
      {node}
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "success":
        return iconShell(variant, <CheckCircle2 className="stroke-[2.25]" aria-hidden />);
      case "destructive":
        return iconShell(variant, <XCircle className="stroke-[2.25]" aria-hidden />);
      case "warning":
        return iconShell(variant, <AlertCircle className="stroke-[2.25]" aria-hidden />);
      case "info":
        return iconShell(variant, <Info className="stroke-[2.25]" aria-hidden />);
      default:
        return iconShell("default", <Sparkles className="stroke-[2.25]" aria-hidden />);
    }
  };

  return (
    <ToastProvider swipeDirection="up" duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIcon(variant);

        return (
          <Toast key={id} variant={variant as "default" | "destructive" | "success" | "warning" | "info"} {...props} className="group">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {icon}
              <div className="grid min-w-0 flex-1 gap-0.5 pr-1 pt-0.5">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
