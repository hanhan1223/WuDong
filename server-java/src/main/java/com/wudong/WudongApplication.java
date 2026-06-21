package com.wudong;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WudongApplication {

    public static void main(String[] args) {
        SpringApplication.run(WudongApplication.class, args);
    }
}
