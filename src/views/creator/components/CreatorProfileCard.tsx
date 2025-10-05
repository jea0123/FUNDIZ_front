import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatorProfileCard() {
    const [roleView, setRoleView] = useState<"user" | "creator">("creator");
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4 space-x-2">
                    <Button
                        variant={roleView === "user" ? "default" : "outline"}
                        onClick={() => navigate("/user/mypage")}
                    >
                        후원자
                    </Button>
                    <Button
                        variant={roleView === "creator" ? "default" : "outline"}
                        onClick={() => setRoleView("creator")}
                    >
                        창작자
                    </Button>
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                    <AvatarFallback>유저</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">창작자</h3>
                <p className="text-sm text-gray-500 mb-4">hong@example.com</p>
                <Badge variant="secondary">창작자</Badge>
            </CardContent>
        </Card>
    );
}