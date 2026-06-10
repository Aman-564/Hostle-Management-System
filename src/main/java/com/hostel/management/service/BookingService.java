package com.hostel.management.service;

import com.hostel.management.entity.Booking;
import com.hostel.management.entity.Room;
import com.hostel.management.entity.Student;
import com.hostel.management.repository.BookingRepository;
import com.hostel.management.repository.RoomRepository;
import com.hostel.management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomService roomService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByStudent(Long studentId) {
        return bookingRepository.findByStudentId(studentId);
    }

    public List<Booking> getBookingsByRoom(Long roomId) {
        return bookingRepository.findByRoomId(roomId);
    }

    public List<Booking> getActiveBookings() {
        return bookingRepository.findByStatus("ACTIVE");
    }

    public Booking createBooking(Booking booking) {
        Student student = studentRepository.findById(booking.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Room room = roomRepository.findById(booking.getRoom().getId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getCurrentOccupancy() >= room.getCapacity()) {
            throw new RuntimeException("Room is already full");
        }

        Optional<Booking> existingActiveBooking = bookingRepository.findActiveBookingByStudentId(student.getId());
        if (existingActiveBooking.isPresent()) {
            throw new RuntimeException("Student already has an active booking");
        }

        booking.setStudent(student);
        booking.setRoom(room);
        booking.setCheckInDate(booking.getCheckInDate() != null ? booking.getCheckInDate() : LocalDate.now());
        booking.setStatus("ACTIVE");
        booking.setPaymentStatus("PENDING");
        booking.setTotalAmount(room.getPrice());

        Booking savedBooking = bookingRepository.save(booking);

        roomService.updateOccupancy(room.getId(), 1);

        return savedBooking;
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setCheckOutDate(bookingDetails.getCheckOutDate());
        booking.setStatus(bookingDetails.getStatus());
        booking.setPaymentStatus(bookingDetails.getPaymentStatus());
        booking.setTotalAmount(bookingDetails.getTotalAmount());

        return bookingRepository.save(booking);
    }

    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CANCELLED".equals(booking.getStatus()) || "COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel this booking");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        roomService.updateOccupancy(booking.getRoom().getId(), -1);
    }

    public void checkoutBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not active");
        }

        booking.setStatus("COMPLETED");
        booking.setCheckOutDate(LocalDate.now());
        bookingRepository.save(booking);

        roomService.updateOccupancy(booking.getRoom().getId(), -1);
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        bookingRepository.delete(booking);
    }
}
