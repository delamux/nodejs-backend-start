import { AppFactory } from './infrastructure/AppFactory';
import { config } from './config';

const server = AppFactory.createServer();
const PORT = config.port;
server.listen(PORT, () => console.log(`Server running on port ${config.domainUrl}:${PORT}`));
