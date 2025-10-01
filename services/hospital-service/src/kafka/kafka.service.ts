import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'hospital-service'),
      brokers: this.configService.get('KAFKA_BROKERS', 'localhost:9092').split(','),
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get('KAFKA_GROUP_ID', 'hospital-service-group'),
    });
  }

  async onModuleInit() {
    try {
      // Check if we're in mock mode
      const brokers = this.configService.get('KAFKA_BROKERS', 'localhost:9092');
      if (brokers.startsWith('mock://')) {
        this.logger.log('Kafka service running in mock mode');
        return;
      }

      await this.producer.connect();
      await this.consumer.connect();
      
      // Subscribe to relevant topics
      await this.consumer.subscribe({
        topics: ['hospital.events', 'patient.events', 'document.events'],
        fromBeginning: false,
      });

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value?.toString();
            if (value) {
              await this.handleMessage(topic, value);
            }
          } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`, error.stack);
          }
        },
      });

      this.logger.log('Kafka service initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka service: ${error.message}`, error.stack);
      this.logger.log('Kafka service running in mock mode due to connection error');
    }
  }

  async emitEvent(topic: string, event: any): Promise<void> {
    try {
      // Check if we're in mock mode
      const brokers = this.configService.get('KAFKA_BROKERS', 'localhost:9092');
      if (brokers.startsWith('mock://')) {
        this.logger.log(`Mock event emitted to topic ${topic}: ${event.eventType}`);
        return;
      }

      await this.producer.send({
        topic,
        messages: [
          {
            key: event.eventId || event.hospitalId || event.patientId || 'default',
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`Event emitted to topic ${topic}: ${event.eventType}`);
    } catch (error) {
      this.logger.error(`Failed to emit event: ${error.message}`, error.stack);
      this.logger.log(`Mock event emitted to topic ${topic}: ${event.eventType}`);
    }
  }

  private async handleMessage(topic: string, message: string): Promise<void> {
    try {
      const event = JSON.parse(message);
      this.logger.log(`Received message from topic ${topic}: ${event.eventType}`);

      // Handle different event types
      switch (event.eventType) {
        case 'patient.consent.granted':
          await this.handlePatientConsentGranted(event);
          break;
        case 'document.uploaded':
          await this.handleDocumentUploaded(event);
          break;
        case 'hospital.verified':
          await this.handleHospitalVerified(event);
          break;
        default:
          this.logger.warn(`Unknown event type: ${event.eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`, error.stack);
    }
  }

  private async handlePatientConsentGranted(event: any): Promise<void> {
    // Handle patient consent granted event
    this.logger.log(`Patient consent granted: ${event.patientId}`);
  }

  private async handleDocumentUploaded(event: any): Promise<void> {
    // Handle document uploaded event
    this.logger.log(`Document uploaded: ${event.documentId}`);
  }

  private async handleHospitalVerified(event: any): Promise<void> {
    // Handle hospital verified event
    this.logger.log(`Hospital verified: ${event.hospitalId}`);
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka service disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting Kafka service: ${error.message}`, error.stack);
    }
  }
}
