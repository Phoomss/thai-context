import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  @ApiOperation({ summary: 'System health check and DB connectivity verification' })
  async getHealth() {
    try {
      const res = await this.db.query('SELECT 1 as connected;');
      return {
        status: 'ok',
        service: 'THAI CONTEXT Backend API',
        timestamp: new Date().toISOString(),
        database: res.rows[0].connected === 1 ? 'connected' : 'error',
      };
    } catch (err) {
      return {
        status: 'degraded',
        service: 'THAI CONTEXT Backend API',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: err.message,
      };
    }
  }
}
