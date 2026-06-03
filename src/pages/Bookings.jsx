import React, { useEffect, useState } from 'react';
import { bookingAPI, studentAPI, roomAPI } from '../services/api';
import { Plus, X, LogOut } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    roomId: '',
    checkInDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, studentsRes, roomsRes] = await Promise.all([
        bookingAPI.getAll(),
        studentAPI.getAll(),
        roomAPI.getAvailable(),
      ]);
      setBookings(bookingsRes.data);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.create({
        student: { id: formData.studentId },
        room: { id: formData.roomId },
        checkInDate: formData.checkInDate,
      });
      setShowModal(false);
      setFormData({ studentId: '', roomId: '', checkInDate: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(id);
        fetchData();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Error cancelling booking');
      }
    }
  };

  const handleCheckout = async (id) => {
    if (window.confirm('Are you sure you want to checkout this booking?')) {
      try {
        await bookingAPI.checkout(id);
        fetchData();
      } catch (error) {
        console.error('Error checking out booking:', error);
        alert('Error checking out booking');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { background: '#d4edda', color: '#155724' };
      case 'COMPLETED':
        return { background: '#d1ecf1', color: '#0c5460' };
      case 'CANCELLED':
        return { background: '#f8d7da', color: '#721c24' };
      default:
        return { background: '#fff3cd', color: '#856404' };
    }
  };

  const getPaymentStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PAID':
        return { background: '#d4edda', color: '#155724' };
      case 'PARTIAL':
        return { background: '#fff3cd', color: '#856404' };
      case 'PENDING':
        return { background: '#f8d7da', color: '#721c24' };
      default:
        return { background: '#d1ecf1', color: '#0c5460' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Bookings</h2>
        <button onClick={() => setShowModal(true)} style={styles.btnPrimary}>
          <Plus size={18} style={styles.btnIcon} />
          New Booking
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Room</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.student?.name || 'N/A'}</td>
                <td>{booking.room?.roomNumber || 'N/A'}</td>
                <td>{booking.checkInDate}</td>
                <td>{booking.checkOutDate || 'N/A'}</td>
                <td>
                  <span style={getStatusBadgeStyle(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <span style={getPaymentStatusBadgeStyle(booking.paymentStatus)}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td>${booking.totalAmount?.toFixed(2) || '0.00'}</td>
                <td>
                  {booking.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => handleCancel(booking.id)} style={styles.btnCancel}>
                        <X size={16} />
                      </button>
                      <button onClick={() => handleCheckout(booking.id)} style={styles.btnCheckout}>
                        <LogOut size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Booking</h3>
            <form onSubmit={handleSubmit}>
              <select name="studentId" value={formData.studentId} onChange={handleChange} required>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.email}
                  </option>
                ))}
              </select>
              <select name="roomId" value={formData.roomId} onChange={handleChange} required>
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} - {room.roomType} - ${room.price}
                  </option>
                ))}
              </select>
              <input
                name="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={handleChange}
                required
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.btnPrimary}>
                  Create Booking
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#2c3e50',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  btnPrimary: {
    background: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  btnCancel: {
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  btnCheckout: {
    background: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnIcon: {
    marginRight: '5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    padding: '30px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
};

export default Bookings;
