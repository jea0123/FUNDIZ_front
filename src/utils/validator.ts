export function validateAddressInput(addr: { addrName: string; recipient: string; postalCode: string; roadAddr: string; detailAddr?: string; recipientPhone: string }) {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  const postalRegex = /^[0-9]{5}$/;

  if (!addr.addrName.trim()) return '배송지 이름을 입력하세요.';
  if (addr.addrName.length > 30) return '배송지 이름은 30자 이하로 입력하세요.';

  if (!addr.recipient.trim()) return '받는 사람 이름을 입력하세요.';

  if (!addr.recipientPhone.trim()) return '연락처를 입력하세요.';
  if (!phoneRegex.test(addr.recipientPhone)) return '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)';

  if (!postalRegex.test(addr.postalCode)) return '우편번호는 5자리 숫자여야 합니다.';

  if (!addr.roadAddr.trim()) return '도로명 주소를 입력하세요.';
  if (addr.roadAddr.length > 100) return '도로명 주소는 100자 이하로 입력하세요.';

  if (addr.detailAddr && addr.detailAddr.length > 100) return '상세 주소는 100자 이하로 입력하세요.';

  return null; //통과
}
