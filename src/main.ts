import { AppFactory } from './infrastructure/AppFactory';

const server = AppFactory.createServer();
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
