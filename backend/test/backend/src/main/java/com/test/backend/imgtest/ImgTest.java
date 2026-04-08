package com.test.backend.imgtest;

/*
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.InputStream;

@Service
public class ImgTest {
	@Autowired
	private ResourceLoader resourceLoader;

	public void loadImage() throws Exception {
		Resource resource = resourceLoader.getResource("classpath:img/test(1).png");

		try (InputStream is = resource.getInputStream()) {
			BufferedImage image = ImageIO.read(is);
			// 이후 그리기 작업 수행...

			// 2. 그래픽 컨텍스트 생성 (붓 잡기)
			Graphics2D g2d = image.createGraphics();

			// 3. 그리기 설정 (색상, 두께 등)
			g2d.setColor(Color.RED); // 선 색상
			g2d.setStroke(new BasicStroke(5)); // 선 두께 5픽셀

			// 4. 좌표 데이터 변환 및 그리기
			// 데이터: {x1: 100, y1: 100, x2: 400, y2: 300} 가정
			int x1 = 100, y1 = 100, x2 = 400, y2 = 300;

			int width = Math.abs(x2 - x1);
			int height = Math.abs(y2 - y1);
			int startX = Math.min(x1, x2);
			int startY = Math.min(y1, y2);

			// 사각형 그리기 (테두리만: drawRect, 채우기: fillRect)
			g2d.drawRect(startX, startY, width, height);

			// 5. 리소스 해제
			g2d.dispose();

			// 3. 물리적 경로 계산 (src/main/resources/img/fixed.png)
			String projectPath = System.getProperty("user.dir");
			File outputFile = new File(projectPath + "/src/main/resources/img/fixed.png");

			// 4. 파일 저장
			ImageIO.write(image, "png", outputFile);

			System.out.println("저장 완료: " + outputFile.getAbsolutePath());

			// 6. 결과 이미지 저장
//			File outputFile = new File("output_rect.jpg");
//			ImageIO.write(image, "jpg", outputFile);

			System.out.println("이미지에 사각형 그리기 완료!");
		} catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
*/

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class ImgTest {
	public static void main(String[] args) {
		try {
			// 1. 리소스 읽기 (앞서 배운 InputStream 방식)
			var is = ImgTest.class.getClassLoader().getResourceAsStream("img/test(1).png");
			if (is == null) return;
			BufferedImage image = ImageIO.read(is);

			// 2. 사각형 그리기 로직
			Graphics2D g2d = image.createGraphics();
			g2d.setColor(Color.RED);
			g2d.setStroke(new BasicStroke(5));
			g2d.drawRect(50, 50, 200, 200); // 예시 좌표
			g2d.dispose();

			// 3. 물리적 경로 계산 (src/main/resources/img/fixed.png)
			String projectPath = System.getProperty("user.dir");
			File outputFile = new File(projectPath + "/src/main/resources/img/fixed.png");

			// 4. 파일 저장
			ImageIO.write(image, "png", outputFile);

			System.out.println("저장 완료: " + outputFile.getAbsolutePath());

		} catch (IOException e) {
			System.out.println(e.getMessage());
		}
	}
}