import { Body, Controller, Delete, Get, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from './user.entity';
import { Model } from 'mongoose';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DecodedToken } from 'src/common/token.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserService } from './user.service';
import { AppHttpCode } from 'src/common/app-enums';
import { IUser } from './user.class';
import { AllExceptionsHandler } from 'src/common/exception-hanlder.filter';
import { AppGuard, AuthGuard } from 'src/common/all.guards';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(AppGuard, AuthGuard)
@Controller('api/user')
@UseFilters(AllExceptionsHandler)
export class UserController {
  constructor(
    @InjectModel(UserEntity.name) private userModel: Model<UserEntity>,
    private userService: UserService
    // private readonly firebaseService: FirebaseService,
    // private userMetadataService: UserMetadataService,
    // private notifierService: NotifierService,
  ) {}

  // This is replace by the one in init.controller
  @Get('/')
  async getLoggedUserDataOrRegister(@DecodedToken() token: DecodedIdToken, @Res({ passthrough: true }) res): Promise<any> {
    console.log('Getting Data', token);
    const user = await this.userService.findUserById(token.uid);

    if (user) {
      return user;
    } else {
      res.status(AppHttpCode.GoodRefreshToken);
      const user = await this.userService.registerWithToken(token);
      return user;
    }
  }

  @Delete('/')
  async deleteUser(@DecodedToken() token: DecodedIdToken): Promise<any> {
    const user = await this.userService.deleteUser(token.uid);
    return user;
  }

  @Post('/')
  @ApiOperation({ summary: 'Update personal data', description: 'Actualiza solo los datos personales' })
  async updateUser(@Body() user: IUser, @DecodedToken() token: DecodedIdToken): Promise<any> {
    // NOTE: only personalData can be updated
    const { personalData, conversationSettings } = user;
    const userData: Partial<IUser> = { personalData, conversationSettings };

    this.userService.updateUser(token.uid, userData);
    return userData;
  }
}
