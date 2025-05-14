# Firebase 설정 가이드

이 가이드는 Firebase 콘솔에서 Firestore 데이터베이스를 설정하는 방법을 안내합니다. 폼 데이터를 저장하기 위해 이 단계들을 따라주세요.

## 1. Firestore 데이터베이스 생성하기

1. [Firebase 콘솔](https://console.firebase.google.com/)에 로그인하세요.
2. 프로젝트 `sh-landing-74407`를 선택하세요.
3. 왼쪽 메뉴에서 **Firestore Database**를 클릭하세요.
4. **데이터베이스 만들기** 버튼을 클릭하세요.
5. 보안 규칙에서 **테스트 모드로 시작**을 선택하세요 (나중에 보안 규칙을 업데이트할 수 있습니다).
6. 데이터베이스 위치를 선택하세요 (한국에 가장 가까운 `asia-northeast3`를 권장합니다).
7. **사용 설정**을 클릭하세요.

## 2. 보안 규칙 설정하기

Firestore 데이터베이스가 생성되면, 보안 규칙을 업데이트하세요:

1. Firestore 대시보드에서 **규칙** 탭을 선택하세요.
2. 다음 규칙을 입력하세요:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 누구나 등록 데이터를 생성할 수 있지만, 읽기는 관리자만 가능합니다
    match /registrations/{registrationId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

3. **게시** 버튼을 클릭하세요.

## 3. 웹 애플리케이션 확인하기

1. 배포된 웹사이트 URL인 [https://sh-landing-74407.web.app](https://sh-landing-74407.web.app)에 접속하세요.
2. 양식을 작성하고 "신청하기" 버튼을 클릭하세요.
3. Firebase 콘솔의 Firestore Database에서 `registrations` 컬렉션이 생성되었는지 확인하세요.
4. 데이터가 제대로 저장되었는지 확인하세요.

## 4. 제출된 데이터 확인하기

1. [Firebase 콘솔](https://console.firebase.google.com/)에 로그인하세요.
2. 프로젝트 `sh-landing-74407`를 선택하세요.
3. 왼쪽 메뉴에서 **Firestore Database**를 클릭하세요.
4. `registrations` 컬렉션을 선택하세요.
5. 여기서 모든 제출된 양식 데이터를 볼 수 있습니다.

## 5. (선택 사항) 데이터 내보내기

데이터를 CSV 파일로 내보내려면:

1. Firebase 콘솔에서 **프로젝트 설정**을 클릭하세요.
2. **서비스 계정** 탭을 선택하세요.
3. **새 비공개 키 생성**을 클릭하여 서비스 계정 키를 다운로드하세요.
4. [Firestore 내보내기 도구](https://github.com/dalenguyen/firestore-import-export)와 같은 오픈 소스 도구를 사용하여 데이터를 CSV로 내보낼 수 있습니다.

## 6. 추가 기능 개발 아이디어

- 관리자 페이지 개발: 제출된 데이터를 쉽게 확인하고 관리할 수 있는 관리자 페이지
- 이메일 알림: 새로운 등록이 있을 때 관리자에게 이메일 알림 보내기
- 데이터 필터링 및 정렬: 관리자가 제출된 데이터를 필터링하고 정렬할 수 있는 기능
- 등록 확인 이메일: 참가자에게 자동 등록 확인 이메일 보내기
