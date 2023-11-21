import {Controller, Get, Param, Req} from '@nestjs/common';
import { AppService } from './app.service';
import {Request} from "express";
import {ApiOperation} from "@nestjs/swagger";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("")
  @ApiOperation({ summary: 'Creation integration and receipt of access token' })
  async getAccessToken(@Req() request: Request) {
    const code = String(request["query"]["code"]);
    const accessToken = await this.appService.getAccessToken(code);
    console.log(accessToken);
  }

  @Get("/newAccess")
  @ApiOperation({ summary: 'Getting a new access token' })
  async getNewAccessTokenByRefresh() {
    const accessToken = await this.appService.getNewAccessTokenByRefresh();
    return accessToken;
  }

  @Get("/createDeal/:name/:email/:phone")
  @ApiOperation({ summary: 'Creating or updating a user. Creating a funnel with it' })
  async checkContactsAndCreateDeal(
      @Param("name") clientName: string,
      @Param("email") clientEmail: string,
      @Param("phone") clientPhone: string
  ) {
    await this.appService.checkContactsAndCreateDeal(clientEmail, clientPhone, clientName);
  }



}
