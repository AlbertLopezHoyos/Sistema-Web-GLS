import { useCallback, useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Sidebar } from './Sidebar';

import { Navbar } from './Navbar';

import { STORAGE_KEYS } from '../../constants/appConfig';

import { storage } from '../../utils/storage';



const MOBILE_BREAKPOINT = 1024;



export const MainLayout = () => {

  const [collapsed, setCollapsed] = useState(() => storage.get(STORAGE_KEYS.SIDEBAR, false));

  const [mobileOpen, setMobileOpen] = useState(false);



  useEffect(() => {

    storage.set(STORAGE_KEYS.SIDEBAR, collapsed);

  }, [collapsed]);



  const toggleSidebar = useCallback(() => {

    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT) {

      setMobileOpen((open) => !open);

      return;

    }

    setCollapsed((c) => !c);

  }, []);



  return (

    <div className="app-layout">

      <Sidebar

        collapsed={collapsed}

        onToggleCollapse={() => setCollapsed((c) => !c)}

        mobileOpen={mobileOpen}

        onMobileClose={() => setMobileOpen(false)}

      />

      <div className="app-main">

        <Navbar onMenuToggle={toggleSidebar} sidebarCollapsed={collapsed} />

        <main className="app-content">

          <Outlet />

        </main>

      </div>

    </div>

  );

};


