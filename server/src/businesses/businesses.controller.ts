import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req) {
    // Add the authenticated user as the owner
    createBusinessDto.owner = req.user.id;
    return this.businessesService.create(createBusinessDto);
  }

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get('my-business')
  @UseGuards(JwtAuthGuard)
  findMyBusinesses(@Request() req) {
    return this.businessesService.findByOwner(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
