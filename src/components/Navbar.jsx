import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bed, Calendar, CreditCard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/rooms', label: 'Rooms', icon: Bed },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <h1 style={styles.logo}>Hostel Management</h1>
        <div style={styles.navLinks}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={isActive ? styles.activeLink : styles.link}
              >
                <Icon size={18} style={styles.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
  },
  logo: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#ecf0f1',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background 0.3s',
  },
  activeLink: {
    color: '#fff',
    backgroundColor: '#34495e',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 12px',
    borderRadius: '4px',
  },
  icon: {
    marginRight: '5px',
  },
};

export default Navbar;
