

export function MyPage() {

  // const MypageAddrDelete = async (addrId: number) => {
  //   const response = await deleteData(endpoints.deleteAddress(tempUserId, addrId), {});
  //   if (response.status === 200) {
  //     alert('배송지가 삭제되었습니다.');

  //     const addrResponse = await getData(endpoints.getAddressList(tempUserId));
  //     if (addrResponse.status === 200) {
  //       setAddressList(addrResponse.data);
  //     }
  //     setIsDeleteDialogOpen(false);
  //     setSelectedAddrId(null);

  //     return true;
  //   } else {
  //     alert('배송지 삭제 실패');
  //     return false;
  //   }
  // };

  // const MypageAddrAdd = async (newAddr: AddrAddRequest) => {
  //   const response = await postData(endpoints.createAddress(tempUserId), newAddr);
  //   if (response.status === 200) {
  //     alert('배송지가 추가되었습니다.');

  //     const addrResponse = await getData(endpoints.getAddressList(tempUserId));
  //     if (addrResponse.status === 200) {
  //       setAddressList(addrResponse.data);
  //     }
  //     return true;
  //     setIsAddDialogOpen(false);
  //   } else {
  //     alert('배송지 추가 실패');
  //     return false;
  //   }
  // };

  // const MyPageAddrUpdate = async (addrId: number, updateAddr: AddrUpdateRequest) => {
  //   const response = await postData(endpoints.updateAddress(tempUserId, addrId), updateAddr);
  //   if (response.status === 200) {
  //     alert('배송지가 수정되었습니다.');

  //     const addrResponse = await getData(endpoints.getAddressList(tempUserId));
  //     if (addrResponse.status === 200) {
  //       setAddressList(addrResponse.data);
  //     }
  //     setIsEditDialogOpen(false);
  //     return true;
  //   } else {
  //     alert('배송지 수정 실패');
  //     return false;
  //   }
  // };

  return (
    <></>
  );
}
