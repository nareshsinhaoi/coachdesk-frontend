import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
    {/* The main container now spans full height and width, no borders or white background */}
    <div className="w-full flex-1">
      <Outlet />
    </div>

    {/* Footer stays at the bottom */}
    <p className="pb-6 pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
  © {new Date().getFullYear()}{" "}
  <a
    href="https://modulelabs.in/"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-indigo-600 hover:underline"
  >
    ModuleLabs
  </a>
  . All rights reserved. CoachDesk Version 1.1
</p>
  </div>
);

export default AuthLayout;