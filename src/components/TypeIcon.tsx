import { Bell, CheckCircle2, CreditCard, Megaphone, Package, ShieldAlert, Truck, Users, MessageCircle, CalendarDays, BadgeCheck } from "lucide-react";
import type { JSX } from "react";
import type { NotificationType } from "@/types/notification";

export const TypeIcon: Record<NotificationType, JSX.Element> = {
    FUNDING_UPCOMING: <CalendarDays className="h-4 w-4 text-sky-600" />,
    FUNDING_REJECTED: <ShieldAlert className="h-4 w-4 text-red-500" />,
    FUNDING_OPEN: <Megaphone className="h-4 w-4 text-amber-500" />,
    FUNDING_SUCCESS: <BadgeCheck className="h-4 w-4 text-emerald-600" />,
    FUNDING_FAILURE: <ShieldAlert className="h-4 w-4 text-red-500" />,
    FUNDING_SETTLED: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,

    SHIPPING_SENT: <Truck className="h-4 w-4 text-purple-500" />,
    SHIPPING_DELIVERED: <Truck className="h-4 w-4 text-green-600" />,

    BACKING_SUCCESS: <CreditCard className="h-4 w-4 text-blue-600" />,
    BACKING_FAIL: <CreditCard className="h-4 w-4 text-red-500" />,
    PAYMENT_SUCCESS: <CreditCard className="h-4 w-4 text-blue-600" />,
    PAYMENT_FAIL: <CreditCard className="h-4 w-4 text-red-500" />,

    NEW_FOLLOWER: <Users className="h-4 w-4 text-pink-500" />,
    COMMUNITY_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    QNA_REPLY: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    QNA_NEW: <MessageCircle className="h-4 w-4 text-indigo-500" />,
    INQUIRY_ANSWERED: <MessageCircle className="h-4 w-4 text-cyan-600" />,
    REPORT_RECEIVED: <ShieldAlert className="h-4 w-4 text-orange-500" />,
    REPORT_RESOLVED: <ShieldAlert className="h-4 w-4 text-emerald-600" />,
    REFUND_COMPLETED: <CreditCard className="h-4 w-4 text-emerald-600" />,
    REWARD_OUT_OF_STOCK: <Package className="h-4 w-4 text-gray-500" />,

    DEFAULT: <Bell className="h-4 w-4 text-gray-400" />,
};
