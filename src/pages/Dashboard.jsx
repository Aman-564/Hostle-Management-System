import React, { useEffect, useState } from 'react';
import { studentAPI, roomAPI, bookingAPI, paymentAPI } from '../services/api';
import { Users, Bed, Calendar, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    rooms: 0,
    availableRooms: 0,
    activeBookings: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, roomsRes, availableRoomsRes, bookingsRes, paymentsRes] = await Promise.all([
        studentAPI.getAll(),
        roomAPI.getAll(),
        roomAPI.getAvailable(),
        bookingAPI.getActive(),
        paymentAPI.getAll(),
      ]);

      const totalPayments = paymentsRes.data.reduce((sum, payment) => sum + payment.amount, 0);

      setStats({
        students: studentsRes.data.length,
        rooms: roomsRes.data.length,
        availableRooms: availableRoomsRes.data.length,
        activeBookings: bookingsRes.data.length,
        totalPayments,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: '#3498db' },
    { label: 'Total Rooms', value: stats.rooms, icon: Bed, color: '#9b59b6' },
    { label: 'Available Rooms', value: stats.availableRooms, icon: Bed, color: '#2ecc71' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: Calendar, color: '#e67e22' },
    { label: 'Total Revenue', value: `$${stats.totalPayments.toFixed(2)}`, icon: TrendingUp, color: '#1abc9c' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard</h2>
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{ ...styles.statCard, borderColor: stat.color }}>
              <div style={{ ...styles.iconWrapper, backgroundColor: stat.color }}>
                <Icon size={24} color="#fff" />
              </div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>{stat.label}</p>
                <h3 style={styles.statValue}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#2c3e50',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid',
  },
  iconWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '0 0 5px 0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#2c3e50',
  },
};

export default Dashboard;
