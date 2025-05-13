document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // 모바일 환경에서는 더 적은 오프셋 적용
        const isMobile = window.innerWidth <= 768;
        const headerHeight = header.offsetHeight;
        const scrollOffset = isMobile ? headerHeight - 10 : headerHeight + 20;

        window.scrollTo({
          top: targetElement.offsetTop - scrollOffset,
          behavior: "smooth",
        });

        // 모바일 메뉴 열려있을 경우 닫기
        if (isMobile && navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
        }
      }
    });
  });

  // Scroll animations
  const animateElements = document.querySelectorAll(".animate-on-scroll");

  const checkIfInView = () => {
    const windowHeight = window.innerHeight;
    const windowTopPosition = window.scrollY;
    const windowBottomPosition = windowTopPosition + windowHeight;

    animateElements.forEach((element) => {
      const elementHeight = element.offsetHeight;
      const elementTopPosition = element.offsetTop;
      const elementBottomPosition = elementTopPosition + elementHeight;

      // Check if element is in viewport
      if (
        elementBottomPosition >= windowTopPosition &&
        elementTopPosition <= windowBottomPosition
      ) {
        element.classList.add("visible");
      }
    });
  };

  // Initial check and add scroll event listener
  checkIfInView();
  window.addEventListener("scroll", checkIfInView);

  // Fixed header behavior
  const header = document.querySelector("header");
  const heroSection = document.querySelector(".hero");

  const updateHeaderStyle = () => {
    const scrollY = window.scrollY;
    const isMobile = window.innerWidth <= 768;

    if (scrollY > 20) {
      header.classList.add("header-scrolled");
      // 모바일에서도 스크롤 시 헤더 고정
      header.style.position = "fixed";
    } else {
      header.classList.remove("header-scrolled");
      // 상단에서는 절대 위치
      header.style.position = "absolute";
    }
  };

  // 초기 로드 시 헤더 스타일 설정
  updateHeaderStyle();

  // 스크롤 이벤트 리스너
  window.addEventListener("scroll", updateHeaderStyle);
  window.addEventListener("resize", updateHeaderStyle);

  // Mobile menu toggle
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");

      // ARIA 속성 추가
      const isExpanded = navMenu.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
    });

    // 모바일 메뉴 외부 클릭 시 닫기
    document.addEventListener("click", (event) => {
      const isMenuToggle =
        event.target === menuToggle || menuToggle.contains(event.target);
      const isNavMenu =
        event.target === navMenu || navMenu.contains(event.target);

      if (!isMenuToggle && !isNavMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", false);
      }
    });

    // 모바일 메뉴 항목 클릭 시 메뉴 닫기
    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", false);
      });
    });

    // ESC 키 누를 때 메뉴 닫기
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", false);
      }
    });
  }

  // Form validation
  const registrationForm = document.getElementById("registration-form");

  if (registrationForm) {
    registrationForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simple validation
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const phone = document.getElementById("phone");
      const education = document.getElementById("education");
      const birthdate = document.getElementById("birthdate");
      const gender = document.getElementById("gender");

      let isValid = true;

      if (!name.value.trim()) {
        showError(name, "이름을 입력해주세요");
        isValid = false;
      } else {
        removeError(name);
      }

      if (!email.value.trim()) {
        showError(email, "이메일을 입력해주세요");
        isValid = false;
      } else if (!isValidEmail(email.value)) {
        showError(email, "유효한 이메일 주소를 입력해주세요");
        isValid = false;
      } else {
        removeError(email);
      }

      if (!phone.value.trim()) {
        showError(phone, "전화번호를 입력해주세요");
        isValid = false;
      } else {
        removeError(phone);
      }

      if (!education.value) {
        showError(education, "최종학력을 선택해주세요");
        isValid = false;
      } else {
        removeError(education);
      }

      if (!birthdate.value) {
        showError(birthdate, "생년월일을 입력해주세요");
        isValid = false;
      } else {
        removeError(birthdate);
      }

      if (!gender.value) {
        showError(gender, "성별을 선택해주세요");
        isValid = false;
      } else {
        removeError(gender);
      }

      if (isValid) {
        // Show success message (in a real app, would submit to server)
        const successMessage = document.createElement("div");
        successMessage.className = "success-message";
        successMessage.innerHTML = `
                    <h3>신청이 완료되었습니다!</h3>
                    <p>신한라이프 잡세미나 신청해 주셔서 감사합니다. 곧 확인 이메일을 보내드리겠습니다.</p>
                `;

        registrationForm.style.display = "none";
        registrationForm.parentNode.appendChild(successMessage);
      }
    });
  }

  function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = "form-control error";
    const errorMessage =
      formControl.querySelector("small") || document.createElement("small");
    errorMessage.innerText = message;
    if (!formControl.querySelector("small")) {
      formControl.appendChild(errorMessage);
    }
  }

  function removeError(input) {
    const formControl = input.parentElement;
    formControl.className = "form-control";
    const small = formControl.querySelector("small");
    if (small) {
      small.innerText = "";
    }
  }

  function isValidEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  // Countdown timer to seminar date
  const countdownElement = document.getElementById("countdown");

  if (countdownElement) {
    const seminarDate = new Date("May 21, 2025 14:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = seminarDate - now;

      if (distance < 0) {
        countdownElement.innerHTML =
          '<div class="expired">세미나가 이미 종료되었습니다</div>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">일</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${hours}</span>
                    <span class="countdown-label">시간</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${minutes}</span>
                    <span class="countdown-label">분</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${seconds}</span>
                    <span class="countdown-label">초</span>
                </div>
            `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Add animation classes to elements when they enter viewport
  const elements = document.querySelectorAll(
    ".card, .timeline-item, .info-row"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
});
