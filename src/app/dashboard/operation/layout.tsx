"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HelpCircle,
  LogOut,
  Menu,
  X,
  Repeat2,
  CirclePlus,
  ChartPie,
} from "lucide-react";
import Image from "next/image";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: ChartPie,
      href: "/dashboard/admin/overview",
    },
    {
      id: "dailytasks",
      label: "Daily Tasks",
      icon: Repeat2,
      href: "/dashboard/admin/dailytasks",
    },
    {
      id: "newtasks",
      label: "New Tasks",
      icon: CirclePlus,
      href: "/dashboard/admin/newtasks",
    },

    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      href: "/dashboard/admin/help",
    },
  ];

  const getActiveSection = () => {
    if (pathname.includes("/overview")) return "overview";
    if (pathname.includes("/dailytasks")) return "dailytasks";
    if (pathname.includes("/newtasks")) return "newtasks";
    if (pathname.includes("/help")) return "help";
    return "overview";
  };

  const activeSection = getActiveSection();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const menuButton = document.getElementById("mobile-menu-button");

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    console.log("Logout clicked");
    router.push("/auth/login/operation");
  };

  return (
    <div className="flex min-h-screen w-screen">
      <button
        id="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#1B3A6A] text-white rounded-lg shadow-lg hover:bg-[#2A4A7A] transition-colors duration-200 md:mr-2 scale-[0.8] md:scale-[1] mt-1 md:mt-0"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        id="mobile-sidebar"
        className={`fixed lg:sticky inset-y-0 right-0 lg:left-0 z-40 w-64 h-screen 
          bg-[#1B3A6A] backdrop-blur-md border-l lg:border-l-0 lg:border-r border-white/20 
          flex flex-col text-white transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="p-6 border-b border-white/20 bg-[#D9A864] md:bg-transparent mb-4 md:mb-0">
          <Image
            src="/PWIOILogo.webp"
            alt="PW IOI Logo"
            width={160}
            height={0}
          />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                  transition-all duration-200 ease-in-out cursor-pointer
                  ${
                    isActive
                      ? "bg-[#D9A864] text-black shadow-lg transform scale-[1.01]"
                      : "text-white hover:bg-[#7695CD] hover:transform hover:scale-[1.01]"
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            className="w-full flex items-center space-x-3 bg-[#D9A864] text-gray-800 py-3 px-4 hover:bg-[#f3c17a] rounded-lg transition-all duration-200 ease-in-out cursor-pointer font-semibold hover:transform hover:scale-[1.01]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#FFE4B8] lg:ml-0">
        <div className="p-6 w-screen md:w-[1000px]">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
