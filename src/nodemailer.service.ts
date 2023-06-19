import { Injectable } from '@nestjs/common';
import * as  nodemailer from "nodemailer";

@Injectable()
export class NodemailerService {
private transporter: nodemailer.Transporter;
      constructor() {
     this.transporter = nodemailer.createTransport({
      
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        // secure: false,
        auth: {
            user:  "6a6f2e0437c00b",
            pass: "a1a16f970b948c"

           },
      });
   }
   async sendMail(email,verifyOTP) {

    console.log(email,verifyOTP);
    
       await this.transporter.sendMail({
       
        from: 'priya@gmail.com',
        to:`priya@gmail.com`,
        subject: 'Verify your email address',
        html:`<p>This is your OTP ${verifyOTP} </p>`
    });
 }
   
 generateVerificationCode() {
     const code = (Math.floor(100000 + Math.random() * 900000));
         return code.toString();
}
}
