declare module 'xss-clean' {
  const xss: any;
  export default xss;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  const mongoSanitize: () => RequestHandler;
  export default mongoSanitize;
}



// declare module 'xss-clean';