import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { MapPin } from 'lucide-react';
import { endpoints, getData, postData, deleteData } from '@/api/apis';
import type { AddrAddRequest, AddrUpdateRequest, AddressResponse, resetDefaultAddr } from '@/types/address';
import { validateAddressInput } from '@/utils/validator';
import { useCookies } from 'react-cookie';

interface SavedAddressModalProps {
  mode: 'mypage' | 'backing';
  onSelectAddress?: (address: resetDefaultAddr) => void;
  triggerText?: string;
}

export function SavedAddressModal({ mode, onSelectAddress, triggerText = '배송지 관리' }: SavedAddressModalProps) {
  // const tempUserId = 1;
  const [cookie] = useCookies();
  const [addrList, setAddrList] = useState<AddressResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 추가 모달 상태
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

  // 수정 모달 상태
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addrEdit, setAddrEdit] = useState<AddrUpdateRequest>({
    addrId: 0,
    addrName: '',
    recipient: '',
    postalCode: '',
    roadAddr: '',
    detailAddr: '',
    recipientPhone: '',
  });
  const [addrEditErrors, setAddrEditErrors] = useState<Record<string, string>>({});

  // 주소 목록 불러오기
  const fetchAddressList = async () => {
    const response = await getData(endpoints.getAddressList, cookie.accessToken);
    if (response.status === 200) setAddrList(response.data);
  };

  useEffect(() => {
    if (isOpen) fetchAddressList();
  }, [isOpen]);

  // 추가
  const handleAddAddress = async () => {
    const errors = validateAddressInput(addrAdd);
    if (errors) {
      setAddrAddErrors(errors);
      return;
    }
    const response = await postData(endpoints.createAddress, addrAdd, cookie.accessToken);
    if (response.status === 200) {
      alert('배송지가 추가되었습니다.');
      await fetchAddressList();
      setIsAddDialogOpen(false);
    } else alert('배송지 추가 실패');
  };

  // 수정
  const handleEditAddress = async () => {
    const errors = validateAddressInput(addrEdit);
    if (errors) {
      setAddrEditErrors(errors);
      return;
    }
    const response = await postData(endpoints.updateAddress(addrEdit.addrId), addrEdit, cookie.accessToken);
    if (response.status === 200) {
      alert('배송지가 수정되었습니다.');
      await fetchAddressList();
      setIsEditDialogOpen(false);
    } else alert('배송지 수정 실패');
  };

  // 기본 배송지 설정
  const handleSetDefaultAddress = async (addr: AddressResponse) => {
    try {
      const response = await postData(endpoints.setAddressDefault(addr.addrId), { ...addr, isDefault: 'Y' }, cookie.accessToken);
      if (response.status === 200) {
        alert('기본 배송지가 변경되었습니다.');
        await fetchAddressList();
      } else alert('기본 배송지 설정 실패');
    } catch (error) {
      console.error(error);
      alert('기본 배송지 설정 중 오류 발생');
    }
  };

  // 삭제
  const handleDeleteAddress = async (addrId: number) => {
    const res = await deleteData(endpoints.deleteAddress(addrId), cookie.accessToken);
    if (res.status === 200) {
      alert('배송지가 삭제되었습니다.');
      setAddrList((prev) => prev.filter((a) => a.addrId !== addrId));
    } else alert('배송지 삭제 실패');
  };

  // 입력 핸들러 (추가 / 수정 공통)
  const handleChange = (
    mode: 'add' | 'edit',
    field: keyof AddrAddRequest | keyof AddrUpdateRequest,
    value: string
  ) => {
    if (mode === 'add') {
      const newData = { ...addrAdd, [field]: value };
      setAddrAdd(newData);
      const allErrors = validateAddressInput(newData);
      setAddrAddErrors((prev) => {
        const next = { ...prev };
        allErrors?.[field as string] ? (next[field as string] = allErrors[field as string]) : delete next[field as string];
        return next;
      });
    } else {
      const newData = { ...addrEdit, [field]: value };
      setAddrEdit(newData);
      const allErrors = validateAddressInput(newData);
      setAddrEditErrors((prev) => {
        const next = { ...prev };
        allErrors?.[field as string] ? (next[field as string] = allErrors[field as string]) : delete next[field as string];
        return next;
      });
    }
  };

  // 렌더링
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-base hover:bg-[rgba(79,137,250,0.2)] font-semibold cursor-pointer">
          <MapPin className="mr-2 h-4 w-4" />
          <p className='w-full justify-start py-2 rounded-md text-left flex items-center gap-2 text-gray-700 font-semibold'>{triggerText}</p>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-lg border border-gray-200 bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>📦 배송지 관리</DialogTitle>
          <DialogDescription>저장된 배송지를 관리하세요.</DialogDescription>
        </DialogHeader>

        {/* 배송지 추가 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-2">배송지 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>📦 새 배송지 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {[
                { label: '배송지 이름', field: 'addrName' },
                { label: '받는 사람', field: 'recipient' },
                { label: '연락처', field: 'recipientPhone' },
                { label: '우편번호', field: 'postalCode' },
                { label: '도로명 주소', field: 'roadAddr' },
                { label: '상세 주소', field: 'detailAddr' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    value={(addrAdd as any)[field]}
                    onChange={(e) => handleChange('add', field as keyof AddrAddRequest, e.target.value)}
                    className={`w-full border p-2 rounded ${addrAddErrors[field] ? 'border-red-500' : ''}`}
                  />
                  <p className="text-xs text-red-500 h-4">{addrAddErrors[field] || ''}</p>
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

        {/* 주소 리스트 (스크롤 방식) */}
        <div className="mt-4 max-h-[400px] overflow-y-scroll space-y-3">
          {addrList.length > 0 ? (
            addrList.map((addr) => (
              <div key={addr.addrId} className="p-4 border border-gray-200 bg-white rounded-xl flex justify-between shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
                <div>
                  <h4 className="font-medium">{addr.addrName}</h4>
                  <p className="text-sm text-gray-500">
                    {addr.recipient} ({addr.recipientPhone})
                  </p>
                  <p className="text-sm text-gray-500">
                    {addr.roadAddr} {addr.detailAddr}
                  </p>
                  <Badge variant={addr.isDefault === 'Y' ? 'default' : 'secondary'}>
                    {addr.isDefault === 'Y' ? '기본배송지' : '보조배송지'}
                  </Badge>
                </div>

                {mode === 'mypage' ? (
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" disabled={addr.isDefault === 'Y'} onClick={() => handleSetDefaultAddress(addr)}>
                      기본 설정
                    </Button>

                    {/* 수정 버튼 */}
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
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">등록된 배송지가 없습니다.</p>
          )}
        </div>

        {/* 수정 모달 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>배송지 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {[
                { label: '배송지 이름', field: 'addrName' },
                { label: '받는 사람', field: 'recipient' },
                { label: '연락처', field: 'recipientPhone' },
                { label: '우편번호', field: 'postalCode' },
                { label: '도로명 주소', field: 'roadAddr' },
                { label: '상세 주소', field: 'detailAddr' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type="text"
                    value={(addrEdit as any)[field]}
                    onChange={(e) => handleChange('edit', field as keyof AddrUpdateRequest, e.target.value)}
                    className={`w-full border p-2 rounded ${addrEditErrors[field] ? 'border-red-500' : ''}`}
                  />
                  <p className="text-xs text-red-500 h-4">{addrEditErrors[field] || ''}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleEditAddress}>수정</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
