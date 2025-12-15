package com.EY.dukandar.Controller;

import com.EY.dukandar.Model.Offer;
import com.EY.dukandar.Service.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    @Autowired
    private OfferService offerService;

    @PostMapping
    public Offer createOffer(@RequestBody Offer offer) {
        return offerService.createOffer(offer);
    }

    @GetMapping("/{id}")
    public Offer getOfferById(@PathVariable Long id) {
        return offerService.getOfferById(id);
    }

    @GetMapping
    public List<Offer> getAllOffers() {
        return offerService.getAllOffers();
    }

    @PutMapping("/{id}")
    public Offer updateOffer(@PathVariable Long id, @RequestBody Offer offer) {
        return offerService.updateOffer(id, offer);
    }

    @DeleteMapping("/{id}")
    public String deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return "Offer deleted successfully.";
    }

    @GetMapping("/active")
    public List<Offer> getActiveOffers() {
        return offerService.getActiveOffers();
    }

    @GetMapping("/eligible/{points}")
    public List<Offer> getEligibleOffers(@PathVariable int points) {
        return offerService.getEligibleOffers(points);
    }
}
