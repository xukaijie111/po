import { NextFunction, Request, Response } from 'express';


function corsMiddleware(request: Request, response: Response, next: NextFunction) {
  response.header("Access-Control-Allow-Origin", request.headers.origin)

  // res.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  response.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  response.header('Access-Control-Allow-Credentials', 'true')

  if (request.method == 'OPTIONS') {
    response.send(200);
  }
  else {


    next();
  }
}

export default corsMiddleware;
