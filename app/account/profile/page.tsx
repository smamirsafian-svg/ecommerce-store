import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">پروفایل</h1>
        <p className="text-muted-foreground mt-2">
          اطلاعات شخصی خود را مدیریت کنید
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات شخصی</CardTitle>
          <CardDescription>
            نام، ایمیل و اطلاعات تماس خود را به‌روزرسانی کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">نام و نام خانوادگی</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="نام و نام خانوادگی"
                className="text-right"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                className="text-right"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="09123456789"
                className="text-right"
                disabled
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled>
                ذخیره تغییرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

