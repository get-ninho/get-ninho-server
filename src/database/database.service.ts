import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {}

  async getUniqueConstraints(entityName: string): Promise<any[]> {
    const entityMetadata = this.dataSource.getMetadata(entityName);
    const uniques = entityMetadata.indices.map((u) => ({
      name: u.name,
      columns: u.columns.map((column) => column.propertyName),
    }));

    return uniques;
  }
}
