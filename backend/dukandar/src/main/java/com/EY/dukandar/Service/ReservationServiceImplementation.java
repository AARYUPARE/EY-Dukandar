package com.EY.dukandar.Service;

import com.EY.dukandar.LangChain.LangChainClient;
import com.EY.dukandar.Model.Product;
import com.EY.dukandar.Model.Reservation;
import com.EY.dukandar.Repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReservationServiceImplementation implements ReservationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private ProductService productService;

    @Autowired
    LangChainClient langChainClient;

    @Override
    public Reservation createReservation(Long userId, Long productId, String size, Long storeId) {
        Reservation reservation = new Reservation(
                userId,
                productId,
                size,
                storeId,
                "RESERVED"
        );
        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation updateStatus(Long id, String newStatus) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(newStatus);
        return reservationRepository.save(reservation);
    }

    @Override
    public Map<String, Object> auth(Long userId, Long productId, String size, Long storeId)
    {
        Map<String, Object> response = new HashMap<>();

        Reservation reservation = reservationRepository.findByProductIdAndSizeAndStoreIdAndUserId(productId, size, storeId, userId);


        if(reservation == null)
        {
            response.put("status", "FAILED");
            return response;
        }

        response = langChainClient.authDetail(productId, userId);

        response.put("status", "SUCCESS");

        return response;
    }
}
