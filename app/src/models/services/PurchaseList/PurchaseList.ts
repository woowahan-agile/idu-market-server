import { Request } from "express";
import { params } from "../../../config/types";
import Error from "../../utils/Error";
import PurchaseListStorage from "./PurchaseListStorage";
import Notification from "../Notification/Notification";
import BoardStorage from "../Board/BoardStorage";
import NotificationStorage from "../Notification/NotificationStorage";

interface error {
  isError: boolean;
  errMsg: string;
  clientMsg: string;
}

interface response {
  success: boolean;
  msg: string;
  purchaseList?: purchaseList[];
  alarm?: response | error;
}

interface purchaseList {
  num: number;
  buyerId: string;
  buyerName: string;
  thumbnail: string;
  title: string;
  hit: number;
  price: string;
  categoryName: string;
  commentCount: number;
  inDate: Date;
  sellerId: string;
  sellerName: string;
  profilePath: string;
}

class PurchaseList {
  params: params;
  body: any;

  constructor(readonly req: Request) {
    this.req = req;
    this.body = req.body;
    this.params = req.params;
  }

  async read(): Promise<error | response> {
    const studentId: string = this.params.studentId;
    try {
      const purchaseList = await PurchaseListStorage.findAllById(studentId);
      return {
        success: true,
        msg: "구매목록 조회 성공했습니다.",
        purchaseList,
      };
    } catch (err) {
      return Error.ctrl("서버 개발자에게 문의해주십시오", err);
    }
  }

  async create(): Promise<error | response> {
    const client = this.body;
    const notification = new Notification(this.req);
    const board = {
      status: 3,
    };

    try {
      const purchaseList =
        await PurchaseListStorage.findOneByBoardNumberAndStudentId(
          client.boardNum,
          client.studentId
        );

      if (!purchaseList) {
        // 구매목록에 추가되지 않은 것만 추가한다.
        const createdId = await PurchaseListStorage.create(
          client.studentId,
          client.boardNum
        );

        // 여러명의 알림 수신자들에게 모두 전송하기 위해 반복문 순회
        client.recipientNicknames.forEach(async (recipientNickname) => {
          // 수신자와 발신자가 다를 경우에만 알림 생성
          if (recipientNickname !== client.senderNickname) {
            const title: string = await NotificationStorage.findTitleByBoardNum(
              client.boardNum
            );
            await notification.createByTitleAndNickname(
              title,
              recipientNickname
            );
          }
        });

        if (createdId === 1) {
          const updateStatus = await BoardStorage.updateOnlyStatusByNum(
            board,
            client.boardNum
          );
          if (updateStatus) {
            return { success: true, msg: "구매목록에 저장되었습니다" };
          }
          return {
            success: false,
            msg: "구매목록에는 저장되었지만 status가 변경되지 않았습니다. 문의주세요",
          };
        }
      }
      return { success: false, msg: "이미 구매목록에 저장이 되었습니다." };
    } catch (err) {
      return Error.ctrl("게시판 혹은 학생 아이디가 존재하지 않습니다.", err);
    }
  }
}

export default PurchaseList;
