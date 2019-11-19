import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { print } from 'graphql';
import { env } from './util';

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp: time }) => `[${level}] ${time}: ${message}`);

const transport = new (transports.DailyRotateFile)({
  filename: 'graphql-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  dirname: `${env('LOGGER_PATH')}`,
});

const logger = createLogger({
  format: combine(timestamp({
    format() {
      return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
      });
    },
  }), myFormat),
  transports: [
    new transports.Console(),
    transport,
  ],
});


export class BasicLogging {
  requestDidStart({ queryString, parsedQuery, variables }) {
    const query = queryString || print(parsedQuery);
    logger.info(`请求参数: ${query}`);
    logger.info(`请求变量: ${JSON.stringify(variables)}`);
  }

  willSendResponse({ graphqlResponse }) {
    logger.info(`返回结果: ${JSON.stringify(graphqlResponse, null, 2)}`);
  }
}

export default logger;
