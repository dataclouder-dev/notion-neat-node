import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseService } from '../common/firebase.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import config from '../config/environment';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]), HttpModule, ConfigModule.forFeature(config)],
  controllers: [UserController],
  providers: [UserService, FirebaseService],
  exports: [UserService, FirebaseService],
})
export class UserModule {}
