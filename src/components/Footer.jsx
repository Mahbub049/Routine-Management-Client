import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full text-black py-4 mt-10">
      <div className="max-w-7xl mx-auto text-center text-sm px-4">
        © 2025. All rights reserved. Developed by <span className="font-semibold"><Link to="https://mahbub-sarwar.vercel.app">Mahbub Sarwar</Link></span>
      </div>
    </footer>
  );
}

export default Footer;
