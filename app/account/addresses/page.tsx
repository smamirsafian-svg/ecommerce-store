import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">آدرس‌ها</h1>
        <p className="text-muted-foreground mt-2">
          آدرس‌های ارسال خود را مدیریت کنید
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آدرس‌های ثبت شده</CardTitle>
          <CardDescription>
            لیست آدرس‌های شما برای ارسال سفارشات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button disabled>افزودن آدرس جدید</Button>
            </div>
            <div className="text-center text-muted-foreground py-8">
              هنوز آدرسی ثبت نشده است
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

