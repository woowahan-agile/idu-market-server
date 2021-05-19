import { Request, Response } from "express";
import logger from "../../config/logger";
import Error from "../../models/utils/Error";

import Email from "../../models/services/Email/Email";

interface response {
  success: boolean;
  msg: string;
}

const inquiry = {
  sendEmailForInquiry: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const email = new Email(req);
      const response = (await email.sendEmailForInquiry()) as response;

      if (response.success) {
        logger.info(`POST /api/inquiry 201 ${response.msg}`);
        return res.status(201).json(response);
      }
      logger.error(`POST /api/inquiry 400 ${response.msg}`);
      return res.status(400).json(response);
    } catch (err) {
      const server = Error.ctrl("서버 개발자에게 문의해주십시오", err);
      logger.error(`POST /api/inquiry 500 ${server.errMsg}`);
      return res.status(500).json(server.clientMsg);
    }
  },
};

export default inquiry;
