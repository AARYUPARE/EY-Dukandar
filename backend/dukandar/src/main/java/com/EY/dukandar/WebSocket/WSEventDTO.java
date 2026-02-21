package com.EY.dukandar.WebSocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WSEventDTO {
    private String eventType;
    private Map<String, Object> data;
}
