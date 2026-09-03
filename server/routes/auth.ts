import{Router}from'express';import{requireAuth}from'../middleware/auth.js';
export const authRouter=Router();
authRouter.get('/me',requireAuth,(req,res)=>res.json({uid:req.user!.uid,email:req.user!.email,role:req.user!.role,permissions:req.user!.permissions,status:req.user!.status}));
