export function validateAddressInput(addr: { addrName: string; recipient: string; postalCode: string; roadAddr: string; detailAddr?: string; recipientPhone: string }) {
  const errors: Record<string, string> = {};

  const phoneRegex = /^(?:(?:01[0-9])|(?:02|0[3-6][1-5]|070))[-]?[0-9]{3,4}[-]?[0-9]{4}$/;
  const postalRegex = /^[0-9]{5}$/;

  // 배송지 이름
  if (!addr.addrName.trim()) errors.addrName = '배송지 이름을 입력하세요.';
  else if (addr.addrName.length > 30) errors.addrName = '배송지 이름은 30자 이하로 입력하세요.';

  // 받는 사람
  if (!addr.recipient.trim()) errors.recipient = '받는 사람 이름을 입력하세요.';

  // 연락처
  if (!addr.recipientPhone.trim()) errors.recipientPhone = '연락처를 입력하세요.';
  else if (!phoneRegex.test(addr.recipientPhone)) errors.recipientPhone = '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678 또는 02-123-4567)';

  // 우편번호
  if (!addr.postalCode.trim()) errors.postalCode = '우편번호를 입력하세요.';
  else if (!postalRegex.test(addr.postalCode)) errors.postalCode = '우편번호는 5자리 숫자여야 합니다.';

  // 도로명 주소
  if (!addr.roadAddr.trim()) errors.roadAddr = '도로명 주소를 입력하세요.';
  else if (addr.roadAddr.length > 100) errors.roadAddr = '도로명 주소는 100자 이하로 입력하세요.';

  // 상세 주소 (선택)
  if (addr.detailAddr && addr.detailAddr.length > 100) errors.detailAddr = '상세 주소는 100자 이하로 입력하세요.';

  // 오류가 있으면 객체 반환, 없으면 null
  return Object.keys(errors).length > 0 ? errors : null;
}
