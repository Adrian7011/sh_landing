// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCchKTpa3JrdJZlRupMq-XwBeQgdzS4MUs",
  authDomain: "sh-landing-74407.firebaseapp.com",
  projectId: "sh-landing-74407",
  storageBucket: "sh-landing-74407.appspot.com",
  messagingSenderId: "299032160126",
  appId: "1:299032160126:web:e6f0d89aa6a7f7e9d18975",
};

// Firebase 초기화 - 간단한 방식으로 변경
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore 설정 - 타임스탬프 처리 명시
db.settings({
  timestampsInSnapshots: true,
});

// 디버깅 활성화
firebase.firestore.setLogLevel("debug");

// 어드민 이메일 설정 - 이 이메일이 관리자로 등록됨
const ADMIN_EMAIL = "ingchief@daum.net";

// 어드민 상태 변수
let currentUser = null;
let registrations = []; // 모든 등록 데이터
let filteredRegistrations = []; // 필터링된 데이터
let currentPage = 1;
const itemsPerPage = 10;

// 설문응답 관련 변수
let currentSurveyPage = 1;
const surveysPerPage = 10;
let allSurveys = [];
let filteredSurveys = [];

// DOM 요소
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const dateFilter = document.getElementById("date-filter");
const applicationsTable = document.getElementById("applications-table");
const totalCount = document.getElementById("total-count");
const filteredCount = document.getElementById("filtered-count");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const exportExcelBtn = document.getElementById("export-excel");

// 사이드바 탭 요소들
const tabLinks = document.querySelectorAll(".header-nav a");
const tabContents = document.querySelectorAll(".tab-content");

// 통계 요소들
const statTotal = document.getElementById("stat-total");
const statToday = document.getElementById("stat-today");
const statWeek = document.getElementById("stat-week");
const statAvg = document.getElementById("stat-avg");

// 교육 수준 매핑
const educationMap = {
  "high-school": "고등학교 졸업",
  college: "전문대학 졸업",
  university: "대학교 졸업",
  master: "석사",
  phd: "박사",
  other: "기타",
};

// 성별 매핑
const genderMap = {
  male: "남성",
  female: "여성",
  other: "기타",
  "prefer-not-to-say": "응답하지 않음",
};

// 화면 크기에 따라 모바일 여부를 판단하는 함수
function isMobileDevice() {
  return window.innerWidth <= 768;
}

// 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  // 로그인 상태 확인
  auth.onAuthStateChanged((user) => {
    if (user) {
      // 로그인 성공
      currentUser = user;
      showDashboard();
      loadRegistrations();
    } else {
      // 로그아웃 상태
      showLogin();
    }
  });

  // 로그인 폼 제출
  loginForm.addEventListener("submit", handleLogin);

  // 로그아웃 버튼
  logoutBtn.addEventListener("click", handleLogout);

  // 탭 전환
  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute("data-tab");

      // 탭 메뉴 활성화
      tabLinks.forEach((item) => {
        item.parentElement.classList.remove("active");
      });
      link.parentElement.classList.add("active");

      // 탭 콘텐츠 전환
      tabContents.forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`${targetTab}-tab`).classList.add("active");

      // 설문응답 탭이 활성화되면 데이터 로드
      if (targetTab === "surveys") {
        loadSurveyResponses();
      }
    });
  });

  // 검색 기능
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  // 날짜 필터
  dateFilter.addEventListener("change", handleDateFilter);

  // 페이지네이션
  prevPageBtn.addEventListener("click", () => navigatePage(-1));
  nextPageBtn.addEventListener("click", () => navigatePage(1));

  // 엑셀 다운로드
  exportExcelBtn.addEventListener("click", handleExportExcel);

  // 설문응답 기능 초기화
  setupSurveySearch();
  setupSurveyDateFilter();
  setupSurveyExcelExport();

  // 화면 크기 변경 시 테이블 다시 렌더링
  window.addEventListener("resize", () => {
    if (registrations.length > 0) {
      renderTable();
    }
    if (
      allSurveys.length > 0 &&
      document.getElementById("surveys-tab").classList.contains("active")
    ) {
      displaySurveyResponses();
    }
  });
});

// 로그인 처리 - 간소화된 버전
async function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  console.log("로그인 시도:", email);

  try {
    loginError.textContent = "";

    if (email !== ADMIN_EMAIL) {
      loginError.textContent = "관리자 계정이 아닙니다.";
      return;
    }

    // 비밀번호 유효성 검사
    if (password.length < 6) {
      loginError.textContent = "비밀번호는 최소 6자 이상이어야 합니다.";
      return;
    }

    try {
      // 로그인 버튼 비활성화 및 로딩 표시
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "로그인 중...";

      // 먼저 로그인 시도
      await auth.signInWithEmailAndPassword(email, password);
      console.log("로그인 성공");

      // 로그인 성공 시 버튼 텍스트 변경
      submitButton.textContent = "로그인 성공!";
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1500);
    } catch (error) {
      console.error("로그인 오류:", error.code, error.message);

      // 사용자가 없으면 생성
      if (error.code === "auth/user-not-found") {
        try {
          console.log("사용자 생성 시도");

          // 생성 중 버튼 상태 변경
          const submitButton = loginForm.querySelector('button[type="submit"]');
          const originalText = submitButton.textContent;
          submitButton.disabled = true;
          submitButton.textContent = "계정 생성 중...";

          const userCredential = await auth.createUserWithEmailAndPassword(
            email,
            password
          );

          submitButton.textContent = "계정 생성 성공!";
          setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
          }, 1500);

          alert("관리자 계정이 생성되었습니다.");
        } catch (createError) {
          console.error(
            "계정 생성 오류:",
            createError.code,
            createError.message
          );
          loginError.textContent = "계정 생성 실패: " + createError.message;

          // 버튼 상태 복원
          const submitButton = loginForm.querySelector('button[type="submit"]');
          submitButton.textContent = "로그인";
          submitButton.disabled = false;
        }
      } else {
        loginError.textContent = "로그인 실패: " + error.message;

        // 버튼 상태 복원
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.textContent = "로그인";
        submitButton.disabled = false;
      }
    }
  } catch (error) {
    console.error("인증 과정 오류:", error);
    loginError.textContent = error.message || "인증 오류가 발생했습니다.";

    // 버튼 상태 복원
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.textContent = "로그인";
    submitButton.disabled = false;
  }
}

// 로그아웃 처리
function handleLogout() {
  auth.signOut().catch((error) => {
    console.error("로그아웃 오류:", error);
  });
}

// 로그인 화면 표시
function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  // 폼 초기화
  loginForm.reset();
  loginError.textContent = "";
}

// 대시보드 화면 표시
function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  userEmail.textContent = currentUser.email;
}

// Firestore에서 등록 데이터 로드
async function loadRegistrations() {
  try {
    console.log("데이터 로드 시작...");

    // 먼저 데이터가 있는지 확인
    const countSnapshot = await db.collection("registrations").limit(1).get();
    if (countSnapshot.empty) {
      console.log("registrations 컬렉션이 비어 있습니다.");
      alert("등록된 신청자 데이터가 없습니다.");
      return;
    }

    // 정렬 필드 결정 (created_at이 일반적이지만 없을 경우 timestamp 사용)
    const testDoc = countSnapshot.docs[0].data();
    const orderByField = testDoc.created_at ? "created_at" : "timestamp";

    console.log(`정렬 필드로 ${orderByField}를 사용합니다.`);

    // 데이터 가져오기
    const snapshot = await db
      .collection("registrations")
      .orderBy(orderByField, "desc")
      .get();

    console.log(`Firestore에서 ${snapshot.size}개의 문서를 가져왔습니다.`);

    registrations = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      console.log(`문서 ${index + 1}:`, doc.id, data);

      // 필드 존재 여부에 따라 다른 필드 사용
      const dateField = data.created_at || data.timestamp;
      let dateValue;

      try {
        // Firestore 타임스탬프인 경우
        if (dateField && typeof dateField.toDate === "function") {
          dateValue = dateField.toDate();
        }
        // 일반 타임스탬프(숫자)인 경우
        else if (dateField) {
          dateValue = new Date(dateField);
        }
        // 기본값
        else {
          dateValue = new Date();
        }
      } catch (e) {
        console.error("날짜 변환 오류:", e);
        dateValue = new Date();
      }

      return {
        id: doc.id,
        index: index + 1,
        ...data,
        formattedDate: formatDate(dateValue),
      };
    });

    console.log("변환된 데이터:", registrations);

    // 모든 데이터로 초기화
    filteredRegistrations = [...registrations];

    // 데이터 카운트 업데이트
    updateCounts();

    // 테이블 렌더링
    renderTable();

    // 통계 업데이트
    updateStatistics();
  } catch (error) {
    console.error("데이터 로드 오류:", error);
    alert("데이터를 불러오는 중 오류가 발생했습니다: " + error.message);
  }
}

// 생년월일 형식 변환 함수 - YYMMDD+성별코드 형식으로 수정
function formatBirthdate(birthdate, gender) {
  if (!birthdate) return "-";

  // YYYY-MM-DD 형식에서 YYMMDD 형식으로 변환
  const date = new Date(birthdate);
  const year = date.getFullYear().toString().substr(-2); // 연도의 마지막 2자리
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // 성별 코드 추가 (남성: 1, 여성: 2)
  const genderCode = gender === "male" ? "1" : gender === "female" ? "2" : "0";

  return `${year}${month}${day}${genderCode}`;
}

// 테이블 렌더링
function renderTable() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredRegistrations.slice(startIndex, endIndex);

  applicationsTable.innerHTML = "";

  if (pageData.length === 0) {
    applicationsTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    데이터가 없습니다.
                </td>
            </tr>
        `;
    return;
  }

  // 모바일 기기인 경우 필수 컬럼만 표시
  const isMobile = isMobileDevice();

  pageData.forEach((item) => {
    const tr = document.createElement("tr");

    // 데이터 매핑 처리
    const formattedEducation = educationMap[item.education] || item.education;
    const formattedBirthdate = formatBirthdate(item.birthdate, item.gender);

    if (isMobile) {
      // 모바일에서는 중요 정보만 표시
      tr.innerHTML = `
              <td>${item.index}</td>
              <td>
                ${item.name || "-"}
                <button class="copy-btn" data-value="${
                  item.name || ""
                }">복사</button>
                <div class="mobile-details">
                  <small>이메일: ${item.email || "-"}</small>
                  <button class="copy-btn small" data-value="${
                    item.email || ""
                  }">복사</button>
                </div>
              </td>
              <td>${item.phone || "-"}</td>
              <td>
                <button class="delete-btn" data-id="${item.id}">삭제</button>
              </td>
          `;
    } else {
      // 데스크톱에서는 모든 정보 표시
      tr.innerHTML = `
              <td>${item.index}</td>
              <td>
                ${item.name || "-"}
                <button class="copy-btn" data-value="${
                  item.name || ""
                }">복사</button>
              </td>
              <td>
                ${item.email || "-"}
                <button class="copy-btn" data-value="${
                  item.email || ""
                }">복사</button>
              </td>
              <td>${item.phone || "-"}</td>
              <td>${formattedEducation || "-"}</td>
              <td>${formattedBirthdate || "-"}</td>
              <td>${item.formattedDate || "-"}</td>
              <td>
                <button class="delete-btn" data-id="${item.id}">삭제</button>
              </td>
          `;
    }

    applicationsTable.appendChild(tr);
  });

  // 페이지 정보 업데이트
  updatePagination();

  // 복사 버튼 이벤트 추가
  addCopyButtonListeners();

  // 삭제 버튼 이벤트 추가
  addDeleteButtonListeners();
}

// 복사 버튼 이벤트 추가
function addCopyButtonListeners() {
  const copyButtons = document.querySelectorAll(".copy-btn");

  copyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const value = e.target.getAttribute("data-value");
      copyToClipboard(value);

      // 복사 성공 표시
      const originalText = e.target.textContent;
      e.target.textContent = "복사됨!";
      e.target.style.color = "var(--success)";

      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.style.color = "";
      }, 1000);
    });
  });
}

// 삭제 버튼 이벤트 리스너 추가
function addDeleteButtonListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");

      if (
        confirm(
          "정말로 이 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        )
      ) {
        try {
          // 삭제 중 버튼 스타일 변경
          e.target.textContent = "삭제 중...";
          e.target.disabled = true;

          // Firestore에서 문서 삭제
          await db.collection("registrations").doc(id).delete();

          // 로컬 데이터에서도 제거
          registrations = registrations.filter((item) => item.id !== id);
          filteredRegistrations = filteredRegistrations.filter(
            (item) => item.id !== id
          );

          // UI 업데이트
          alert("데이터가 성공적으로 삭제되었습니다.");

          // 테이블 다시 렌더링
          updateCounts();
          renderTable();

          // 페이지가 비었다면 이전 페이지로 이동
          if (
            filteredRegistrations.length <= (currentPage - 1) * itemsPerPage &&
            currentPage > 1
          ) {
            currentPage--;
            renderTable();
          }
        } catch (error) {
          console.error("데이터 삭제 중 오류 발생:", error);
          alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);

          // 버튼 상태 복원
          e.target.textContent = "삭제";
          e.target.disabled = false;
        }
      }
    });
  });
}

// 클립보드에 복사
function copyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = 0;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// 검색 처리
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredRegistrations = [...registrations];
  } else {
    filteredRegistrations = registrations.filter((item) => {
      return (
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.email && item.email.toLowerCase().includes(searchTerm)) ||
        (item.phone && item.phone.includes(searchTerm))
      );
    });
  }

  // 첫 페이지로 리셋
  currentPage = 1;

  // 데이터 카운트 업데이트
  updateCounts();

  // 테이블 렌더링
  renderTable();
}

// 날짜 필터 처리
function handleDateFilter() {
  const filterValue = dateFilter.value;
  const now = new Date();

  if (filterValue === "all") {
    filteredRegistrations = [...registrations];
  } else {
    filteredRegistrations = registrations.filter((item) => {
      const itemDate = new Date(item.created_at?.toDate() || item.timestamp);

      switch (filterValue) {
        case "today":
          return isSameDay(itemDate, now);
        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return isSameDay(itemDate, yesterday);
        case "week":
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return itemDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // 검색어가 있으면 함께 적용
  if (searchInput.value.trim() !== "") {
    handleSearch();
    return;
  }

  // 첫 페이지로 리셋
  currentPage = 1;

  // 데이터 카운트 업데이트
  updateCounts();

  // 테이블 렌더링
  renderTable();
}

// 페이지 이동
function navigatePage(direction) {
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const newPage = currentPage + direction;

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    renderTable();
  }
}

// 페이지네이션 정보 업데이트
function updatePagination() {
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  pageInfo.textContent = `페이지 ${currentPage} / ${totalPages || 1}`;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// 데이터 카운트 업데이트
function updateCounts() {
  totalCount.textContent = registrations.length;
  filteredCount.textContent = filteredRegistrations.length;
}

// 통계 업데이트
function updateStatistics() {
  if (registrations.length === 0) return;

  // 총 신청자 수
  statTotal.textContent = registrations.length;

  // 오늘 신청자 수
  const today = new Date();
  const todayRegistrations = registrations.filter((item) => {
    const itemDate = new Date(item.created_at?.toDate() || item.timestamp);
    return isSameDay(itemDate, today);
  });
  statToday.textContent = todayRegistrations.length;

  // 최근 7일 신청자 수
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const weekRegistrations = registrations.filter((item) => {
    const itemDate = new Date(item.created_at?.toDate() || item.timestamp);
    return itemDate >= weekAgo;
  });
  statWeek.textContent = weekRegistrations.length;

  // 평균 신청률 (하루 평균)
  const dates = registrations.map((item) =>
    new Date(item.created_at?.toDate() || item.timestamp).toDateString()
  );
  const uniqueDates = [...new Set(dates)];
  const avgPerDay = (registrations.length / uniqueDates.length).toFixed(1);
  statAvg.textContent = `${avgPerDay}명/일`;

  // 차트 초기화
  if (window.chartFunctions) {
    window.chartFunctions.initializeCharts(registrations);
  }
}

// 엑셀 다운로드 처리
function handleExportExcel() {
  // CSV 형식으로 데이터 변환
  let csvContent = "No.,이름,이메일,전화번호,최종학력,생년월일,신청일시\n";

  filteredRegistrations.forEach((item) => {
    const formattedEducation = educationMap[item.education] || item.education;
    const formattedBirthdate = formatBirthdate(item.birthdate, item.gender);

    csvContent += `${item.index},"${item.name || ""}","${item.email || ""}","${
      item.phone || ""
    }","${formattedEducation || ""}","${formattedBirthdate || ""}","${
      item.formattedDate || ""
    }"\n`;
  });

  // BOM 추가 (한글 지원)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  // 다운로드 링크 생성 및 클릭
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `신한라이프_잡세미나_신청자_목록_${formatDateForFilename(new Date())}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 헬퍼 함수: 날짜 포맷팅
function formatDate(date) {
  if (!date) return "-";

  // 문자열이나 숫자인 경우 Date 객체로 변환
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch (e) {
      console.error("날짜 변환 오류:", e);
      return "-";
    }
  }

  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    console.error("유효하지 않은 날짜:", date);
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 헬퍼 함수: 같은 날짜인지 확인
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 헬퍼 함수: 파일명을 위한 날짜 포맷팅
function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

// 설문응답 데이터 로드
async function loadSurveyResponses() {
  try {
    const snapshot = await db
      .collection("survey_responses")
      .orderBy("submitted_at", "desc")
      .get();
    allSurveys = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      allSurveys.push({
        id: doc.id,
        ...data,
        submitted_at: data.submitted_at
          ? data.submitted_at.toDate()
          : new Date(),
      });
    });

    // 통계 업데이트
    updateSurveyStats();

    // 테이블 업데이트
    filteredSurveys = [...allSurveys];
    displaySurveyResponses();
  } catch (error) {
    console.error("설문응답 데이터 로드 실패:", error);
    alert("설문응답 데이터를 불러오는 데 실패했습니다.");
  }
}

// 설문응답 통계 업데이트
function updateSurveyStats() {
  const surveyTotalCount = document.getElementById("survey-total-count");
  const surveyFilteredCount = document.getElementById("survey-filtered-count");

  if (surveyTotalCount) surveyTotalCount.textContent = allSurveys.length;
  if (surveyFilteredCount)
    surveyFilteredCount.textContent = filteredSurveys.length;
}

// 설문응답 목록 표시 - 모바일 최적화
function displaySurveyResponses() {
  const tableBody = document.getElementById("surveys-table");
  const startIndex = (currentSurveyPage - 1) * surveysPerPage;
  const endIndex = startIndex + surveysPerPage;
  const pageItems = filteredSurveys.slice(startIndex, endIndex);
  const isMobile = isMobileDevice();

  tableBody.innerHTML = "";

  if (pageItems.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="no-data">표시할 설문 응답이 없습니다.</td></tr>`;
    return;
  }

  pageItems.forEach((survey, index) => {
    const row = document.createElement("tr");
    const rowNumber = startIndex + index + 1;

    const formattedDate = survey.submitted_at
      ? formatDate(survey.submitted_at)
      : "날짜 없음";

    if (isMobile) {
      // 모바일 레이아웃
      row.innerHTML = `
        <td>${rowNumber}</td>
        <td>
          ${survey.name || "-"}
          <div class="mobile-details">
            <small>이메일: ${survey.email || "-"}</small>
          </div>
        </td>
        <td>${formattedDate}</td>
        <td><button class="btn-view" data-id="${
          survey.id
        }">상세보기</button></td>
      `;
    } else {
      // 데스크톱 레이아웃
      row.innerHTML = `
        <td>${rowNumber}</td>
        <td>${survey.name || "-"}</td>
        <td>${survey.email || "-"}</td>
        <td>${
          survey.question1 ? survey.question1.substring(0, 10) + "..." : "-"
        }</td>
        <td>${survey.education || "-"}</td>
        <td>${survey.credit_score || "-"}</td>
        <td>${formattedDate}</td>
        <td><button class="btn-view" data-id="${
          survey.id
        }">상세보기</button></td>
      `;
    }

    tableBody.appendChild(row);
  });

  // 상세보기 버튼에 이벤트 리스너 추가
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const surveyId = btn.getAttribute("data-id");
      showSurveyDetails(surveyId);
    });
  });

  // 페이지네이션 업데이트
  updateSurveyPagination();
}

// 설문 상세정보 표시
function showSurveyDetails(surveyId) {
  const survey = allSurveys.find((s) => s.id === surveyId);
  if (!survey) return;

  const modal = document.getElementById("survey-detail-modal");
  const contentDiv = document.getElementById("survey-detail-content");

  if (!modal || !contentDiv) return;

  // 설문 질문 레이블 정의
  const questionLabels = {
    question1: "[질문 1] 본인의 성향",
    question2: "[질문 2] 복장 및 태도 기준 동의",
    question3: "[질문 3] 최근 활동 및 직무",
    question4: "[질문 4] 취업 독려금 조건 동의",
    education: "[질문 5-1] 최종 학력",
    credit_score: "[질문 5-2] 신용점수",
    question6: "[질문 6] 인적성 검사 동의",
    question7: "[질문 7] 세미나 지원 이유",
    question8: "[질문 8] 기대하는 점 (선택)",
  };

  // 모달 내용 생성
  let detailsHTML = `
    <div class="survey-detail-header">
      <h3>${survey.name}님의 설문 응답</h3>
      <p><strong>이메일:</strong> ${survey.email}</p>
      <p><strong>제출일시:</strong> ${formatDate(survey.submitted_at, true)}</p>
    </div>
    <div class="survey-detail-content">
  `;

  // 각 설문 질문 및 응답 추가
  for (const [key, label] of Object.entries(questionLabels)) {
    const value = survey[key] || "응답 없음";
    detailsHTML += `
      <div class="survey-item">
        <div class="survey-question">${label}</div>
        <div class="survey-answer">${value}</div>
      </div>
    `;
  }

  detailsHTML += `</div>`;

  contentDiv.innerHTML = detailsHTML;

  // 모달 표시
  modal.style.display = "block";

  // 닫기 버튼 이벤트
  const closeBtn = modal.querySelector(".close-modal");
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  // 모달 외부 클릭 시 닫기
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

// 설문응답 페이지네이션 업데이트
function updateSurveyPagination() {
  const prevBtn = document.getElementById("survey-prev-page");
  const nextBtn = document.getElementById("survey-next-page");
  const pageInfo = document.getElementById("survey-page-info");

  const totalPages = Math.ceil(filteredSurveys.length / surveysPerPage);

  if (pageInfo)
    pageInfo.textContent = `페이지 ${currentSurveyPage} / ${totalPages || 1}`;

  if (prevBtn) {
    prevBtn.disabled = currentSurveyPage <= 1;
    prevBtn.onclick = () => {
      if (currentSurveyPage > 1) {
        currentSurveyPage--;
        displaySurveyResponses();
      }
    };
  }

  if (nextBtn) {
    nextBtn.disabled = currentSurveyPage >= totalPages;
    nextBtn.onclick = () => {
      if (currentSurveyPage < totalPages) {
        currentSurveyPage++;
        displaySurveyResponses();
      }
    };
  }
}

// 설문응답 검색 기능
function setupSurveySearch() {
  const searchInput = document.getElementById("survey-search-input");
  const searchBtn = document.getElementById("survey-search-btn");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      performSurveySearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSurveySearch();
      }
    });
  }
}

// 설문응답 검색 실행
function performSurveySearch() {
  const searchInput = document.getElementById("survey-search-input");
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!searchTerm) {
    filteredSurveys = [...allSurveys];
  } else {
    filteredSurveys = allSurveys.filter((survey) => {
      return (
        (survey.name && survey.name.toLowerCase().includes(searchTerm)) ||
        (survey.email && survey.email.toLowerCase().includes(searchTerm))
      );
    });
  }

  currentSurveyPage = 1;
  updateSurveyStats();
  displaySurveyResponses();
}

// 설문응답 날짜 필터링
function setupSurveyDateFilter() {
  const dateFilter = document.getElementById("survey-date-filter");

  if (dateFilter) {
    dateFilter.addEventListener("change", () => {
      const filterValue = dateFilter.value;

      if (filterValue === "all") {
        filteredSurveys = [...allSurveys];
      } else {
        const now = new Date();
        let compareDate = new Date();

        switch (filterValue) {
          case "today":
            compareDate.setHours(0, 0, 0, 0);
            break;
          case "yesterday":
            compareDate.setDate(compareDate.getDate() - 1);
            compareDate.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(compareDate);
            yesterdayEnd.setHours(23, 59, 59, 999);
            filteredSurveys = allSurveys.filter((survey) => {
              return (
                survey.submitted_at >= compareDate &&
                survey.submitted_at <= yesterdayEnd
              );
            });
            currentSurveyPage = 1;
            updateSurveyStats();
            displaySurveyResponses();
            return;
          case "week":
            compareDate.setDate(compareDate.getDate() - 7);
            break;
          case "month":
            compareDate.setDate(compareDate.getDate() - 30);
            break;
        }

        filteredSurveys = allSurveys.filter((survey) => {
          return survey.submitted_at >= compareDate;
        });
      }

      currentSurveyPage = 1;
      updateSurveyStats();
      displaySurveyResponses();
    });
  }
}

// 설문응답 엑셀 다운로드
function setupSurveyExcelExport() {
  const exportBtn = document.getElementById("export-surveys-excel");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (filteredSurveys.length === 0) {
        alert("내보낼 설문 응답 데이터가 없습니다.");
        return;
      }

      const headers = [
        "번호",
        "이름",
        "이메일",
        "성향",
        "복장/태도 동의",
        "최근 활동/직무",
        "취업 독려금 동의",
        "최종 학력",
        "신용점수",
        "인적성 검사 동의",
        "지원 이유",
        "기대하는 점",
        "제출일시",
      ];

      const rows = filteredSurveys.map((survey, index) => {
        return [
          index + 1,
          survey.name || "",
          survey.email || "",
          survey.question1 || "",
          survey.question2 || "",
          survey.question3 || "",
          survey.question4 || "",
          survey.education || "",
          survey.credit_score || "",
          survey.question6 || "",
          survey.question7 || "",
          survey.question8 || "",
          formatDate(survey.submitted_at, true),
        ];
      });

      exportToExcel("신한라이프_설문응답_목록", headers, rows);
    });
  }
}
