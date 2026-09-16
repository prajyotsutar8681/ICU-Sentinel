import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3001);

  console.log('🏥 ICU Simulator API started on http://localhost:3001');
}

bootstrap();