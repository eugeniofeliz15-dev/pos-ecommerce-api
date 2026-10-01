import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        message = `El valor de '${target?.join(', ')}' ya está en uso.`;
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no fue encontrado.';
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Error de referencia: El registro relacionado no existe.';
        break;

      default:
        message = exception.message;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: exception.code,
    });
  }
}