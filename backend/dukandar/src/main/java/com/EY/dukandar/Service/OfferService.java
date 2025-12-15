package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Offer;
import java.util.List;

public interface OfferService {
    Offer createOffer(Offer offer);
    Offer updateOffer(Long id, Offer offer);
    void deleteOffer(Long id);
    Offer getOfferById(Long id);
    List<Offer> getAllOffers();
    List<Offer> getActiveOffers();
    List<Offer> getEligibleOffers(int loyaltyPoints);
}
