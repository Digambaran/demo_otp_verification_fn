import { shared, env } from "@appblocks/node-sdk";

const sample_otp_verification_fn = async (req, res) => {
  const { prisma, getBody, sendResponse } = await shared.getShared();
  // health check
  if (req.params["health"] === "health") {
    sendResponse(res, 200, { success: true, msg: "Health check success" });
    return;
  }

  const { email, email_verification_code } = await getBody(req);
  console.log(`email:${email}`);
  console.log(`code:${email_verification_code}`);
  try {
    const userData = await prisma.users.findFirst({ where: { email } });

    if (!userData) {
      console.log(`record for user with email:${email} not found`);
      sendResponse(res, 200, {
        err: true,
        msg: "email not found",
        data: {},
      });
      return;
    }

    console.log(`record for user with email:${email} exists`);

    if (userData.email_verified) {
      console.log(`email already verified`);
      sendResponse(res, 200, {
        err: true,
        msg: "already verified",
        data: {},
      });
      return;
    }

    if (userData.email_verification_code != email_verification_code) {
      console.log(`wrong verification code`);
      sendResponse(res, 200, {
        err: true,
        msg: "Wrong verification code",
        data: {},
      });
      return;
    }

    if (userData.email_verification_expiry < new Date()) {
      console.log(`verification code expired`);
      sendResponse(res, 200, {
        err: true,
        msg: "Verification code expired",
        data: {},
      });
      return;
    }

    const userDataPayload = await prisma.users.update({
      where: { email },
      data: {
        email_verified: true,
        email_verification_expiry: undefined,
        email_verification_code: undefined,
      },
    });

    console.log(`email verified successfully`);
    sendResponse(res, 200, {
      err: false,
      msg: "email verified",
      data: {
        user_name: userData.user_name,
        email: userData.email,
      },
    });
    return;
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, {
      err: true,
      msg: "server error",
      data: { message: error.message },
    });
    return;
  }
};

export default sample_otp_verification_fn;
