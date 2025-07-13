import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const newBusiness = new this.businessModel(createBusinessDto);
    return newBusiness.save();
  }

  async findAll(): Promise<Business[]> {
    return this.businessModel.find().exec();
  }

  async findOne(id: string): Promise<Business> {
    return this.businessModel.findById(id).exec();
  }

  async findByOwner(ownerId: string): Promise<Business[]> {
    return this.businessModel.find({ owner: ownerId }).exec();
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<Business> {
    return this.businessModel.findByIdAndUpdate(id, updateBusinessDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Business> {
    return this.businessModel.findByIdAndDelete(id).exec();
  }
}
