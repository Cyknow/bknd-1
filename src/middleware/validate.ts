import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // ✅ FIX: Use Object.assign to update properties instead of overwriting the whole object
      Object.assign(req.body, validated.body);
      Object.assign(req.query, validated.query);
      Object.assign(req.params, validated.params);
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(i => i.message).join(', ');
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };



// import { AnyZodObject, ZodError } from 'zod';
// import { Request, 
//   Response, 
//   NextFunction } from 'express';
// import AppError from '../utils/appError.js';

// export const validate = (schema: AnyZodObject) => 
//   async (req: Request, 
//     res: Response, 
//     next: NextFunction) => {
//     try {
//       const validated = await schema.parseAsync({
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });

//       // Overwrite req with validated data (removes extra/malicious fields)
//       req.body = validated.body;
//       req.query = validated.query;
//       req.params = validated.params;
      
//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         // Formats Zod errors into a clean object for the frontend
//         const message = error.errors.map(i => i.message).join(', ');
//         return next(new AppError(message, 400));
//       }
//       next(error);
//     }
//   };
//   //       return res.status(400).json({
//   //         status: 'fail',
//   //         errors: error.flatten().fieldErrors,
//   //       });
//   //     }
//   //     next(error);
//   //   }
//   // };