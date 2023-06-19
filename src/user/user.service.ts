import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  
  constructor(@InjectRepository(User) public userRepository:Repository <User>){}
  async create(body: any) {
    // return 'This action adds a new user';
     return await this.userRepository.save(body);
  }

  findAll() {
    return `This action returns all user`;
  }

 async findOne(email: any) {
    // return `This action returns a #${id} user`;
    return this.userRepository.findOne({where: {email:email}, select:['id','name','email','password','gender','otp']});
  }
  async getlogindata(email: any) {

    return this.userRepository.findOne({where: {email:email,isVerified:true}, select:['id','name','email','password','gender','otp','isVerified']});
  }

  async update(email:string, otp: any) {
    return this.userRepository.update({email},{otp});
  }

  async updateotp(id:any,otp:any){
    return this.userRepository.update(id,{otp});
  }

 async updateisverified(id:any,isVerified:any){
    return this.userRepository.update(id,isVerified);
  }

  async updateemail(email:string,code:any){
    return this.userRepository.update({email},{otp:code});
  }

  async updatepassword(id:any,password:any){
    return this.userRepository.update(id,{password});
  }

  

  // async updateisVerified(id: number, isVerified: any) {
  //  return this.userRepository.update(id,isVerified);
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
