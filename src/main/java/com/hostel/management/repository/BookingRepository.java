package com.hostel.management.repository;

import com.hostel.management.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudentId(Long studentId);
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByStatus(String status);
    
    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId AND b.status = 'ACTIVE'")
    Optional<Booking> findActiveBookingByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status = 'ACTIVE'")
    Optional<Booking> findActiveBookingByRoomId(@Param("roomId") Long roomId);
}
