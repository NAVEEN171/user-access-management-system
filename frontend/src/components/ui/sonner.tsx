import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: {
          background: "white",
          color: "black",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        classNames: {
          error: "!bg-red-500 !text-white !border-red-600",
          success: "!bg-white !text-black !border-gray-200",
          warning: "!bg-yellow-500 !text-white !border-yellow-600",
          info: "!bg-blue-500 !text-white !border-blue-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
