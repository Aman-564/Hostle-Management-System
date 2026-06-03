package com.hostel.management.repository;

import com.hostel.management.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudentId(Long studentId);
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByStatus(String status);
    Optional<Booking> findActiveBookingByStudentId(Long studentId);
    Optional<Booking> findActiveBookingByRoomId(Long roomId);
}
