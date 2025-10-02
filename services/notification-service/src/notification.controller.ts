import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications with filters' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAll(@Query() query: NotificationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Get('recipient/:recipientId')
  @ApiOperation({ summary: 'Get notifications for a specific recipient' })
  @ApiResponse({ status: 200, description: 'Recipient notifications retrieved successfully' })
  async findByRecipient(@Param('recipientId') recipientId: string, @Query() query: NotificationQueryDto) {
    return this.notificationService.findByRecipient(recipientId, query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.notificationService.remove(id);
    return { message: 'Notification deleted successfully' };
  }

  @Get('recipient/:recipientId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count for recipient' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Param('recipientId') recipientId: string) {
    const count = await this.notificationService.getUnreadCount(recipientId);
    return { unreadCount: count };
  }

  @Get('recipient/:recipientId/stats')
  @ApiOperation({ summary: 'Get notification statistics for recipient' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Param('recipientId') recipientId: string) {
    return this.notificationService.getNotificationStats(recipientId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications created successfully' })
  async sendBulk(@Body() notifications: CreateNotificationDto[]) {
    return this.notificationService.sendBulk(notifications);
  }
}


