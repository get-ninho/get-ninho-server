import { Injectable } from '@nestjs/common';
import { CreateJobDto } from '../dto/requests/create-job.dto';
import { UpdateJobDto } from '../dto/requests/update-job.dto';

@Injectable()
export class JobsService {
  create(createJobDto: CreateJobDto) {
    return 'This action adds a new job';
  }

  findAll() {
    return `This action returns all jobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
