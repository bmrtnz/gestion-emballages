import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from './entities/user.entity';
import { EntityType, UserRole } from '@common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { EmailService } from '@common/services/email.service';
import { Station } from '@modules/stations/entities/station.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';

// Interface for user with populated relationships
interface UserWithRelations extends User {
  station?: { id: string; name: string; internalIdentifier?: string };
  supplier?: { id: string; name: string; siret?: string };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    private paginationService: PaginationService,
    private emailService: EmailService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cette adresse email existe déjà');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      phone: createUserDto.phone,
      role: createUserDto.role,
      entityType: createUserDto.entityType,
      entityId: createUserDto.entityId,
      hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC',
    });

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where('(user.full_name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${paginationDto.search}%`,
      });
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
    if (paginationDto['entityType']) {
      queryBuilder.andWhere('user.entityType = :entityType', { entityType: paginationDto['entityType'] });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`user.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Populate entity details for each user
    const data = await Promise.all(
      users.map(async user => {
        if (user.entityType === EntityType.STATION && user.entityId) {
          const station = await this.stationRepository.findOne({
            where: { id: user.entityId },
            select: ['id', 'name', 'internalId'],
          });
          if (station) {
            (user as UserWithRelations).station = {
              id: station.id,
              name: station.name,
              internalIdentifier: station.internalId,
            };
            this.logger.debug(`Added station to user: ${user.email}`);
          }
        } else if (user.entityType === EntityType.SUPPLIER && user.entityId) {
          const supplier = await this.supplierRepository.findOne({
            where: { id: user.entityId },
            select: ['id', 'name', 'siret', 'specialties'],
          });
          if (supplier) {
            (user as UserWithRelations).supplier = {
              id: supplier.id,
              name: supplier.name,
              siret: supplier.siret,
            };
            this.logger.debug(`Added supplier to user: ${user.email}`);
          }
        }
        return user;
      })
    );

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Populate entity details
    if (user.entityType === EntityType.STATION && user.entityId) {
      const station = await this.stationRepository.findOne({
        where: { id: user.entityId },
        select: ['id', 'name', 'internalId'],
      });
      if (station) {
        (user as User & { station: { id: string; name: string; internalIdentifier: string } }).station = {
          id: station.id,
          name: station.name,
          internalIdentifier: station.internalId,
        };
      }
    } else if (user.entityType === EntityType.SUPPLIER && user.entityId) {
      const supplier = await this.supplierRepository.findOne({
        where: { id: user.entityId },
        select: ['id', 'name', 'siret', 'specialties'],
      });
      if (supplier) {
        (user as User & { supplier: { id: string; name: string; siret?: string; specialties?: string } }).supplier = {
          id: supplier.id,
          name: supplier.name,
          siret: supplier.siret,
          specialties: supplier.specialties,
        };
      }
    }

    return user;
  }

  async findOneWithEntity(id: string): Promise<{ user: User; entity?: Station | Supplier }> {
    const user = await this.findOne(id);

    let entity: Station | Supplier | null = null;
    if (user.entityType === EntityType.STATION && user.entityId) {
      entity = await this.stationRepository.findOne({ where: { id: user.entityId } });
    } else if (user.entityType === EntityType.SUPPLIER && user.entityId) {
      entity = await this.supplierRepository.findOne({ where: { id: user.entityId } });
    }

    return { user, entity };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cette adresse email existe déjà');
      }
    }

    // Handle role change logic
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      // If changing to a role that doesn't require an entity (ADMIN, MANAGER, HANDLER)
      if ([UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER].includes(updateUserDto.role)) {
        updateUserDto.entityId = null;
        updateUserDto.entityType = null;
      }
      // If changing to STATION role, ensure entityType is STATION
      else if (updateUserDto.role === UserRole.STATION) {
        updateUserDto.entityType = EntityType.STATION;
      }
      // If changing to SUPPLIER role, ensure entityType is SUPPLIER
      else if (updateUserDto.role === UserRole.SUPPLIER) {
        updateUserDto.entityType = EntityType.SUPPLIER;
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

  async sendPasswordResetLink(email: string): Promise<{ message: string }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException("Format d'email invalide");
    }

    // Find user (only active users can reset passwords)
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    // For security reasons, always return success message
    // even if user doesn't exist (prevents email enumeration)
    if (!user) {
      return { message: `Lien de réinitialisation envoyé à ${email}` };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store reset token (you would typically have a separate PasswordResetToken entity)
    // For now, we'll store it in the user entity temporarily
    user.resetToken = resetToken;
    user.resetTokenExpiry = expiresAt;
    await this.userRepository.save(user);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.fullName);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error.stack);
      // Don't expose email sending errors to client for security
    }

    return { message: `Lien de réinitialisation envoyé à ${email}` };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Validate inputs
    if (!token || !newPassword) {
      throw new BadRequestException('Token et mot de passe requis');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
    }

    // Find user with valid token
    const user = await this.userRepository.findOne({
      where: {
        resetToken: token,
        isActive: true,
      },
    });

    if (!user?.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    user.hashedPassword = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
