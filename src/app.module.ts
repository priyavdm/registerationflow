import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserdetailsModule } from './userdetails/userdetails.module';
import { NodemailerService } from "src/nodemailer.service";

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        envFilePath: '.env',
      }
      ),
      TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: false,
      autoLoadEntities: true,
      }),

    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService,NodemailerService],
})
export class AppModule {}
