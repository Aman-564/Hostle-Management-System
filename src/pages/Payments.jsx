import React, { useEffect, useState } from 'react';
import { paymentAPI, bookingAPI } from '../services/api';
import { Plus } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    amount: 0,
    paymentMethod: 'CASH',
    transactionId: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching payments and bookings...');
      const [paymentsRes, bookingsRes] = await Promise.all([
        paymentAPI.getAll(),
        bookingAPI.getActive(),
      ]);
      console.log('Payments received:', paymentsRes.data);
      setPayments(paymentsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data from server. Please check the console.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId) {
      alert('Please select a booking');
      return;
    }
    try {
      console.log('Creating payment with data:', formData);
      const paymentData = {
        booking: { id: parseInt(formData.bookingId) },
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        remarks: formData.remarks,
        paymentDate: new Date().toISOString().split('T')[0], // Ensure date is sent
        status: 'SUCCESS' // Explicitly set status
      };
      
      const response = await paymentAPI.create(paymentData);
      console.log('Payment created successfully:', response.data);
      
      setShowModal(false);
      setFormData({
        bookingId: '',
        amount: 0,
        paymentMethod: 'CASH',
        transactionId: '',
        remarks: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating payment:', error);
      const message = error.response?.data || 'Error creating payment';
      alert(message);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { background: '#d4edda', color: '#155724' };
      case 'FAILED':
        return { background: '#f8d7da', color: '#721c24' };
      case 'PENDING':
        return { background: '#fff3cd', color: '#856404' };
      default:
        return { background: '#d1ecf1', color: '#0c5460' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Payments</h2>
        <button onClick={() => setShowModal(true)} style={styles.btnPrimary}>
          <Plus size={18} style={styles.btnIcon} />
          New Payment
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>#{payment.booking?.id}</td>
                <td>{payment.booking?.student?.name || 'N/A'}</td>
                <td>${payment.amount?.toFixed(2)}</td>
                <td>{payment.paymentDate}</td>
                <td>{payment.paymentMethod}</td>
                <td>{payment.transactionId || 'N/A'}</td>
                <td>
                  <span style={getStatusBadgeStyle(payment.status)}>
                    {payment.status}
                  </span>
                </td>
                <td>{payment.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>New Payment</h3>
            <form onSubmit={handleSubmit}>
              <select name="bookingId" value={formData.bookingId} onChange={handleChange} required>
                <option value="">Select Booking</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} - {booking.student?.name} - Room {booking.room?.roomNumber} - Due: ${booking.totalAmount?.toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                name="amount"
                placeholder="Amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
              <input
                name="transactionId"
                placeholder="Transaction ID"
                value={formData.transactionId}
                onChange={handleChange}
              />
              <input
                name="remarks"
                placeholder="Remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.btnPrimary}>
                  Record Payment
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
  btnCancel: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Payments;
