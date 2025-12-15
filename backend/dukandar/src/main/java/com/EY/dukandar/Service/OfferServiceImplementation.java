package com.EY.dukandar.Service;

import com.EY.dukandar.Model.Offer;
import com.EY.dukandar.Repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferServiceImplementation implements OfferService {

    @Autowired
    private OfferRepository offerRepository;

    @Override
    public Offer createOffer(Offer offer) {
        return offerRepository.save(offer);
    }

    @Override
    public Offer updateOffer(Long id, Offer offerDetails) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offerDetails.getOfferName() != null)
            offer.setOfferName(offerDetails.getOfferName());
        if (offerDetails.getDescription() != null)
            offer.setDescription(offerDetails.getDescription());

        if (offerDetails.getMinPointsRequired() != 0)
            offer.setMinPointsRequired(offerDetails.getMinPointsRequired());

        if (offerDetails.getDiscountPercentage() != 0)
            offer.setDiscountPercentage(offerDetails.getDiscountPercentage());

        offer.setActive(offerDetails.isActive());

        return offerRepository.save(offer);
    }

    @Override
    public void deleteOffer(Long id) {
        offerRepository.deleteById(id);
    }

    @Override
    public Offer getOfferById(Long id) {
        return offerRepository.findById(id).orElse(null);
    }

    @Override
    public List<Offer> searchAllOffers(int loyaltyPoints) {
        return offerRepository.findByActiveTrueAndMinPointsRequiredLessThanEqual(loyaltyPoints);
    }
}
