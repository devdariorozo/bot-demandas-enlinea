// Responsabilidad: fachada de aplicación que usará el controller.

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AttentionSchedule } from '@domain/entities/attentionSchedule.entities';
import {
  ATTENTION_SCHEDULE_REPOSITORY,
  AttentionScheduleRepository,
  CreateAttentionScheduleInput,
} from '@domain/ports/attentionSchedule.ports';
import { PORTFOLIO_TYPE_REPOSITORY, PortfolioTypeRepository } from '@domain/ports/portfolioType.ports';
import { CAMPaING_TYPE_REPOSITORY, CampaingTypeRepository } from '@domain/ports/campaingType.ports';
import { STATE_TYPE_REPOSITORY, StateTypeRepository } from '@domain/ports/stateType.ports';
import { PortfolioTypeId } from '@domain/value-objects/portfolioType.valueobjects';
import { CampaingTypeId } from '@domain/value-objects/campaingType.valueobjects';
import { StateTypeId } from '@domain/value-objects/stateType.valueobjects';
import { capitalizeFirstWord } from '@application/utils/string.utils';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

@Injectable()
export class AttentionScheduleService {
  constructor(
    @Inject(ATTENTION_SCHEDULE_REPOSITORY)
    private readonly attentionScheduleRepository: AttentionScheduleRepository,
    @Inject(PORTFOLIO_TYPE_REPOSITORY)
    private readonly portfolioTypeRepository: PortfolioTypeRepository,
    @Inject(CAMPaING_TYPE_REPOSITORY)
    private readonly campaingTypeRepository: CampaingTypeRepository,
    @Inject(STATE_TYPE_REPOSITORY)
    private readonly stateTypeRepository: StateTypeRepository,
  ) {}

  // Crear un nuevo horario de atención
  async create(input: CreateAttentionScheduleInput): Promise<AttentionSchedule> {
    // Validar IDs positivos
    try {
      PortfolioTypeId.create(input.portfolio_type_id);
      CampaingTypeId.create(input.campaing_type_id);
      StateTypeId.create(input.state_type_id);
    } catch {
      throw new BadRequestException('All foreign keys must be positive integers');
    }

    // Validar existencia en BD
    try {
      await this.portfolioTypeRepository.findById(input.portfolio_type_id);
      await this.campaingTypeRepository.findById(input.campaing_type_id);
      await this.stateTypeRepository.findById(input.state_type_id);
    } catch {
      throw new NotFoundException('One or more related records not found');
    }

    // Validar formato y rango de horas
    const start = timeToMinutes(input.start_time);
    const end = timeToMinutes(input.end_time);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new BadRequestException('start_time and end_time must be valid HH:mm');
    }
    if (start >= end) {
      throw new BadRequestException('start_time must be before end_time');
    }

    // Validar solapamiento: para misma cartera/campaña/día
    const existingForDay = await this.attentionScheduleRepository.findByPortfolioCampaingAndDay(
      input.portfolio_type_id,
      input.campaing_type_id,
      input.day_of_week,
    );

    const overlaps = existingForDay.some((schedule) => {
      const s = timeToMinutes(schedule.start_time);
      const e = timeToMinutes(schedule.end_time);
      return start < e && end > s;
    });

    if (overlaps) {
      throw new ConflictException('Schedule overlaps with existing range for this portfolio/campaing/day');
    }

    const normalizedInput = { ...input, detail: capitalizeFirstWord(input.detail) };
    try {
      return await this.attentionScheduleRepository.create(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error creating attention schedule');
    }
  }

  // Obtener todos los horarios de atención
  async findAll(): Promise<AttentionSchedule[]> {
    try {
      return await this.attentionScheduleRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error getting all attention schedules');
    }
  }

  // Obtener un horario de atención por su id
  async findById(id: number): Promise<AttentionSchedule> {
    try {
      const sc = await this.attentionScheduleRepository.findById(id);
      const [portfolio, campaing, state] = await Promise.all([
        this.portfolioTypeRepository.findById(sc.portfolio_type_id),
        this.campaingTypeRepository.findById(sc.campaing_type_id),
        this.stateTypeRepository.findById(sc.state_type_id),
      ]);

      return {
        id: sc.id,
        portfolio_type_id: sc.portfolio_type_id,
        portfolio_type_name: portfolio.type,
        campaing_type_id: sc.campaing_type_id,
        campaing_type_name: campaing.type,
        day_of_week: sc.day_of_week,
        shiftType: sc.shiftType,
        start_time: sc.start_time,
        end_time: sc.end_time,
        detail: sc.detail,
        state_type_id: sc.state_type_id,
        state_type_name: state.type,
        created_at: sc.created_at,
        updated_at: sc.updated_at,
        responsible: sc.responsible,
      };
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
  }

  // Obtener horarios por combinación cartera/campaña (todos los días)
  async findByPortfolioAndCampaing(portfolio_type_id: number, campaing_type_id: number): Promise<AttentionSchedule[]> {
    const all = await this.attentionScheduleRepository.findAll();
    return all.filter(
      (sc) => sc.portfolio_type_id === portfolio_type_id && sc.campaing_type_id === campaing_type_id,
    );
  }

  // Actualizar un horario de atención
  async update(input: AttentionSchedule): Promise<AttentionSchedule> {
    // Validar IDs positivos
    try {
      PortfolioTypeId.create(input.portfolio_type_id);
      CampaingTypeId.create(input.campaing_type_id);
      StateTypeId.create(input.state_type_id);
    } catch {
      throw new BadRequestException('All foreign keys must be positive integers');
    }

    let existing: AttentionSchedule;
    try {
      existing = await this.attentionScheduleRepository.findById(input.id);
    } catch {
      throw new NotFoundException('No data found for the given id');
    }

    const start = timeToMinutes(input.start_time);
    const end = timeToMinutes(input.end_time);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new BadRequestException('start_time and end_time must be valid HH:mm');
    }
    if (start >= end) {
      throw new BadRequestException('start_time must be before end_time');
    }

    // Validar solapamiento excluyendo el propio registro
    const existingForDay = await this.attentionScheduleRepository.findByPortfolioCampaingAndDay(
      input.portfolio_type_id,
      input.campaing_type_id,
      input.day_of_week,
    );

    const overlaps = existingForDay
      .filter((sc) => sc.id !== input.id)
      .some((schedule) => {
        const s = timeToMinutes(schedule.start_time);
        const e = timeToMinutes(schedule.end_time);
        return start < e && end > s;
      });

    if (overlaps) {
      throw new ConflictException('Schedule overlaps with existing range for this portfolio/campaing/day');
    }

    const normalizedInput = { ...input, detail: capitalizeFirstWord(input.detail) };
    const hasChanges =
      existing.portfolio_type_id !== normalizedInput.portfolio_type_id ||
      existing.campaing_type_id !== normalizedInput.campaing_type_id ||
      existing.day_of_week !== normalizedInput.day_of_week ||
      existing.shiftType !== normalizedInput.shiftType ||
      existing.start_time !== normalizedInput.start_time ||
      existing.end_time !== normalizedInput.end_time ||
      existing.detail !== normalizedInput.detail ||
      existing.state_type_id !== normalizedInput.state_type_id ||
      existing.responsible !== normalizedInput.responsible;

    if (!hasChanges) {
      throw new BadRequestException('No changes to update');
    }
    try {
      return await this.attentionScheduleRepository.update(normalizedInput);
    } catch (error) {
      throw new InternalServerErrorException('Error updating attention schedule');
    }
  }

  // Eliminar un horario de atención
  async delete(id: number): Promise<void> {
    try {
      await this.attentionScheduleRepository.findById(id);
    } catch (error) {
      throw new NotFoundException('No data found for the given id');
    }
    try {
      await this.attentionScheduleRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting attention schedule');
    }
  }
}

