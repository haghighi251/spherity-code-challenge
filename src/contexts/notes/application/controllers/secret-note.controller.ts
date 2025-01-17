import {
  Controller,
  Post,
  Body,
  HttpCode,
  UsePipes,
  HttpStatus,
  Res,
  Get,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';

import {
  CreateSecretNoteDto,
  CreateSecretNoteSchema,
} from '@contexts/notes/application/dtos/create-secret-note.dto';
import { CreateSecretNoteUseCase } from '@contexts/notes/application/usecases/create-secret-note.usecase';
import { SecretNote } from '@contexts/notes/domain/entities/secret-note.entity';
import { ZodValidationPipe } from '@/shared/infrastructure/nest/pipes/validation.pipe';
import { NoteDomainException } from '@/contexts/shared/domain/note/note.exception';
import { FindAllSecretNotesUseCase } from '@contexts/notes/application/usecases/find-all-secret-note.usecase';
import { FindOneSecretNoteUseCase } from '@contexts/notes/application/usecases/find-one-secret-note.usecase';
import { FindOneEncryptedSecretNoteUseCase } from '@contexts/notes/application/usecases/find-one-encrypted-secret-note.usecase';
import { UpdateSecretNoteUseCase } from '@contexts/notes/application/usecases/update-secret-note.usecase';
import { DeleteSecretNoteUseCase } from '@contexts/notes/application/usecases/delete-secret-note.usecase';
import {
  UpdateSecretNoteDto,
  UpdateSecretNoteSchema,
} from '@contexts/notes/application/dtos/update-secret-note.dto';
import { UpdateResponse } from '@/shared/infrastructure/types/note/update-response';

@Controller('secret-notes')
export class SecretNoteController {
  constructor(
    private readonly createSecretNoteUseCase: CreateSecretNoteUseCase,
    private readonly findAllSecretNotesUseCase: FindAllSecretNotesUseCase,
    private readonly findOneSecretNoteUseCase: FindOneSecretNoteUseCase,
    private readonly findOneEncryptedSecretNoteUseCase: FindOneEncryptedSecretNoteUseCase,
    private readonly updateSecretNoteUseCase: UpdateSecretNoteUseCase,
    private readonly deleteSecretNoteUseCase: DeleteSecretNoteUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSecretNoteSchema))
  @HttpCode(201)
  async create(
    @Body() createSecretNoteDto: CreateSecretNoteDto,
    @Res() res: Response,
  ): Promise<Response<Partial<SecretNote>>> {
    try {
      const result =
        await this.createSecretNoteUseCase.execute(createSecretNoteDto);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      throw new NoteDomainException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @HttpCode(200)
  async findAll(@Res() res: Response): Promise<Response> {
    try {
      const notes = await this.findAllSecretNotesUseCase.execute();
      return res.status(HttpStatus.OK).json(notes);
    } catch (error) {
      throw new NoteDomainException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id') id: string,
    @Query('encrypted') encrypted: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      if (encrypted === 'true') {
        const note = await this.findOneEncryptedSecretNoteUseCase.execute(id);
        return res.status(HttpStatus.OK).json(note);
      } else {
        const note = await this.findOneSecretNoteUseCase.execute(id);
        return res.status(HttpStatus.OK).json(note);
      }
    } catch (error) {
      throw new NoteDomainException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSecretNoteSchema))
    updateSecretNoteDto: UpdateSecretNoteDto,
    @Res() res: Response,
  ): Promise<Response<UpdateResponse>> {
    try {
      const result = await this.updateSecretNoteUseCase.execute({
        id,
        updateSecretNoteDto,
      });
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      throw new NoteDomainException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response<{ message: string }>> {
    try {
      await this.deleteSecretNoteUseCase.execute(id);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
      throw new NoteDomainException('Note not found.', HttpStatus.NOT_FOUND);
    }
  }
}
