import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, EntityType } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(Fournisseur)
    private fournisseurRepository: Repository<Fournisseur>,
    private paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cette adresse email existe déjà');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.userRepository
      .createQueryBuilder('user');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(user.nomComplet ILIKE :search OR user.email ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: false });
    }

    // Add role filter
    if (paginationDto['role']) {
      queryBuilder.andWhere('user.role = :role', { role: paginationDto['role'] });
    }

    // Add entity type filter
    if (paginationDto['entiteType']) {
      queryBuilder.andWhere('user.entiteType = :entiteType', { entiteType: paginationDto['entiteType'] });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`user.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    
    // Populate entity details for each user
    const data = await Promise.all(users.map(async (user) => {
      if (user.entiteType === EntityType.STATION && user.entiteId) {
        const station = await this.stationRepository.findOne({
          where: { id: user.entiteId },
          select: ['id', 'nom', 'identifiantInterne']
        });
        if (station) {
          (user as any).station = station;
        }
      } else if (user.entiteType === EntityType.FOURNISSEUR && user.entiteId) {
        const fournisseur = await this.fournisseurRepository.findOne({
          where: { id: user.entiteId },
          select: ['id', 'nom', 'siret', 'type']
        });
        if (fournisseur) {
          (user as any).fournisseur = fournisseur;
        }
      }
      return user;
    }));

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Populate entity details
    if (user.entiteType === EntityType.STATION && user.entiteId) {
      const station = await this.stationRepository.findOne({
        where: { id: user.entiteId },
        select: ['id', 'nom', 'identifiantInterne']
      });
      if (station) {
        (user as any).station = station;
      }
    } else if (user.entiteType === EntityType.FOURNISSEUR && user.entiteId) {
      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id: user.entiteId },
        select: ['id', 'nom', 'siret', 'type']
      });
      if (fournisseur) {
        (user as any).fournisseur = fournisseur;
      }
    }

    return user;
  }

  async findOneWithEntity(id: string): Promise<{ user: User; entity?: Station | Fournisseur }> {
    const user = await this.findOne(id);
    
    let entity: Station | Fournisseur | null = null;
    if (user.entiteType === EntityType.STATION && user.entiteId) {
      entity = await this.stationRepository.findOne({ where: { id: user.entiteId } });
    } else if (user.entiteType === EntityType.FOURNISSEUR && user.entiteId) {
      entity = await this.fournisseurRepository.findOne({ where: { id: user.entiteId } });
    }

    return { user, entity };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cette adresse email existe déjà');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async reactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.userRepository.save(user);
  }
}