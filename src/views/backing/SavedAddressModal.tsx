import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { MapPin } from 'lucide-react';

import { endpoints, getData, postData, deleteData } from '@/api/apis';
import type { AddrAddRequest, AddrUpdateRequest, AddressResponse, resetDefaultAddr } from '@/types/address';

interface SavedAddressModalProps {
  mode: 'mypage' | 'backing';
  onSelectAddress?: (address: resetDefaultAddr) => void; // 선택 시 callback
  triggerText?: string;
}

export function SavedAddressModal({ mode, onSelectAddress, triggerText = '배송지 관리' }: SavedAddressModalProps) {
  const tempUserId = 1;
  const [addrList, setAddrList] = useState<AddressResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    const fetchAddressList = async () => {
      const response = await getData(endpoints.getAddressList(tempUserId)); // userId 4
      if (response.status === 200) {
        setAddrList(response.data);
      }
    };
    if (isOpen) {
      fetchAddressList();
    }
  }, [isOpen]);

  const handleAddAddress = async () => {
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
    } else {
      alert('배송지 추가 실패');
    }
  };

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
        if (addrResponse.status === 200) {
          setAddrList(addrResponse.data);
        }
      } else {
        alert('기본 배송지 설정 실패 ');
      }
    } catch (error) {
      console.error(error);
      alert('기본 배송지 설정 중 오류 발생');
    }
  };

  const handleEditAddress = async () => {
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

  const handleDeleteAddress = async (addrId: number) => {
    const response = await deleteData(endpoints.deleteAddress(tempUserId, addrId), {});
    if (response.status === 200) {
      alert('배송지가 삭제되었습니다.');
      setAddrList((prev) => prev.filter((a) => a.addrId !== addrId));
    } else {
      alert('배송지 삭제 실패');
    }
  };

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

        {/* 하단 추가 버튼 */}
        <div className="mt-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">배송지 추가</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 배송지 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input type="text" placeholder="배송지 이름" className="w-full border p-2 rounded" value={addrAdd.addrName} onChange={(e) => setAddrAdd({ ...addrAdd, addrName: e.target.value })} />
                <input type="text" placeholder="받는 사람" className="w-full border p-2 rounded" value={addrAdd.recipient} onChange={(e) => setAddrAdd({ ...addrAdd, recipient: e.target.value })} />
                <input type="text" placeholder="연락처" className="w-full border p-2 rounded" value={addrAdd.recipientPhone} onChange={(e) => setAddrAdd({ ...addrAdd, recipientPhone: e.target.value })} />
                <input type="text" placeholder="우편번호" className="w-full border p-2 rounded" value={addrAdd.postalCode} onChange={(e) => setAddrAdd({ ...addrAdd, postalCode: e.target.value })} />
                <input type="text" placeholder="도로명 주소" className="w-full border p-2 rounded" value={addrAdd.roadAddr} onChange={(e) => setAddrAdd({ ...addrAdd, roadAddr: e.target.value })} />
                <input type="text" placeholder="상세 주소" className="w-full border p-2 rounded" value={addrAdd.detailAddr} onChange={(e) => setAddrAdd({ ...addrAdd, detailAddr: e.target.value })} />
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
            addrList.map((addr) => (
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

                {/* 모드 분기 */}
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
                        setIsOpen(false); // 선택 후 모달 닫기
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

        {/* 수정 모달 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>배송지 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input type="text" placeholder="배송지 이름" className="w-full border p-2 rounded" value={addrEdit.addrName} onChange={(e) => setAddrEdit({ ...addrEdit, addrName: e.target.value })} />
              <input type="text" placeholder="받는 사람" className="w-full border p-2 rounded" value={addrEdit.recipient} onChange={(e) => setAddrEdit({ ...addrEdit, recipient: e.target.value })} />
              <input type="text" placeholder="연락처" className="w-full border p-2 rounded" value={addrEdit.recipientPhone} onChange={(e) => setAddrEdit({ ...addrEdit, recipientPhone: e.target.value })} />
              <input type="text" placeholder="우편번호" className="w-full border p-2 rounded" value={addrEdit.postalCode} onChange={(e) => setAddrEdit({ ...addrEdit, postalCode: e.target.value })} />
              <input type="text" placeholder="도로명 주소" className="w-full border p-2 rounded" value={addrEdit.roadAddr} onChange={(e) => setAddrEdit({ ...addrEdit, roadAddr: e.target.value })} />
              <input type="text" placeholder="상세 주소" className="w-full border p-2 rounded" value={addrEdit.detailAddr} onChange={(e) => setAddrEdit({ ...addrEdit, detailAddr: e.target.value })} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button onClick={handleEditAddress}>저장</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
