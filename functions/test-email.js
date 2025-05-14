const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 이메일 테스트 문서 추가
async function addTestEmail() {
  try {
    const docRef = await db.collection("email_queue").add({
      to: "your-test-email@example.com", // 수신할 이메일 주소로 변경하세요
      name: "테스트 사용자",
      survey_url: "https://sh-landing-74407.web.app/survey",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("테스트 이메일 문서가 추가되었습니다:", docRef.id);
  } catch (error) {
    console.error("오류 발생:", error);
  }
}

// 실행
addTestEmail()
  .then(() => {
    console.log("테스트 완료");
    process.exit(0);
  })
  .catch((err) => {
    console.error("오류 발생:", err);
    process.exit(1);
  });
