import type{ErrorRequestHandler}from'express';
export const errorHandler:ErrorRequestHandler=(error,_req,res,next)=>{void next;const message=error instanceof Error?error.message:'UNKNOWN_ERROR';console.error('[API ERROR]',message);res.status(500).json({error:'INTERNAL_ERROR'})};
