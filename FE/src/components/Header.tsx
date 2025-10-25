"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Import icons for hamburger menu and close button

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu visibility

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false); // Close the mobile menu after clicking a link
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">JobSphereAI</div>

        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <nav
          className={`fixed md:relative top-16 md:top-0 left-0 right-0 bg-black bg-opacity-90 md:bg-transparent md:flex md:space-x-6 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <button
            onClick={() => handleScroll("features")}
            className="block w-full text-left md:text-center text-white hover:text-blue-500 transition-colors p-4 md:p-0"
          >
            Features
          </button>
          <button
            onClick={() => handleScroll("how-it-works")}
            className="block w-full text-left md:text-center text-white hover:text-blue-500 transition-colors p-4 md:p-0"
          >
            Working
          </button>
          <button
            onClick={() => handleScroll("metrics")}
            className="block w-full text-left md:text-center text-white hover:text-blue-500 transition-colors p-4 md:p-0"
          >
            Metrics
          </button>
          <button
            onClick={() => handleScroll("team")}
            className="block w-full text-left md:text-center text-white hover:text-blue-500 transition-colors p-4 md:p-0"
          >
            Team
          </button>
          <button
            onClick={() => handleScroll("faq")}
            className="block w-full text-left md:text-center text-white hover:text-blue-500 transition-colors p-4 md:p-0"
          >
            FAQ
          </button>
        </nav>
      </div>
    </header>
  );
};
