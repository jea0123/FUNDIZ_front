import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { MapPin, Home, Building, Package, Trash2, Edit } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  isDefault: boolean;
  label: string;
  type: "home" | "office" | "other";
}

interface SavedAddressModalProps {
  onSelectAddress: (address: Address) => void;
  triggerText?: string;
}

export function SavedAddressModal({ onSelectAddress, triggerText = "저장된 주소 불러오기" }: SavedAddressModalProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // 예시 저장된 주소들
  const savedAddresses: Address[] = [
    {
      id: "1",
      name: "김철수",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 테헤란로 123",
      detailAddress: "ABC빌딩 5층",
      zipCode: "06142",
      isDefault: true,
      label: "집",
      type: "home"
    },
    {
      id: "2",
      name: "김철수",
      phone: "010-1234-5678",
      address: "서울특별시 서초구 서초대로 456",
      detailAddress: "XYZ타워 12층 1205호",
      zipCode: "06653",
      isDefault: false,
      label: "회사",
      type: "office"
    },
    {
      id: "3",
      name: "박영희",
      phone: "010-9876-5432",
      address: "부산광역시 해운대구 해운대로 789",
      detailAddress: "해운대아파트 101동 502호",
      zipCode: "48094",
      isDefault: false,
      label: "부모님댁",
      type: "other"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "office":
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "home":
        return "bg-green-100 text-green-800";
      case "office":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectAddress = () => {
    const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
    if (selectedAddress) {
      onSelectAddress(selectedAddress);
      setIsOpen(false);
    }
  };

  const handleDeleteAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 주소 삭제 로직 (실제로는 API 호출)
    console.log("Delete address:", addressId);
  };

  const handleEditAddress = (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 주소 편집 로직
    console.log("Edit address:", addressId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            저장된 배송지
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {savedAddresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">저장된 배송지가 없습니다.</p>
              <p className="text-sm text-gray-400">새로운 배송지를 등록해보세요.</p>
            </div>
          ) : (
            <>
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="relative">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value={address.id} 
                          id={address.id} 
                          className="mt-1" 
                        />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <Card className={`transition-colors ${
                            selectedAddressId === address.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`${getTypeColor(address.type)} border-0`}>
                                    <span className="flex items-center gap-1">
                                      {getTypeIcon(address.type)}
                                      {address.label}
                                    </span>
                                  </Badge>
                                  {address.isDefault && (
                                    <Badge variant="default" className="bg-orange-500">
                                      기본 배송지
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => handleEditAddress(address.id, e)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={(e) => handleDeleteAddress(address.id, e)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{address.name}</span>
                                  <span className="text-sm text-gray-500">{address.phone}</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  ({address.zipCode}) {address.address}
                                </p>
                                {address.detailAddress && (
                                  <p className="text-sm text-gray-600">
                                    {address.detailAddress}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Separator />

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSelectAddress}
                  disabled={!selectedAddressId}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  선택한 주소 사용하기
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}