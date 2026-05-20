package com.marsking.mars_king.models.service;

import com.marsking.mars_king.models.common.ModeCode;
import com.marsking.mars_king.models.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class MaskingService {
	@Autowired
	private PythonClient pythonClient;

	public List<MaskingDto> postPython(ImgRequestDto requestDto) {
		return this.pythonClient.postPython(requestDto);
	}

	/*
	public MaskedImgDto maskingImage(MaskingRequestDto requestDto, ModeCode mode) {
		String base64Image = requestDto.getImage();
		String[] parts = base64Image.split(",");
		String header = parts[0];
		base64Image = parts[1];
		String format = header.split("/")[1].split(";")[0];

		BufferedImage image;
		try {
			byte[] imageBytes = Base64.getDecoder().decode(base64Image);
			ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
			image = ImageIO.read(bis);
			bis.close();
		} catch(IOException e) {
			return new MaskedImgDto(requestDto.getImage());
		}
		if(image == null) {
			return new MaskedImgDto(requestDto.getImage());
		}

		List<PositionDto> positions = requestDto.getPositions();

		// 사각형 그리기
		Graphics2D g2d = image.createGraphics();
		g2d.setColor(Color.BLACK);
		g2d.setStroke(new BasicStroke(1));
		positions.forEach(positionDto -> {
			int x1 = positionDto.getX1();
			int y1 = positionDto.getY1();
			int x2 = positionDto.getX2();
			int y2 = positionDto.getY2();
			if(positionDto.getIsChecked()) {
				g2d.fillRect(x1, y1, (x2 - x1), (y2 - y1));
			} else if (mode == ModeCode.MODE_MASKING) {
				g2d.drawRect(x1, y1, (x2 - x1), (y2 - y1));
			}
		});
		g2d.dispose();

		try {
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			ImageIO.write(image, format, baos); // "png", "jpg"
			byte[] imageBytes = baos.toByteArray();
			baos.close();
			base64Image = Base64.getEncoder().encodeToString(imageBytes);
		} catch(IOException e) {
			return new MaskedImgDto(requestDto.getImage());
		}
		if(base64Image == null) {
			return new MaskedImgDto(requestDto.getImage());
		}
		base64Image = header + "," + base64Image;

		MaskedImgDto result = new MaskedImgDto(base64Image);
		return result;
	}
	*/
}