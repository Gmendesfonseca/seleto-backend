// Address model
export * from './address.model';
// The model class wins over the same-named interface exported by './interfaces/address.interface'
export { Address } from './address.model';

// Address interfaces
export * from './interfaces/address.interface';
export * from './interfaces/address.service.interface';

// Address DTOs
export * from './dto/address.dto';

// Address repositories
export * from './repositories/address.repository.interface';

// Address module
export { AddressModule } from './address.module';

// Address controller
export { AddressController } from './address.controller';

// Address service
export { AddressService } from './address.service';
