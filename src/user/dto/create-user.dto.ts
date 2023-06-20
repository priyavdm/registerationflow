import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches,} from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    gender: string;
}
