import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />;
      case "destructive":
        return <XCircle className="h-5 w-5 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      case "info":
        return <Info className="h-5 w-5 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <ToastProvider swipeDirection="up" duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIcon(variant);
        
        return (
          <Toast key={id} variant={variant as any} {...props} className="group">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="mt-0.5">
                  {icon}
                </div>
              )}
              <div className="grid gap-1 flex-1 min-w-0">
                {title && <ToastTitle className="font-semibold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className={variant === "destructive" || variant === "success" || variant === "info" ? "text-white/90" : ""}>
                    {description}
                  </ToastDescription>
                )}
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
