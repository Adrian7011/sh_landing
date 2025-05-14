const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// 환경변수 로그 출력
console.log("환경변수 설정 확인:", {
  emailUser: functions.config().email
    ? functions.config().email.user
    : "설정 없음",
  emailPassLength:
    functions.config().email && functions.config().email.pass
      ? functions.config().email.pass.length
      : 0,
});

// Nodemailer 전송자 설정 (네이버) - 더 자세한 설정 추가
const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465, // 포트를 465로 변경
  secure: true, // SSL 사용
  auth: {
    user: functions.config().email ? functions.config().email.user : "",
    pass: functions.config().email ? functions.config().email.pass : "",
  },
  connectionTimeout: 30000, // 30초 타임아웃
  greetingTimeout: 30000,
  debug: true, // 디버그 로그 활성화
  logger: true, // 로거 활성화
});

// 발신 이메일 주소
const senderEmail = functions.config().email
  ? functions.config().email.user
  : "";

// 이메일 서버 연결 테스트
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP 서버 연결 오류:", error);
  } else {
    console.log("SMTP 서버 연결 성공! 이메일 발송 준비 완료");
  }
});

// 직접 테스트용 함수 추가
exports.testSendEmail = functions.https.onRequest(async (req, res) => {
  console.log("테스트 이메일 발송 시작");

  try {
    const mailOptions = {
      from: `"신한라이프 잡세미나" <${senderEmail}>`,
      to: "ddejis@naver.com", // 같은 네이버 계정으로 테스트 (자기 자신에게 보내기)
      subject: "테스트 이메일",
      text: "이것은 테스트 이메일입니다.",
    };

    console.log("이메일 옵션:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("테스트 이메일 발송 성공:", info);
    res.send("테스트 이메일 발송 성공!");
  } catch (error) {
    console.error("테스트 이메일 발송 실패:", error);
    res.status(500).send("테스트 이메일 발송 실패: " + error.message);
  }
});

// 신청자 정보 추가 시 자동으로 이메일 보내기
exports.sendSurveyEmailOnRegistration = functions.firestore
  .document("registrations/{registrationId}")
  .onCreate(async (snap, context) => {
    console.log("신청자 정보 추가 - 이메일 전송 함수 시작");

    try {
      const registrationData = snap.data();
      console.log("신청자 데이터:", JSON.stringify(registrationData));

      const { email, name } = registrationData;
      const survey_url = `https://sh-landing-74407.web.app/pages/survey.html?email=${encodeURIComponent(
        email
      )}&name=${encodeURIComponent(name)}`; // 수정된 설문 URL (파라미터 포함)

      if (!email || !name) {
        console.error("필수 이메일 데이터가 누락되었습니다:", registrationData);
        return null;
      }

      console.log(`이메일 전송 시도: ${email}, 발신자: ${senderEmail}`);

      // 이메일 HTML 템플릿
      const mailOptions = {
        from: `"신한라이프 잡세미나" <${senderEmail}>`,
        to: email,
        subject: "신한라이프 잡세미나 사전 설문조사 안내",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                }
                .container {
                  padding: 20px;
                  background-color: #f9f9f9;
                }
                .header {
                  background-color: #0045b0;
                  color: white;
                  padding: 20px;
                  text-align: center;
                }
                .content {
                  background-color: white;
                  padding: 20px;
                  border-radius: 5px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #0045b0;
                  color: white;
                  text-decoration: none;
                  border-radius: 30px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>신한라이프 잡세미나</h1>
                </div>
                <div class="content">
                  <h2>${name}님, 안녕하세요!</h2>
                  <p>신한라이프 잡세미나에 신청해 주셔서 감사합니다.</p>
                  <p>세미나 참석 확정을 위해 아래 링크에서 사전 설문조사를 완료해 주시기 바랍니다.</p>
                  <p>작성하신 내용은 내부 검토 후, 참석 여부를 개별적으로 안내드릴 예정입니다.</p>
                  
                  <div style="text-align: center;">
                    <a href="${survey_url}" class="button">설문조사 참여하기</a>
                  </div>
                  
                  <p>위 버튼을 클릭하시면 설문조사 페이지로 연결됩니다.</p>
                  <p>설문 작성에는 약 5-10분 정도 소요됩니다.</p>
                  
                  <p><strong>📌 중요 안내사항</strong></p>
                  <ul>
                    <li>설문은 세미나 참석자 선별을 위한 사전 절차입니다.</li>
                    <li>검토를 통과하신 분에 한해 인적성 검사 링크가 이메일로 개별 발송됩니다.</li>
                    <li>반드시 사전 검사를 완료하셔야 세미나 당일 참석이 가능합니다.</li>
                    <li>당일 현장에서는 검사 결과를 기반으로 한 1:1 피드백 세션이 진행됩니다.</li>
                  </ul>
                  
                  <p>추가 문의사항이 있으시면 이메일(${senderEmail})로 연락 주시기 바랍니다.</p>
                  <p>감사합니다.</p>
                </div>
                <div class="footer">
                  <p>© 2025 Shinhan Life. All rights reserved.</p>
                  <p>서울특별시 강남구 신한L 강남타워</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      // 이메일 발송 시도 시작 로그
      console.log("이메일 발송 시도 시작");
      console.log(
        "이메일 옵션:",
        JSON.stringify({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
        })
      );

      // 이메일 발송
      try {
        console.log("transporter.sendMail 호출");
        const info = await transporter.sendMail(mailOptions);
        console.log(`이메일 발송 성공: ${email}`, info);
      } catch (emailError) {
        console.error("이메일 발송 오류 (상세):", JSON.stringify(emailError));
        console.error("이메일 발송 오류 스택:", emailError.stack);
        throw emailError; // 상위 catch 블록으로 오류 전달
      }

      // 이메일 발송 성공 후 신청자 문서 상태 업데이트
      console.log("이메일 발송 성공 후 문서 업데이트");
      await admin
        .firestore()
        .collection("registrations")
        .doc(context.params.registrationId)
        .update({
          email_sent: true,
          email_sent_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`설문조사 이메일 발송 성공: ${email}`);
      return null;
    } catch (error) {
      console.error("이메일 처리 오류:", error);
      console.error("오류 스택:", error.stack);

      // 오류 발생 시 신청자 문서에 오류 정보 기록
      try {
        console.log("오류 발생 후 문서 업데이트");
        await admin
          .firestore()
          .collection("registrations")
          .doc(context.params.registrationId)
          .update({
            email_error: error.message,
            email_error_at: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (updateError) {
        console.error("오류 정보 업데이트 실패:", updateError);
      }

      return null;
    }
  });

// 사전 설문 완료 시 알림 이메일 (관리자용)
exports.notifySurveyCompleted = functions.firestore
  .document("survey_responses/{responseId}")
  .onCreate(async (snap, context) => {
    try {
      const surveyData = snap.data();
      const { name, email } = surveyData;

      // 관리자에게 알림 이메일 보내기
      const mailOptions = {
        from: `"신한라이프 잡세미나 시스템" <${senderEmail}>`,
        to: senderEmail, // 관리자 이메일 (동일한 계정으로 보냄)
        subject: `[설문완료] ${name}님이 사전 설문을 제출했습니다`,
        html: `
          <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif;">
            <h2>사전 설문 제출 알림</h2>
            <p><strong>이름:</strong> ${name}</p>
            <p><strong>이메일:</strong> ${email}</p>
            <p>해당 참가자가 사전 설문을 완료했습니다. 관리자 페이지에서 자세한 내용을 확인하세요.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`관리자 알림 이메일 발송 성공: ${name}님의 설문 완료`, info);
      return null;
    } catch (error) {
      console.error("관리자 알림 이메일 발송 오류:", error);
      return null;
    }
  });
