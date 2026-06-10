package com.hostel.management.service;

import com.hostel.management.entity.Room;
import com.hostel.management.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByStatus("AVAILABLE");
    }

    public List<Room> getRoomsByType(String roomType) {
        return roomRepository.findByRoomType(roomType);
    }

    public Room createRoom(Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new RuntimeException("Room number already exists");
        }
        room.setCurrentOccupancy(0);
        room.setStatus("AVAILABLE");
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room roomDetails) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getRoomNumber().equals(roomDetails.getRoomNumber()) 
                && roomRepository.existsByRoomNumber(roomDetails.getRoomNumber())) {
            throw new RuntimeException("Room number already exists");
        }

        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setRoomType(roomDetails.getRoomType());
        room.setCapacity(roomDetails.getCapacity());
        room.setPrice(roomDetails.getPrice());
        room.setFloor(roomDetails.getFloor());
        room.setAmenities(roomDetails.getAmenities());
        room.setStatus(roomDetails.getStatus());

        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        roomRepository.delete(room);
    }

    public Room updateOccupancy(Long roomId, int change) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        int newOccupancy = room.getCurrentOccupancy() + change;
        if (newOccupancy < 0 || newOccupancy > room.getCapacity()) {
            throw new RuntimeException("Invalid occupancy change");
        }

        room.setCurrentOccupancy(newOccupancy);
        if (newOccupancy >= room.getCapacity()) {
            room.setStatus("FULL");
        } else {
            room.setStatus("AVAILABLE");
        }

        return roomRepository.save(room);
    }
}
