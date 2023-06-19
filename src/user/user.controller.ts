import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {Request,Response} from 'express';
import * as bcrypt from 'bcryptjs';
import { NodemailerService } from 'src/nodemailer.service';


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
          
      
        res.json({status:404,message:"User already exists"});
        }
        else{
          let code = await this.nodemailer.generateVerificationCode();
          console.log(code);
          await this.userService.updateemail(email,code);
          await this.nodemailer.sendMail(email,code);
          res.status(HttpStatus.OK).json({status:200,message:"Verify your email",data:getuser});
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
        
        res.status(HttpStatus.OK).json({status:200,message:"User created successfully",data:user});

      }
    } 
    catch(error){
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({status:500,message:"something went wrong"});
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
        
        
        res.json({status:200,message:"User logged in successfully"});

        await this.userService.updateotp(getuser.id,{otp:null});
        await this.userService.updateisverified(getuser.id,{isVerified:true});

      }
        
        else{
          res.json({status:404,message:"OTP not verified"});
        }
      }
      else{
        res.json({status:404,message:"User not found"});
      }
    }
    catch(error){
      res.json({status:500,message:"something went wrong"});
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
      if(getuser){
          if(await bcrypt.compare(password,getuser.password)){
            if(getuser.isVerified==true){
              res.json({status:200,message:"User logged in successfully",data:getuser});
            }
          // res.json({status:200,message:"User logged in successfully",data:getuser});
          else{
            res.json({status:404,message:"invalid isverified"});
          }
      }
      else{
        res.json({status:404,message:"Invalid username or password"});
      }
    }
      else{
        res.json({status:404,message:"User not found"});
      }
  }
    catch(error){
      res.json({status:500,message:"something went wrong"});
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
        res.json({status:200,message:"Otp sent your email",data:getuser});
      }
      else{
        res.json({status:404,message:"User not found"});
      }
    }
    catch(error){
      console.log(error);
      
      res.json({status:500,message:"something went wrong"});
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
          res.json({status:200,message:"OTP verified successfully",data:getuser});
        }
        else{
          res.json({status:404,message:"OTP not verified"});
        }
      }
    }
    catch(error){
      res.json({status:500,message:"something went wrong"});
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
      res.json({status:200,message:"Password changed successfully",data:getuser});
    }
    else{
      res.json({status:404,message:"Invalid password"});
    }
  }
  catch(error){
    res.json({status:500,message:"something went wrong"});
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


function elseif(arg0: boolean) {
  throw new Error('Function not implemented.');
}

