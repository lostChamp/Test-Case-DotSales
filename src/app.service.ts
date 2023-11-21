import { Injectable } from '@nestjs/common';
import * as process from "process";
import axios from "axios";

@Injectable()
export class AppService {
     async checkContactsAndCreateDeal(clientEmail: string, clientPhone: string, clientName: string) {
        const routeByEmail = process.env.ADMIN_URI + `api/v4/contacts?query=${clientEmail}`;
        const routeByPhone = process.env.ADMIN_URI + `api/v4/contacts?query=${clientPhone}`;
        const token = process.env.ACCESS_TOKEN;
        const resByEmail = await axios.get(routeByEmail, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
         const resByPhone = await axios.get(routeByPhone, {
             headers: {
                 Authorization: `Bearer ${token}`,
             }
         });
         let clientId;
         if(resByEmail.data !== '') {
             clientId = resByEmail["data"]["_embedded"]["contacts"][0]["id"];
         }
         if(resByPhone.data !== '') {
             clientId = resByPhone["data"]["_embedded"]["contacts"][0]["id"];
         }
         if(resByEmail.data === '' && resByPhone.data === '') {
             const resCreateUser = await this.createUser(clientPhone, clientEmail, clientName);
             const clientId = resCreateUser["data"]["_embedded"]["contacts"][0]["id"];
             const resFromCreateDeal = await this.createDeal(clientId);
             return resFromCreateDeal;
         }

         await this.updateUserData(clientId, clientEmail, clientName, clientPhone);
         const resFromCreateDeal = await this.createDeal(clientId);
         return resFromCreateDeal;
    }

    async createDeal(clientId: number) {
         const route = process.env.ADMIN_URI + `/api/v4/leads`;
         const token = process.env.ACCESS_TOKEN;
         const resDeal = await axios.post(route, [
             {
                 name: "Test deal",
                 _embedded: {
                     contacts: [
                         {
                             id: clientId
                         }
                     ]
                 }
             }
         ], {
             headers: {
                 Authorization: `Bearer ${token}`,
             }
         });

         return resDeal;
    }

    async updateUserData(idContact: number, clientEmail: string, clientName: string, clientPhone: string) {
        const route = process.env.ADMIN_URI + `api/v4/contacts/${idContact}`;
        const token = process.env.ACCESS_TOKEN;
        const arrayName = clientName.match(/[A-Z][a-z]+/g);;
        const firstName = arrayName[0];
        const lastName = arrayName[1];
        const resUpdate = await axios.patch(route, {
                id: idContact,
                first_name: firstName,
                last_name: lastName,
                custom_fields_values: [
                    {
                        field_code: "PHONE",
                        field_name: "Телефон",
                        values: [
                            {
                                value: clientPhone,
                                enum_code: "WORK",
                            }
                        ]
                    },
                    {
                        field_code: "EMAIL",
                        field_name: "Email",
                        values: [
                            {
                                value: clientEmail,
                                enum_code: "WORK",
                            }
                        ]
                    },
                ],
            }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return resUpdate;
    }

    async createUser(clientPhone: string, clientEmail: string, clientName: string) {
        const route = process.env.ADMIN_URI + `api/v4/contacts`;
        const token = process.env.ACCESS_TOKEN;
        const arrayName = clientName.match(/[A-Z][a-z]+/g);
        const firstName = arrayName[0];
        const lastName = arrayName[1];
        const resCreate = await axios.post(route, [
            {
                first_name: firstName,
                last_name: lastName,
                custom_fields_values: [
                    {
                        field_id: 1452061,
                        values: [
                            {
                                value: clientPhone
                            }
                        ]
                    },
                    {
                        field_id: 1452063,
                        values: [
                            {
                                value: clientEmail
                            }
                        ]
                    },
                ],
            }
        ], {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return resCreate;
    }

    async getAccessToken(authorizationCode: string) {
        const axiosInstance = axios.create({
            baseURL: process.env.ADMIN_URI_FOR_AUTH
        });
        const route = "access_token?=" + process.env.SESSION_KEY;
        const resAccessToken = await axiosInstance.post(route, {
            client_id: process.env.ID_INTEGRATION,
            client_secret: process.env.SECRET_KEY,
            grant_type: "authorization_code",
            code: authorizationCode,
            redirect_uri: process.env.REDIRECT_URI
        });

        return resAccessToken.data;
    }

    async getNewAccessTokenByRefresh() {
        const axiosInstance = axios.create({
            baseURL: process.env.ADMIN_URI_FOR_AUTH
        });
        const route = "access_token?=" + process.env.SESSION_KEY;
        const resAccessTokenByRefresh = await axiosInstance.post(route, {
            client_id: process.env.ID_INTEGRATION,
            client_secret: process.env.SECRET_KEY,
            grant_type: "refresh_token",
            refresh_token: process.env.REFRESH_TOKEN,
            redirect_uri: process.env.REDIRECT_URI
        });

        return resAccessTokenByRefresh.data;
    }
}
