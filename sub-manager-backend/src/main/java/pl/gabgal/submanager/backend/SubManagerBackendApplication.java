package pl.gabgal.submanager.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubManagerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubManagerBackendApplication.class, args);
	}

}
