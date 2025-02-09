import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class MongoDBModule {
  static forRoot(): DynamicModule {
    return {
      module: MongoDBModule,
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const user = configService.get<string>('MONGO_USER');
            const pass = configService.get<string>('MONGO_PASS');
            const host = configService.get<string>('MONGO_HOST');
            const db = configService.get<string>('MONGO_DB');
            const uri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;

            // Safer logging without credentials
            console.log('MongoDB Connection Details:', {
              host: host,
              database: db,
              connected: true,
            });

            return {
              uri: uri,
            };
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
