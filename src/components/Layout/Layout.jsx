import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import SideMenu from './SideMenu';
import DesktopSidebar from './DesktopSidebar';
import RightSidebar from './RightSidebar';
import Footer from './Footer';
import styles from './Layout.module.css';

/**
 * Layout — Main app shell.
 * Uses root-level scrolling on 'shell' to allow a clean full-width footer.
 * Sidebars are fixed and stay in place while content scrolls.
 * 'main' has flex-1 to keep footer at bottom of short content.
 * 'content' has padding for sidebar avoidance.
 */
export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <TopBar onMenuClick={() => setMenuOpen(true)} />
      
      <div className={styles.layoutBody}>
        <DesktopSidebar />
        
        {/* Main content layer — scrolls with shell */}
        <main className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Full-width footer at the bottom of the root scroll area */}
      <Footer />

      <BottomNav />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
