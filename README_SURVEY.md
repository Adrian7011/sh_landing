# 신한라이프 잡세미나 설문조사 시스템

이 문서는 신한라이프 잡세미나 웹사이트에 추가된 설문조사 시스템의 설명과 설정 방법을 안내합니다.

## 시스템 구성

1. **참가 신청 폼**: 메인 페이지의 신청 폼을 통해 사용자 정보를 수집합니다.
2. **설문조사 페이지**: 사용자가 받은 링크를 통해 접근할 수 있는 설문조사 페이지입니다.
3. **이메일 발송 기능**: Firebase Cloud Functions를 통해 설문조사 링크를 이메일로 발송합니다.
4. **관리자 대시보드**: 설문 응답을 확인하고 관리할 수 있는 관리자 인터페이스입니다.

## 설정 방법

### 1. Firebase Functions 설정

이메일 발송을 위해 Firebase Functions의 환경 변수를 설정해야 합니다.

```bash
# Firebase CLI 설치 (아직 설치하지 않은 경우)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Gmail 계정 설정 (이메일 발송에 사용됨)
firebase functions:config:set gmail.email="발신용_이메일@gmail.com" gmail.password="앱_비밀번호"
```

> **중요**: Gmail에서 앱 비밀번호를 생성해야 합니다. 일반 계정 비밀번호가 아닌 앱 비밀번호를 사용해야 합니다.
> Gmail 앱 비밀번호 생성 방법: [Google 계정 보안 > 앱 비밀번호](https://myaccount.google.com/apppasswords)

### 2. 배포 방법

프로젝트를 배포하려면 다음 명령어를 사용합니다.

```bash
# Firestore 규칙 배포
firebase deploy --only firestore

# Cloud Functions 배포
firebase deploy --only functions

# 웹사이트 배포
firebase deploy --only hosting

# 또는 전체 배포
firebase deploy
```

## 시스템 흐름

1. 사용자가 메인 페이지에서 참가 신청 폼을 작성하고 제출합니다.
2. 시스템은 Firestore에 사용자 정보를 저장하고, `email_queue` 컬렉션에 이메일 발송 요청을 추가합니다.
3. Firebase Cloud Functions는 이메일 큐를 모니터링하고, 새로운 요청이 들어오면 설문조사 링크가 포함된 이메일을 발송합니다.
4. 사용자는 이메일 링크를 통해 설문조사 페이지에 접속하여 응답합니다.
5. 설문 응답은 Firestore `survey_responses` 컬렉션에 저장됩니다.
6. 관리자는 관리자 대시보드에서 설문 응답을 확인하고 관리할 수 있습니다.

## 데이터베이스 구조

- `registrations`: 참가 신청 정보
- `email_queue`: 이메일 발송 요청 큐
- `survey_responses`: 사용자의 설문 응답

## 주의사항

1. Gmail을 통한 이메일 발송은 일일 할당량에 제한이 있습니다. 대량 발송 시 다른 이메일 서비스 (SendGrid, Mailgun 등)를 고려하세요.
2. Firebase Functions의 환경 변수는 보안을 위해 콘솔에 표시되지 않습니다.
3. 개인정보 보호를 위해 Firestore 보안 규칙을 신중하게 설정해야 합니다.

## 문제 해결

- 이메일이 발송되지 않는 경우, Firebase 콘솔에서 Functions 로그를 확인하세요.
- 설문 응답이 저장되지 않는 경우, 브라우저 콘솔에서 오류 메시지를 확인하고 Firestore 규칙을 검토하세요.

## 연락처

문제가 발생하거나 도움이 필요한 경우 관리자에게 문의하세요: ingchief@daum.net
