import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#98D0EF] via-[#e7f2fb] to-[#ffffff] w-full items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md ">
        <div className="relative bg-gradient-to-b from-[#C6F0FB] via-[#e7f2fb] to-[#ffffff] backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-white/20 animate-scale-in">
          <div className="flex justify-center pt-8">
            <div className="h-14 w-14 bg-white shadow-lg rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
              <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
