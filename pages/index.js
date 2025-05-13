import Image from "next/image";
import styles from "../styles/globals.css";

export default function Home() {
  return (
    <div
      style={{
        fontFamily: "Pretendard, sans-serif",
        background: "#f8f9fb",
        color: "#222",
      }}
    >
      {/* 히어로 섹션 */}
      <section
        style={{
          padding: "64px 0 32px 0",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <div
          style={{
            width: 320,
            height: 120,
            margin: "0 auto 24px",
            background: "#e0e7ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            fontWeight: 600,
            color: "#4a5a6a",
            fontSize: 18,
          }}
        >
          여기에 세미나 배너 이미지가 들어갑니다
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12 }}>
          신한라이프 잡세미나
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: 8 }}>
          2025년 5월 21일 (수) | 강남 WM센터
        </p>
        <button
          style={{
            background: "#2d6cdf",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "16px 40px",
            fontSize: "1.1rem",
            fontWeight: 700,
            marginTop: 16,
            cursor: "pointer",
          }}
        >
          지원하기
        </button>
      </section>

      {/* 혜택 섹션 */}
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          padding: "48px 0",
          background: "#f0f4fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 12px",
              background: "#e0e7ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              fontWeight: 600,
              color: "#4a5a6a",
              fontSize: 14,
            }}
          >
            여기에 취업 독려금 이미지
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            취업 독려금 7만원
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 12px",
              background: "#e0e7ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              fontWeight: 600,
              color: "#4a5a6a",
              fontSize: 14,
            }}
          >
            여기에 고급 와인 이미지
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            고급 와인 증정
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 12px",
              background: "#e0e7ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              fontWeight: 600,
              color: "#4a5a6a",
              fontSize: 14,
            }}
          >
            여기에 HR 피드백 이미지
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            HR 매니저 피드백
          </div>
        </div>
      </section>

      {/* 세미나 개요 섹션 */}
      <section style={{ padding: "48px 0", background: "#fff" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: 32,
          }}
        >
          세미나 개요
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#f0f4fa",
              borderRadius: 16,
              padding: 24,
              width: 260,
              minHeight: 120,
            }}
          >
            <strong>1. 우리나라 채용시장의 현재</strong>
          </div>
          <div
            style={{
              background: "#f0f4fa",
              borderRadius: 16,
              padding: 24,
              width: 260,
              minHeight: 120,
            }}
          >
            <strong>2. 인적성검사 결과에 대한 HR 피드백</strong>
          </div>
          <div
            style={{
              background: "#f0f4fa",
              borderRadius: 16,
              padding: 24,
              width: 260,
              minHeight: 120,
            }}
          >
            <strong>3. 신한라이프의 비전</strong>
          </div>
          <div
            style={{
              background: "#f0f4fa",
              borderRadius: 16,
              padding: 24,
              width: 260,
              minHeight: 120,
            }}
          >
            <strong>4. 실무자와의 커리어 Q&A</strong>
          </div>
        </div>
      </section>

      {/* 참가 조건 섹션 */}
      <section style={{ padding: "48px 0", background: "#f8f9fb" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.7rem",
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          참가 조건
        </h2>
        <ul
          style={{
            maxWidth: 600,
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: 2,
          }}
        >
          <li>사전 신청 필수</li>
          <li>세미나 전에 인적성검사 + 설문 작성 필수</li>
          <li>세미나 성실 청강 및 피드백</li>
        </ul>
      </section>

      {/* 신청 프로세스 섹션 */}
      <section style={{ padding: "48px 0", background: "#fff" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.7rem",
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          신청 프로세스
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 8px",
                background: "#e0e7ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                fontWeight: 600,
                color: "#4a5a6a",
                fontSize: 13,
              }}
            >
              지원신청 이미지
            </div>
            <div>1. 지원신청</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 8px",
                background: "#e0e7ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                fontWeight: 600,
                color: "#4a5a6a",
                fontSize: 13,
              }}
            >
              담당자 연락 이미지
            </div>
            <div>2. 담당자 연락</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 8px",
                background: "#e0e7ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                fontWeight: 600,
                color: "#4a5a6a",
                fontSize: 13,
              }}
            >
              인적성검사 및 설문 이미지
            </div>
            <div>3. 인적성검사 및 설문</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 8px",
                background: "#e0e7ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                fontWeight: 600,
                color: "#4a5a6a",
                fontSize: 13,
              }}
            >
              세미나 참가 이미지
            </div>
            <div>4. 세미나 참가</div>
          </div>
        </div>
      </section>

      {/* 중요 안내 섹션 */}
      <section
        style={{
          padding: "40px 0",
          background: "#ffe9e0",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: 12 }}>
          중요 안내
        </h3>
        <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "#d14b00" }}>
          참가를 원하시는 분들은 지원신청해주시고, 지원자에 한해서 인적성 검사
          및 사전 설문조사 진행을 위해 담당자가 연락드리겠습니다.
        </p>
      </section>
    </div>
  );
}
