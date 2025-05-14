// 차트 관련 함수들을 정의합니다

// 차트 데이터 준비
function prepareChartData(registrations) {
  // 날짜별 등록 수 계산
  const dateCounts = {};
  const educationCounts = {
    "고등학교 졸업": 0,
    "전문대학 졸업": 0,
    "대학교 졸업": 0,
    석사: 0,
    박사: 0,
    기타: 0,
  };

  // 날짜 형식 변환 함수
  function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // 데이터 처리
  registrations.forEach((item) => {
    // 날짜별 카운트
    let dateStr;
    if (item.created_at && typeof item.created_at.toDate === "function") {
      dateStr = formatDate(item.created_at.toDate());
    } else if (item.timestamp) {
      dateStr = formatDate(new Date(item.timestamp));
    } else {
      return; // 날짜 없으면 건너뜀
    }

    if (!dateCounts[dateStr]) {
      dateCounts[dateStr] = 0;
    }
    dateCounts[dateStr]++;

    // 학력별 카운트
    const education = educationMap[item.education] || item.education || "기타";
    if (educationCounts.hasOwnProperty(education)) {
      educationCounts[education]++;
    } else {
      educationCounts["기타"]++;
    }
  });

  // 날짜 정렬
  const sortedDates = Object.keys(dateCounts).sort();

  return {
    dates: sortedDates,
    dateCounts: sortedDates.map((date) => dateCounts[date]),
    educationLabels: Object.keys(educationCounts),
    educationData: Object.values(educationCounts),
  };
}

// 차트 초기화 및 렌더링
function initializeCharts(registrations) {
  if (!registrations || registrations.length === 0) return;

  const chartData = prepareChartData(registrations);

  // 날짜별 등록 차트
  renderDailyChart(chartData);

  // 학력별 분포 차트
  renderEducationChart(chartData);
}

// 날짜별 등록 차트 렌더링
function renderDailyChart(chartData) {
  const ctx = document.getElementById("daily-chart");
  if (!ctx) return;

  // 기존 차트 제거
  if (window.dailyChart) {
    window.dailyChart.destroy();
  }

  window.dailyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.dates,
      datasets: [
        {
          label: "일별 신청자 수",
          data: chartData.dateCounts,
          backgroundColor: "rgba(11, 77, 162, 0.2)",
          borderColor: "rgba(11, 77, 162, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(11, 77, 162, 1)",
          pointRadius: 4,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "일별 신청자 현황",
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function (context) {
              return `신청자 수: ${context.parsed.y}명`;
            },
          },
        },
      },
    },
  });
}

// 학력별 분포 차트 렌더링
function renderEducationChart(chartData) {
  const ctx = document.getElementById("education-chart");
  if (!ctx) return;

  // 기존 차트 제거
  if (window.educationChart) {
    window.educationChart.destroy();
  }

  // 색상 배열
  const backgroundColors = [
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ];

  window.educationChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: chartData.educationLabels,
      datasets: [
        {
          data: chartData.educationData,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.6", "1")
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "학력별 분포",
          font: {
            size: 16,
          },
        },
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value}명 (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// 성별 분포 차트 렌더링
function renderGenderChart(registrations) {
  const ctx = document.getElementById("gender-chart");
  if (!ctx) return;

  // 기존 차트 제거
  if (window.genderChart) {
    window.genderChart.destroy();
  }

  // 성별 카운트
  const genderCounts = {
    남성: 0,
    여성: 0,
    "기타/응답안함": 0,
  };

  registrations.forEach((item) => {
    if (item.gender === "male") {
      genderCounts["남성"]++;
    } else if (item.gender === "female") {
      genderCounts["여성"]++;
    } else {
      genderCounts["기타/응답안함"]++;
    }
  });

  const labels = Object.keys(genderCounts);
  const data = Object.values(genderCounts);

  window.genderChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "성별 분포",
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce(
                (acc, val) => acc + val,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value}명 (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// 외부에서 사용할 함수 노출
window.chartFunctions = {
  initializeCharts,
  renderDailyChart,
  renderEducationChart,
  renderGenderChart,
};
