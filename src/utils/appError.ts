export default class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // IMPORTANT

    Error.captureStackTrace(this, this.constructor);
  }
}











// class AppError extends Error {
//   public statusCode: number;
//   public status: string;
//   public isOperational: boolean;

//   constructor(message: string, statusCode: number) {
//     super(message);

//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
//     this.isOperational = true; // Mark as expected error

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// export default AppError;