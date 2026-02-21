package com.EY.dukandar.Model;

import lombok.Data;
import org.springframework.web.bind.annotation.RequestParam;

@Data
public class SendImageRequest {
    public String phone;
    public String caption;
    public byte[] imageBytes;
    public String name;
}
