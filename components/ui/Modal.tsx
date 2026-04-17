import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  preventBodyScroll = true,
  className
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventBodyScroll]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "max-w-md";
      case "md": return "max-w-2xl";
      case "lg": return "max-w-4xl";
      case "xl": return "max-w-6xl";
      case "full": return "max-w-full mx-4";
      default: return "max-w-2xl";
    }
  };

  if (!isMounted) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isOpen && !isClosing ? "bg-black/60 backdrop-blur-sm modal-backdrop" : "bg-black/0 backdrop-blur-none"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 transform modal-content",
          getSizeClasses(),
          "w-full max-h-[90vh]",
          isOpen && !isClosing ? "scale-100 opacity-100 translate-y-0 modal-entrance" : "scale-95 opacity-0 translate-y-4 modal-exit",
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            {title && (
              <h2 className="text-xl font-bold text-slate-800 pr-12">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 group border border-slate-200 shadow-sm"
              >
                <X className="h-5 w-5 text-slate-600 group-hover:text-slate-800 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de confirmation
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "info",
  isLoading = false
}: ConfirmModalProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "danger":
        return "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
      case "warning":
        return "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700";
      default:
        return "from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto">
          {variant === "danger" && (
            <X className="h-8 w-8 text-red-500" />
          )}
          {variant === "warning" && (
            <span className="text-2xl">!</span>
          )}
          {variant === "info" && (
            <span className="text-2xl">?</span>
          )}
        </div>
        
        <div>
          <p className="text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-6 py-3 bg-gradient-to-r text-white rounded-2xl font-medium transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed",
              getVariantClasses()
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                En cours...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );

}

// Modal de succès/erreur
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  actionText?: string;
  onAction?: () => void;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  actionText,
  onAction
}: AlertModalProps) {
  const getTypeClasses = () => {
    switch (type) {
      case "success":
        return "from-emerald-500 to-emerald-600";
      case "error":
        return "from-red-500 to-red-600";
      case "warning":
        return "from-amber-500 to-amber-600";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "CheckCircle";
      case "error":
        return "XCircle";
      case "warning":
        return "AlertTriangle";
      default:
        return "Info";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="text-center space-y-6">
        <div className={cn(
          "w-16 h-16 rounded-3xl bg-gradient-to-br flex items-center justify-center mx-auto",
          getTypeClasses()
        )}>
          <span className="text-white text-2xl">
            {getIcon() === "CheckCircle" && "CheckCircle"}
            {getIcon() === "XCircle" && "XCircle"}
            {getIcon() === "AlertTriangle" && "AlertTriangle"}
            {getIcon() === "Info" && "Info"}
          </span>
        </div>
        
        <div>
          <p className="text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-6 py-3 bg-gradient-to-r from-primary to-violet-600 text-white rounded-2xl font-medium transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              {actionText}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300 hover:-translate-y-1"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Modal de chargement
interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingModal({ isOpen, message = "Chargement..." }: LoadingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="sm" showCloseButton={false} closeOnBackdropClick={false}>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        
        <div>
          <p className="text-slate-700 font-medium">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}
