import { shared, env } from "@appblocks/node-sdk";

const sample_otp_verification_fn = async (req, res) => {
  const { prisma, getBody, sendResponse } = await shared.getShared();
  // health check
  if (req.params["health"] === "health") {
    sendResponse(res, 200, { success: true, msg: "Health check success" });
    return;
  }

  const { email, email_verification_code } = await getBody(req);
  try {
    const userData = await prisma.users.findFirst({ where: { email } });

    console.log("userData:", userData);
    if (!userData) {
      sendResponse(res, 404, {
        err: true,
        msg: "email not found",
        data: {},
      });
      return;
    }

    if (userData.email_verification_code != email_verification_code) {
      sendResponse(res, 400, {
        err: true,
        msg: "Wrong verification code",
        data: {},
      });
      return;
    }

    sendResponse(res, 200, {
      err: false,
      msg: "otp verified",
      data: {
        user_name: userData.user_name,
        email: userData.email,
      },
    });
    return;
  } catch (error) {
    sendResponse(res, 500, {
      err: true,
      msg: "server error",
      data: { message: error.message },
    });
    return;
  }
};

export default sample_otp_verification_fn;
