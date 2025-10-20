import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { MapPin } from 'lucide-react';
import { endpoints, getData, postData, deleteData } from '@/api/apis';
import type { AddrAddRequest, AddrUpdateRequest, AddressResponse, resetDefaultAddr } from '@/types/address';
import { validateAddressInput } from '@/utils/validator';

interface SavedAddressModalProps {
  mode: 'mypage' | 'backing';
  onSelectAddress?: (address: resetDefaultAddr) => void;
  triggerText?: string;
}

export function SavedAddressModal({ mode, onSelectAddress, triggerText = '배송지 관리' }: SavedAddressModalProps) {
  const tempUserId = 1;
  const [addrList, setAddrList] = useState<AddressResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 한 페이지당 표시할 항목 수
  const totalPages = Math.max(1, Math.ceil(addrList.length / itemsPerPage));

  // 페이지 그룹
  const pagesPerGroup = 5;
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const groupStart = currentGroup * pagesPerGroup + 1;
  const groupEnd = Math.min(groupStart + pagesPerGroup - 1, totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAddresses = addrList.slice(startIndex, endIndex);

  //커서가 해당위치에서 뺼때 에러제거
  const handleAddInputBlur = (field: keyof AddrAddRequest) => {
    setAddrAddErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field]; // 해당 필드 에러만 제거
      return newErrors;
    });
  };

  // 주소 리스트 변경 시 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [addrList]);

  // 추가 모달
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addrAdd, setAddrAdd] = useState<AddrAddRequest>({
    addrName: '',
    recipient: '',
    postalCode: '',
    roadAddr: '',
    detailAddr: '',
    recipientPhone: '',
    isDefault: 'N',
  });
  const [addrAddErrors, setAddrAddErrors] = useState<Record<string, string>>({});

  //입력창을 띄울때마다 초기화
  useEffect(() => {
    if (!isAddDialogOpen) {
      setAddrAdd({
        addrName: '',
        recipient: '',
        postalCode: '',
        roadAddr: '',
        detailAddr: '',
        recipientPhone: '',
        isDefault: 'N',
      });
      setAddrAddErrors({});
    }
  }, [isAddDialogOpen]);

  // 수정 모달
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addrEdit, setAddrEdit] = useState<AddrUpdateRequest>({
    addrId: 0,
    userId: tempUserId,
    addrName: '',
    recipient: '',
    postalCode: '',
    roadAddr: '',
    detailAddr: '',
    recipientPhone: '',
  });
  const [addrEditErrors, setAddrEditErrors] = useState<Record<string, string>>({});

  // 주소 목록 불러오기
  useEffect(() => {
    const fetchAddressList = async () => {
      const response = await getData(endpoints.getAddressList(tempUserId));
      if (response.status === 200) setAddrList(response.data);
    };
    if (isOpen) fetchAddressList();
  }, [isOpen]);

  // 배송지 추가
  const handleAddAddress = async () => {
    const errors = validateAddressInput(addrAdd);
    if (errors) {
      setAddrAddErrors(errors);
      return;
    } else {
      setAddrAddErrors({});
    }

    const response = await postData(endpoints.createAddress(tempUserId), addrAdd);
    if (response.status === 200) {
      alert('배송지가 추가되었습니다.');
      const addrResponse = await getData(endpoints.getAddressList(tempUserId));
      if (addrResponse.status === 200) setAddrList(addrResponse.data);
      setIsAddDialogOpen(false);
      setAddrAdd({
        addrName: '',
        recipient: '',
        postalCode: '',
        roadAddr: '',
        detailAddr: '',
        recipientPhone: '',
        isDefault: 'N',
      });
      setAddrAddErrors({});
    } else {
      alert('배송지 추가 실패');
    }
  };

  // 기본 배송지 설정
  const handleSetDefaultAddress = async (addr: AddressResponse) => {
    try {
      const payload: resetDefaultAddr = {
        userId: addr.userId,
        addrId: addr.addrId,
        isDefault: 'Y',
      };
      const response = await postData(endpoints.setAddressDefault(payload.userId, payload.addrId), { ...addr, isDefault: 'Y' });
      if (response.status === 200) {
        alert('기본 배송지가 변경되었습니다.');
        const addrResponse = await getData(endpoints.getAddressList(payload.userId));
        if (addrResponse.status === 200) setAddrList(addrResponse.data);
      } else {
        alert('기본 배송지 설정 실패');
      }
    } catch (error) {
      console.error(error);
      alert('기본 배송지 설정 중 오류 발생');
    }
  };

  // 배송지 수정
  const handleEditAddress = async () => {
    const errors = validateAddressInput(addrEdit);
    if (errors) {
      setAddrEditErrors(errors);
      return;
    } else {
      setAddrEditErrors({});
    }

    const response = await postData(endpoints.updateAddress(tempUserId, addrEdit.addrId), addrEdit);
    if (response.status === 200) {
      alert('배송지가 수정되었습니다.');
      const addrResponse = await getData(endpoints.getAddressList(tempUserId));
      if (addrResponse.status === 200) setAddrList(addrResponse.data);
      setIsEditDialogOpen(false);
    } else {
      alert('배송지 수정 실패');
    }
  };

  // 배송지 삭제
  const handleDeleteAddress = async (addrId: number) => {
    const response = await deleteData(endpoints.deleteAddress(tempUserId, addrId), {});
    if (response.status === 200) {
      alert('배송지가 삭제되었습니다.');
      setAddrList((prev) => prev.filter((a) => a.addrId !== addrId));
    } else {
      alert('배송지 삭제 실패');
    }
  };

  // 입력 변경
  const handleAddInputChange = (field: keyof AddrAddRequest, value: string) => {
    const newData = { ...addrAdd, [field]: value };
    setAddrAdd(newData);

    const allErrors = validateAddressInput(newData);

    setAddrAddErrors((prev) => {
      const newErrors = { ...prev };

      if (allErrors && allErrors[field]) {
        // 현재 필드가 여전히 유효하지 않으면 에러 유지
        newErrors[field] = allErrors[field];
      } else {
        //해당 필드가 유효해졌으면 에러 제거
        delete newErrors[field];
      }

      return newErrors;
    });
  };

  const handleEditInputChange = (field: keyof AddrUpdateRequest, value: string) => {
    const newData = { ...addrEdit, [field]: value };
    setAddrEdit(newData);

    const allErrors = validateAddressInput(newData);

    setAddrEditErrors((prev) => {
      const newErrors = { ...prev };

      if (allErrors && allErrors[field]) {
        // 해당 필드에 아직 오류가 있으면 유지
        newErrors[field] = allErrors[field];
      } else {
        // 유효해졌으면 제거
        delete newErrors[field];
      }

      return newErrors;
    });
  };
  // 렌더링
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <MapPin className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>배송지 관리</DialogTitle>
          <DialogDescription>저장된 배송지를 관리하세요.</DialogDescription>
        </DialogHeader>

        {/* 배송지 추가 */}
        <div className="mt-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">배송지 추가</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 배송지 추가</DialogTitle>
                <DialogDescription>배송지 정보를 입력하세요.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {[
                  { label: '배송지 이름', field: 'addrName' },
                  { label: '받는 사람', field: 'recipient' },
                  { label: '연락처', field: 'recipientPhone', placeholder: '예: 010-1234-5678 또는 02-123-4567' },
                  { label: '우편번호', field: 'postalCode' },
                  { label: '도로명 주소', field: 'roadAddr' },
                  { label: '상세 주소', field: 'detailAddr' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input type="text" className={`w-full border p-2 rounded ${addrAddErrors[field as string] ? 'border-red-500' : ''}`} value={(addrAdd as any)[field]} placeholder={placeholder} onChange={(e) => handleAddInputChange(field as keyof AddrAddRequest, e.target.value)} onBlur={() => handleAddInputBlur(field as keyof AddrAddRequest)} />

                    {/* 에러 메시지 영역 높이 고정 */}
                    <p className={`text-xs mt-1 min-h-[1.25rem] ${addrAddErrors[field as string] ? 'text-red-600' : 'text-transparent'}`}>{addrAddErrors[field as string] || 'placeholder'}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">취소</Button>
                </DialogClose>
                <Button onClick={handleAddAddress}>추가</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 배송지 리스트 */}
        <div className="mt-4 space-y-4">
          {addrList.length > 0 ? (
            currentAddresses.map((addr) => (
              <div key={addr.addrId} className="p-4 border rounded-lg flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{addr.addrName}</h4>
                  <p className="text-sm text-gray-500">
                    {addr.recipient} ({addr.recipientPhone})
                  </p>
                  <p className="text-sm text-gray-500">
                    {addr.roadAddr} {addr.detailAddr}
                  </p>
                  <Badge variant={addr.isDefault === 'Y' ? 'default' : 'secondary'}>{addr.isDefault === 'Y' ? '기본배송지' : '보조배송지'}</Badge>
                </div>

                {mode === 'mypage' ? (
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" disabled={addr.isDefault === 'Y'} onClick={() => handleSetDefaultAddress(addr)}>
                      기본 설정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddrEdit(addr);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      수정
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteAddress(addr.addrId)}>
                      삭제
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectAddress?.(addr);
                        setIsOpen(false);
                      }}
                    >
                      선택
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">등록된 배송지가 없습니다.</p>
          )}
        </div>

        {/* 페이지네이션 */}
        {addrList.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button size="sm" variant="outline" disabled={currentGroup === 0} onClick={() => setCurrentPage(groupStart - pagesPerGroup)}>
              이전
            </Button>

            {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map((pageNum) => (
              <Button key={pageNum} size="sm" variant={currentPage === pageNum ? 'default' : 'outline'} onClick={() => setCurrentPage(pageNum)}>
                {pageNum}
              </Button>
            ))}

            <Button size="sm" variant="outline" disabled={groupEnd === totalPages} onClick={() => setCurrentPage(groupEnd + 1)}>
              다음
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
