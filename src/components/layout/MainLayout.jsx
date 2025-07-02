// src/components/layout/MainLayout.jsx
import { Link, Outlet } from 'react-router-dom';
import './MainLayout.css';

function MainLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">Walmart Security</div>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">
                <span className="material-icons">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/fraud-detection" className="nav-link">
                <span className="material-icons">security</span>
                Fraud Detection
              </Link>
            </li>
            <li>
              <Link to="/bot-trap" className="nav-link">
                <span className="material-icons">bug_report</span>
                Bot Trap Monitor
              </Link>
            </li>
<li>
  <Link to="/merkel-logging" className="nav-link">
    <span className="material-icons">fingerprint</span>
    DNA Fingerprinting
  </Link>
</li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <Outlet /> {/* This will render BotTrapPage content */}
      </main>
    </div>
  );
}

export default MainLayout; 
