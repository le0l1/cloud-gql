import { createLogger, format, transports } from 'winston';

const {
  combine, timestamp, printf,
} = format;

const myFormat = printf(({ level, message, timestamp: time }) => `[${level}] ${time}: ${message}`);

export default createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
});
