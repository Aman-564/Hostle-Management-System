import React, { useEffect, useState } from 'react';
import { roomAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'SINGLE',
    capacity: 1,
    price: 0,
    floor: '',
    amenities: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomAPI.update(editingRoom.id, formData);
      } else {
        await roomAPI.create(formData);
      }
      setShowModal(false);
      setEditingRoom(null);
      setFormData({
        roomNumber: '',
        roomType: 'SINGLE',
        capacity: 1,
        price: 0,
        floor: '',
        amenities: '',
        status: 'AVAILABLE',
      });
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomAPI.delete(id);
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room');
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { background: '#d4edda', color: '#155724' };
      case 'FULL':
        return { background: '#f8d7da', color: '#721c24' };
      case 'MAINTENANCE':
        return { background: '#fff3cd', color: '#856404' };
      default:
        return { background: '#d1ecf1', color: '#0c5460' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Rooms</h2>
        <button onClick={() => setShowModal(true)} style={styles.btnPrimary}>
          <Plus size={18} style={styles.btnIcon} />
          Add Room
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Occupancy</th>
              <th>Price</th>
              <th>Floor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td>{room.capacity}</td>
                <td>{room.currentOccupancy}/{room.capacity}</td>
                <td>${room.price}</td>
                <td>{room.floor}</td>
                <td>
                  <span style={getStatusBadgeStyle(room.status)}>
                    {room.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(room)} style={styles.btnEdit}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(room.id)} style={styles.btnDelete}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                name="roomNumber"
                placeholder="Room Number"
                value={formData.roomNumber}
                onChange={handleChange}
                required
              />
              <select name="roomType" value={formData.roomType} onChange={handleChange}>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TRIPLE">Triple</option>
                <option value="DORMITORY">Dormitory</option>
              </select>
              <input
                name="capacity"
                placeholder="Capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
              <input
                name="price"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <input
                name="floor"
                placeholder="Floor"
                value={formData.floor}
                onChange={handleChange}
                required
              />
              <input
                name="amenities"
                placeholder="Amenities (comma separated)"
                value={formData.amenities}
                onChange={handleChange}
              />
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="AVAILABLE">Available</option>
                <option value="FULL">Full</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.btnPrimary}>
                  {editingRoom ? 'Update' : 'Add'}
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
  btnEdit: {
    background: '#ffc107',
    color: '#000',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  btnDelete: {
    background: '#dc3545',
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
  btnCancel: {
    background: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Rooms;
