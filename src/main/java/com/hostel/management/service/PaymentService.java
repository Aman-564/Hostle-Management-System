package com.hostel.management.service;

import com.hostel.management.entity.Booking;
import com.hostel.management.entity.Payment;
import com.hostel.management.repository.BookingRepository;
import com.hostel.management.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByIdDesc();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Payment createPayment(Payment payment) {
        Booking booking = bookingRepository.findById(payment.getBooking().getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        payment.setBooking(booking);
        payment.setPaymentDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : LocalDate.now());
        payment.setStatus("SUCCESS");

        Payment savedPayment = paymentRepository.save(payment);

        updateBookingPaymentStatus(booking.getId());

        return savedPayment;
    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setAmount(paymentDetails.getAmount());
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        payment.setTransactionId(paymentDetails.getTransactionId());
        payment.setStatus(paymentDetails.getStatus());
        payment.setRemarks(paymentDetails.getRemarks());

        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        paymentRepository.delete(payment);
    }

    private void updateBookingPaymentStatus(Long bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        double totalPaid = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();

        if (totalPaid >= booking.getTotalAmount()) {
            booking.setPaymentStatus("PAID");
        } else if (totalPaid > 0) {
            booking.setPaymentStatus("PARTIAL");
        }

        bookingRepository.save(booking);
    }
}
