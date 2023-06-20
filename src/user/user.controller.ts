import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import e, {Request,Response} from 'express';
import * as bcrypt from 'bcryptjs';
import { NodemailerService } from 'src/nodemailer.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private nodemailer:NodemailerService) {}

  @Post('/insert')
  async create(@Req() req:Request, @Res() res:Response, @Body() body: any) {
   
        try{ 
   console.log(body);
   
          let name=body.name;
          let email=body.email;
          let password=body.password;
          let gender=body.gender;

          let getuser=await this.userService.findOne(email); 
          // console.log(getuser);  

      if(getuser){
        if(getuser.isVerified==true){
          res.status(HttpStatus.OK).json({
            message:"User already exists"
          });
      
        }
        else{
          let code = await this.nodemailer.generateVerificationCode();
          console.log(code);
          await this.userService.updateemail(email,code);
          await this.nodemailer.sendMail(email,code);
          res.status(HttpStatus.OK).json({
            message:"Verify your email"
          });
          }
      }

      else{
        let hashpassword=await bcrypt.hash(password,10);
        body.password=hashpassword; 

        const code = await this.nodemailer.generateVerificationCode();

        // let verifyotp=await this.nodemailer.generateVerificationCode();
        body.otp=code;
        
        console.log(code);
        console.log('welcome');
           
        let user=await this.userService.create(body);
        
        await this.nodemailer.sendMail(email,code);
        
        res.status(HttpStatus.OK).json({
          message:"User created successfully"
        });

      }
    } 
    catch(error){
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:"something went wrong"});
    }            
  }

  @Post('/otpverify')
  async otpverify(@Req() req:Request, @Res() res:Response, @Body() body: any) {
    try{
      const email=body.email;
      let otp=parseInt(body.otp);
      console.log(otp);
      console.log(email);
      
      let getuser=await this.userService.findOne(email);
      console.log(getuser);
      
      if(getuser){
      
       if(otp==getuser.otp){
        console.log(getuser.otp);
        console.log(otp);
        res.status(HttpStatus.OK).json({
          message:"OTP verified successfully"
        });
        await this.userService.updateotp(getuser.id,{otp:null});
        await this.userService.updateisverified(getuser.id,{isVerified:true});

      }
        
        else{
          res.status(HttpStatus.BAD_REQUEST).json({
            message:"Invalid OTP"
          });
        }
      }
      else{
        res.status(HttpStatus.BAD_REQUEST).json({
          message:"User not found"
        });
      }
    }
    catch(error){
      // res.json({status:500,message:"something went wrong"});
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:"something went wrong"
      });
        
      }
  }

  @Post('/login')
  async login(@Req() req:Request, @Res() res:Response, @Body() body: any) {
    try{
      const email=body.email;
      const password=body.password;
      console.log(email);

      let getuser=await this.userService.getlogindata(email);
      console.log(getuser);
      let loginuser=getuser.loginCount;
      if(getuser.loginCount < 3){
      if(getuser){
          if(await bcrypt.compare(password,getuser.password)){
            if(getuser.isVerified==true){
              res.status(HttpStatus.OK).json({
                message:"User logged in successfully"
              });
            }
          // res.json({status:200,message:"User logged in successfully",data:getuser});
          else{
            res.status(HttpStatus.BAD_REQUEST).json({
              message: 'Verify your email'
            });
          }
        }
      else{
        loginuser=loginuser+1;
        const currentTime:string=getCurrentTime();
        await this.userService.logincount(getuser.id,loginuser);
        await this.userService.updatelogintime(getuser.id,currentTime);
        // res.json({status:404,message:"Invalid username or password"});
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid username or password'
        });
      }}
      else{
        // res.json({status:404,message:"Invalid username or password"});
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid username or password'
        });
      }
    }
  
      else{
        let getnowtime :any=getCurrentTime();
        let unblockAccount: any = parseInt(getnowtime) - parseInt(getuser.lastLogin);
        // let unblockAccount: any = getTimeDifferenceInMinutes(new Date(logindata.logintime), new Date(getnowtime));
        console.log(parseInt(getnowtime));

        console.log(parseInt(getuser.lastLogin));
        console.log(parseInt(unblockAccount));

        if (unblockAccount > 1 || unblockAccount < -1){
          console.log('unblock');
          
          await this.userService.logincount(getuser.id, 0);
          await this.userService.updatelogintime(getuser.id, 0);
            return;
        }
        else {
          res.status(HttpStatus.BAD_REQUEST).json({
           message: 'login Timeout,Try after sometime',

          });

        }
      }
  }
    catch(error){
      // res.json({status:500,message:"something went wrong"});
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'something went wrong'
    })
  }
}

  @Post('/forgotemail')
  async forgotemail(@Req() req:Request, @Res() res:Response, @Body() body: any) {
    try{
      const email=body.email;
      console.log(email);
      let getuser=await this.userService.findOne(email);
      console.log(getuser);
      
      if(getuser){
        let code=await this.nodemailer.generateVerificationCode();
        console.log(code);
        await this.userService.updateemail(getuser.email,code);
        await this.nodemailer.sendMail(body.email,code);
        res.status(HttpStatus.OK).json({
          message:"OTP sent successfully"
        });
      }
      else{
        res.status(HttpStatus.BAD_REQUEST).json({
          message:"User not found"
        });
      }
    }
    catch(error){
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:"something went wrong"
      });
    }
  }

  @Post('/forgototp')
  async forgototp(@Req() req:Request, @Res() res:Response, @Body() body: any) {
    try{
      const email=body.email;
      console.log(email);
      
      let otp=parseInt(body.otp);
      console.log(otp);
      

      let getuser=await this.userService.findOne(email);
      console.log(getuser);
      if(getuser){
        if(getuser.otp==otp){
          // await this.userService.updateotp(getuser.id,{otp:null});
          await this.userService.updateisverified(getuser.id,{isVerified:true});
          res.status(HttpStatus.OK).json({
            message:"OTP verified successfully"
          });
        }
        else{
          res.status(HttpStatus.BAD_REQUEST).json({
            message:"Invalid OTP"
          });
        }
      }
    }
    catch(error){
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:"something went wrong"
      });
    }
  }

@Post('/changePassword')
async changePassword(@Req() req:Request, @Res() res:Response, @Body() body: any) {
  try{
    const email=body.email;
    console.log(email);
    let getuser=await this.userService.findOne(email);
    console.log(getuser);
    if(getuser){
      let hashpassword=await bcrypt.hash(body.password,10);
      await this.userService.updatepassword(getuser.id,{password:hashpassword});
      res.status(HttpStatus.OK).json({
        message:"Password changed successfully"
      });
    }
    else{
      res.status(HttpStatus.BAD_REQUEST).json({
        message:"User not found"
      });
    }
  }
  catch(error){
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message:"something went wrong"
    });
  }
}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

function getCurrentTime() {

 const now:Date = new Date();
 const hours:number = now.getHours();
  const minutes:number = now.getMinutes();
  const seconds:number = now.getSeconds();

  const time:string = `${padZero(minutes)}:${padZero(seconds)}`;
  return time;
}

function padZero(value:number):string {
  return value.toString().padStart(2, '0');
}
