import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "process";
import {Logger} from "@nestjs/common";
import {DocumentBuilder, SwaggerDocumentOptions, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
      .setTitle('Test Case For DotSales')
      .setDescription('Test Case For DotSales')
      .setVersion('1.0')
      .addTag('DotSales')
      .build();
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 8000;
  await app.listen(port);
  Logger.log(
      `🚀 Application is running on: http://localhost:${port}`
  );
  Logger.log(
      `🚀 Documentation is running on: http://localhost:${port}/api`
  );
}
bootstrap();
