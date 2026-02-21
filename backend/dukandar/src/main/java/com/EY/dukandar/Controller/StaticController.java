package com.EY.dukandar.Controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/static")
public class StaticController {

    private static final String BASE_DIR ="dukandar/uploads/";

    // =====================================================
    // POST: /api/static/save/image
    // =====================================================
    @PostMapping(value = "/save/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String saveImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("name") String name
    ) throws Exception {

        System.out.println("========== SAVE IMAGE DEBUG ==========");

        byte[] bytes = file.getBytes();
        System.out.println("File size: " + bytes.length);

        String folder = resolveFolder(type);
        System.out.println("Folder: " + folder);

        String fileName = name + ".png";

        System.out.println("Base dir: " + BASE_DIR);

        Path path = Paths.get(BASE_DIR + folder + "/" + fileName);

        System.out.println("Full path: " + path.toAbsolutePath());

        Files.createDirectories(path.getParent());

        Files.write(path, bytes);

        System.out.println("File exists after save? " + Files.exists(path));

        System.out.println("======================================");

        return folder + "/" + fileName;
    }



    // =====================================================
    // Folder resolver (scalable)
    // =====================================================
    private String resolveFolder(String type) {

        if (type.equalsIgnoreCase("QR"))
            return "qr";

        else if (type.equalsIgnoreCase("BARCODE"))
            return "barcode";

        else if (type.equalsIgnoreCase("INVOICE"))
            return "invoice";

        else
            return "misc";
    }
}
